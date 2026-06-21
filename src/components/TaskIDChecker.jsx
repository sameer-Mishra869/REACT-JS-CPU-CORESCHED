import { useState } from "react";
import { useScheduler } from "../context/SchedulerContext.jsx";

const TaskIDChecker = () => {
  const { tasks } = useScheduler();
  const [searchId, setSearchId] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);

  const handleCheck = (e) => {
    e.preventDefault();
    if (!searchId.trim()) {
      setVerificationResult(null);
      return;
    }

    const cleanId = searchId.trim().toUpperCase();
    const foundTask = tasks.find((t) => t.id === cleanId);

    if (foundTask) {
      // Mock security hashes
      const mockHash = btoa(`SECURE-TOKEN-HASH-${cleanId}-${foundTask.priority}`).substring(0, 16).toUpperCase();
      setVerificationResult({
        found: true,
        task: foundTask,
        securityToken: `SEC-${mockHash}`,
        verifiedAt: new Date().toLocaleTimeString(),
      });
    } else {
      setVerificationResult({
        found: false,
        searchedId: cleanId,
      });
    }
  };

  return (
    <div className="card" style={{ height: "100%" }}>
      <div className="card-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span>Task ID Security Checker</span>
      </div>

      <div className="card-content" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <p style={{ fontSize: "0.8rem", color: "var(--text-sub)" }}>
          Instantly verify if a thread's hardware security ID is registered on the active CPU schedule list.
        </p>

        {/* Search input form */}
        <form onSubmit={handleCheck} style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search ID (e.g. T1, T2)"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            style={{ flexGrow: 1, padding: "6px 10px", fontSize: "0.8rem" }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
            Verify
          </button>
        </form>

        {/* Verification result output */}
        {verificationResult !== null && (
          <div
            style={{
              marginTop: "8px",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "12px",
              backgroundColor: "var(--bg-app)",
              transition: "all 0.2s ease",
            }}
          >
            {verificationResult.found ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {/* Secure Badge */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--emerald)", fontWeight: "600", fontSize: "0.8rem" }}>
                  <span style={{ fontSize: "1.1rem" }}>✓</span> ID VERIFIED SECURE
                </div>

                <div style={{ fontSize: "0.75rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", marginTop: "4px" }}>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Thread:</span>{" "}
                    <strong>{verificationResult.task.name}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Priority:</span>{" "}
                    <strong>{verificationResult.task.priority}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Status:</span>{" "}
                    <strong style={{ textTransform: "capitalize" }}>{verificationResult.task.status}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Locks:</span>{" "}
                    <strong>{verificationResult.task.requiredResource || "None"}</strong>
                  </div>
                </div>

                <div
                  style={{
                    borderTop: "1px dashed var(--border)",
                    paddingTop: "6px",
                    marginTop: "4px",
                    fontFamily: "monospace",
                    fontSize: "0.65rem",
                    color: "var(--text-sub)",
                  }}
                >
                  <div>Token: <span style={{ color: "var(--indigo)" }}>{verificationResult.securityToken}</span></div>
                  <div style={{ color: "var(--text-muted)" }}>Verified: {verificationResult.verifiedAt}</div>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--rose)", fontWeight: "600", fontSize: "0.8rem" }}>
                  <span style={{ fontSize: "1.1rem" }}>✗</span> ID NOT REGISTERED
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-sub)" }}>
                  ID <strong>{verificationResult.searchedId}</strong> is not recognized on the active scheduler table. 
                  Possible rogue thread.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick select list to aid testing */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "600" }}>
            CLICK TO SELECT REGISTERED IDS:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {tasks.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setSearchId(t.id);
                  // Trigger search immediately
                  const mockHash = btoa(`SECURE-TOKEN-HASH-${t.id}-${t.priority}`).substring(0, 16).toUpperCase();
                  setVerificationResult({
                    found: true,
                    task: t,
                    securityToken: `SEC-${mockHash}`,
                    verifiedAt: new Date().toLocaleTimeString(),
                  });
                }}
                className="btn"
                style={{
                  padding: "2px 6px",
                  fontSize: "0.65rem",
                  fontFamily: "monospace",
                }}
              >
                {t.id}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskIDChecker;
