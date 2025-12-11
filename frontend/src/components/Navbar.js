import React from "react";
import { NavLink } from "react-router-dom";
import "../index.css";

function Navbar() {
  return (
    <div className="navbar">
      <h2 className="logo">CareerCompass</h2>

      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => isActive ? "active-link" : ""}>Home</NavLink>
        <NavLink to="/resume-analyzer" className={({ isActive }) => isActive ? "active-link" : ""}>Resume Analyzer</NavLink>
        <NavLink to="/jobs" className={({ isActive }) => isActive ? "active-link" : ""}>Jobs</NavLink>
        <NavLink to="/interview" className={({ isActive }) => isActive ? "active-link" : ""}>Interview</NavLink>
        <NavLink to="/roadmap" className={({ isActive }) => isActive ? "active-link" : ""}>Roadmap</NavLink>
        <NavLink to="/chat" className={({ isActive }) => isActive ? "active-link" : ""}>Chat</NavLink>
      </div>
    </div>
  );
}

export default Navbar;
