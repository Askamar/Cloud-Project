require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const {
    CloudWatchClient,
    GetMetricStatisticsCommand,
} = require('@aws-sdk/client-cloudwatch');
const { EC2Client, DescribeInstancesCommand } = require('@aws-sdk/client-ec2');

const app = express();
app.use(cors());
app.use(express.static(__dirname));

// The AWS region is typically taken from your environment (AWS_REGION) or the .env file.
const region = process.env.AWS_REGION || 'us-east-1';

// The EC2Client will automatically pick up AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY from the environment
const ec2Client = new EC2Client({ region });
const cloudWatchClient = new CloudWatchClient({ region });

const INSTANCE_PRICING_USD_PER_HOUR = {
    't2.micro': 0.0116,
    't2.small': 0.023,
    't2.medium': 0.0464,
    't2.large': 0.0928,
    'm5.large': 0.096,
    'c5.xlarge': 0.17,
};

let dashboardCache = { expiresAt: 0, payload: null };

function latestDatapoint(datapoints) {
    if (!datapoints || datapoints.length === 0) return null;
    return [...datapoints].sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp))[0];
}

async function getLatestMetric({
    instanceId,
    metricName,
    namespace,
    statistic = 'Average',
    period = 300,
    lookbackMinutes = 20,
}) {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - lookbackMinutes * 60 * 1000);

    const result = await cloudWatchClient.send(new GetMetricStatisticsCommand({
        Namespace: namespace,
        MetricName: metricName,
        Dimensions: [{ Name: 'InstanceId', Value: instanceId }],
        StartTime: startTime,
        EndTime: endTime,
        Period: period,
        Statistics: [statistic],
    }));

    const point = latestDatapoint(result.Datapoints);
    if (!point) return null;
    return Number(point[statistic] ?? 0);
}

async function enrichInstanceWithMetrics(instance) {
    if (instance.status !== 'running') {
        return {
            ...instance,
            cpu: 0,
            memory: 0,
            networkInMbps: 0,
            networkOutMbps: 0,
            diskReadMBps: 0,
            diskWriteMBps: 0,
        };
    }

    const [cpuAvg, memUsed, netInSum, netOutSum, diskReadSum, diskWriteSum] = await Promise.all([
        getLatestMetric({ instanceId: instance.id, metricName: 'CPUUtilization', namespace: 'AWS/EC2', statistic: 'Average' }),
        getLatestMetric({ instanceId: instance.id, metricName: 'mem_used_percent', namespace: 'CWAgent', statistic: 'Average' }).catch(() => null),
        getLatestMetric({ instanceId: instance.id, metricName: 'NetworkIn', namespace: 'AWS/EC2', statistic: 'Sum' }),
        getLatestMetric({ instanceId: instance.id, metricName: 'NetworkOut', namespace: 'AWS/EC2', statistic: 'Sum' }),
        getLatestMetric({ instanceId: instance.id, metricName: 'DiskReadBytes', namespace: 'AWS/EC2', statistic: 'Sum' }),
        getLatestMetric({ instanceId: instance.id, metricName: 'DiskWriteBytes', namespace: 'AWS/EC2', statistic: 'Sum' }),
    ]);

    // Network and disk sums are over a 5-minute period (300 seconds).
    const netInMbps = netInSum ? Number((((netInSum * 8) / 300) / 1_000_000).toFixed(3)) : 0;
    const netOutMbps = netOutSum ? Number((((netOutSum * 8) / 300) / 1_000_000).toFixed(3)) : 0;
    const diskReadMBps = diskReadSum ? Number(((diskReadSum / 300) / 1_048_576).toFixed(3)) : 0;
    const diskWriteMBps = diskWriteSum ? Number(((diskWriteSum / 300) / 1_048_576).toFixed(3)) : 0;

    return {
        ...instance,
        cpu: Math.round(cpuAvg || 0),
        memory: Math.round(memUsed || 0),
        networkInMbps: netInMbps,
        networkOutMbps: netOutMbps,
        diskReadMBps,
        diskWriteMBps,
    };
}

function mapEc2Instances(data) {
    const instances = [];
    if (!data.Reservations) return instances;

    data.Reservations.forEach((reservation) => {
        reservation.Instances.forEach((inst) => {
            const id = inst.InstanceId;
            const type = inst.InstanceType;
            const status = inst.State?.Name || 'unknown';
            if (status === 'terminated' || status === 'shutting-down') return;

            let name = 'AWS-Instance';
            if (inst.Tags) {
                const nameTag = inst.Tags.find((t) => t.Key === 'Name');
                if (nameTag) name = nameTag.Value;
            }

            const storage = (inst.BlockDeviceMappings || []).reduce((sum, mapping) => {
                const size = mapping?.Ebs?.VolumeSize;
                return sum + (typeof size === 'number' ? size : 0);
            }, 0);

            instances.push({
                id,
                name,
                type,
                status,
                ip: inst.PublicIpAddress || inst.PrivateIpAddress || 'N/A',
                os: inst.PlatformDetails || 'Linux/UNIX',
                launched: inst.LaunchTime,
                storage: storage || 8,
                costPerHr: INSTANCE_PRICING_USD_PER_HOUR[type] || 0,
            });
        });
    });

    return instances;
}

app.get('/api/dashboard', async (req, res) => {
    try {
        if (dashboardCache.payload && dashboardCache.expiresAt > Date.now()) {
            return res.json(dashboardCache.payload);
        }

        const data = await ec2Client.send(new DescribeInstancesCommand({}));
        const baseInstances = mapEc2Instances(data);
        const instances = await Promise.all(baseInstances.map((inst) => enrichInstanceWithMetrics(inst)));

        const running = instances.filter((i) => i.status === 'running');
        const avgCpu = running.length ? Math.round(running.reduce((sum, i) => sum + i.cpu, 0) / running.length) : 0;
        const monthlyCost = Math.round(
            instances.reduce((sum, i) => sum + (i.status === 'running' ? i.costPerHr * 730 : 0), 0)
        );

        const payload = {
            source: 'aws-live',
            region,
            syncedAt: new Date().toISOString(),
            instances,
            summary: {
                runningInstances: running.length,
                avgCpu,
                monthlyCost,
            },
        };

        dashboardCache = {
            payload,
            expiresAt: Date.now() + 15000,
        };

        res.json(payload);

    } catch (error) {
        console.error('AWS Query Error:', error);
        res.status(500).json({ error: error.message, hint: 'Check your AWS credentials, CloudWatch permissions, and region.' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`CloudPulse AWS Backend running on http://localhost:${PORT}`);
    console.log(`Make sure you configure your AWS credentials in the .env file.`);
});
