# ☁️ CloudPulse — AWS Cloud Resource Monitor Dashboard

A **real-time cloud infrastructure monitoring dashboard** that connects live to your AWS account to display EC2 instance health, performance metrics, auto-scaling events, and cost tracking — powered by the AWS SDK and served via a Node.js backend.

---

## ☁️ Cloud Technologies Used

| AWS Service | Purpose |
|---|---|
| **Amazon EC2** | Lists and manages all virtual machine instances (status, type, IP, OS, storage) |
| **Amazon CloudWatch** | Fetches real-time metrics: CPU utilization, Network In/Out, Disk Read/Write |
| **CloudWatch Agent (CWAgent)** | Retrieves memory usage metrics (`mem_used_percent`) from inside EC2 instances |
| **AWS IAM** | Authentication via `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` credentials |
| **AWS Regions** | Region-aware client setup — configurable via `AWS_REGION` environment variable |

### AWS SDK Packages Used

```json
"@aws-sdk/client-ec2"          → DescribeInstancesCommand (list all EC2 instances)
"@aws-sdk/client-cloudwatch"   → GetMetricStatisticsCommand (pull CloudWatch metrics)
```

### CloudWatch Metrics Collected

| Metric | Namespace | Description |
|---|---|---|
| `CPUUtilization` | `AWS/EC2` | CPU usage percentage per instance |
| `NetworkIn` | `AWS/EC2` | Inbound network traffic (bytes) |
| `NetworkOut` | `AWS/EC2` | Outbound network traffic (bytes) |
| `DiskReadBytes` | `AWS/EC2` | Disk read throughput (bytes) |
| `DiskWriteBytes` | `AWS/EC2` | Disk write throughput (bytes) |
| `mem_used_percent` | `CWAgent` | Memory usage % (requires CloudWatch Agent on EC2) |

---

## 🚀 Features

### 📊 Dashboard Overview
- Live sync of all EC2 instances from your AWS account
- Real-time stats: running instances, average CPU, estimated monthly cost
- CPU utilization line chart (live history)
- Resource distribution donut chart (Running / Stopped / Pending)
- Live activity feed and active CloudWatch alerts panel

### 🖥️ Instance Management
- View all EC2 instances with status, instance type, OS, IP, and storage
- Start, Stop, Reboot, and Terminate instances
- Live CPU/memory metric bars per instance (refreshed every 15 seconds)

### 📈 Performance Monitoring
- CPU, Memory, Network In/Out, and Disk Read/Write charts
- Smooth bezier-curve line charts with gradient fills
- Filter by specific instance or view aggregated fleet metrics

### ⚡ Auto Scaling
- Configure min/max instances and scaling thresholds
- Visual scaling timeline showing scale-up/down events
- Real-time gauge showing current load vs capacity

### 💰 Cost & Billing
- Monthly spending estimate per instance type
- Daily cost stacked bar chart (Compute / Storage / Network)
- Cost distribution chart and spending forecast

---

## 🛠️ Full Tech Stack

| Layer | Technology |
|---|---|
| **Cloud Platform** | Amazon Web Services (AWS) |
| **Compute Metrics** | Amazon EC2 + CloudWatch |
| **Backend** | Node.js + Express |
| **AWS SDK** | `@aws-sdk/client-ec2`, `@aws-sdk/client-cloudwatch` |
| **Auth** | AWS IAM (Access Key + Secret) via `dotenv` |
| **Frontend** | Vanilla HTML5, CSS3, JavaScript |
| **Charts** | HTML5 Canvas API (custom, no libraries) |
| **Fonts** | Google Fonts — Inter, JetBrains Mono |
| **Dev Server** | Nodemon |

---

## 📁 Project Structure

```
Cloud-Project/
├── index.html        # Frontend UI — dashboard, instances, monitoring, billing
├── styles.css        # Complete design system & responsive styles (glassmorphism)
├── app.js            # Frontend logic, charts, live data rendering
├── server.js         # Node.js backend — AWS SDK calls (EC2 + CloudWatch)
├── package.json      # Dependencies
├── .env              # ⚠️ AWS credentials (NEVER commit — gitignored)
├── .env.example      # Template for environment variables
├── .gitignore        # Excludes .env and node_modules
└── README.md         # Project documentation
```

---

## ⚙️ Setup & Configuration

### 1. Clone the repository

```bash
git clone https://github.com/Askamar/Cloud-Project.git
cd Cloud-Project
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure AWS credentials

Copy the example file and add your credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=ap-south-1
```

> ⚠️ **Never commit `.env` to version control.** It is already listed in `.gitignore`.

### 4. AWS IAM Permissions Required

Your IAM user must have the following permissions:

```json
{
  "Effect": "Allow",
  "Action": [
    "ec2:DescribeInstances",
    "cloudwatch:GetMetricStatistics"
  ],
  "Resource": "*"
}
```

### 5. Run the application

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

Open your browser at: **http://localhost:3000**

---

## 🔄 How Live Data Works

1. The frontend (`app.js`) polls `/api/dashboard` every **15 seconds**
2. The backend (`server.js`) calls **AWS EC2** to list all instances
3. For each **running** instance, it fetches **6 CloudWatch metrics** in parallel
4. Metrics are cached for **15 seconds** to avoid AWS API rate limits
5. If the backend is unreachable, the dashboard shows last-known values with a warning toast

---

## ☁️ AWS Free Tier Deployment Options

| Service | Free Tier Limit |
|---|---|
| **Amazon S3 Static Hosting** | 5 GB storage, 20,000 GET requests/month |
| **AWS CloudFront CDN** | 1 TB data transfer/month |
| **AWS Amplify** | 5 GB hosting, 15 GB/month transfer |
| **AWS EC2 t2.micro** | 750 hours/month (12 months) |

---

## 📝 License

Open source for educational purposes.
