import React, { useState, useContext } from "react";
import axios from "axios";
import "../index.css";
import jsPDF from "jspdf";

import { ResumeContext } from "../context/ResumeContext";
import CompanyDropdown from "../components/CompanyDropdown";
import MatchScoreChart from "../components/MatchScoreChart";
import RadarScoreChart from "../components/RadarScoreChart";

import Illustration from "../assets/career.svg";

function Main() {
  const { resumeText, setResumeText } = useContext(ResumeContext);

  const [resumeFile, setResumeFile] = useState(null);
  const [company, setCompany] = useState("");
  const [result, setResult] = useState(null);
  const [rewrittenResume, setRewrittenResume] = useState(null); // ⭐ NEW
  const [loading, setLoading] = useState(false);

  // ============================
  // AUTO RESUME TEXT EXTRACTION
  // ============================
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

  // ============================
  // ANALYZE RESUME
  // ============================
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

  // ============================
  // ⭐ AI REWRITE RESUME
  // ============================
  const rewriteResumeAI = async () => {
    if (!resumeText || !company) {
      return alert("Upload resume + select a company!");
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/rewrite", {
        resumeText,
        company,
      });

      setRewrittenResume(res.data.rewritten);
    } catch (err) {
      alert("Rewrite failed!");
    }

    setLoading(false);
  };

  // ============================
  // DOWNLOAD FILE
  // ============================
  const downloadRewritten = () => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const text = rewrittenResume;
  const marginLeft = 40;
  const marginTop = 40;
  const lineHeight = 18;
  const maxWidth = 520;

  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, marginLeft, marginTop);

  doc.save(`Rewritten_${company}_Resume.pdf`);
};

  return (
    <div className="page-wrapper">

      {/* ============================
          HERO SECTION
      ============================ */}
      <div className="landing-container">

        <div className="hero-left">
          <h1 className="hero-title">
            Revolutionize Your Career With <br />
            <span className="highlight">AI Resume Intelligence</span>
          </h1>

          <p className="hero-subtitle">
            Upload your resume, choose your target company, and instantly get
            match scores, strengths, missing skills, improvement tips, & AI rewritten resumes.
          </p>

          {/* Upload Box */}
          <div className="upload-box">
            <label className="upload-label">
              Choose File
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setResumeFile(file);
                  uploadResumeAuto(file);
                }}
              />
            </label>

            <button className="process-btn" onClick={analyze}>
              Process
            </button>

            {/* ⭐ NEW REWRITE BUTTON */}
            <button className="rewrite-btn" onClick={rewriteResumeAI}>
              ✨ AI Rewrite
            </button>
          </div>

          {/* Uploaded File Name */}
          {resumeFile && (
            <div className="uploaded-file-box">
              <span className="file-icon">📄</span>
              <span className="file-name">{resumeFile.name}</span>
            </div>
          )}

          {/* Company Dropdown */}
          <div className="company-row">
            <span className="company-title">Select a Company:</span>

            <div className="company-select">
              <CompanyDropdown selected={company} setSelected={setCompany} />
            </div>
          </div>

          {loading && <p className="loading-text">Processing… please wait</p>}
        </div>

        {/* Illustration */}
        <div className="hero-right">
          <img src={Illustration} alt="AI" className="hero-illustration" />
        </div>

      </div>

      {/* ============================
          RESULT SECTION
      ============================ */}
      {result && (
        <div className="result-card">

          {/* Match Score */}
          <h2>Match Score: {result.matchScore}/10</h2>
          <MatchScoreChart score={result.matchScore} />

          {/* Score Radar Breakdown */}
          <h3>Resume Score Breakdown</h3>

          <RadarScoreChart
            technical={result.technicalSkills}
            soft={result.softSkills}
            exp={result.experienceScore}
            project={result.projectQuality}
            ats={result.atsScore}
          />

          <div className="score-grid">
            <p>Technical Skills: {result.technicalSkills}/10</p>
            <p>Soft Skills: {result.softSkills}/10</p>
            <p>Experience: {result.experienceScore}/10</p>
            <p>Project Quality: {result.projectQuality}/10</p>
            <p>ATS Score: {result.atsScore}/10</p>
          </div>

          {/* Strengths */}
          <h3>Strengths</h3>
          {result.strengths.map((s, i) => (
            <div key={i} className="strength-box">{s}</div>
          ))}

          {/* Missing Skills */}
          <h3>Missing Skills</h3>
          {result.missingSkills.map((m, i) => (
            <div key={i} className="missing-box">{m}</div>
          ))}

          {/* Improvement Tip */}
          <h3>Improvement Tip</h3>
          <div className="tip-box">{result.tip}</div>

        </div>
      )}

      {/* ============================
          ⭐ REWRITTEN RESUME SECTION
      ============================ */}
      {rewrittenResume && (
        <div className="result-card">
          <h2>✨ AI-Rewritten Resume for {company}</h2>

          <pre className="rewritten-box">{rewrittenResume}</pre>

          <button className="process-btn" onClick={downloadRewritten}>
            ⬇ Download Rewritten Resume
          </button>
        </div>
      )}

    </div>
  );
}

export default Main;
