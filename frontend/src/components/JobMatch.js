import React, { useState } from "react";
import axios from "axios";
import "./JobMatch.css";
import JobMatchChart from "./JobMatchChart";

function JobMatch({ resumeText }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const findJobs = async () => {
    if (!resumeText) return alert("Please upload your resume first!");

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/job-match", {
        resumeText
      });

      setJobs(res.data.jobs);
    } catch {
      alert("Job matching failed");
    }

    setLoading(false);
  };

  return (
    <div className="jobmatch-container">
      <button onClick={findJobs} className="jobmatch-btn">
        Find Matching Jobs
      </button>

      {loading && <p>⏳ Finding best jobs...</p>}
            {jobs.length > 0 && <JobMatchChart jobs={jobs} />}

      <div className="jobmatch-list">
        {jobs.map((job, index) => (
          <div key={index} className="job-card">
            <h2>{job.title}</h2>

            <p className="score">Match Score: {job.matchScore}/10</p>

            <h4>Why you're a fit:</h4>
            <p>{job.reason}</p>

            <h4>Missing Skills</h4>
            <ul>
              {job.missingSkills.map((skill, i) => (
                <li key={i}>{skill}</li>
              ))}
            </ul>

            <h4>Recommended Certifications</h4>
            <ul>
              {job.recommendedCertifications.map((cert, i) => (
                <li key={i}>{cert}</li>
              ))}
            </ul>

            <h4>Salary Prediction</h4>
            <p>{job.salaryPrediction}</p>

          </div>
        ))}
      </div>
    </div>
  );
}

export default JobMatch;
