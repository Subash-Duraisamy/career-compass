import React, { useState, useContext } from "react";
import axios from "axios";
import "../index.css";

import { ResumeContext } from "../context/ResumeContext";
import WavyRoadmap from "../components/WavyRoadmap";

function RoadmapPage() {
  const { resumeText, setResumeText } = useContext(ResumeContext);

  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [projects, setProjects] = useState([]);
  const [resumeFile, setResumeFile] = useState(null);

  // ==============================
  // Upload resume (auto extract text)
  // ==============================
  const uploadResume = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("resume", file);

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/upload", formData);
      setResumeText(res.data.text);
      setResumeFile(file);
    } catch (err) {
      alert("Resume extraction failed!");
    }
    setLoading(false);
  };

  // ==============================
  // Remove Resume
  // ==============================
  const removeResume = () => {
    setResumeText("");
    setResumeFile(null);
    setRoadmap(null);
    setProjects([]);
  };

  // ==============================
  // Generate Roadmap & Projects
  // ==============================
  const generateRoadmap = async () => {
    if (!resumeText) return alert("Please upload your resume first!");

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/roadmap", {
        resumeText,
      });

      setRoadmap(res.data.roadmap || []);

      // Merge project categories into one list
      if (res.data.projects) {
        const merged = [
          ...(res.data.projects.easy || []),
          ...(res.data.projects.medium || []),
          ...(res.data.projects.advanced || []),
        ];
        setProjects(merged);
      }
    } catch (err) {
      console.error(err);
      alert("Unable to generate roadmap!");
    }

    setLoading(false);
  };

  return (
    <div className="container roadmap-page">

      <h1 className="page-title">AI Roadmap & Project Suggestions</h1>
      <p className="page-subtext">
        Personalized learning path and project suggestions based on your resume.
      </p>

      {/* ==============================
          RESUME UPLOAD / REMOVE SECTION
      ============================== */}
      <div className="resume-actions">

        {/* If resume NOT uploaded → show upload */}
        {!resumeText && (
          <label className="upload-label">
            Upload Resume
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => uploadResume(e.target.files[0])}
            />
          </label>
        )}

        {/* If resume uploaded → show file + remove */}
        {resumeText && (
          <div className="uploaded-resume-box">
            <span className="file-icon">📄</span>
            <span className="file-name">{resumeFile?.name || "Resume Added"}</span>

            <button className="remove-btn" onClick={removeResume}>
              Remove Resume ❌
            </button>
          </div>
        )}
      </div>

      {/* Generate Roadmap Button */}
      <button className="process-btn" onClick={generateRoadmap}>
        Generate Roadmap
      </button>

      {loading && <p className="loading-text">⏳ AI is analyzing your resume…</p>}

      {/* ==============================
          ROADMAP SECTION
      ============================== */}
      {roadmap && roadmap.length > 0 && (
        <div className="result-card roadmap-section">
          <h2 className="section-title">Learning Roadmap</h2>
          <WavyRoadmap roadmap={roadmap} />
        </div>
      )}

      {/* ==============================
          PROJECT SUGGESTIONS
      ============================== */}
      {projects.length > 0 && (
        <div className="result-card project-section">
          <h2 className="section-title">Recommended Projects</h2>

          <div className="project-grid">
            {projects.map((p, i) => (
              <div key={i} className="project-box">
                <h3>{p.name}</h3>

                <p><b>Problem:</b> {p.problem}</p>
                <p><b>Tech Stack:</b> {p.techStack.join(", ")}</p>
                <p><b>Difficulty:</b> {p.difficulty}</p>

                <h4>What You Will Learn:</h4>
                <ul>
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
