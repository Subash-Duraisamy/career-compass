import React, { useState, useContext } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "../index.css";

import { motion, useScroll, useTransform } from "framer-motion";
import { ResumeContext } from "../context/ResumeContext";

import CompanyDropdown from "../components/CompanyDropdown";
import MatchScoreChart from "../components/MatchScoreChart";
import RadarScoreChart from "../components/RadarScoreChart";

import Illustration from "../assets/career.svg";

function ResumeAnalyzer() {
  const { resumeText, setResumeText } = useContext(ResumeContext);

  const [resumeFile, setResumeFile] = useState(null);
  const [company, setCompany] = useState("");
  const [result, setResult] = useState(null);
  const [rewrittenResume, setRewrittenResume] = useState(null);
  const [loading, setLoading] = useState(false);

  /* PARALLAX */
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 300], [0, -50]);
  const imageY = useTransform(scrollY, [0, 300], [0, -30]);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  /* Upload Resume */
  const uploadResumeAuto = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("resume", file);

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/upload", formData);
      setResumeText(res.data.text);
    } catch {
      alert("Resume extraction failed!");
    }
    setLoading(false);
  };

  /* Analyze Resume */
  const analyze = async () => {
    if (!resumeText || !company) return alert("Upload resume + select a company");

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/analyze", {
        resumeText,
        company,
      });

      setResult(res.data);
    } catch {
      alert("AI analysis failed");
    }
    setLoading(false);
  };

  /* AI Rewrite */
  const rewriteResumeAI = async () => {
    if (!resumeText || !company) return alert("Upload resume + select company");

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/rewrite", {
        resumeText,
        company,
      });

      setRewrittenResume(res.data.rewritten);
    } catch {
      alert("Rewrite failed");
    }
    setLoading(false);
  };

  /* Download PDF */
  const downloadRewritten = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const maxWidth = 520;

    const lines = doc.splitTextToSize(rewrittenResume, maxWidth);
    doc.text(lines, 40, 40);
    doc.save(`Rewritten_${company}_Resume.pdf`);
  };

  return (
    <div className="page-wrapper">

      {/* HERO SECTION */}
      <div className="landing-container">

        {/* LEFT */}
        <motion.div
          className="hero-left"
          style={{ y: heroY }}
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="hero-title">
            AI Resume <span className="highlight">Analyzer & Rewriter</span>
          </h1>

          <p className="hero-subtitle">
            Upload your resume → choose target company → get ATS score, skills
            match, insights, and AI-powered rewrite.
          </p>

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

            <button className="rewrite-btn" onClick={rewriteResumeAI}>
              ✨ AI Rewrite
            </button>
          </div>

          {resumeFile && (
            <div className="uploaded-file-box">
              <span className="file-icon">📄</span>
              <span>{resumeFile.name}</span>
            </div>
          )}

          <div className="company-row">
            <span className="company-title">Select a Company:</span>
            <CompanyDropdown selected={company} setSelected={setCompany} />
          </div>

          {loading && <p className="loading-text">Processing...</p>}
        </motion.div>

        {/* RIGHT */}
        <motion.div
          className="hero-right"
          style={{ y: imageY }}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <img src={Illustration} className="hero-illustration" alt="AI Resume" />
        </motion.div>
      </div>

      {/* RESULT SECTION */}
      {result && (
        <motion.div
          className="analyzer-card"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <h2>Match Score: {result.matchScore}/10</h2>

          <MatchScoreChart score={result.matchScore} />

          <h3>Resume Score Breakdown</h3>

          <RadarScoreChart
            technical={result.technicalSkills}
            soft={result.softSkills}
            exp={result.experienceScore}
            project={result.projectQuality}
            ats={result.atsScore}
          />

          <div className="analyzer-score-grid">
            <p>Technical Skills: {result.technicalSkills}/10</p>
            <p>Soft Skills: {result.softSkills}/10</p>
            <p>Experience: {result.experienceScore}/10</p>
            <p>Project Quality: {result.projectQuality}/10</p>
            <p>ATS Score: {result.atsScore}/10</p>
          </div>

          <h3>Strengths</h3>
          {result.strengths.map((s, i) => (
            <div key={i} className="analyzer-strength">{s}</div>
          ))}

          <h3>Missing Skills</h3>
          {result.missingSkills.map((m, i) => (
            <div key={i} className="analyzer-missing">{m}</div>
          ))}

          <h3>Improvement Tip</h3>
          <div className="analyzer-tip">{result.tip}</div>
        </motion.div>
      )}

      {/* REWRITTEN RESUME */}
      {rewrittenResume && (
        <motion.div
          className="result-card"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <h2>✨ AI-Rewritten Resume for {company}</h2>

          <pre className="analyzer-rewrite">{rewrittenResume}</pre>

          <button className="process-btn" onClick={downloadRewritten}>
            ⬇ Download Rewritten Resume
          </button>
        </motion.div>
      )}

    </div>
  );
}

export default ResumeAnalyzer;
