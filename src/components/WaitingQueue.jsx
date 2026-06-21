import { useScheduler } from "../context/SchedulerContext.jsx";

const WaitingQueue = () => {
  const { waitingQueue, tasks } = useScheduler();

  return (
    <div className="card" style={{ height: "100%" }}>
      <div className="card-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <span>Waiting Line Organizer (Ready Queue)</span>
      </div>

      <div className="card-content" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {waitingQueue.length === 0 ? (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              color: "var(--text-muted)",
              border: "1px dashed var(--border)",
              borderRadius: "var(--radius-md)",
              fontStyle: "italic",
              fontSize: "0.85rem",
            }}
          >
            Ready queue is empty.
            <div style={{ fontSize: "0.75rem", marginTop: "4px" }}>
              All ready tasks have been scheduled to CPU cores.
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              maxHeight: "350px",
              overflowY: "auto",
              paddingRight: "4px",
            }}
          >
            <div
              style={{
                fontSize: "0.7rem",
                fontWeight: "600",
                color: "var(--text-sub)",
                marginBottom: "4px",
                textTransform: "uppercase",
              }}
            >
              Arrival Order (FCFS Sequence)
            </div>
            
            {waitingQueue.map((tId, index) => {
              const task = tasks.find((t) => t.id === tId);
              if (!task) return null;

              return (
                <div
                  key={tId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    padding: "10px 12px",
                    backgroundColor: "var(--bg-card)",
                    transition: "transform 0.15s ease",
                    position: "relative",
                  }}
                >
                  {/* Position number */}
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      backgroundColor: "var(--bg-app)",
                      border: "1px solid var(--border)",
                      color: "var(--text-sub)",
                      fontSize: "0.7rem",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "12px",
                    }}
                  >
                    {index + 1}
                  </div>

                  {/* Task details */}
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ fontSize: "0.8rem", color: "var(--text-main)" }}>
                        {task.name}
                      </strong>
                      <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "var(--text-muted)" }}>
                        {task.id}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "12px", fontSize: "0.7rem", color: "var(--text-sub)", marginTop: "2px" }}>
                      <span>Priority: <strong style={{ color: "var(--text-main)" }}>{task.priority}</strong></span>
                      <span>Burst: <strong>{task.remainingTime}s</strong></span>
                      {task.ticksWaiting > 0 && (
                        <span style={{ color: "var(--amber)", fontWeight: "500" }}>
                          Wait: {task.ticksWaiting}t
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WaitingQueue;
