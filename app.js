/* ============================================
   CloudPulse — Cloud Resource Monitor Dashboard
   Main Application Logic
   ============================================ */

// ─── Data Store ────────────────────────────────
let CloudData = {
    instances: [
        { id: 'i-0a1b2c3d4e', name: 'web-server-01', type: 't2.medium', os: 'Ubuntu 22.04', status: 'running', cpu: 72, memory: 65, storage: 30, ip: '10.0.1.12', launched: '2026-03-15', costPerHr: 0.046 },
        { id: 'i-1b2c3d4e5f', name: 'web-server-02', type: 't2.medium', os: 'Ubuntu 22.04', status: 'running', cpu: 58, memory: 54, storage: 30, ip: '10.0.1.13', launched: '2026-03-15', costPerHr: 0.046 },
        { id: 'i-2c3d4e5f6a', name: 'api-gateway-01', type: 't2.large', os: 'Amazon Linux', status: 'running', cpu: 81, memory: 73, storage: 50, ip: '10.0.2.10', launched: '2026-03-10', costPerHr: 0.093 },
        { id: 'i-3d4e5f6a7b', name: 'db-primary', type: 'm5.large', os: 'Ubuntu 22.04', status: 'running', cpu: 45, memory: 82, storage: 200, ip: '10.0.3.20', launched: '2026-02-28', costPerHr: 0.096 },
        { id: 'i-4e5f6a7b8c', name: 'db-replica', type: 'm5.large', os: 'Ubuntu 22.04', status: 'running', cpu: 32, memory: 68, storage: 200, ip: '10.0.3.21', launched: '2026-02-28', costPerHr: 0.096 },
        { id: 'i-5f6a7b8c9d', name: 'cache-server-01', type: 't2.small', os: 'Amazon Linux', status: 'running', cpu: 28, memory: 45, storage: 20, ip: '10.0.4.10', launched: '2026-03-20', costPerHr: 0.023 },
        { id: 'i-6a7b8c9d0e', name: 'worker-01', type: 'c5.xlarge', os: 'Debian 12', status: 'running', cpu: 92, memory: 78, storage: 50, ip: '10.0.5.10', launched: '2026-03-18', costPerHr: 0.170 },
        { id: 'i-7b8c9d0e1f', name: 'worker-02', type: 'c5.xlarge', os: 'Debian 12', status: 'running', cpu: 88, memory: 71, storage: 50, ip: '10.0.5.11', launched: '2026-03-18', costPerHr: 0.170 },
        { id: 'i-8c9d0e1f2a', name: 'monitoring', type: 't2.small', os: 'Ubuntu 22.04', status: 'running', cpu: 35, memory: 52, storage: 40, ip: '10.0.6.10', launched: '2026-03-01', costPerHr: 0.023 },
        { id: 'i-9d0e1f2a3b', name: 'staging-server', type: 't2.medium', os: 'Ubuntu 22.04', status: 'stopped', cpu: 0, memory: 0, storage: 30, ip: '10.0.7.10', launched: '2026-03-22', costPerHr: 0.046 },
        { id: 'i-0e1f2a3b4c', name: 'load-balancer', type: 't2.micro', os: 'Amazon Linux', status: 'running', cpu: 18, memory: 32, storage: 8, ip: '10.0.1.5', launched: '2026-03-01', costPerHr: 0.012 },
        { id: 'i-1f2a3b4c5d', name: 'dev-server', type: 't2.micro', os: 'Ubuntu 22.04', status: 'running', cpu: 42, memory: 58, storage: 20, ip: '10.0.8.10', launched: '2026-03-25', costPerHr: 0.012 },
    ],

    activities: [
        { type: 'launch', text: 'Instance web-server-02 launched', time: '2 min ago' },
        { type: 'scale', text: 'Auto-scaling: added worker-02', time: '15 min ago' },
        { type: 'alert', text: 'CPU alert: worker-01 at 92%', time: '22 min ago' },
        { type: 'terminate', text: 'Instance test-env terminated', time: '1 hr ago' },
        { type: 'launch', text: 'Instance cache-server-01 launched', time: '2 hr ago' },
        { type: 'scale', text: 'Auto-scaling: removed idle worker', time: '3 hr ago' },
        { type: 'alert', text: 'Memory warning: db-primary at 82%', time: '4 hr ago' },
        { type: 'launch', text: 'Instance monitoring launched', time: '5 hr ago' },
    ],

    alerts: [
        { severity: 'critical', title: 'High CPU: worker-01', desc: 'CPU utilization at 92% for 10+ minutes. Consider scaling.', icon: '🔴' },
        { severity: 'warning', title: 'Memory: db-primary', desc: 'Memory usage at 82%. Approaching threshold.', icon: '🟡' },
        { severity: 'info', title: 'Scaling Event', desc: 'Auto-scaling triggered: +1 worker instance added.', icon: '🔵' },
    ],

    scalingEvents: [
        { direction: 'up', text: 'Scaled up to 12 instances (CPU > 75%)', time: '15 min ago' },
        { direction: 'down', text: 'Scaled down to 11 instances (CPU < 25%)', time: '2 hr ago' },
        { direction: 'up', text: 'Scaled up to 12 instances (CPU > 75%)', time: '4 hr ago' },
        { direction: 'up', text: 'Scaled up to 11 instances (CPU > 75%)', time: '6 hr ago' },
        { direction: 'down', text: 'Scaled down to 10 instances (CPU < 25%)', time: '8 hr ago' },
    ]
};

