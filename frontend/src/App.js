import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RoadmapPage from "./pages/RoadmapPage";

import Main from "./pages/Main";
import Chat from "./pages/Chat";
import JobMatchPage from "./pages/JobMatchPage";
import InterviewPage from "./pages/InterviewPage";

import Navbar from "./components/Navbar";
import FloatingChat from "./components/FloatingChat";
import { ResumeProvider } from "./context/ResumeContext";

function App() {
  return (
    <ResumeProvider>
      <BrowserRouter>

        {/* NAVBAR ALWAYS VISIBLE */}
        <Navbar />

        {/* ALL PAGES */}
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/jobs" element={<JobMatchPage />} />
          <Route path="/interview" element={<InterviewPage />} />

<Route path="/roadmap" element={<RoadmapPage />} />

          <Route path="/chat" element={<Chat />} />
        </Routes>

        <FloatingChat />
      </BrowserRouter>
    </ResumeProvider>
  );
}

export default App;
