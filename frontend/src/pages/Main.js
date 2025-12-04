import React, { useState, useContext } from "react";
import axios from "axios";
import "../index.css";

import { ResumeContext } from "../context/ResumeContext";
import CompanyDropdown from "../components/CompanyDropdown";
import MatchScoreChart from "../components/MatchScoreChart";

import Illustration from "../assets/career.svg";

function Main() {
  const { resumeText, setResumeText } = useContext(ResumeContext);

  const [resumeFile, setResumeFile] = useState(null);
  const [company, setCompany] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auto Resume Extraction
  const uploadResumeAuto = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("resume", file);

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/upload", formData);
      setResumeText(res.data.text);
    } catch (err) {
      alert("Resume extraction failed!");
    }
    setLoading(false);
  };

  // Analyze Resume
  const analyze = async () => {
    if (!resumeText || !company) {
      return alert("Upload resume + select a company first");
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/analyze", {
        resumeText,
        company,
      });
      setResult(res.data);
    } catch (err) {
      alert("AI analysis failed");
    }
    setLoading(false);
  };

  return (
    <div className="page-wrapper">

     

      {/* MAIN SECTION */}
      <div className="landing-container">

        <div className="hero-left">
          <h1 className="hero-title">
            Revolutionize Your Career With <br />
            <span className="highlight">AI Resume Intelligence</span>
          </h1>

          <p className="hero-subtitle">
            Upload your resume, choose your target company, and instantly get
            match scores, strengths, missing skills, and improvement tips.
          </p>

          {/* Upload Section */}
          <div className="upload-box">
            <label className="upload-label">
              Choose File
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  const f = e.target.files[0];
                  setResumeFile(f);
                  uploadResumeAuto(f);
                }}
              />
            </label>

            <button className="process-btn" onClick={analyze}>
              Process
            </button>
          </div>

          {/* SHOW UPLOADED FILE NAME */}
          {resumeFile && (
            <div className="uploaded-file-box">
              <span className="file-icon">📄</span>
              <span className="file-name">{resumeFile.name}</span>
            </div>
          )}

          {/* Dropdown Row */}
          <div className="company-row">
            <span className="company-title">Select a Company:</span>

            <div className="company-select">
              <CompanyDropdown selected={company} setSelected={setCompany} />
            </div>
          </div>

          {loading && <p className="loading-text">Analyzing… please wait</p>}
        </div>

        {/* Right Image */}
        <div className="hero-right">
          <img src={Illustration} alt="AI" className="hero-illustration" />
        </div>

      </div>

      {/* RESULT CARD */}
      {result && (
        <div className="result-card">
          <h2>Match Score: {result.matchScore}/10</h2>
          <MatchScoreChart score={result.matchScore} />

          <h3>Strengths</h3>
          {result.strengths.map((s, i) => (
            <div key={i} className="strength-box">{s}</div>
          ))}

          <h3>Missing Skills</h3>
          {result.missingSkills.map((m, i) => (
            <div key={i} className="missing-box">{m}</div>
          ))}

          <h3>Improvement Tip</h3>
          <div className="tip-box">{result.tip}</div>
        </div>
      )}

    </div>
  );
}

export default Main;
