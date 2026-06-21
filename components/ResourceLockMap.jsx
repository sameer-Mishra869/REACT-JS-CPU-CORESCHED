import { useScheduler } from "../context/SchedulerContext.jsx";

const ResourceLockMap = () => {
  const { resources, tasks } = useScheduler();

  // Find all blocked tasks waiting for each resource
  const getWaitingTasksForResource = (resName) => {
    return tasks.filter((t) => t.status === "blocked" && t.requiredResource === resName);
  };

  // Helper to check if a resource is in a deadlock cycle
  const isResourceDeadlocked = (resName) => {
    const res = resources[resName];
    if (!res || !res.lockedBy) return false;
    
    // Find if the task holding this resource is blocked waiting for something else, 
    // and if there's a cycle. For visual warning, if a resource is locked by X, and X is blocked, 
    // it's a potential deadlock candidate.
    const holderTask = tasks.find((t) => t.id === res.lockedBy);
    return holderTask && holderTask.status === "blocked";
  };

  return (
    <div className="card" style={{ height: "100%" }}>
      <div className="card-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span>Resource Lock Map</span>
      </div>

      <div className="card-content" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {Object.values(resources).map((res) => {
            const isLocked = res.lockedBy !== null;
            const holder = isLocked ? tasks.find((t) => t.id === res.lockedBy) : null;
            const waiters = getWaitingTasksForResource(res.name);
            const deadlocked = isResourceDeadlocked(res.name);

            return (
              <div
                key={res.name}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  backgroundColor: deadlocked
                    ? "var(--rose-bg)"
                    : isLocked
                    ? "var(--indigo-bg)"
                    : "var(--bg-card)",
                  borderColor: deadlocked
                    ? "var(--rose-border)"
                    : isLocked
                    ? "var(--indigo-border)"
                    : "var(--border)",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Resource Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: isLocked ? (deadlocked ? "var(--rose)" : "var(--indigo)") : "var(--emerald)",
                      }}
                    />
                    <strong style={{ fontSize: "0.85rem" }}>{res.name}</strong>
                  </div>

                  <span
                    className={`badge ${
                      deadlocked
                        ? "badge-blocked"
                        : isLocked
                        ? "badge-running"
                        : "badge-ready"
                    }`}
                    style={{ fontSize: "0.65rem", padding: "2px 6px" }}
                  >
                    {deadlocked ? "DEADLOCKED" : isLocked ? "LOCKED" : "AVAILABLE"}
                  </span>
                </div>

                {/* Lock Holder Info */}
                <div style={{ fontSize: "0.75rem", color: "var(--text-sub)" }}>
                  {isLocked && holder ? (
                    <div>
                      Locked by:{" "}
                      <strong style={{ color: "var(--text-main)" }}>
                        {holder.name} ({res.lockedBy})
                      </strong>
                    </div>
                  ) : (
                    <div style={{ fontStyle: "italic", color: "var(--text-muted)" }}>
                      No active locks. Resource is open.
                    </div>
                  )}
                </div>

                {/* Waiting Threads Queue */}
                {waiters.length > 0 && (
                  <div
                    style={{
                      borderTop: "1px dashed var(--border)",
                      paddingTop: "6px",
                      marginTop: "2px",
                    }}
                  >
                    <div style={{ fontSize: "0.65rem", fontWeight: "600", color: "var(--rose)", marginBottom: "4px" }}>
                      BLOCKED THREADS WAITING ({waiters.length}):
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {waiters.map((w) => (
                        <span
                          key={w.id}
                          style={{
                            fontSize: "0.65rem",
                            backgroundColor: "var(--rose-bg)",
                            color: "var(--rose)",
                            border: "1px solid var(--rose-border)",
                            borderRadius: "var(--radius-sm)",
                            padding: "1px 5px",
                            fontWeight: "500",
                          }}
                          title={`${w.name} is waiting for ${res.name}`}
                        >
                          {w.id}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResourceLockMap;
