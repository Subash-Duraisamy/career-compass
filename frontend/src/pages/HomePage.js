// =======================
// pages/HomePage.js
// =======================
import React from "react";
import { motion } from "framer-motion";
import "../index.css";

// ⭐ IMPORT IMAGES PROPERLY
import UnlimitedIcon from "../assets/unlimted resume.png";
import AnalysisIcon from "../assets/analysis.png";
import EvaluateIcon from "../assets/evaluate.jpg";
import InterviewIcon from "../assets/interview.png";

function HomePage() {
  return (
    <div className="home-wrapper">

      {/* HERO SECTION */}
      <motion.div
        className="home-hero"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="home-title">
          Welcome to <span className="highlight">CareerCompass</span>
        </h1>

        <p className="home-sub">
          Your AI-powered companion for resume analysis, interviews,
          roadmaps, project guidance and career growth.
        </p>

        <a href="/resume-analyzer">
          <button className="home-cta-btn">Start Resume Analysis</button>
        </a>
      </motion.div>

      {/* FEATURE GRID */}
      <div className="feature-section">
        <h2 className="feature-heading">Why Choose CareerCompass?</h2>

        <div className="feature-grid">

          <motion.div className="feature-card" whileHover={{ y: -8 }}>
            <img src={UnlimitedIcon} className="feature-icon" alt="Unlimited Resume" />
            <h3>Performance Analysis</h3>
            <p>Analyze your resume strengths & weaknesses instantly.</p>
          </motion.div>

          <motion.div className="feature-card" whileHover={{ y: -8 }}>
            <img src={AnalysisIcon} className="feature-icon" alt="Analysis" />
            <h3>Unlimited Resume Evaluations</h3>
            <p>Analyze & rewrite your resumes unlimited times.</p>
          </motion.div>

          <motion.div className="feature-card" whileHover={{ y: -8 }}>
            <img src={EvaluateIcon} className="feature-icon" alt="Evaluation" />
            <h3>Smart Breaking of Resume</h3>
            <p>RAG-powered extraction of your best achievements.</p>
          </motion.div>

          <motion.div className="feature-card" whileHover={{ y: -8 }}>
            <img src={InterviewIcon} className="feature-icon" alt="AI Interview" />
            <h3>AI Mock Interviews</h3>
            <p>Difficulty levels, scoring, & real HR-style feedback.</p>
          </motion.div>

        </div>
      </div>

    </div>
  );
}

export default HomePage;
