# ☁️ CloudPulse — Cloud Resource Monitor Dashboard

A **simulated cloud infrastructure monitoring dashboard** built with pure HTML, CSS, and JavaScript. This mini-project demonstrates core cloud computing concepts like resource monitoring, auto-scaling, instance management, and cost tracking — all running locally in the browser with **zero AWS costs**.

---

## 🚀 Features

### 📊 Dashboard Overview
- Real-time stats: running instances, average CPU, memory usage, estimated monthly cost
- CPU utilization line chart (24h / 7d / 30d views)
- Resource distribution donut chart
- Live activity feed and active alerts panel

### 🖥️ Instance Management
- View all cloud instances with status (Running / Stopped / Pending)
- Launch new instances with configurable type, OS, and storage
- Stop, Start, Reboot, and Terminate instances
- Live CPU/memory metric bars per instance

### 📈 Performance Monitoring
- CPU, Memory, Network, and Disk I/O charts
- Smooth bezier-curve line charts with gradient fills
- Filter by specific instance or view aggregated metrics

### ⚡ Auto Scaling
- Configure min/max instances and scaling thresholds
- Visual scaling timeline showing scale-up/down events
- Real-time gauge showing current load vs capacity
- Adjustable cooldown period

### 💰 Cost & Billing
- Month-to-date spending breakdown
- Daily cost stacked bar chart (Compute / Storage / Network)
- Cost distribution pie chart
- Spending forecast

---

## 🎨 Design Highlights

- **Dark glassmorphism** theme with ambient floating orbs
- **Custom canvas charts** — no external libraries needed
- **Smooth animations** and micro-interactions
- **Fully responsive** — works on desktop, tablet, and mobile
- **JetBrains Mono + Inter** typography
- **Toast notifications** for all user actions

---

## 🛠️ Tech Stack

| Layer     | Technology          |
|-----------|---------------------|
| Structure | HTML5               |
| Styling   | Vanilla CSS3        |
| Logic     | Vanilla JavaScript  |
| Charts    | HTML5 Canvas API    |
| Fonts     | Google Fonts (Inter, JetBrains Mono) |

> **No frameworks, no libraries, no build tools required.**

---

## 📁 Project Structure

```
AWS/
├── index.html    # Main HTML structure
├── styles.css    # Complete design system & responsive styles
├── app.js        # Application logic, charts, simulated data
└── README.md     # Project documentation
```

---

## ▶️ How to Run

Simply open `index.html` in any modern web browser:

```bash
# Option 1: Double-click index.html in File Explorer

# Option 2: From terminal
start index.html

# Option 3: Use VS Code Live Server extension
```

---

## ☁️ Cloud Computing Concepts Demonstrated

| Concept              | Where in the App                           |
|----------------------|--------------------------------------------|
| Virtual Instances    | Instances tab — launch, manage VMs         |
| Resource Monitoring  | Monitoring tab — CPU, RAM, Network, Disk   |
| Auto Scaling         | Scaling tab — policies, thresholds, events |
| Cost Management      | Billing tab — cost tracking, forecasts     |
| Regions              | Region selector in top bar                 |
| Load Balancing       | Load balancer instance in the dashboard    |
| Alerting             | Active alerts panel on dashboard           |

---

## 💡 AWS Free Tier Compatible

This project runs **100% locally** in your browser. No AWS services are consumed. If you wish to deploy it:

- **Amazon S3 Static Hosting** — Free tier: 5 GB storage, 20,000 GET requests/month
- **AWS CloudFront** — Free tier: 1 TB data transfer/month
- **AWS Amplify** — Free tier: 5 GB hosting, 15 GB/month transfer

---

## 📝 License

Open source for educational purposes.
