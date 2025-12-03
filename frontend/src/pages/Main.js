import React, { useState } from "react";
import axios from "axios";
import "../index.css";
import MatchScoreChart from "../components/MatchScoreChart";

function Main() {
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState("");

  // Upload Resume
  const uploadResume = async () => {
    if (!resumeFile) return alert("Please upload your resume!");

    const formData = new FormData();
    formData.append("resume", resumeFile);

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/upload", formData);
      setResumeText(res.data.text);
      alert("Resume text extracted successfully!");
    } catch (e) {
      alert("Failed to extract resume text");
    }

    setLoading(false);
  };

  // Analyze Resume + Company ONLY
  const analyze = async () => {
    if (!resumeText || !company) {
      return alert("Please upload resume and select a company.");
    }

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/analyze", {
        resumeText,
        company,
      });

      setResult(res.data);
    } catch (e) {
      alert("AI analysis failed");
    }

    setLoading(false);
  };

  return (
    <div className="container">

      {/* HERO SECTION */}
      <div className="hero-section">
        <h1>Analyze Your Resume with AI</h1>
        <p>
          Upload your resume, choose a company, and instantly see your strengths,
          missing skills, and tips to improve.
        </p>
      </div>

      {/* DARK MODE BUTTON */}
      <button
        style={{ float: "right", marginBottom: "10px" }}
        onClick={() => document.body.classList.toggle("dark-mode")}
      >
        Toggle Dark Mode
      </button>

      {/* CHAT ASSISTANT */}
      <button onClick={() => (window.location.href = "/chat")}>
        Open Chat Assistant
      </button>

      {/* UPLOAD RESUME */}
      <h3>Upload Resume (PDF)</h3>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setResumeFile(e.target.files[0])}
      />
      <br />
      <button onClick={uploadResume}>Extract Text</button>

      {/* COMPANY SELECT */}
      <h3>Select Company</h3>
      <select
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        style={{
          padding: "12px",
          width: "100%",
          borderRadius: "10px",
          marginBottom: "20px",
          border: "1px solid var(--border-color)",
          background: "var(--card-bg)",
          color: "var(--text-color)",
        }}
      >
        <option value="">-- Select Company --</option>
        <option value="Google">Google</option>
        <option value="Apple">Apple</option>
        <option value="Deltaforge">Deltaforge</option>
        <option value="Microsoft">Microsoft</option>
        <option value="Tesla">Tesla</option>
      </select>

      {/* ANALYZE BUTTON */}
      <button style={{ marginTop: "20px" }} onClick={analyze}>
        Analyze
      </button>

      {loading && <p>⏳ Processing... please wait</p>}

      {/* RESULT SECTION */}
      {result && (
        <div className="result-card">

          <h2>Match Score: {result.matchScore}/10</h2>
          <MatchScoreChart score={result.matchScore} />

          <h3>Strengths</h3>
          {result.strengths?.map((s, i) => (
            <div key={i} className="strength-box">{s}</div>
          ))}

          <h3>Missing Skills</h3>
          {result.missingSkills?.map((m, i) => (
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
