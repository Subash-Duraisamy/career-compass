import React, { useContext } from "react";
import { motion } from "framer-motion";
import { ResumeContext } from "../context/ResumeContext";
import JobMatch from "../components/JobMatch";
import Illustration from "../assets/career.svg";
import "../components/JobMatch.css";

function JobMatchPage() {
  const { resumeText } = useContext(ResumeContext);

  return (
    <div className="job-page-wrapper">

      {/* HERO SECTION */}
      <motion.div 
        className="job-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="job-hero-left">
          <h1 className="job-title">
            Find The Best Career Roles  
            <span className="job-highlight"> Tailored For You</span>
          </h1>

          <p className="job-subtitle">
            Our advanced AI analyzes your resume and provides the most accurate  
            job recommendations with salary predictions & missing skills.
          </p>

          {!resumeText && (
            <p className="job-warning">⚠ Upload your resume in Resume Analyzer first.</p>
          )}
        </div>

        <motion.div 
          className="job-hero-right"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <img src={Illustration} className="job-illustration" alt="Illustration" />
        </motion.div>
      </motion.div>

      {/* JOB MATCH SECTION */}
      <motion.div
        className="job-results-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.7 }}
      >
        {resumeText ? <JobMatch resumeText={resumeText} /> : null}
      </motion.div>

    </div>
  );
}

export default JobMatchPage;
