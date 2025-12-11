import React, { useState, useEffect } from "react";
import axios from "axios";
import "../index.css";

function InterviewPage() {
  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState("easy");

  const [question, setQuestion] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);

  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [finalReport, setFinalReport] = useState(null);

  const [timeLeft, setTimeLeft] = useState(0);

  /* =========================
        Countdown Timer
  ========================== */
  useEffect(() => {
    if (!started || timeLeft <= 0 || !question) return;

    const t = setInterval(() => {
      setTimeLeft((sec) => sec - 1);
    }, 1000);

    return () => clearInterval(t);
  }, [started, timeLeft, question]);

  useEffect(() => {
    // Auto-submit when timer hits 0
    if (timeLeft === 0 && started && question) {
      submitAnswer();
    }
  }, [timeLeft]);

  /* =========================
        START INTERVIEW
  ========================== */
  const startInterview = async () => {
    if (!role) return alert("Please choose a role!");

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/interview/start", {
        role,
        difficulty,
      });

      setQuestion(res.data.question);
      setRound(1);
      setScore(0);
      setFeedback(null);
      setFinalReport(null);
      setStarted(true);
      setUserAnswer("");
      setTimeLeft(res.data.timer);

    } catch {
      alert("Unable to start interview");
    }
    setLoading(false);
  };

  /* =========================
        SUBMIT ANSWER
  ========================== */
  const submitAnswer = async () => {
    if (!userAnswer.trim()) userAnswer = "No answer provided";

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/interview/answer", {
        question,
        userAnswer,
        role,
        index: round,
        score,
        difficulty,
      });

      setUserAnswer("");

      if (res.data.finished) {
        setFinalReport(res.data);
        setQuestion("");
        setStarted(false);
      } else {
        setFeedback(res.data.feedback);
        setQuestion(res.data.nextQuestion);
        setRound(res.data.index);
        setScore(res.data.score);
        setTimeLeft(res.data.timer);
      }

    } catch {
      alert("Evaluation failed");
    }
    setLoading(false);
  };

  return (
    <div className="container">

      {/* HEADER */}
      <div className="hero-section">
        <h1>AI Mock Interview</h1>
        <p>Practice technical, HR & SDE-level questions with instant feedback.</p>
      </div>

      {/* ROLE + DIFFICULTY */}
      <h3>Select Role</h3>
      <select className="role-select" value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="">-- Choose Role --</option>
        <option value="Frontend Developer">Frontend Developer</option>
        <option value="Backend Developer">Backend Developer</option>
        <option value="Full Stack Developer">Full Stack Developer</option>
        <option value="Data Analyst">Data Analyst</option>
        <option value="Cloud Engineer">Cloud Engineer</option>
        <option value="Machine Learning Engineer">Machine Learning Engineer</option>
      </select>

      <h3>Select Difficulty</h3>
      <select className="role-select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard (Real SDE)</option>
      </select>

      {!started && (
        <button className="process-btn" onClick={startInterview} style={{ marginTop: "12px" }}>
          Start Interview
        </button>
      )}

      {loading && <p className="loading-text">⏳ AI Thinking…</p>}

      {/* QUESTION CARD */}
      {started && question && (
        <div className="result-card" style={{ marginTop: "20px" }}>

          <h3>Question {round} / 5</h3>
          <p className="timer-box">⏳ Time Left: {timeLeft}s</p>

          <p className="question-text">{question}</p>

          <textarea
            className="answer-box"
            placeholder="Write your answer..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
          ></textarea>

          <button className="process-btn" onClick={submitAnswer}>
            Submit Answer
          </button>

          {feedback && (
            <div className="tip-box">
              <strong>Feedback:</strong>
              <p><b>✔ Strengths:</b> {feedback.strengths}</p>
              <p><b>⚠ Weaknesses:</b> {feedback.weaknesses}</p>
            </div>
          )}
        </div>
      )}

      {/* FINAL REPORT */}
      {finalReport && (
        <div className="result-card" style={{ marginTop: "25px" }}>
          <h2>🎉 Interview Complete!</h2>
          <h3>Final Score: {finalReport.finalScore}/10</h3>

          <h3>Strengths</h3>
          <p>{finalReport.summary.strengths}</p>

          <h3>Weaknesses</h3>
          <p>{finalReport.summary.weaknesses}</p>

          <h3>Recommendations</h3>
          <p>{finalReport.recommendation}</p>
        </div>
      )}

    </div>
  );
}

export default InterviewPage;
