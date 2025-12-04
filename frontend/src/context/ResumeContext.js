import { createContext, useState } from "react";

export const ResumeContext = createContext();

export const ResumeProvider = ({ children }) => {
  const [resumeText, setResumeText] = useState(
    localStorage.getItem("resumeText") || ""
  );

  const updateResumeText = (text) => {
    setResumeText(text);
    localStorage.setItem("resumeText", text);
  };

  return (
    <ResumeContext.Provider value={{ resumeText, setResumeText: updateResumeText }}>
      {children}
    </ResumeContext.Provider>
  );
};
