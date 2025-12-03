import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function MatchScoreChart({ score }) {
  const data = {
    labels: ["Match Score", "Gap"],
    datasets: [
      {
        data: [score, 10 - score],
        backgroundColor: ["#4ade80", "#f87171"], // green, red
        borderColor: ["#4ade80", "#f87171"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ width: "300px", margin: "auto" }}>
      <Pie data={data} />
    </div>
  );
}

export default MatchScoreChart;
