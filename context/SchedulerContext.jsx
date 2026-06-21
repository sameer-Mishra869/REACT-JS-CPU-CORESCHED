/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useRef } from "react";

const SchedulerContext = createContext(null);

const INITIAL_RESOURCES = {
  Memory: { name: "Memory", lockedBy: null },
  Disk: { name: "Disk", lockedBy: null },
  Network: { name: "Network", lockedBy: null },
  GPU: { name: "GPU", lockedBy: null },
};

const INITIAL_CORES = [
  { id: 0, name: "Core 0", currentTaskId: null, active: true, temperature: 42, load: 0 },
  { id: 1, name: "Core 1", currentTaskId: null, active: true, temperature: 38, load: 0 },
  { id: 2, name: "Core 2", currentTaskId: null, active: true, temperature: 40, load: 0 },
  { id: 3, name: "Core 3", currentTaskId: null, active: false, temperature: 35, load: 0 }, // Core 3 disabled by default
];

const INITIAL_TASKS = [
  {
    id: "T1",
    name: "Web Server",
    priority: 8,
    burstTime: 12,
    remainingTime: 12,
    status: "ready",
    assignedCore: null,
    requiredResource: "Network",
    ticksWaiting: 0,
  },
  {
    id: "T2",
    name: "Database Sync",
    priority: 6,
    burstTime: 15,
    remainingTime: 15,
    status: "ready",
    assignedCore: null,
    requiredResource: "Disk",
    ticksWaiting: 0,
  },
  {
    id: "T3",
    name: "Image Processor",
    priority: 7,
    burstTime: 10,
    remainingTime: 10,
    status: "ready",
    assignedCore: null,
    requiredResource: "GPU",
    ticksWaiting: 0,
  },
  {
    id: "T4",
    name: "Log Aggregator",
    priority: 3,
    burstTime: 8,
    remainingTime: 8,
    status: "ready",
    assignedCore: null,
    requiredResource: "Memory",
    ticksWaiting: 0,
  },
  {
    id: "T5",
    name: "Cleanup Service",
    priority: 2,
    burstTime: 6,
    remainingTime: 6,
    status: "ready",
    assignedCore: null,
    requiredResource: null, // No resource locks needed
    ticksWaiting: 0,
  },
];

