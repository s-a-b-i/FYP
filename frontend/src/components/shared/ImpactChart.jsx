import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";

// Register required components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const ImpactChart = () => {
  return (
    <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
      <h3 className="font-bold text-lg mb-6 text-white">Impact Growth</h3>
      <div className="w-full h-96">
        <Bar
          data={{
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            datasets: [
              {
                label: "Items Recycled",
                data: [400000, 800000, 1200000, 1600000, 2000000, 2500000],
                backgroundColor: (context) => {
                  const chart = context.chart;
                  const { ctx, chartArea } = chart;
                  if (!chartArea) return;
                  const gradient = ctx.createLinearGradient(
                    0,
                    chartArea.bottom,
                    0,
                    chartArea.top
                  );
                  gradient.addColorStop(0, "rgba(5, 150, 105, 0.2)");
                  gradient.addColorStop(1, "rgba(5, 150, 105, 0.8)");
                  return gradient;
                },
                borderColor: "#059669",
                borderWidth: 2,
                borderRadius: 8,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                titleColor: "#fff",
                bodyColor: "#fff",
                borderColor: "#059669",
                borderWidth: 1,
                padding: 10,
              },
            },
            scales: {
              x: {
                type: "category", // Ensure x-axis is treated as a category scale
                grid: {
                  color: "rgba(255, 255, 255, 0.1)",
                },
                ticks: {
                  color: "rgba(255, 255, 255, 0.8)",
                },
              },
              y: {
                beginAtZero: true,
                grid: {
                  color: "rgba(255, 255, 255, 0.1)",
                },
                ticks: {
                  color: "rgba(255, 255, 255, 0.8)",
                  callback: (value) => `${value / 1000000}M`,
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default ImpactChart;
