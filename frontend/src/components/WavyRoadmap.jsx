import React from "react";
import "./WavyRoadmap.css";

function WavyRoadmap({ roadmap }) {
  return (
    <div className="roadmap-wrapper">
      <h2 className="timeline-title">LEARNING ROADMAP</h2>

      <div className="timeline-container">
        <div className="timeline-road"></div>

        {roadmap.map((phase, index) => (
          <div key={index} className="timeline-item">
            <div className="timeline-marker">
              <span>{index + 1}</span>
            </div>

            <div className="timeline-content">
              <h3>{phase.title}</h3>
              <ul>
                {phase.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WavyRoadmap;
