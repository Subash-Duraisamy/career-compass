import React from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

// Register chart components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

function RadarScoreChart({ technical, soft, exp, project, ats }) {
  const data = {
    labels: [
      "Technical Skills",
      "Soft Skills",
      "Experience",
      "Project Quality",
      "ATS Score",
    ],
    datasets: [
      {
        label: "Resume Score Breakdown",
        data: [technical, soft, exp, project, ats],
        backgroundColor: "rgba(75, 192, 192, 0.3)",
        borderColor: "rgb(75, 192, 192)",
        borderWidth: 2,
        pointBackgroundColor: "rgb(75, 192, 192)",
        pointBorderColor: "#fff",
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      r: {
        suggestedMin: 0,
        suggestedMax: 10,
        ticks: {
          stepSize: 2,
          color: "#333",
          backdropColor: "transparent",
        },
        grid: { color: "#ccc" },
        angleLines: { color: "#bbb" },
        pointLabels: {
          color: "#111",
          font: { size: 14 },
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#111",
        titleColor: "#fff",
        bodyColor: "#fff",
      },
    },
  };

  return (
    <div style={{ width: "100%", maxWidth: "450px", margin: "20px auto" }}>
      <Radar data={data} options={options} />
    </div>
  );
}

export default RadarScoreChart;
