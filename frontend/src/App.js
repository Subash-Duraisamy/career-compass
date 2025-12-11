import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/HomePage";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import JobMatchPage from "./pages/JobMatchPage";
import InterviewPage from "./pages/InterviewPage";
import RoadmapPage from "./pages/RoadmapPage";
import Chat from "./pages/Chat";

import Navbar from "./components/Navbar";
import FloatingChat from "./components/FloatingChat";

import { ResumeProvider } from "./context/ResumeContext";

function App() {
  return (
    <ResumeProvider>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
        <Route path="/jobs" element={<JobMatchPage />} />
        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>

      <FloatingChat />
    </ResumeProvider>
  );
}

export default App;
