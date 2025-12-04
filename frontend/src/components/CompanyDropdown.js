import React, { useState } from "react";
import "./CompanyDropdown.css";

import GoogleLogo from "../assets/google.svg";
import AppleLogo from "../assets/apple.svg";
import MicrosoftLogo from "../assets/microsoft.svg";
import TeslaLogo from "../assets/tesla.svg";
import DeltaforgeLogo from "../assets/deltaforge.svg";

function CompanyDropdown({ selected, setSelected }) {
  const companies = [
    { name: "Google", logo: GoogleLogo },
    { name: "Apple", logo: AppleLogo },
    { name: "Microsoft", logo: MicrosoftLogo },
    { name: "Tesla", logo: TeslaLogo },
    { name: "Deltaforge", logo: DeltaforgeLogo },
  ];

  const [open, setOpen] = useState(false);

  return (
    <div className="dropdown-container">
      
      {/* SELECTED DISPLAY */}
      <div className="dropdown-header" onClick={() => setOpen(!open)}>
        {selected ? (
          <div
            className="company-image-option selected-company"
            style={{
              backgroundImage: `url(${companies.find(c => c.name === selected)?.logo})`,
            }}
          >
            <span className="company-title">{selected}</span>
          </div>
        ) : (
          <span className="placeholder-text">Select Company</span>
        )}
      </div>

      {/* DROPDOWN OPTIONS (OPEN UPWARDS) */}
      {open && (
        <div className="dropdown-list">
          {companies.map((c) => (
            <div
              key={c.name}
              className="company-image-option"
              style={{ backgroundImage: `url(${c.logo})` }}
              onClick={() => {
                setSelected(c.name);
                setOpen(false);
              }}
            >
              <span className="company-title">{c.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CompanyDropdown;
