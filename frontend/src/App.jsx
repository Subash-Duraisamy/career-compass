import React, { useState } from "react";
import axios from "axios";

export default function App() {
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [resumeSkills, setResumeSkills] = useState([]);
  const [jdSkills, setJdSkills] = useState([]);
  const [scoreResult, setScoreResult] = useState(null);
  const [embScore, setEmbScore] = useState(null);
  const [gapResult, setGapResult] = useState(null);
  const [suggestion, setSuggestion] = useState(null);

  const backend = "http://localhost:8000";

  async function uploadResume() {
    if (!resumeFile) return alert("Choose a file");
    const form = new FormData();
    form.append("file", resumeFile);
    try {
      const res = await axios.post(`${backend}/extract-resume`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResumeText(res.data.text || "");
      alert("Resume text extracted — now extract skills.");
    } catch (err) {
      console.error(err);
      alert("Upload failed. Is backend running?");
    }
  }

  async function extractResumeSkills() {
    if (!resumeText) return alert("No resume text");
    const res = await axios.post(`${backend}/extract-skills`, { text: resumeText });
    setResumeSkills(res.data.skills || []);
  }

  async function extractJDskills() {
    if (!jdText) return alert("Paste JD first");
    const res = await axios.post(`${backend}/extract-skills`, { text: jdText });
    setJdSkills(res.data.skills || []);
  }

  async function computeOverlapScore() {
    const res = await axios.post(`${backend}/match-score`, {
      resume_skills: resumeSkills,
      jd_skills: jdSkills,
    });
    setScoreResult(res.data);
  }

  async function computeEmbeddingsScore() {
    const res = await axios.post(`${backend}/embeddings-match`, {
      resume_text: resumeText,
      jd_text: jdText,
      resume_skills: resumeSkills,
      jd_skills: jdSkills,
    });
    setEmbScore(res.data);
  }

  async function runGapAnalysis() {
    const res = await axios.post(`${backend}/gap-analysis`, {
      resume_text: resumeText,
      jd_text: jdText,
      resume_skills: resumeSkills,
      jd_skills: jdSkills,
    });
    setGapResult(res.data);
  }

  async function getSuggestion() {
    const res = await axios.post(`${backend}/suggestion`, {
      resume_text: resumeText,
      jd_text: jdText,
      resume_skills: resumeSkills,
      jd_skills: jdSkills,
    });
    setSuggestion(res.data);
  }

  return (
    <div style={{ maxWidth: 900, margin: "20px auto", fontFamily: "Arial, sans-serif" }}>
      <h1>Career Compass — AI Starter</h1>

      <section style={card}>
        <h3>1) Upload Resume (PDF)</h3>
        <input type="file" accept=".pdf" onChange={(e) => setResumeFile(e.target.files[0])} />
        <button onClick={uploadResume} style={btn}>Upload & Extract Text</button>
        <div style={{ marginTop: 8 }}>
          <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} rows={8} style={ta} />
        </div>
        <button onClick={extractResumeSkills} style={btn}>Extract Skills from Resume (AI)</button>
        <div>Resume Skills: <b>{resumeSkills.join(", ")}</b></div>
      </section>

      <section style={card}>
        <h3>2) Paste Job Description (JD)</h3>
        <textarea placeholder="Paste JD here" value={jdText} onChange={(e) => setJdText(e.target.value)} rows={8} style={ta} />
        <button onClick={extractJDskills} style={btn}>Extract Skills from JD (AI)</button>
        <div>JD Skills: <b>{jdSkills.join(", ")}</b></div>
      </section>

      <section style={card}>
        <h3>3) Scoring & Analysis</h3>
        <button onClick={computeOverlapScore} style={btn}>Compute Overlap Score (0-10)</button>
        <button onClick={computeEmbeddingsScore} style={btn}>Compute Embeddings Score (0-10)</button>
        <button onClick={runGapAnalysis} style={btn}>Run Gap Analysis</button>
        <button onClick={getSuggestion} style={btn}>Get One-Line Suggestion</button>

        {scoreResult && (
          <div style={{ marginTop: 8 }}>
            <h4>Overlap Score: {scoreResult.score} / 10</h4>
            <pre>{JSON.stringify(scoreResult.explanation, null, 2)}</pre>
          </div>
        )}

        {embScore && (
          <div style={{ marginTop: 8 }}>
            <h4>Embeddings Score: {embScore.score} / 10</h4>
            {embScore.similarity && <div>Cosine similarity: {embScore.similarity}</div>}
          </div>
        )}

        {gapResult && (
          <div style={{ marginTop: 8 }}>
            <h4>Gap Analysis ({gapResult.source})</h4>
            <pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(gapResult.analysis, null, 2)}</pre>
          </div>
        )}

        {suggestion && (
          <div style={{ marginTop: 8 }}>
            <h4>Suggestion ({suggestion.source})</h4>
            <div style={{whiteSpace:"pre-wrap"}}>{suggestion.suggestion}</div>
          </div>
        )}
      </section>

    </div>
  );
}

const card = { background: "#fff", padding: 16, borderRadius: 8, boxShadow: "0 2px 6px rgba(0,0,0,0.05)", marginBottom: 16 };
const btn = { margin: "6px 8px 6px 0", padding: "8px 12px", cursor: "pointer" };
const ta = { width: "100%", fontFamily: "monospace", padding: 8 };
