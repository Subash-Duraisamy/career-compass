import React, { useState, useContext } from "react";
import axios from "axios";
import "../index.css";
import "../components/RoadmapPage.css";

import { ResumeContext } from "../context/ResumeContext";
import WavyRoadmap from "../components/WavyRoadmap";

function RoadmapPage() {
  const { resumeText, setResumeText } = useContext(ResumeContext);

  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [projects, setProjects] = useState([]);
  const [resumeFile, setResumeFile] = useState(null);

  // Upload Resume
  const uploadResume = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("resume", file);

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/upload", formData);
      setResumeText(res.data.text);
      setResumeFile(file);
    } catch {
      alert("Resume extraction failed!");
    }
    setLoading(false);
  };

  // Remove resume
  const removeResume = () => {
    setResumeText("");
    setResumeFile(null);
    setRoadmap(null);
    setProjects([]);
  };

  // Generate Roadmap
  const generateRoadmap = async () => {
    if (!resumeText) return alert("Please upload your resume first!");

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/roadmap", {
        resumeText,
      });

      setRoadmap(res.data.roadmap || []);

      if (res.data.projects) {
        const merged = [
          ...(res.data.projects.easy || []),
          ...(res.data.projects.medium || []),
          ...(res.data.projects.advanced || []),
        ];
        setProjects(merged);
      }
    } catch (err) {
      alert("AI failed to generate roadmap!");
    }

    setLoading(false);
  };

  return (
    <div className="roadmap-wrapper">

      {/* HEADER */}
      <div className="roadmap-header">
        <h1 className="roadmap-title">AI Roadmap & Project Mentor</h1>
        <p className="roadmap-sub">
          Get a personalized learning roadmap & industry-ready project ideas based on <br />
          your resume strengths.
        </p>
      </div>

      {/* UPLOAD BOX */}
      <div className="resume-upload-box">
        {!resumeText ? (
          <label className="upload-btn">
            📄 Upload Resume
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => uploadResume(e.target.files[0])}
            />
          </label>
        ) : (
          <div className="resume-info-card">
            <span className="resume-file-icon">📘</span>
            <span className="resume-file-name">{resumeFile?.name}</span>

            <button className="remove-resume-btn" onClick={removeResume}>
              Remove ✖
            </button>
          </div>
        )}
      </div>

      {/* ACTION BUTTON */}
      <button className="generate-roadmap-btn" onClick={generateRoadmap}>
        Generate Roadmap 🚀
      </button>

      {loading && <p className="loading-txt">⏳ AI is analyzing your resume…</p>}

      {/* ROADMAP SECTION */}
      {roadmap?.length > 0 && (
        <div className="glass-card roadmap-display">
          <h2 className="section-heading">📌 Your Learning Roadmap</h2>
          <WavyRoadmap roadmap={roadmap} />
        </div>
      )}

      {/* PROJECT SECTION */}
      {projects?.length > 0 && (
        <div className="glass-card projects-container">
          <h2 className="section-heading">💡 Recommended Projects</h2>

          <div className="project-grid">
            {projects.map((p, i) => (
              <div key={i} className="project-card">
                <h3 className="project-title">{p.name}</h3>

                <p><b>Problem:</b> {p.problem}</p>
                <p><b>Tech Stack:</b> {p.techStack.join(", ")}</p>
                <p><b>Difficulty:</b> {p.difficulty}</p>

                <h4 className="learn-title">What You Will Learn:</h4>
                <ul className="learn-list">
                  {p.whatYouLearn.map((skill, j) => (
                    <li key={j}>{skill}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default RoadmapPage;