export const SchedulerProvider = ({ children }) => {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [cores, setCores] = useState(INITIAL_CORES);
  const [resources, setResources] = useState(INITIAL_RESOURCES);
  const [waitingQueue, setWaitingQueue] = useState(["T1", "T2", "T3", "T4", "T5"]);
  const [tick, setTick] = useState(0);
  const [logs, setLogs] = useState([
    { id: 0, tick: 0, text: "Simulation initialized. Tasks loaded.", type: "system" },
  ]);
  const [history, setHistory] = useState([]);
  
  // Configuration
  const [algorithm, setAlgorithm] = useState("priority"); // 'priority' | 'rr' | 'fcfs' | 'sjf'
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000); // ms per tick
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [roundRobinQuantum, setRoundRobinQuantum] = useState(3);
  
  // Track tasks current execution slices for Round Robin
  const [taskQuantums, setTaskQuantums] = useState({});

  const timerRef = useRef(null);
  const taskCounterRef = useRef(6); // Next sequential ID (T1-T5 already exist)

  // Deep copy state for history tracking
  const captureHistory = (currentTasks, currentCores, currentResources, currentQueue, currentTick, currentLogs, currentQuantums) => {
    const snapshot = {
      tasks: JSON.parse(JSON.stringify(currentTasks)),
      cores: JSON.parse(JSON.stringify(currentCores)),
      resources: JSON.parse(JSON.stringify(currentResources)),
      waitingQueue: [...currentQueue],
      tick: currentTick,
      logs: [...currentLogs],
      taskQuantums: { ...currentQuantums },
    };
    setHistory((prev) => {
      // Limit history to 30 steps to preserve memory
      const newHistory = [...prev, snapshot];
      if (newHistory.length > 30) {
        newHistory.shift();
      }
      return newHistory;
    });
  };

  const addLog = (newLogs, text, type = "info", tickValue) => {
    const newId = newLogs.length > 0 ? Math.max(...newLogs.map((l) => l.id)) + 1 : 1;
    newLogs.unshift({ id: newId, tick: tickValue !== undefined ? tickValue : tick + 1, text, type });
  };

  // Deadlock detection cycle solver (DFS)
  const detectDeadlocks = (currentTasks, currentResources, currentLogs) => {
    // Graph of: Task A waits for Task B (Task A wants resource locked by Task B)
    const adj = {};
    const taskIds = currentTasks.filter((t) => t.status === "blocked").map((t) => t.id);
    
    currentTasks.forEach((t) => {
      if (t.status === "blocked" && t.requiredResource) {
        const owner = currentResources[t.requiredResource].lockedBy;
        if (owner) {
          adj[t.id] = owner;
        }
      }
    });

    // Detect cycle
    const visited = {};
    const recStack = {};
    let hasDeadlock = false;
    const deadlockedTasks = [];

    const dfs = (v) => {
      if (!visited[v]) {
        visited[v] = true;
        recStack[v] = true;

        const neighbor = adj[v];
        if (neighbor) {
          if (!visited[neighbor] && dfs(neighbor)) {
            deadlockedTasks.push(v);
            return true;
          } else if (recStack[neighbor]) {
            deadlockedTasks.push(v);
            deadlockedTasks.push(neighbor);
            return true;
          }
        }
      }
      recStack[v] = false;
      return false;
    };

    taskIds.forEach((id) => {
      if (dfs(id)) {
        hasDeadlock = true;
      }
    });

    if (hasDeadlock) {
      const uniqueDeadlocks = [...new Set(deadlockedTasks)];
      addLog(
        currentLogs,
        `CRITICAL: Deadlock detected! Cyclic waiting dependency between tasks: ${uniqueDeadlocks.join(" <-> ")}`,
        "error"
      );
    }
  };

  // Step simulation forward
  const stepSimulation = () => {
    // 1. Capture current state in history
    captureHistory(tasks, cores, resources, waitingQueue, tick, logs, taskQuantums);

    let nextTick = tick + 1;
    let nextTasks = JSON.parse(JSON.stringify(tasks));
    let nextCores = JSON.parse(JSON.stringify(cores));
    let nextResources = JSON.parse(JSON.stringify(resources));
    let nextQueue = [...waitingQueue];
    let nextLogs = [...logs];
    let nextQuantums = { ...taskQuantums };

    addLog(nextLogs, `--- Clock Tick ${nextTick} ---`, "system");

    // 2. Process tasks running on active cores
    nextCores.forEach((core) => {
      if (!core.active) {
        if (core.currentTaskId) {
          // core was deactivated while holding a task, send task back to waiting
          const tId = core.currentTaskId;
          const task = nextTasks.find((t) => t.id === tId);
          if (task) {
            task.status = "ready";
            task.assignedCore = null;
            addLog(nextLogs, `Core ${core.id} deactivated. Task ${task.name} (${tId}) returned to Ready state.`, "warning");
            if (!nextQueue.includes(tId)) {
              nextQueue.push(tId);
            }
          }
          core.currentTaskId = null;
          core.load = 0;
        }
        return;
      }

      if (core.currentTaskId) {
        const task = nextTasks.find((t) => t.id === core.currentTaskId);
        if (task) {
          // Decrement task execution time
          task.remainingTime -= 1;
          
          // Increment quantum usage for Round Robin
          if (algorithm === "rr") {
            nextQuantums[task.id] = (nextQuantums[task.id] || 0) + 1;
          }

          // Core load & temperature simulation
          core.load = 100;
          core.temperature = Math.min(85, core.temperature + Math.floor(Math.random() * 4) + 1);

          addLog(nextLogs, `Core ${core.id} executed task ${task.name} (${task.id}). Remaining: ${task.remainingTime}s.`, "execute");

          // Task completed
          if (task.remainingTime <= 0) {
            task.status = "completed";
            task.assignedCore = null;
            core.currentTaskId = null;
            core.load = 0;

            // Release resource
            if (task.requiredResource && nextResources[task.requiredResource]) {
              nextResources[task.requiredResource].lockedBy = null;
              addLog(nextLogs, `Task ${task.name} (${task.id}) finished. Released resource ${task.requiredResource}.`, "success");
            } else {
              addLog(nextLogs, `Task ${task.name} (${task.id}) finished execution.`, "success");
            }
            
            // Remove from queue
            nextQueue = nextQueue.filter((id) => id !== task.id);
            delete nextQuantums[task.id];
          }
        } else {
          // Invalid task association, clean up core
          core.currentTaskId = null;
          core.load = 0;
        }
      } else {
        // Idle core cools down
        core.load = 0;
        core.temperature = Math.max(35, core.temperature - Math.floor(Math.random() * 3) - 1);
      }
    });

    // 3. Preemption logic for Round Robin or high priority preemptive
    if (algorithm === "rr") {
      nextCores.forEach((core) => {
        if (core.active && core.currentTaskId) {
          const task = nextTasks.find((t) => t.id === core.currentTaskId);
          if (task && task.status === "running") {
            const usedQuantum = nextQuantums[task.id] || 0;
            if (usedQuantum >= roundRobinQuantum && task.remainingTime > 0) {
              // Preempt this task
              task.status = "ready";
              task.assignedCore = null;
              core.currentTaskId = null;
              core.load = 0;
              addLog(nextLogs, `Time Quantum (${roundRobinQuantum}) expired for Task ${task.name} (${task.id}). Preempted.`, "warning");
              nextQueue.push(task.id);
              nextQuantums[task.id] = 0;
            }
          }
        }
      });
    }

    // 4. Aging of ready tasks
    nextTasks.forEach((t) => {
      if (t.status === "ready" && nextQueue.includes(t.id)) {
        t.ticksWaiting += 1;
        if (t.ticksWaiting >= 8 && t.priority < 10) {
          t.priority += 1;
          t.ticksWaiting = 0;
          addLog(nextLogs, `Aging: Boosted priority of task ${t.name} (${t.id}) to ${t.priority} due to wait time.`, "info");
        }
      }
    });

    // 5. Update blocked tasks status
    // A task is blocked if it requires a resource that is currently locked by ANOTHER task
    nextTasks.forEach((t) => {
      if (t.status === "completed") return;

      if (t.requiredResource) {
        const res = nextResources[t.requiredResource];
        if (res.lockedBy && res.lockedBy !== t.id) {
          // Resource is locked by someone else. Task is blocked!
          if (t.status === "running") {
            // Task was running, but resource got locked or pre-emption occurred, kick off core
            const core = nextCores.find((c) => c.currentTaskId === t.id);
            if (core) {
              core.currentTaskId = null;
              core.load = 0;
            }
            t.assignedCore = null;
          }
          if (t.status !== "blocked") {
            t.status = "blocked";
            addLog(nextLogs, `Task ${t.name} (${t.id}) BLOCKED. Waiting for resource ${t.requiredResource} (held by ${res.lockedBy}).`, "error");
          }
          // Remove from waiting queue list since it is blocked
          nextQueue = nextQueue.filter((id) => id !== t.id);
        } else {
          // Resource is free or already locked by this task. If it was blocked, make it ready.
          if (t.status === "blocked") {
            t.status = "ready";
            t.ticksWaiting = 0;
            addLog(nextLogs, `Task ${t.name} (${t.id}) UNBLOCKED. Resource ${t.requiredResource} is now available.`, "info");
            if (!nextQueue.includes(t.id)) {
              nextQueue.push(t.id);
            }
          }
        }
      }
    });

    // 6. Schedule ready tasks onto idle active cores
    const idleCores = nextCores.filter((c) => c.active && c.currentTaskId === null);
    
    if (idleCores.length > 0 && nextQueue.length > 0) {
      // Sort the queue based on the active scheduler algorithm
      let schedQueue = [...nextQueue];
      
      if (algorithm === "priority") {
        // High priority first
        schedQueue.sort((aId, bId) => {
          const tA = nextTasks.find((t) => t.id === aId);
          const tB = nextTasks.find((t) => t.id === bId);
          return (tB?.priority || 0) - (tA?.priority || 0);
        });
      } else if (algorithm === "sjf") {
        // Shortest job first (by remaining time)
        schedQueue.sort((aId, bId) => {
          const tA = nextTasks.find((t) => t.id === aId);
          const tB = nextTasks.find((t) => t.id === bId);
          return (tA?.remainingTime || 0) - (tB?.remainingTime || 0);
        });
      }
      // FCFS and RR use the default queue order (First-Come-First-Serve arrival)

      // Allocate tasks to idle cores
      for (let i = 0; i < idleCores.length; i++) {
        if (schedQueue.length === 0) break;
        
        const core = idleCores[i];
        
        // Find the first task in sorted scheduling queue that is NOT blocked and gets its resources
        let taskToSchedule = null;
        let taskIndexInQueue = -1;

        for (let j = 0; j < schedQueue.length; j++) {
          const tId = schedQueue[j];
          const task = nextTasks.find((t) => t.id === tId);
          
          if (task && task.status === "ready") {
            // Check resource availability
            if (!task.requiredResource || nextResources[task.requiredResource].lockedBy === null || nextResources[task.requiredResource].lockedBy === task.id) {
              taskToSchedule = task;
              taskIndexInQueue = nextQueue.indexOf(tId);
              break;
            }
          }
        }

        if (taskToSchedule) {
          // Schedule task on core
          taskToSchedule.status = "running";
          taskToSchedule.assignedCore = core.id;
          core.currentTaskId = taskToSchedule.id;
          core.load = 100;
          
          // Lock resource if needed
          if (taskToSchedule.requiredResource) {
            nextResources[taskToSchedule.requiredResource].lockedBy = taskToSchedule.id;
            addLog(nextLogs, `Scheduled Task ${taskToSchedule.name} (${taskToSchedule.id}) on Core ${core.id}. Locked resource ${taskToSchedule.requiredResource}.`, "info");
          } else {
            addLog(nextLogs, `Scheduled Task ${taskToSchedule.name} (${taskToSchedule.id}) on Core ${core.id}.`, "info");
          }

          // Remove from waiting queue
          nextQueue.splice(taskIndexInQueue, 1);
          nextQuantums[taskToSchedule.id] = 0;
          
          // Re-filter the sorted local scheduling queue
          schedQueue = schedQueue.filter((id) => id !== taskToSchedule.id);
        }
      }
    }

    // 7. Check for deadlocks
    detectDeadlocks(nextTasks, nextResources, nextLogs);

    // 8. Commit state changes
    setTick(nextTick);
    setTasks(nextTasks);
    setCores(nextCores);
    setResources(nextResources);
    setWaitingQueue(nextQueue);
    setLogs(nextLogs);
    setTaskQuantums(nextQuantums);
  };

  // Auto-play timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        stepSimulation();
      }, speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, speed, tasks, cores, resources, waitingQueue, tick, logs, history, algorithm, taskQuantums]);

  // Undo simulation backward
  const undoSimulation = () => {
    if (history.length === 0) return;
    
    // De-structure previous state
    const prev = history[history.length - 1];
    
    setTick(prev.tick);
    setTasks(prev.tasks);
    setCores(prev.cores);
    setResources(prev.resources);
    setWaitingQueue(prev.waitingQueue);
    setLogs(prev.logs);
    setTaskQuantums(prev.taskQuantums);
    
    // Pop from history
    setHistory((prevHistory) => prevHistory.slice(0, -1));
  };

  // Reset simulation to initials
  const resetSimulation = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);
    setTick(0);
    setTasks(INITIAL_TASKS);
    setCores(INITIAL_CORES);
    setResources(INITIAL_RESOURCES);
    setWaitingQueue(["T1", "T2", "T3", "T4", "T5"]);
    setLogs([{ id: 0, tick: 0, text: "Simulation reset.", type: "system" }]);
    setHistory([]);
    setTaskQuantums({});
    setSelectedTaskId("");
    taskCounterRef.current = 6; // Reset sequential ID counter
  };

  // Add a new task dynamically
  const addTask = (name, priority, burstTime, requiredResource) => {
    const newId = `T${taskCounterRef.current}`;
    taskCounterRef.current += 1;
    const newTask = {
      id: newId,
      name: name || `Task-${newId}`,
      priority: parseInt(priority) || 5,
      burstTime: parseInt(burstTime) || 8,
      remainingTime: parseInt(burstTime) || 8,
      status: "ready",
      assignedCore: null,
      requiredResource: requiredResource || null,
      ticksWaiting: 0,
    };

    captureHistory(tasks, cores, resources, waitingQueue, tick, logs, taskQuantums);

    const nextTasks = [...tasks, newTask];
    const nextQueue = [...waitingQueue, newId];
    const nextLogs = [...logs];
    addLog(nextLogs, `Task ${newTask.name} (${newId}) added to Ready queue. Priority: ${newTask.priority}.`, "success", tick);

    setTasks(nextTasks);
    setWaitingQueue(nextQueue);
    setLogs(nextLogs);
  };

  // Boost a task's priority by 1 (max 10)
  const boostPriority = (taskId) => {
    captureHistory(tasks, cores, resources, waitingQueue, tick, logs, taskQuantums);

    const nextTasks = tasks.map((t) => {
      if (t.id === taskId) {
        const newPriority = Math.min(10, t.priority + 1);
        return { ...t, priority: newPriority, ticksWaiting: 0 };
      }
      return t;
    });
    const nextLogs = [...logs];
    const task = nextTasks.find((t) => t.id === taskId);
    if (task) {
      addLog(nextLogs, `Priority BOOSTED for ${task.name} (${taskId}) → now ${task.priority}.`, "warning", tick);
    }

    setTasks(nextTasks);
    setLogs(nextLogs);
  };

  // Terminate a task manually
  const terminateTask = (taskId) => {
    captureHistory(tasks, cores, resources, waitingQueue, tick, logs, taskQuantums);

    let nextTasks = JSON.parse(JSON.stringify(tasks));
    let nextCores = JSON.parse(JSON.stringify(cores));
    let nextResources = JSON.parse(JSON.stringify(resources));
    let nextQueue = waitingQueue.filter((id) => id !== taskId);
    let nextLogs = [...logs];

    const task = nextTasks.find((t) => t.id === taskId);
    if (!task) return;

    task.status = "completed";
    task.remainingTime = 0;
    
    // Release active core
    if (task.assignedCore !== null) {
      const core = nextCores.find((c) => c.id === task.assignedCore);
      if (core) {
        core.currentTaskId = null;
        core.load = 0;
      }
      task.assignedCore = null;
    }

    // Release resource locks
    if (task.requiredResource && nextResources[task.requiredResource].lockedBy === taskId) {
      nextResources[task.requiredResource].lockedBy = null;
    }

    addLog(nextLogs, `Task ${task.name} (${taskId}) was manually terminated. All locks released.`, "warning");

    setTasks(nextTasks);
    setCores(nextCores);
    setResources(nextResources);
    setWaitingQueue(nextQueue);
    setLogs(nextLogs);
  };

  // Toggle active status of a core
  const toggleCore = (coreId) => {
    captureHistory(tasks, cores, resources, waitingQueue, tick, logs, taskQuantums);
    
    let nextCores = JSON.parse(JSON.stringify(cores));
    let nextTasks = JSON.parse(JSON.stringify(tasks));
    let nextQueue = [...waitingQueue];
    let nextLogs = [...logs];

    const core = nextCores.find((c) => c.id === coreId);
    if (core) {
      core.active = !core.active;
      addLog(nextLogs, `CPU Core ${coreId} was turned ${core.active ? "ONLINE" : "OFFLINE"}.`, "warning");
      
      if (!core.active && core.currentTaskId) {
        // Send active task back to queue
        const tId = core.currentTaskId;
        const task = nextTasks.find((t) => t.id === tId);
        if (task) {
          task.status = "ready";
          task.assignedCore = null;
          addLog(nextLogs, `Task ${task.name} (${tId}) returned to Ready state.`, "warning");
          if (!nextQueue.includes(tId)) {
            nextQueue.push(tId);
          }
        }
        core.currentTaskId = null;
        core.load = 0;
      }
    }

    setCores(nextCores);
    setTasks(nextTasks);
    setWaitingQueue(nextQueue);
    setLogs(nextLogs);
  };

  // Manually rebalance cores
  const rebalanceWorkload = () => {
    captureHistory(tasks, cores, resources, waitingQueue, tick, logs, taskQuantums);

    let nextCores = JSON.parse(JSON.stringify(cores));
    let nextTasks = JSON.parse(JSON.stringify(tasks));
    let nextResources = JSON.parse(JSON.stringify(resources));
    let nextQueue = [...waitingQueue];
    let nextLogs = [...logs];

    const activeCores = nextCores.filter((c) => c.active);
    if (activeCores.length === 0) {
      addLog(nextLogs, `Rebalance failed: No active cores available.`, "warning");
      setLogs(nextLogs);
      return;
    }

    // Step 1: Unassign all running tasks from cores, put them back to ready
    nextTasks.forEach((task) => {
      if (task.status === "running") {
        task.status = "ready";
        if (task.assignedCore !== null) {
          const core = nextCores.find((c) => c.id === task.assignedCore);
          if (core) {
            core.currentTaskId = null;
            core.load = 0;
          }
        }
        task.assignedCore = null;
        // Release resource so it can be re-acquired fairly
        if (task.requiredResource && nextResources[task.requiredResource]?.lockedBy === task.id) {
          nextResources[task.requiredResource].lockedBy = null;
        }
        // Add back to queue if not already there
        if (!nextQueue.includes(task.id)) {
          nextQueue.push(task.id);
        }
      }
    });

    // Step 2: Clear all cores
    nextCores.forEach((c) => {
      c.currentTaskId = null;
      c.load = 0;
    });

    // Step 3: Get all ready tasks sorted by priority (highest first)
    const readyTasks = nextTasks
      .filter((t) => t.status === "ready" && t.remainingTime > 0)
      .sort((a, b) => b.priority - a.priority);

    // Step 4: Assign ready tasks to active cores
    let assigned = 0;
    for (const task of readyTasks) {
      // Find a free active core
      const freeCore = activeCores.find((c) => c.currentTaskId === null);
      if (!freeCore) break; // No more free cores

      // Check if resource is available
      if (task.requiredResource && nextResources[task.requiredResource]?.lockedBy !== null) {
        continue; // Skip this task, resource is locked
      }

      // Assign task to core
      task.status = "running";
      task.assignedCore = freeCore.id;
      freeCore.currentTaskId = task.id;
      freeCore.load = 100;

      // Lock resource
      if (task.requiredResource) {
        nextResources[task.requiredResource].lockedBy = task.id;
      }

      // Remove from waiting queue
      nextQueue = nextQueue.filter((id) => id !== task.id);
      assigned++;
    }

    addLog(nextLogs, `Rebalanced workload: ${assigned} task(s) distributed across ${activeCores.length} active core(s).`, "success", tick);

    setCores(nextCores);
    setTasks(nextTasks);
    setResources(nextResources);
    setWaitingQueue(nextQueue);
    setLogs(nextLogs);
  };

  // Automatically find and resolve deadlocks
  const resolveDeadlocks = () => {
    // DFS cycle detection, find the list of cycle participants
    const adj = {};
    const blockedTasks = tasks.filter((t) => t.status === "blocked");
    
    blockedTasks.forEach((t) => {
      if (t.requiredResource) {
        const owner = resources[t.requiredResource].lockedBy;
        if (owner) adj[t.id] = owner;
      }
    });

    const visited = {};
    const recStack = {};
    const cycleNodes = [];

    const dfs = (v) => {
      if (!visited[v]) {
        visited[v] = true;
        recStack[v] = true;
        const neighbor = adj[v];
        if (neighbor) {
          if (!visited[neighbor] && dfs(neighbor)) {
            cycleNodes.push(v);
            return true;
          } else if (recStack[neighbor]) {
            cycleNodes.push(v);
            cycleNodes.push(neighbor);
            return true;
          }
        }
      }
      recStack[v] = false;
      return false;
    };

    blockedTasks.forEach((t) => {
      dfs(t.id);
    });

    const uniqueCycleNodes = [...new Set(cycleNodes)];
    
    if (uniqueCycleNodes.length > 0) {
      // Find the task with the lowest priority to terminate
      let victim = null;
      let minPriority = 999;
      
      uniqueCycleNodes.forEach((tId) => {
        const task = tasks.find((t) => t.id === tId);
        if (task && task.priority < minPriority) {
          minPriority = task.priority;
          victim = tId;
        }
      });

      if (victim) {
        terminateTask(victim);
        return victim;
      }
    }
    return null;
  };

  return (
    <SchedulerContext.Provider
      value={{
        tasks,
        cores,
        resources,
        waitingQueue,
        tick,
        logs,
        history,
        algorithm,
        isPlaying,
        speed,
        selectedTaskId,
        roundRobinQuantum,
        setAlgorithm,
        setIsPlaying,
        setSpeed,
        setSelectedTaskId,
        setRoundRobinQuantum,
        stepSimulation,
        undoSimulation,
        resetSimulation,
        addTask,
        boostPriority,
        terminateTask,
        toggleCore,
        rebalanceWorkload,
        resolveDeadlocks,
      }}
    >
      {children}
    </SchedulerContext.Provider>
  );
};

export const useScheduler = () => {
  const context = useContext(SchedulerContext);
  if (!context) {
    throw new Error("useScheduler must be used within a SchedulerProvider");
  }
  return context;
};
