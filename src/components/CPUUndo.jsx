import { useScheduler } from "../context/SchedulerContext.jsx";

const CPUUndo = () => {
  const { logs, history, undoSimulation } = useScheduler();

  return (
    <div className="card" style={{ height: "100%" }}>
      <div className="card-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 2v6h6" />
          <path d="M3 13a9 9 0 1 0 3-7.7L3 8" />
        </svg>
        <span>CPU State Undo & History Log</span>
        
        {/* Undo Button */}
        <button
          onClick={undoSimulation}
          className="btn"
          style={{
            marginLeft: "auto",
            fontSize: "0.75rem",
            padding: "4px 10px",
            borderColor: "var(--indigo-border)",
            color: "var(--indigo)",
            backgroundColor: "var(--indigo-bg)",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
          disabled={history.length === 0}
          title="Restore the processor and tasks to the previous state"
        >
          <span>↩</span> Undo State Switch ({history.length})
        </button>
      </div>

      <div className="card-content" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <p style={{ fontSize: "0.8rem", color: "var(--text-sub)" }}>
          The system takes memory registers and scheduler snapshots at every task switch. 
          Use <strong>Undo State Switch</strong> to rollback execution.
        </p>

        {/* History Log Terminal */}
        <div className="log-timeline" style={{ flexGrow: 1 }}>
          {logs.map((log) => (
            <div key={log.id} className={`log-item ${log.type}`}>
              <span style={{ fontWeight: "700", marginRight: "6px", opacity: 0.6 }}>
                [Tick {log.tick}]
              </span>
              <span>{log.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CPUUndo;
