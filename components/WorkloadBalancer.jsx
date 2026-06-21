import { useScheduler } from "../context/SchedulerContext.jsx";

const WorkloadBalancer = () => {
  const { cores, tasks, toggleCore, rebalanceWorkload } = useScheduler();

  return (
    <div className="card">
      <div className="card-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="2" width="20" height="8" rx="2" />
          <rect x="2" y="14" width="20" height="8" rx="2" />
          <line x1="6" y1="6" x2="6.01" y2="6" strokeWidth="3" />
          <line x1="6" y1="18" x2="6.01" y2="18" strokeWidth="3" />
          <line x1="10" y1="6" x2="10.01" y2="6" strokeWidth="3" />
          <line x1="10" y1="18" x2="10.01" y2="18" strokeWidth="3" />
        </svg>
        <span>CPU Workload Balancer (Virtual Cores)</span>
        <button
          onClick={rebalanceWorkload}
          className="btn btn-primary"
          style={{ fontSize: "0.75rem", padding: "4px 8px", marginLeft: "auto" }}
          title="Evenly distribute threads across online cores"
        >
          Auto Balance Workload
        </button>
      </div>

      <div className="card-content">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          {cores.map((core) => {
            const activeTask = tasks.find((t) => t.id === core.currentTaskId && t.status === "running");

            return (
              <div
                key={core.id}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: "16px",
                  backgroundColor: core.active ? "var(--bg-card)" : "var(--bg-app)",
                  opacity: core.active ? 1 : 0.7,
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  position: "relative",
                  transition: "all 0.2s ease",
                  boxShadow: core.active && activeTask ? "var(--shadow-glow)" : "none",
                  borderColor: core.active && activeTask ? "var(--indigo-border)" : "var(--border)",
                }}
              >
                {/* Core Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ fontSize: "0.9rem", fontWeight: "600" }}>{core.name}</h3>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: core.active ? "var(--emerald)" : "var(--text-muted)",
                        fontWeight: "600",
                      }}
                    >
                      {core.active ? "● ONLINE" : "○ OFFLINE"}
                    </span>
                  </div>
                  
                  {/* Core Toggle Switch */}
                  <label className="switch" style={{ cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={core.active}
                      onChange={() => toggleCore(core.id)}
                      style={{ display: "none" }}
                    />
                    <div
                      style={{
                        width: "36px",
                        height: "20px",
                        backgroundColor: core.active ? "var(--emerald)" : "var(--slate)",
                        borderRadius: "10px",
                        position: "relative",
                        padding: "2px",
                        transition: "background-color 0.2s",
                      }}
                    >
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          backgroundColor: "white",
                          borderRadius: "50%",
                          transform: core.active ? "translateX(16px)" : "translateX(0)",
                          transition: "transform 0.2s",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        }}
                      />
                    </div>
                  </label>
                </div>

                {/* Core Metrics */}
                {core.active ? (
                  <>
                    {/* Utilization Bar */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "4px" }}>
                        <span>Utilization</span>
                        <strong>{core.load}%</strong>
                      </div>
                      <div className="progress-container">
                        <div
                          className={`progress-bar ${activeTask ? "progress-bar-success" : ""}`}
                          style={{ width: `${core.load}%` }}
                        />
                      </div>
                    </div>

                    {/* Active Task Info */}
                    <div
                      style={{
                        backgroundColor: "var(--bg-app)",
                        padding: "8px 10px",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.75rem",
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      {activeTask ? (
                        <>
                          <div style={{ color: "var(--text-sub)", fontSize: "0.7rem" }}>RUNNING THREAD</div>
                          <div style={{ fontWeight: "600", color: "var(--text-main)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                            {activeTask.name} ({activeTask.id})
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", color: "var(--text-sub)" }}>
                            <span>Priority: {activeTask.priority}</span>
                            <span>Remaining: {activeTask.remainingTime}s</span>
                          </div>
                        </>
                      ) : (
                        <div style={{ color: "var(--text-muted)", textAlign: "center", fontStyle: "italic" }}>
                          Idle
                        </div>
                      )}
                    </div>

                    {/* Temp & Load Sparklines */}
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-sub)" }}>
                      <span>Temp: {core.temperature}°C</span>
                      <span>Power: {activeTask ? "15W" : "2.4W"}</span>
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      flexGrow: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--text-muted)",
                      fontSize: "0.8rem",
                      border: "1px dashed var(--border)",
                      borderRadius: "var(--radius-sm)",
                      height: "105px",
                    }}
                  >
                    Core Suspended
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

export default WorkloadBalancer;
