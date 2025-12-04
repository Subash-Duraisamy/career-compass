import React, { useState } from "react";
import axios from "axios";
import "../index.css";

function InterviewPage() {
  const [role, setRole] = useState("");
  const [question, setQuestion] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);

  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [finalReport, setFinalReport] = useState(null);

  // Start Interview
  const startInterview = async () => {
    if (!role) return alert("Please choose a job role!");

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/interview/start", { role });

      setQuestion(res.data.question);
      setStarted(true);
      setFeedback(null);
      setUserAnswer("");
      setRound(1);
      setScore(0);
      setFinalReport(null);

    } catch {
      alert("Unable to start interview.");
    }
    setLoading(false);
  };

  // Submit answer
  const submitAnswer = async () => {
    if (!userAnswer.trim()) return alert("Please type your answer!");

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/interview/answer", {
        question,
        userAnswer,
        role,
        index: round,
        score,
      });

      setUserAnswer("");

      if (res.data.finished) {
        setFinalReport(res.data);
        setQuestion("");
        setFeedback(null);
      } else {
        setFeedback(res.data.feedback);
        setQuestion(res.data.nextQuestion);
        setRound(res.data.index);
        setScore(res.data.score);
      }

    } catch {
      alert("Evaluation failed.");
    }
    setLoading(false);
  };

  return (
    <div className="container">

      {/* HERO */}
      <div className="hero-section">
        <h1>AI Mock Interview</h1>
        <p>Practice technical & HR questions with instant AI feedback.</p>
      </div>

      {/* ROLE SELECTOR */}
      <h3 className="role-heading">Select Job Role</h3>

      <select
        className="role-select"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="">-- Choose Role --</option>
        <option value="Frontend Developer">Frontend Developer</option>
        <option value="Backend Developer">Backend Developer</option>
        <option value="Full Stack Developer">Full Stack Developer</option>
        <option value="Data Analyst">Data Analyst</option>
        <option value="Cloud Engineer">Cloud Engineer</option>
        <option value="Machine Learning Engineer">Machine Learning Engineer</option>
      </select>

      {!started && (
        <button className="process-btn" onClick={startInterview} style={{ marginTop: "10px" }}>
          Start Interview
        </button>
      )}

      {loading && <p className="loading-text">⏳ AI Thinking…</p>}

      {/* QUESTION SECTION */}
      {started && question && (
        <div className="result-card" style={{ marginTop: "18px" }}>

          <h3 style={{ marginBottom: "6px" }}>Question {round} of 5</h3>
          <p style={{ fontWeight: 600, marginBottom: "12px" }}>{question}</p>

          <textarea
            className="answer-box"
            rows={5}
            placeholder="Write your answer professionally..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
          />

          <button className="process-btn" onClick={submitAnswer} style={{ marginTop: "12px" }}>
            Submit Answer
          </button>

          {feedback && (
            <div className="tip-box" style={{ marginTop: "15px" }}>
              <strong>Feedback:</strong>
              {feedback.strengths && (
                <p><b>✔ Strengths:</b> {feedback.strengths}</p>
              )}
              {feedback.weaknesses && (
                <p><b>⚠ Weaknesses:</b> {feedback.weaknesses}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* FINAL REPORT */}
      {finalReport && (
        <div className="result-card" style={{ marginTop: "25px" }}>

          <h2>🎉 Interview Complete!</h2>
          <h3>Final Score: {finalReport.finalScore}/10</h3>

          <h3 style={{ marginTop: "10px" }}>Strengths</h3>
          <p>{finalReport.summary.strengths}</p>

          <h3 style={{ marginTop: "10px" }}>Weaknesses</h3>
          <p>{finalReport.summary.weaknesses}</p>

          <h3 style={{ marginTop: "10px" }}>Recommendations</h3>
          <p>{finalReport.recommendation}</p>

        </div>
      )}

    </div>
  );
}

export default InterviewPage;