// ─── Chart Drawing Utilities ──────────────────
class ChartRenderer {
    static getCanvasContext(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        // Use bounding rect, but fall back to CSS/attribute dimensions if rect is 0
        const w = rect.width || canvas.offsetWidth || parseInt(canvas.getAttribute('width')) || 400;
        const h = rect.height || canvas.offsetHeight || parseInt(canvas.getAttribute('height')) || 200;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        return { ctx, width: w, height: h };
    }

    static generateTimeSeriesData(points = 24, min = 20, max = 90) {
        const data = [];
        let value = min + Math.random() * (max - min);
        for (let i = 0; i < points; i++) {
            value += (Math.random() - 0.48) * 15;
            value = Math.max(min, Math.min(max, value));
            data.push(value);
        }
        return data;
    }

    static drawLineChart(canvasId, datasets, options = {}) {
        const result = this.getCanvasContext(canvasId);
        if (!result) return;
        const { ctx, width, height } = result;

        const padding = { top: 20, right: 20, bottom: 40, left: 50 };
        const chartW = width - padding.left - padding.right;
        const chartH = height - padding.top - padding.bottom;

        ctx.clearRect(0, 0, width, height);

        // Find data bounds
        let allValues = datasets.flatMap(d => d.data);
        const minVal = options.minVal ?? Math.min(...allValues) * 0.9;
        const maxVal = options.maxVal ?? Math.max(...allValues) * 1.1;

        // Grid lines
        const gridLines = 5;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
        ctx.textAlign = 'right';

        for (let i = 0; i <= gridLines; i++) {
            const y = padding.top + (chartH / gridLines) * i;
            const val = maxVal - ((maxVal - minVal) / gridLines) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();
            ctx.fillText(val.toFixed(0) + (options.suffix || ''), padding.left - 8, y + 4);
        }

        // X-axis labels
        const points = datasets[0].data.length;
        ctx.textAlign = 'center';
        const labelInterval = Math.ceil(points / 8);
        for (let i = 0; i < points; i += labelInterval) {
            const x = padding.left + (chartW / (points - 1)) * i;
            const label = options.xLabels ? options.xLabels[i] : `${points - i}h`;
            ctx.fillText(label, x, height - padding.bottom + 20);
        }

        // Draw datasets
        datasets.forEach(dataset => {
            const data = dataset.data;

            // Gradient fill
            if (dataset.fill) {
                const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
                gradient.addColorStop(0, dataset.fillColor || 'rgba(99, 102, 241, 0.15)');
                gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

                ctx.beginPath();
                for (let i = 0; i < data.length; i++) {
                    const x = padding.left + (chartW / (data.length - 1)) * i;
                    const y = padding.top + chartH - ((data[i] - minVal) / (maxVal - minVal)) * chartH;
                    if (i === 0) ctx.moveTo(x, y);
                    else {
                        const prevX = padding.left + (chartW / (data.length - 1)) * (i - 1);
                        const prevY = padding.top + chartH - ((data[i - 1] - minVal) / (maxVal - minVal)) * chartH;
                        const cpX = (prevX + x) / 2;
                        ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
                    }
                }
                ctx.lineTo(padding.left + chartW, padding.top + chartH);
                ctx.lineTo(padding.left, padding.top + chartH);
                ctx.closePath();
                ctx.fillStyle = gradient;
                ctx.fill();
            }

            // Line
            ctx.beginPath();
            ctx.strokeStyle = dataset.color || '#6366f1';
            ctx.lineWidth = 2.5;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';

            if (dataset.dashed) {
                ctx.setLineDash([6, 4]);
            } else {
                ctx.setLineDash([]);
            }

            for (let i = 0; i < data.length; i++) {
                const x = padding.left + (chartW / (data.length - 1)) * i;
                const y = padding.top + chartH - ((data[i] - minVal) / (maxVal - minVal)) * chartH;
                if (i === 0) ctx.moveTo(x, y);
                else {
                    const prevX = padding.left + (chartW / (data.length - 1)) * (i - 1);
                    const prevY = padding.top + chartH - ((data[i - 1] - minVal) / (maxVal - minVal)) * chartH;
                    const cpX = (prevX + x) / 2;
                    ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
                }
            }
            ctx.stroke();
            ctx.setLineDash([]);

            // Data points
            if (dataset.showDots !== false) {
                for (let i = 0; i < data.length; i++) {
                    const x = padding.left + (chartW / (data.length - 1)) * i;
                    const y = padding.top + chartH - ((data[i] - minVal) / (maxVal - minVal)) * chartH;
                    ctx.beginPath();
                    ctx.arc(x, y, 3, 0, Math.PI * 2);
                    ctx.fillStyle = dataset.color || '#6366f1';
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                    ctx.fillStyle = '#0a0e1a';
                    ctx.fill();
                }
            }
        });
    }

