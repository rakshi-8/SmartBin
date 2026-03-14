# SmartBin PRO 🌍
**IoSmart Waste Monitoring Dashboard - Madurai Corporation**

SmartBin PRO is a complete full-stack React frontend dashboard designed for municipal waste management. It provides an interactive real-time map interface mapping IoT smart bins, automatically calculating emergency collection routes based on capacity algorithms.

## ✨ Core Features
- **Real-Time IoT Simulation**: Background engine processes 5-second updates simulating active bin fill levels and battery degradation.
- **Dynamic Leaflet Map**: Geo-locational markers update colors live (Ok vs Warning vs Critical) and visually pulse when bins overflow.
- **Autonomous Emergency Alerts**: A global State listener intercepts `>80%` capacities, dispatching emergency modals and maintaining an un-dismissed alert log. 
- **Auto-Route Generation Engine**: Integrates a Greedy TSP (Traveling Salesperson Problem) logical algorithm mapping the shortest possible driving stop-order when two or more bins trigger alerts.
- **Analytics Visualization**: Powered by `Chart.js`, graphing localized trigger bottlenecks.
- **Dark Mode Optimized**: "Government Smart-City" aesthetic utilizing deep slates, professional teals, and glassmorphism.

## 🛠 Tech Stack
- **React.js 18** (Context API, Hooks)
- **Vite** (Build Tooling)
- **React Leaflet** (Map Interface)
- **Chart.js / react-chartjs-2**
- **Lucide React** (Vector Icons)

## 🚀 Getting Started

To launch this dashboard locally, ensure you have **Node.js** installed on your system.
*If you are the evaluator and do not have Node, [download it here](https://nodejs.org).*

1. Open your terminal inside the `SmartBinReactApp` directory.
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Boot up the Vite Development Server:
   ```bash
   npm run dev
   ```
4. Access the dashboard via your browser at `[https://smartbinmadurai.netlify.app]`.
