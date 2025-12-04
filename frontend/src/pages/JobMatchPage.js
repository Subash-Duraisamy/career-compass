import React, { useContext } from "react";
import { ResumeContext } from "../context/ResumeContext";
import JobMatch from "../components/JobMatch";
import Illustration from "../assets/career.svg";
import "../index.css";

function JobMatchPage() {
  const { resumeText } = useContext(ResumeContext);

  return (
    <div className="page-wrapper">

      {/* FIXED NAVBAR APPEARS AUTOMATICALLY */}

      <div className="landing-container">
        
        <div className="hero-left">
          <h1 className="hero-title">
            Discover the Best Jobs <br />
            <span className="highlight">Matched to Your Resume</span>
          </h1>

          <p className="hero-subtitle">
            AI analyzes your resume and shows the top job roles you qualify for,
            along with salaries & required skills.
          </p>

          {!resumeText ? (
            <p style={{ color: "red", fontSize: "16px" }}>
              ⚠ Please upload your resume from Home page first.
            </p>
          ) : (
            <JobMatch resumeText={resumeText} />
          )}
        </div>

        <div className="hero-right">
          <img src={Illustration} className="hero-illustration" alt="" />
        </div>

      </div>
    </div>
  );
}

export default JobMatchPage;