    static drawDonutChart(canvasId, segments, legendId) {
        const result = this.getCanvasContext(canvasId);
        if (!result) return;
        const { ctx, width, height } = result;

        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 30;
        const innerRadius = radius * 0.62;

        ctx.clearRect(0, 0, width, height);

        const total = segments.reduce((sum, s) => sum + s.value, 0);
        let currentAngle = -Math.PI / 2;

        segments.forEach((segment, index) => {
            const sliceAngle = (segment.value / total) * Math.PI * 2;

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
            ctx.closePath();
            ctx.fillStyle = segment.color;
            ctx.fill();

            // Gap between segments
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
            ctx.closePath();
            ctx.strokeStyle = '#0a0e1a';
            ctx.lineWidth = 2;
            ctx.stroke();

            currentAngle += sliceAngle;
        });

        // Center text
        ctx.fillStyle = '#f1f5f9';
        ctx.font = 'bold 24px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(total.toString(), centerX, centerY - 8);
        ctx.fillStyle = '#64748b';
        ctx.font = '11px Inter, sans-serif';
        ctx.fillText('Total', centerX, centerY + 14);

        // Legend
        if (legendId) {
            const legendEl = document.getElementById(legendId);
            if (legendEl) {
                legendEl.innerHTML = segments.map(s => `
                    <div class="legend-item">
                        <span class="legend-dot" style="background: ${s.color}"></span>
                        <span>${s.label}: ${s.value}</span>
                    </div>
                `).join('');
            }
        }
    }

    static drawBarChart(canvasId, data, colors, options = {}) {
        const result = this.getCanvasContext(canvasId);
        if (!result) return;
        const { ctx, width, height } = result;

        const padding = { top: 20, right: 20, bottom: 40, left: 50 };
        const chartW = width - padding.left - padding.right;
        const chartH = height - padding.top - padding.bottom;

        ctx.clearRect(0, 0, width, height);

        const maxVal = Math.max(...data.map(d => d.values.reduce((a, b) => a + b, 0))) * 1.15;
        const barWidth = (chartW / data.length) * 0.6;
        const gap = (chartW / data.length) * 0.4;

        // Grid
        const gridLines = 5;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
        ctx.textAlign = 'right';

        for (let i = 0; i <= gridLines; i++) {
            const y = padding.top + (chartH / gridLines) * i;
            const val = maxVal - (maxVal / gridLines) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();
            ctx.fillText('$' + val.toFixed(0), padding.left - 8, y + 4);
        }

        // Bars
        data.forEach((item, i) => {
            const x = padding.left + (chartW / data.length) * i + gap / 2;
            let yOffset = 0;

            item.values.forEach((val, vi) => {
                const barH = (val / maxVal) * chartH;
                const y = padding.top + chartH - yOffset - barH;

                const gradient = ctx.createLinearGradient(x, y, x, y + barH);
                gradient.addColorStop(0, colors[vi]);
                gradient.addColorStop(1, colors[vi] + '99');
                ctx.fillStyle = gradient;

                // Rounded top corners for top segment
                const r = 4;
                if (vi === item.values.length - 1 || yOffset + barH >= chartH - 1) {
                    ctx.beginPath();
                    ctx.moveTo(x, y + barH);
                    ctx.lineTo(x, y + r);
                    ctx.quadraticCurveTo(x, y, x + r, y);
                    ctx.lineTo(x + barWidth - r, y);
                    ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + r);
                    ctx.lineTo(x + barWidth, y + barH);
                    ctx.closePath();
                    ctx.fill();
                } else {
                    ctx.fillRect(x, y, barWidth, barH);
                }

                yOffset += barH;
            });

            // Label
            ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
            ctx.font = '10px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(item.label, x + barWidth / 2, height - padding.bottom + 18);
        });
    }

    static drawGauge(canvasId, value, max = 100) {
        const result = this.getCanvasContext(canvasId);
        if (!result) return;
        const { ctx, width, height } = result;

        ctx.clearRect(0, 0, width, height);

        const centerX = width / 2;
        const centerY = height - 20;
        const radius = Math.min(width / 2, height) - 30;
        const startAngle = Math.PI;
        const endAngle = 2 * Math.PI;
        const valueAngle = startAngle + (value / max) * Math.PI;

        // Background arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 20;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Value arc
        const gradient = ctx.createLinearGradient(centerX - radius, centerY, centerX + radius, centerY);
        if (value < 50) {
            gradient.addColorStop(0, '#10b981');
            gradient.addColorStop(1, '#06b6d4');
        } else if (value < 75) {
            gradient.addColorStop(0, '#06b6d4');
            gradient.addColorStop(1, '#f59e0b');
        } else {
            gradient.addColorStop(0, '#f59e0b');
            gradient.addColorStop(1, '#f43f5e');
        }

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, valueAngle);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 20;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Value text
        ctx.fillStyle = '#f1f5f9';
        ctx.font = 'bold 32px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(value + '%', centerX, centerY - 20);

        // Scale labels
        ctx.fillStyle = '#64748b';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('0%', centerX - radius - 5, centerY + 15);
        ctx.fillText('100%', centerX + radius + 5, centerY + 15);
    }
}

