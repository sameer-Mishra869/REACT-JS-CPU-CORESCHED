import { useScheduler } from "../context/SchedulerContext.jsx";

const PrioritySorter = () => {
  const { waitingQueue, tasks, algorithm, boostPriority } = useScheduler();

  // Get only tasks in the waiting queue and sort them by priority descending
  const sortedReadyTasks = waitingQueue
    .map((tId) => tasks.find((t) => t.id === tId))
    .filter(Boolean)
    .sort((a, b) => b.priority - a.priority);

  // Boost priority of a task manually
  const handleBoost = (taskId) => {
    boostPriority(taskId);
  };

  return (
    <div className="card" style={{ height: "100%" }}>
      <div className="card-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
          <path d="M17 15l4-4-4-4" />
        </svg>
        <span>Priority Sorter</span>
      </div>

      <div className="card-content" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ fontSize: "0.8rem", color: "var(--text-sub)" }}>
          Ranks ready tasks by priority score (1-10) to determine execution order. 
          {algorithm !== "priority" && (
            <span style={{ color: "var(--amber)", fontWeight: "500" }}>
              {" "}
              (Note: The active scheduler is currently set to <strong>{algorithm.toUpperCase()}</strong>).
            </span>
          )}
        </div>

        {sortedReadyTasks.length === 0 ? (
          <div
            style={{
              padding: "30px 20px",
              textAlign: "center",
              color: "var(--text-muted)",
              border: "1px dashed var(--border)",
              borderRadius: "var(--radius-md)",
              fontStyle: "italic",
              fontSize: "0.85rem",
            }}
          >
            No waiting tasks to sort.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {sortedReadyTasks.map((task, index) => (
              <div
                key={task.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--bg-card)",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Ranking badge and details */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: index === 0 ? "var(--amber-bg)" : "var(--bg-app)",
                      color: index === 0 ? "var(--amber)" : "var(--text-sub)",
                      border: `1px solid ${index === 0 ? "var(--amber-border)" : "var(--border)"}`,
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    #{index + 1}
                  </div>
                  <div>
                    <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>
                      {task.name}
                    </span>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: "0.7rem",
                        color: "var(--text-muted)",
                        marginLeft: "6px",
                      }}
                    >
                      {task.id}
                    </span>
                  </div>
                </div>

                {/* Priority value and Boost action */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <div style={{ fontSize: "0.8rem" }}>
                      Priority: <strong style={{ color: "var(--indigo)" }}>{task.priority}</strong>
                    </div>
                    {task.requiredResource && (
                      <span style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>
                        needs {task.requiredResource}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleBoost(task.id)}
                    className="btn"
                    style={{
                      padding: "2px 8px",
                      fontSize: "0.7rem",
                      borderColor: "var(--amber-border)",
                      color: "var(--amber)",
                      backgroundColor: "var(--amber-bg)",
                    }}
                    title="Boost task priority score (max 10)"
                    disabled={task.priority >= 10}
                  >
                    ▲ Boost
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrioritySorter;
