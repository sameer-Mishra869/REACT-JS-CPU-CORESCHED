import { useState } from "react";
import { useScheduler } from "../context/SchedulerContext.jsx";

const TaskStatusList = () => {
  const { tasks, addTask, terminateTask } = useScheduler();
  const [name, setName] = useState("");
  const [priority, setPriority] = useState(5);
  const [burstTime, setBurstTime] = useState(8);
  const [resource, setResource] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    addTask(name, priority, burstTime, resource || null);
    // Reset form
    setName("");
    setPriority(5);
    setBurstTime(8);
    setResource("");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "running":
        return <span className="badge badge-running">Running</span>;
      case "ready":
        return <span className="badge badge-ready">Ready</span>;
      case "blocked":
        return <span className="badge badge-blocked">Blocked</span>;
      case "completed":
        return <span className="badge badge-completed">Completed</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div className="card-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" strokeWidth="3" />
          <line x1="3" y1="12" x2="3.01" y2="12" strokeWidth="3" />
          <line x1="3" y1="18" x2="3.01" y2="18" strokeWidth="3" />
        </svg>
        <span>Task Status List (Active Threads)</span>
      </div>

      <div className="card-content" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Table list */}
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Thread Name</th>
                <th>Priority</th>
                <th>Remaining / Burst</th>
                <th>Progress</th>
                <th>Status</th>
                <th>Resource Lock</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const percent = Math.round(
                  ((task.burstTime - task.remainingTime) / task.burstTime) * 100
                );
                
                return (
                  <tr key={task.id} style={{ opacity: task.status === "completed" ? 0.6 : 1 }}>
                    <td style={{ fontWeight: "600", fontFamily: "monospace" }}>{task.id}</td>
                    <td>
                      <div>
                        <div style={{ fontWeight: "500" }}>{task.name}</div>
                        {task.assignedCore !== null && (
                          <div style={{ fontSize: "0.7rem", color: "var(--indigo)" }}>
                            Running on Core {task.assignedCore}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: "600" }}>{task.priority}</span>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginLeft: "4px" }}>
                        (wait: {task.ticksWaiting}t)
                      </span>
                    </td>
                    <td style={{ fontFamily: "monospace" }}>
                      {task.remainingTime}s / {task.burstTime}s
                    </td>
                    <td style={{ width: "120px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "0.7rem", minWidth: "28px", textAlign: "right" }}>{percent}%</span>
                        <div className="progress-container" style={{ width: "80px" }}>
                          <div
                            className={`progress-bar ${
                              task.status === "completed"
                                ? "progress-bar-success"
                                : task.status === "blocked"
                                ? "progress-bar-danger"
                                : ""
                            }`}
                            style={{ width: `${percent}%`, backgroundColor: task.status === "blocked" ? "var(--rose)" : undefined }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>{getStatusBadge(task.status)}</td>
                    <td>
                      {task.requiredResource ? (
                        <span
                          style={{
                            fontSize: "0.7rem",
                            backgroundColor: task.status === "blocked" ? "var(--rose-bg)" : "var(--indigo-bg)",
                            color: task.status === "blocked" ? "var(--rose)" : "var(--indigo)",
                            border: `1px solid ${task.status === "blocked" ? "var(--rose-border)" : "var(--indigo-border)"}`,
                            padding: "2px 6px",
                            borderRadius: "var(--radius-sm)",
                            fontWeight: "500",
                          }}
                        >
                          {task.requiredResource}
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>None</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {task.status !== "completed" ? (
                        <button
                          onClick={() => terminateTask(task.id)}
                          className="btn btn-danger"
                          style={{ padding: "4px 8px", fontSize: "0.7rem" }}
                        >
                          Kill
                        </button>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Terminated</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Task Creation Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "16px",
            backgroundColor: "var(--bg-sidebar)",
          }}
        >
          <h3
            style={{
              fontSize: "0.85rem",
              fontWeight: "600",
              marginBottom: "12px",
              color: "var(--text-main)",
            }}
          >
            Create New Thread / Task
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "12px",
              alignItems: "end",
            }}
          >
            <div className="form-group">
              <label className="form-label">Thread Name</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Worker Thread"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Priority (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                required
                className="form-input"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Burst Time (seconds)</label>
              <input
                type="number"
                min="1"
                max="30"
                required
                className="form-input"
                value={burstTime}
                onChange={(e) => setBurstTime(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lock Required</label>
              <select
                className="form-select"
                value={resource}
                onChange={(e) => setResource(e.target.value)}
              >
                <option value="">None</option>
                <option value="Memory">Memory Mutex</option>
                <option value="Disk">Disk File I/O</option>
                <option value="Network">Network Socket</option>
                <option value="GPU">GPU Resource</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ height: "38px" }}>
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskStatusList;
