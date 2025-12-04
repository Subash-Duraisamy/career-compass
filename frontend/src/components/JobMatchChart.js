import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function JobMatchChart({ jobs }) {
  const labels = jobs.map((job) => job.title);
  const scores = jobs.map((job) => job.matchScore);

  const data = {
    labels,
    datasets: [
      {
        label: "Match Score (1–10)",
        data: scores,
        backgroundColor: [
          "rgba(59,130,246,0.8)",   // blue
          "rgba(16,185,129,0.8)",   // green
          "rgba(245,158,11,0.8)",   // yellow
          "rgba(239,68,68,0.8)",    // red
          "rgba(139,92,246,0.8)",   // purple
        ],
        borderRadius: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, max: 10 },
    },
  };

  return (
    <div style={{ marginTop: "20px", padding: "20px" }}>
      <h3 style={{ marginBottom: "15px" }}>Job Match Score Comparison</h3>
      <Bar data={data} options={options} />
    </div>
  );
}

export default JobMatchChart;
