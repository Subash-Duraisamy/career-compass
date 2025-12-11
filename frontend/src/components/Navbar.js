import React from "react";
import "../index.css";

function Navbar() {
  return (
    <div className="navbar">
      <h2 className="logo">CareerCompass</h2>

      <div className="nav-links">
        <a href="/">Home</a>
        <a href="/jobs">Jobs</a>
        <a href="/interview">Interview</a>
        <a href="/roadmap">Roadmap</a> 
        <a href="/chat">Chat</a>

      </div>
    </div>
  );
}

export default Navbar;
