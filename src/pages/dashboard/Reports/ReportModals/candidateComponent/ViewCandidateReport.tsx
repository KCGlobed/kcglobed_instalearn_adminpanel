import { useState } from "react";
import CandidateLogReport from "./CandidateLogReport";
import CandidatePasswordReport from "./CandidatePasswordReport";

const ViewCandidateReport = ( data : any) => {
  const [activeTab, setActiveTab] = useState("log");

  return (
    <div>
      {/* Tab Buttons */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button
          onClick={() => setActiveTab("log")}
          style={{
            padding: "8px 16px",
            background: activeTab === "log" ? "#2563eb" : "#e5e7eb",
            color: activeTab === "log" ? "#fff" : "#000",
            borderRadius: 6,
            border: "none",
            cursor: "pointer"
          }}
        >
          Candidate Log Report
        </button>

        <button
          onClick={() => setActiveTab("password")}
          style={{
            padding: "8px 16px",
            background: activeTab === "password" ? "#2563eb" : "#e5e7eb",
            color: activeTab === "password" ? "#fff" : "#000",
            borderRadius: 6,
            border: "none",
            cursor: "pointer"
          }}
        >
          Candidate Password Report
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "log" && <CandidateLogReport data={data} />}
      {activeTab === "password" && <CandidatePasswordReport data={data} />}
    </div>
  );
};

export default ViewCandidateReport;
