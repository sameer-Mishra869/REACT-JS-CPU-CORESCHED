import { SchedulerProvider, useScheduler } from "./context/SchedulerContext.jsx";
import TaskStatusList from "./components/TaskStatusList.jsx";
import CPUUndo from "./components/CPUUndo.jsx";
import WaitingQueue from "./components/WaitingQueue.jsx";
import TaskIDChecker from "./components/TaskIDChecker.jsx";
import PrioritySorter from "./components/PrioritySorter.jsx";
import ResourceLockMap from "./components/ResourceLockMap.jsx";
import QuickestReleaseFinder from "./components/QuickestReleaseFinder.jsx";
import WorkloadBalancer from "./components/WorkloadBalancer.jsx";

// Main Content Component that consumes the Context
function DashboardContent() {
  const {
    tick,
    algorithm,
    setAlgorithm,
    isPlaying,
    setIsPlaying,
    speed,
    setSpeed,
    stepSimulation,
    resetSimulation,
    cores,
    tasks,
  } = useScheduler();

  // Compute stats
  const activeTasksCount = tasks.filter((t) => t.status === "running").length;
  const waitingTasksCount = tasks.filter((t) => t.status === "ready").length;
  const blockedTasksCount = tasks.filter((t) => t.status === "blocked").length;
  const completedTasksCount = tasks.filter((t) => t.status === "completed").length;
  const activeCoresCount = cores.filter((c) => c.active).length;

  return (
    <div className="app-container">
      {/* Top Header Controls */}
      <header className="dashboard-header">
        <div className="header-logo">
          <div className="logo-icon">CS</div>
          <div>
            <h1>CoreSched Simulator</h1>
            <p style={{ fontSize: "0.75rem", color: "var(--text-sub)" }}>
              ITM Skills University CPU & Lock Scheduling Dashboard
            </p>
          </div>
        </div>

        <div className="header-controls">
          {/* Algorithm Selector */}
          <div className="control-group">
            <label
              style={{
                fontSize: "0.75rem",
                fontWeight: "600",
                color: "var(--text-sub)",
                paddingLeft: "8px",
              }}
            >
              SCHEDULER:
            </label>
            <select
              className="form-select"
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              style={{ padding: "4px 8px", fontSize: "0.8rem", border: "none" }}
            >
              <option value="priority">Priority Preemptive</option>
              <option value="rr">Round Robin (Quantum=3)</option>
              <option value="fcfs">First-Come-First-Serve</option>
              <option value="sjf">Shortest Job First (SJF)</option>
            </select>
          </div>

          {/* Speed Control */}
          <div className="control-group" style={{ padding: "4px 10px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-sub)" }}>
              SPEED:
            </span>
            <input
              type="range"
              min="200"
              max="2500"
              step="100"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              style={{ width: "80px", cursor: "pointer" }}
            />
            <span style={{ fontSize: "0.75rem", fontFamily: "monospace" }}>
              {(speed / 1000).toFixed(1)}s
            </span>
          </div>

          {/* Player controls */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`btn ${isPlaying ? "btn-danger" : "btn-success"}`}
              style={{ minWidth: "80px" }}
            >
              {isPlaying ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                  </svg>
                  Pause
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Run
                </>
              )}
            </button>

            <button onClick={stepSimulation} className="btn" disabled={isPlaying} title="Step Simulation (1 Tick)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 4 15 12 5 20 5 4" fill="currentColor" />
                <line x1="19" y1="5" x2="19" y2="19" strokeWidth="3" />
              </svg>
              Step
            </button>

            <button onClick={resetSimulation} className="btn" title="Reset Simulation">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              Reset
            </button>
          </div>
        </div>
      </header>

      {/* Simulator Metrics Subbar */}
      <div
        style={{
          backgroundColor: "var(--bg-sidebar)",
          borderBottom: "1px solid var(--border)",
          padding: "10px 24px",
          display: "flex",
          flexWrap: "wrap",
          gap: "24px",
          fontSize: "0.8rem",
          fontWeight: "500",
          color: "var(--text-sub)",
        }}
      >
        <div>
          CLOCK TICK: <strong style={{ color: "var(--indigo)" }}>{tick}</strong>
        </div>
        <div>
          ACTIVE CORES: <strong>{activeCoresCount} / 4</strong>
        </div>
        <div>
          RUNNING THREADS: <span className="badge badge-running" style={{ padding: "1px 6px" }}>{activeTasksCount}</span>
        </div>
        <div>
          WAITING IN QUEUE: <span className="badge badge-ready" style={{ padding: "1px 6px" }}>{waitingTasksCount}</span>
        </div>
        <div>
          BLOCKED ON LOCKS: <span className="badge badge-blocked" style={{ padding: "1px 6px" }}>{blockedTasksCount}</span>
        </div>
        <div>
          COMPLETED: <span className="badge badge-completed" style={{ padding: "1px 6px" }}>{completedTasksCount}</span>
        </div>
      </div>

      {/* Main Grid Panels */}
      <main className="dashboard-grid">
        {/* Row 1: CPU Balancer & Resource Lock Map */}
        <div className="col-8">
          <WorkloadBalancer />
        </div>
        <div className="col-4">
          <ResourceLockMap />
        </div>

        {/* Row 2: Tasks Status List & Waiting Line Organizer */}
        <div className="col-8">
          <TaskStatusList />
        </div>
        <div className="col-4">
          <WaitingQueue />
        </div>

        {/* Row 3: Priority Sorter & Quickest Release Finder */}
        <div className="col-6">
          <PrioritySorter />
        </div>
        <div className="col-6">
          <QuickestReleaseFinder />
        </div>

        {/* Row 4: Task ID Checker & CPU Undo */}
        <div className="col-4">
          <TaskIDChecker />
        </div>
        <div className="col-8">
          <CPUUndo />
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <SchedulerProvider>
      <DashboardContent />
    </SchedulerProvider>
  );
}

export default App;