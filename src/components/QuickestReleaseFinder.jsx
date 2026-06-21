import { useScheduler } from "../context/SchedulerContext.jsx";

const QuickestReleaseFinder = () => {
  const { tasks, resources, resolveDeadlocks } = useScheduler();

  // Find blocked tasks
  const blockedTasks = tasks.filter((t) => t.status === "blocked");

  // Analyze the bottleneck path
  const getBottleneckAnalysis = () => {
    if (blockedTasks.length === 0) {
      return { status: "clean", message: "All systems operating normally. No task stall detected." };
    }

    const analyses = [];
    let hasDeadlock = false;

    blockedTasks.forEach((task) => {
      const neededRes = task.requiredResource;
      if (!neededRes) return;
      
      const holderId = resources[neededRes]?.lockedBy;
      if (!holderId) return;

      const holderTask = tasks.find((t) => t.id === holderId);
      if (!holderTask) return;

      // Check if holder task is also blocked (cyclic)
      const holderIsBlocked = holderTask.status === "blocked";
      if (holderIsBlocked && holderTask.requiredResource) {
        const secondaryHolderId = resources[holderTask.requiredResource]?.lockedBy;
        if (secondaryHolderId === task.id) {
          hasDeadlock = true;
        }
      }

      analyses.push({
        blockedId: task.id,
        blockedName: task.name,
        resource: neededRes,
        holderId: holderId,
        holderName: holderTask.name,
        holderTimeLeft: holderTask.remainingTime,
        holderStatus: holderTask.status,
      });
    });

    return {
      status: hasDeadlock ? "deadlock" : "conflict",
      analyses,
    };
  };

  const analysis = getBottleneckAnalysis();

  const handleResolve = () => {
    const victimId = resolveDeadlocks();
    if (victimId) {
      alert(`Deadlock resolved by terminating task: ${victimId}`);
    } else {
      alert("No active deadlocks found. Cleaning up lock bottlenecks...");
    }
  };

  return (
    <div className="card" style={{ height: "100%" }}>
      <div className="card-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        <span>Quickest Release Finder</span>
      </div>

      <div className="card-content" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {analysis.status === "clean" ? (
          <div
            style={{
              padding: "24px 16px",
              textAlign: "center",
              backgroundColor: "var(--emerald-bg)",
              color: "#047857",
              border: "1px solid var(--emerald-border)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.85rem",
              fontWeight: "500",
            }}
          >
            ✓ {analysis.message}
            <div style={{ fontSize: "0.75rem", color: "var(--text-sub)", marginTop: "4px", fontWeight: "normal" }}>
              Ready tasks will schedule immediately as virtual cores free up.
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Alert Box */}
            <div
              style={{
                padding: "12px 16px",
                backgroundColor: analysis.status === "deadlock" ? "var(--rose-bg)" : "var(--amber-bg)",
                border: `1px solid ${analysis.status === "deadlock" ? "var(--rose-border)" : "var(--amber-border)"}`,
                borderRadius: "var(--radius-md)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong style={{ color: analysis.status === "deadlock" ? "var(--rose)" : "var(--amber)", fontSize: "0.85rem" }}>
                  {analysis.status === "deadlock"
                    ? "CRITICAL: Deadlock (Stall) Detected!"
                    : "Resource Conflict Detected"}
                </strong>
                <p style={{ fontSize: "0.75rem", color: "var(--text-sub)", marginTop: "2px" }}>
                  {analysis.status === "deadlock"
                    ? "Circular dependency locking tasks. Manual resolution or kill required."
                    : "Some threads are blocked waiting for locks to be released."}
                </p>
              </div>
              
              {analysis.status === "deadlock" && (
                <button
                  onClick={handleResolve}
                  className="btn btn-danger"
                  style={{ fontSize: "0.75rem", padding: "6px 10px" }}
                >
                  Resolve Deadlock
                </button>
              )}
            </div>

            {/* Analysis details list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-sub)" }}>
                QUICKEST RELEASE PATHS:
              </div>

              {analysis.analyses.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    padding: "10px 12px",
                    fontSize: "0.8rem",
                    backgroundColor: "var(--bg-card)",
                  }}
                >
                  <div>
                    Thread <strong style={{ color: "var(--rose)" }}>{item.blockedName} ({item.blockedId})</strong> is blocked on{" "}
                    <strong>{item.resource}</strong>.
                  </div>
                  <div style={{ marginTop: "6px", color: "var(--text-sub)", fontSize: "0.75rem" }}>
                    ↳ Lock is held by: <strong>{item.holderName} ({item.holderId})</strong>.
                  </div>
                  <div
                    style={{
                      marginTop: "4px",
                      padding: "4px 8px",
                      backgroundColor: "var(--bg-app)",
                      borderRadius: "4px",
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.7rem",
                    }}
                  >
                    <span>Holder status: <strong>{item.holderStatus.toUpperCase()}</strong></span>
                    <span>Time to unlock: <strong style={{ color: "var(--indigo)" }}>{item.holderTimeLeft}s</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickestReleaseFinder;
