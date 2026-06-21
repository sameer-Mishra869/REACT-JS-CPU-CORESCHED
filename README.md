# CoreSched - CPU Scheduling Simulator

## 📌 Project Overview

CoreSched is a React.js-based CPU Scheduling Simulator developed as a college case study project. It demonstrates how a CPU manages tasks (threads), handles resource locks, prioritizes execution, and balances workloads across processor cores.

The project uses React components and JavaScript data structures such as Arrays, Stack, Queue, Set, and Map to simulate CPU scheduling concepts in an interactive dashboard.

---

## 🚀 Features

### 1. Task Status List

Displays all tasks and their current status:

* Running
* Waiting
* Blocked

### 2. CPU State Undo

Simulates CPU context switching and allows restoring the previous CPU state using Stack (LIFO).

### 3. Waiting Queue Organizer

Maintains tasks in a waiting queue using Queue (FIFO) scheduling.

### 4. Task ID Checker

Verifies whether a task ID exists using JavaScript Set for fast lookup.

### 5. Priority Sorter

Sorts tasks based on priority so high-priority tasks execute first.

### 6. Resource Lock Map

Tracks which resources are currently locked by specific tasks using Map.

### 7. Quickest Release Finder

Identifies the resource that will be released first to avoid system stalling.

### 8. CPU Workload Balancer

Assigns new tasks to the least busy CPU core for efficient load distribution.

---

## 🛠️ Technologies Used

* React JS
* Vite
* JavaScript (ES6+)
* HTML5
* CSS3

---

## 📂 Project Structure

```text
src/
│
├── components/
│   ├── TaskStatusList.jsx
│   ├── CPUUndo.jsx
│   ├── WaitingQueue.jsx
│   ├── TaskIDChecker.jsx
│   ├── PrioritySorter.jsx
│   ├── ResourceLockMap.jsx
│   ├── QuickestReleaseFinder.jsx
│   └── WorkloadBalancer.jsx
│
├── App.jsx
├── main.jsx
└── index.css
```

## ▶️ Installation

Clone the repository:

```bash
git clone https://github.com/your-username/coresched.git
```

Navigate to the project folder:

```bash
cd coresched
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

---

## 📚 Data Structures Used

| Feature                 | Data Structure    |
| ----------------------- | ----------------- |
| Task Status List        | Array             |
| CPU State Undo          | Stack             |
| Waiting Queue Organizer | Queue             |
| Task ID Checker         | Set               |
| Priority Sorter         | Sorting Algorithm |
| Resource Lock Map       | Map               |
| Quickest Release Finder | Minimum Search    |
| CPU Workload Balancer   | Priority Logic    |

---

## 🎯 Learning Outcomes

* Understanding CPU Scheduling Concepts
* Implementing Data Structures in JavaScript
* Building React Components
* State Management using React Hooks
* Creating Interactive Dashboards

---

## 👨‍💻 Author

**Sameer Mishra**

B.Tech CSE
ITM Skills University

---

## 📄 License

This project is created for educational and academic purposes.