// ─── Application Controller ────────────────────
class CloudPulseApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.pollIntervalMs = 15000;
        this.metricHistory = {
            labels: [],
            cpu: [],
            memory: [],
            netIn: [],
            netOut: [],
            diskRead: [],
            diskWrite: [],
        };
        this.maxHistoryPoints = 30;
        this.hasShownBackendError = false;
        this.init();
    }

    async init() {
        this.setupNavigation();
        this.setupClock();
        this.setupModal();
        this.setupScalingControls();
        
        await this.fetchRealData({ initialSync: true });
        
        this.renderDashboard();
        this.renderInstances();
        this.renderMonitoring();
        this.renderScaling();
        this.renderBilling();
        this.startLiveUpdates();
        this.setupResize();
    }

    async fetchRealData({ initialSync = false, silent = false } = {}) {
        try {
            const res = await fetch('/api/dashboard');
            if (res.ok) {
                const data = await res.json();
                if (data.instances) {
                    CloudData.instances = data.instances;
                    this.syncLivePanels(data.syncedAt);
                    this.recordMetricSample();
                    if (initialSync) {
                        this.addActivity('launch', `Synced ${data.instances.length} live instances from AWS (${data.region})`);
                    }
                } else if (data.instances && data.instances.length === 0) {
                    this.addActivity('info', `AWS Connected, but NO EC2 instances found in region.`);
                }

                this.hasShownBackendError = false;
                this.updateStats();
                if (!silent) {
                    this.refreshVisibleSection();
                }
            }
        } catch (e) {
            if (!this.hasShownBackendError) {
                this.showToast('Unable to fetch live AWS metrics. Showing last known values.', 'warning');
                this.hasShownBackendError = true;
            }
            console.log('Backend not available: using last known values.');
        }
    }

    recordMetricSample() {
        const running = CloudData.instances.filter(i => i.status === 'running');
        const avg = (arr) => (arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0);

        const avgCpu = Math.round(avg(running.map(i => i.cpu || 0)));
        const avgMem = Math.round(avg(running.map(i => i.memory || 0)));
        const avgNetIn = Number(avg(running.map(i => i.networkInMbps || 0)).toFixed(3));
        const avgNetOut = Number(avg(running.map(i => i.networkOutMbps || 0)).toFixed(3));
        const avgDiskRead = Number(avg(running.map(i => i.diskReadMBps || 0)).toFixed(3));
        const avgDiskWrite = Number(avg(running.map(i => i.diskWriteMBps || 0)).toFixed(3));

        const timeLabel = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

        this.metricHistory.labels.push(timeLabel);
        this.metricHistory.cpu.push(avgCpu);
        this.metricHistory.memory.push(avgMem);
        this.metricHistory.netIn.push(avgNetIn);
        this.metricHistory.netOut.push(avgNetOut);
        this.metricHistory.diskRead.push(avgDiskRead);
        this.metricHistory.diskWrite.push(avgDiskWrite);

        Object.keys(this.metricHistory).forEach((key) => {
            if (this.metricHistory[key].length > this.maxHistoryPoints) {
                this.metricHistory[key].shift();
            }
        });
    }

    syncLivePanels(syncedAt) {
        const running = CloudData.instances.filter(i => i.status === 'running');

        const cpuAlerts = running
            .filter(i => (i.cpu || 0) >= 75)
            .slice(0, 4)
            .map(i => ({
                severity: (i.cpu || 0) >= 90 ? 'critical' : 'warning',
                title: `CPU: ${i.name}`,
                desc: `CPU at ${i.cpu}% on ${i.id}`,
                icon: (i.cpu || 0) >= 90 ? '🔴' : '🟡',
            }));

        CloudData.alerts = cpuAlerts.length
            ? cpuAlerts
            : [{ severity: 'info', title: 'No Active Alarms', desc: 'No CPU alarms above 75% right now.', icon: '🔵' }];

        const latestTime = syncedAt ? new Date(syncedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'now';
        const statusActivities = CloudData.instances.slice(0, 6).map(i => ({
            type: i.status === 'running' ? 'launch' : 'info',
            text: `${i.name} (${i.id}) is ${i.status}`,
            time: latestTime,
        }));

        CloudData.activities = [
            { type: 'info', text: `Live AWS sync completed (${running.length} running instances)`, time: latestTime },
            ...statusActivities,
        ];
    }

    seriesOrFallback(key, fallbackValue, points = 24) {
        const series = this.metricHistory[key] || [];
        if (series.length >= 2) return series;
        return Array.from({ length: points }, () => fallbackValue);
    }

    refreshVisibleSection() {
        this.renderInstances();

        if (this.currentSection === 'dashboard') this.renderDashboard();
        if (this.currentSection === 'monitoring') this.renderMonitoring();
        if (this.currentSection === 'scaling') this.renderScaling();
        if (this.currentSection === 'billing') this.renderBilling();
    }

    // ─── Navigation ──────────────────────────
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.switchSection(section);
            });
        });

        // Mobile menu toggle
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }

        // Close sidebar on content click (mobile)
        document.getElementById('mainContent').addEventListener('click', () => {
            sidebar.classList.remove('open');
        });
    }

    switchSection(sectionName) {
        // Update nav
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const activeNav = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeNav) activeNav.classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
        const activeSection = document.getElementById(`section-${sectionName}`);
        if (activeSection) {
            activeSection.classList.add('active');
            // Re-render charts when section becomes visible
            // Use rAF + timeout to ensure layout is fully computed after display change
            const self = this;
            requestAnimationFrame(() => {
                setTimeout(() => {
                    if (sectionName === 'dashboard') self.renderDashboardCharts();
                    if (sectionName === 'monitoring') self.renderMonitoring();
                    if (sectionName === 'scaling') self.renderScalingGauge();
                    if (sectionName === 'billing') self.renderBillingCharts();
                }, 100);
            });
        }

        // Update breadcrumb
        const breadcrumb = document.getElementById('breadcrumbSection');
        const names = { dashboard: 'Dashboard', instances: 'Instances', monitoring: 'Monitoring', scaling: 'Auto Scaling', billing: 'Billing' };
        if (breadcrumb) breadcrumb.textContent = names[sectionName] || sectionName;

        this.currentSection = sectionName;
    }

    // ─── Clock ───────────────────────────────
    setupClock() {
        const updateClock = () => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
            const clockEl = document.getElementById('liveClock');
            if (clockEl) clockEl.textContent = timeStr;
        };
        updateClock();
        setInterval(updateClock, 1000);
    }

    // ─── Dashboard ───────────────────────────
    renderDashboard() {
        this.renderActivityList();
        this.renderAlertsList();
        this.renderDashboardCharts();
    }

    renderDashboardCharts() {
        const running = CloudData.instances.filter(i => i.status === 'running');
        const avgCpuNow = running.length ? Math.round(running.reduce((s, i) => s + i.cpu, 0) / running.length) : 0;
        const cpuData = this.seriesOrFallback('cpu', avgCpuNow, 24);

        ChartRenderer.drawLineChart('cpuChart', [
            { data: cpuData, color: '#6366f1', fill: true, fillColor: 'rgba(99, 102, 241, 0.12)' },
        ], {
            suffix: '%',
            minVal: 0,
            maxVal: 100,
            xLabels: this.metricHistory.labels.length ? this.metricHistory.labels : undefined,
        });

        // Resource Donut
        const runningCount = running.length;
        const stopped = CloudData.instances.filter(i => i.status === 'stopped').length;
        const pending = CloudData.instances.filter(i => i.status === 'pending').length;
        ChartRenderer.drawDonutChart('resourceDonut', [
            { label: 'Running', value: runningCount, color: '#10b981' },
            { label: 'Stopped', value: stopped || 1, color: '#64748b' },
            { label: 'Pending', value: pending || 0, color: '#f59e0b' },
        ], 'donutLegend');
    }

    renderActivityList() {
        const list = document.getElementById('activityList');
        if (!list) return;
        list.innerHTML = CloudData.activities.map(a => `
            <div class="activity-item">
                <span class="activity-dot ${a.type}"></span>
                <span class="activity-text">${a.text}</span>
                <span class="activity-time">${a.time}</span>
            </div>
        `).join('');
    }

    renderAlertsList() {
        const list = document.getElementById('alertsList');
        if (!list) return;
        list.innerHTML = CloudData.alerts.map(a => `
            <div class="alert-item ${a.severity}">
                <span class="alert-icon">${a.icon}</span>
                <div class="alert-content">
                    <div class="alert-title">${a.title}</div>
                    <div class="alert-desc">${a.desc}</div>
                </div>
            </div>
        `).join('');
    }

    // ─── Instances ───────────────────────────
    renderInstances() {
        const grid = document.getElementById('instancesGrid');
        if (!grid) return;

        grid.innerHTML = CloudData.instances.map(inst => `
            <div class="instance-card" id="card-${inst.id}">
                <div class="instance-header">
                    <div>
                        <div class="instance-name">${inst.name}</div>
                        <div class="instance-id">${inst.id}</div>
                    </div>
                    <span class="instance-status ${inst.status}">${inst.status}</span>
                </div>
                <div class="instance-meta">
                    <div class="instance-meta-item">
                        <span class="meta-label">Type</span>
                        <span class="meta-value">${inst.type}</span>
                    </div>
                    <div class="instance-meta-item">
                        <span class="meta-label">OS</span>
                        <span class="meta-value">${inst.os}</span>
                    </div>
                    <div class="instance-meta-item">
                        <span class="meta-label">IP Address</span>
                        <span class="meta-value">${inst.ip}</span>
                    </div>
                    <div class="instance-meta-item">
                        <span class="meta-label">Storage</span>
                        <span class="meta-value">${inst.storage} GB</span>
                    </div>
                </div>
                <div class="instance-metrics">
                    <div class="metric-bar">
                        <div class="metric-bar-label">
                            <span>CPU</span>
                            <span>${inst.cpu}%</span>
                        </div>
                        <div class="metric-bar-track">
                            <div class="metric-bar-fill cpu" style="width: ${inst.cpu}%"></div>
                        </div>
                    </div>
                    <div class="metric-bar">
                        <div class="metric-bar-label">
                            <span>Memory</span>
                            <span>${inst.memory}%</span>
                        </div>
                        <div class="metric-bar-track">
                            <div class="metric-bar-fill memory" style="width: ${inst.memory}%"></div>
                        </div>
                    </div>
                </div>
                <div class="instance-actions">
                    ${inst.status === 'running' ? `
                        <button class="instance-btn" onclick="app.toggleInstance('${inst.id}', 'stop')">⏸ Stop</button>
                        <button class="instance-btn" onclick="app.rebootInstance('${inst.id}')">🔄 Reboot</button>
                        <button class="instance-btn danger" onclick="app.terminateInstance('${inst.id}')">🗑 Terminate</button>
                    ` : `
                        <button class="instance-btn" onclick="app.toggleInstance('${inst.id}', 'start')">▶ Start</button>
                        <button class="instance-btn danger" onclick="app.terminateInstance('${inst.id}')">🗑 Terminate</button>
                    `}
                </div>
            </div>
        `).join('');

        // Update instance selector in monitoring
        const monitorSelect = document.getElementById('monitorInstance');
        if (monitorSelect) {
            monitorSelect.innerHTML = '<option value="all">All Instances</option>' +
                CloudData.instances.map(i => `<option value="${i.id}">${i.name}</option>`).join('');
        }
    }

    toggleInstance(id, action) {
        const inst = CloudData.instances.find(i => i.id === id);
        if (!inst) return;

        if (action === 'stop') {
            inst.status = 'stopped';
            inst.cpu = 0;
            inst.memory = 0;
            this.showToast(`Instance ${inst.name} stopped successfully`, 'warning');
        } else {
            inst.status = 'pending';
            this.showToast(`Instance ${inst.name} starting...`, 'info');
            setTimeout(() => {
                inst.status = 'running';
                inst.cpu = 20 + Math.floor(Math.random() * 40);
                inst.memory = 30 + Math.floor(Math.random() * 30);
                this.renderInstances();
                this.updateStats();
                this.showToast(`Instance ${inst.name} is now running`, 'success');
            }, 2000);
        }

        this.renderInstances();
        this.updateStats();
        this.addActivity(action === 'stop' ? 'terminate' : 'launch', `Instance ${inst.name} ${action === 'stop' ? 'stopped' : 'starting'}`);
    }

    rebootInstance(id) {
        const inst = CloudData.instances.find(i => i.id === id);
        if (!inst) return;

        inst.status = 'pending';
        this.renderInstances();
        this.showToast(`Rebooting ${inst.name}...`, 'info');

        setTimeout(() => {
            inst.status = 'running';
            inst.cpu = 15 + Math.floor(Math.random() * 30);
            inst.memory = 25 + Math.floor(Math.random() * 25);
            this.renderInstances();
            this.showToast(`${inst.name} rebooted successfully`, 'success');
        }, 3000);
    }

    terminateInstance(id) {
        const inst = CloudData.instances.find(i => i.id === id);
        if (!inst) return;

        if (!confirm(`Are you sure you want to terminate ${inst.name}? This action cannot be undone.`)) return;

        CloudData.instances = CloudData.instances.filter(i => i.id !== id);
        this.renderInstances();
        this.updateStats();
        this.addActivity('terminate', `Instance ${inst.name} terminated`);
        this.showToast(`Instance ${inst.name} terminated`, 'error');
    }

    // ─── Monitoring ──────────────────────────
    renderMonitoring() {
        const running = CloudData.instances.filter(i => i.status === 'running');
        const avgCpuNow = running.length ? Math.round(running.reduce((s, i) => s + i.cpu, 0) / running.length) : 0;
        const avgMemNow = running.length ? Math.round(running.reduce((s, i) => s + (i.memory || 0), 0) / running.length) : 0;

        // CPU
        ChartRenderer.drawLineChart('monitorCpuChart', [
            { data: this.seriesOrFallback('cpu', avgCpuNow, 30), color: '#6366f1', fill: true, fillColor: 'rgba(99, 102, 241, 0.1)' }
        ], { suffix: '%', minVal: 0, maxVal: 100, xLabels: this.metricHistory.labels.length ? this.metricHistory.labels : undefined });

        // Memory
        ChartRenderer.drawLineChart('monitorMemChart', [
            { data: this.seriesOrFallback('memory', avgMemNow, 30), color: '#06b6d4', fill: true, fillColor: 'rgba(6, 182, 212, 0.1)' }
        ], { suffix: '%', minVal: 0, maxVal: 100, xLabels: this.metricHistory.labels.length ? this.metricHistory.labels : undefined });

        // Network
        ChartRenderer.drawLineChart('monitorNetChart', [
            { data: this.seriesOrFallback('netIn', 0, 30), color: '#10b981', fill: true, fillColor: 'rgba(16, 185, 129, 0.1)' },
            { data: this.seriesOrFallback('netOut', 0, 30), color: '#f59e0b', fill: false, dashed: true, showDots: false }
        ], { suffix: ' Mbps', xLabels: this.metricHistory.labels.length ? this.metricHistory.labels : undefined });

        // Disk
        ChartRenderer.drawLineChart('monitorDiskChart', [
            { data: this.seriesOrFallback('diskRead', 0, 30), color: '#8b5cf6', fill: true, fillColor: 'rgba(139, 92, 246, 0.1)' },
            { data: this.seriesOrFallback('diskWrite', 0, 30), color: '#f43f5e', fill: false, dashed: true, showDots: false }
        ], { suffix: ' MB/s', xLabels: this.metricHistory.labels.length ? this.metricHistory.labels : undefined });
    }

    // ─── Auto Scaling ────────────────────────
    renderScaling() {
        this.renderScalingTimeline();
        this.renderScalingGauge();
    }

    renderScalingTimeline() {
        const timeline = document.getElementById('scalingTimeline');
        if (!timeline) return;
        timeline.innerHTML = CloudData.scalingEvents.map(e => `
            <div class="timeline-item">
                <span class="timeline-icon ${e.direction === 'up' ? 'up' : 'down'}"></span>
                <span class="timeline-text">${e.text}</span>
                <span class="timeline-time">${e.time}</span>
            </div>
        `).join('');
    }

    renderScalingGauge() {
        const running = CloudData.instances.filter(i => i.status === 'running').length;
        const avgCpu = running > 0 ? Math.round(CloudData.instances.filter(i => i.status === 'running').reduce((s, i) => s + i.cpu, 0) / running) : 0;
        ChartRenderer.drawGauge('scalingGauge', avgCpu);

        const loadEl = document.getElementById('currentLoad');
        const instEl = document.getElementById('currentInstCount');
        if (loadEl) loadEl.textContent = avgCpu + '%';
        if (instEl) instEl.textContent = running;
    }

    setupScalingControls() {
        const scaleUp = document.getElementById('scaleUpThreshold');
        const scaleDown = document.getElementById('scaleDownThreshold');
        const scaleUpVal = document.getElementById('scaleUpValue');
        const scaleDownVal = document.getElementById('scaleDownValue');

        if (scaleUp) scaleUp.addEventListener('input', () => { scaleUpVal.textContent = scaleUp.value + '%'; });
        if (scaleDown) scaleDown.addEventListener('input', () => { scaleDownVal.textContent = scaleDown.value + '%'; });

        const applyBtn = document.getElementById('applyScalingBtn');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.showToast('Scaling policy updated successfully!', 'success');
                this.addActivity('scale', `Scaling policy updated: up=${scaleUp.value}%, down=${scaleDown.value}%`);
            });
        }
    }

    // ─── Billing ─────────────────────────────
    renderBilling() {
        this.renderBillingCharts();
    }

    renderBillingCharts() {
        // Daily cost bar chart
        const days = [];
        for (let i = 1; i <= 15; i++) {
            days.push({
                label: `Apr ${i}`,
                values: [
                    25 + Math.random() * 35,  // Compute
                    8 + Math.random() * 12,   // Storage
                    3 + Math.random() * 8     // Network
                ]
            });
        }
        ChartRenderer.drawBarChart('billingChart', days, ['#6366f1', '#06b6d4', '#10b981']);

        // Cost pie chart
        ChartRenderer.drawDonutChart('costPieChart', [
            { label: 'Compute', value: 876, color: '#6366f1' },
            { label: 'Storage', value: 235, color: '#06b6d4' },
            { label: 'Network', value: 137, color: '#10b981' },
        ], 'costLegend');
    }

    // ─── Modal ───────────────────────────────
    setupModal() {
        const launchBtn = document.getElementById('launchInstanceBtn');
        const modal = document.getElementById('launchModal');
        const closeBtn = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelModal');
        const confirmBtn = document.getElementById('confirmLaunch');

        if (launchBtn) launchBtn.addEventListener('click', () => modal.classList.add('active'));
        if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
        if (cancelBtn) cancelBtn.addEventListener('click', () => modal.classList.remove('active'));

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.remove('active');
            });
        }

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                const name = document.getElementById('instanceName').value || 'new-instance-' + Date.now().toString().slice(-4);
                const type = document.getElementById('instanceType').value;
                const os = document.getElementById('instanceOS');
                const osText = os.options[os.selectedIndex].text;
                const storage = parseInt(document.getElementById('instanceStorage').value) || 30;

                const typeInfo = {
                    't2.micro': { cost: 0.012 }, 't2.small': { cost: 0.023 },
                    't2.medium': { cost: 0.046 }, 't2.large': { cost: 0.093 },
                    'm5.large': { cost: 0.096 }, 'c5.xlarge': { cost: 0.170 }
                };

                const newInst = {
                    id: 'i-' + Math.random().toString(36).substr(2, 10),
                    name: name,
                    type: type,
                    os: osText,
                    status: 'pending',
                    cpu: 0,
                    memory: 0,
                    storage: storage,
                    ip: `10.0.${Math.floor(Math.random()*9)+1}.${Math.floor(Math.random()*250)+1}`,
                    launched: new Date().toISOString().split('T')[0],
                    costPerHr: typeInfo[type]?.cost || 0.046
                };

                CloudData.instances.push(newInst);
                this.renderInstances();
                this.addActivity('launch', `Instance ${name} launched (${type})`);
                this.showToast(`Launching instance ${name}...`, 'info');

                modal.classList.remove('active');
                document.getElementById('instanceName').value = '';

                // Simulate startup
                setTimeout(() => {
                    newInst.status = 'running';
                    newInst.cpu = 10 + Math.floor(Math.random() * 30);
                    newInst.memory = 15 + Math.floor(Math.random() * 25);
                    this.renderInstances();
                    this.updateStats();
                    this.showToast(`Instance ${name} is now running!`, 'success');
                }, 3000);

                this.updateStats();

                // Switch to instances view
                this.switchSection('instances');
            });
        }
    }

    // ─── Live Updates ────────────────────────
    startLiveUpdates() {
        setInterval(async () => {
            await this.fetchRealData({ silent: true });
            this.refreshVisibleSection();
        }, this.pollIntervalMs);
    }

    updateStats() {
        const running = CloudData.instances.filter(i => i.status === 'running');
        const runningCount = running.length;
        const avgCpu = runningCount > 0 ? Math.round(running.reduce((s, i) => s + i.cpu, 0) / runningCount) : 0;
        const totalMem = runningCount * 8; // Approximate
        const usedMem = runningCount > 0 ? Math.round(running.reduce((s, i) => s + (i.memory / 100) * 8, 0)) : 0;
        const monthlyCost = Math.round(CloudData.instances.reduce((s, i) => s + (i.status === 'running' ? i.costPerHr * 730 : 0), 0));

        const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };

        el('runningInstances', runningCount);
        el('avgCpu', avgCpu + '%');
        el('memoryUsed', usedMem + ' GB');
        el('monthlyCost', '$' + monthlyCost.toLocaleString());
    }

    // ─── Helpers ─────────────────────────────
    addActivity(type, text) {
        CloudData.activities.unshift({ type, text, time: 'just now' });
        if (CloudData.activities.length > 20) CloudData.activities.pop();
        this.renderActivityList();
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toastOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    setupResize() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (this.currentSection === 'dashboard') this.renderDashboardCharts();
                if (this.currentSection === 'monitoring') this.renderMonitoring();
                if (this.currentSection === 'scaling') this.renderScalingGauge();
                if (this.currentSection === 'billing') this.renderBillingCharts();
            }, 250);
        });
    }
}

// ─── Initialize App ────────────────────────────
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new CloudPulseApp();
});
