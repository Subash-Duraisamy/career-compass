import React, { useState } from "react";
import { FaSun, FaMoon, FaUserCircle } from "react-icons/fa";
import "./Navbar.css";

function Navbar() {
  const [dark, setDark] = useState(false);

  const toggleTheme = () => {
    setDark(!dark);
    document.body.classList.toggle("dark-mode");
  };

  return (
    <nav className="navbar">
      {/* Left logo */}
      <div className="nav-left">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Sample_User_Icon.png/600px-Sample_User_Icon.png"
          alt="logo"
          className="nav-logo"
        />
        <h2 className="nav-title">Career Compass</h2>
      </div>

      {/* Center menu */}
      <ul className="nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="#">Upload</a></li>
        <li><a href="/chat">Chat Assistant</a></li>
        <li><a href="#">About</a></li>
      </ul>

      {/* Right icons */}
      <div className="nav-right">
        {dark ? (
          <FaSun className="nav-icon" onClick={toggleTheme} />
        ) : (
          <FaMoon className="nav-icon" onClick={toggleTheme} />
        )}

        <FaUserCircle className="nav-profile" />
      </div>
    </nav>
  );
}

export default Navbar;
