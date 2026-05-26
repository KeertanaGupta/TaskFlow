import React, { useState, useEffect, useCallback } from 'react';
import { getTasks, getStats, createTask, updateTask, deleteTask } from './api/tasks';
import StatsCard from './components/StatsCard';
import Filters from './components/Filters';
import CreateTaskForm from './components/CreateTaskForm';
import TaskList from './components/TaskList';

function App() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({ status: 'all', minImportance: '' });
  
  const [tasksLoading, setTasksLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [tasksError, setTasksError] = useState(null);
  const [statsError, setStatsError] = useState(null);

  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch Stats (memozied with useCallback)
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const statsData = await getStats();
      setStats(statsData);
      setStatsError(null);
    } catch (err) {
      console.error(err);
      setStatsError(err.message || 'Failed to fetch statistics');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch Tasks based on filters
  const fetchTasks = useCallback(async () => {
    setTasksLoading(true);
    try {
      const tasksData = await getTasks(filters);
      setTasks(tasksData);
      setTasksError(null);
    } catch (err) {
      console.error(err);
      setTasksError(err.message || 'Failed to fetch tasks');
    } finally {
      setTasksLoading(false);
    }
  }, [filters]);

  // Load initial tasks and stats
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Handle Task Creation
  const handleTaskCreated = async (taskData) => {
    const newTask = await createTask(taskData);
    
    // Optimistic / Local update: Append tasks and re-sort local state by priorityScore
    // Wait, the API sorts them, but we can do a local merge or simply re-fetch tasks.
    // Let's re-fetch to ensure the server computes and sorts perfectly, but doing a silent re-fetch
    // ensures the list updates immediately without page reload!
    await fetchTasks();
    await fetchStats();
    setShowCreateForm(false);
  };

  // Handle Task Completion
  const handleTaskComplete = async (taskId) => {
    await updateTask(taskId, { status: 'completed' });
    await fetchTasks();
    await fetchStats();
  };

  // Handle Task Deletion
  const handleTaskDelete = async (taskId) => {
    await deleteTask(taskId);
    await fetchTasks();
    await fetchStats();
  };

  return (
    <div className="app-container">
      {/* Header credentials section */}
      <header className="app-header">
        <div className="header-brand">
          <div className="logo-icon">⏳</div>
          <div>
            <h1 className="app-main-title">TaskFlow</h1>
            <p className="app-subtitle">Smart Priority Task Manager</p>
          </div>
        </div>
        <div className="user-credentials-badge">
          <div className="cred-field">
            <span className="cred-label">Candidate:</span>
            <span className="cred-val">Keertana Gupta</span>
          </div>
          <div className="cred-field">
            <span className="cred-label">Roll No:</span>
            <span className="cred-val">0827CS231128</span>
          </div>
          <div className="cred-field">
            <span className="cred-label">College:</span>
            <span className="cred-val">Acropolis Institute</span>
          </div>
        </div>
      </header>

      {/* Stats Cards Section */}
      <section className="stats-dashboard-section">
        <StatsCard stats={stats} loading={statsLoading} error={statsError} />
      </section>

      {/* Main Workspace */}
      <main className="main-workspace-grid">
        {/* Left column: Controls & Filters */}
        <aside className="workspace-controls">
          <button 
            type="button" 
            className={`btn btn-primary btn-block toggle-create-btn ${showCreateForm ? 'active-toggle' : ''}`}
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? '✕ Close Form' : '➕ Create New Task'}
          </button>

          {showCreateForm && (
            <div className="slide-down-panel">
              <CreateTaskForm 
                onTaskCreated={handleTaskCreated} 
                onClose={() => setShowCreateForm(false)} 
              />
            </div>
          )}

          <Filters filters={filters} setFilters={setFilters} />
        </aside>

        {/* Right column: Task List */}
        <section className="workspace-tasklist">
          <div className="tasklist-header">
            <h2 className="section-title">
              📋 My Tasks 
              <span className="task-count-pill">{tasks.length}</span>
            </h2>
            <button 
              type="button" 
              className="refresh-btn" 
              onClick={() => { fetchTasks(); fetchStats(); }}
              title="Refresh task list"
            >
              🔄 Refresh
            </button>
          </div>
          
          <TaskList 
            tasks={tasks} 
            loading={tasksLoading} 
            error={tasksError} 
            onComplete={handleTaskComplete}
            onDelete={handleTaskDelete}
          />
        </section>
      </main>
      
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} TaskFlow by Keertana Gupta (0827CS231128). All rights reserved.</p>
        <p className="footer-meta">MERN Stack Smart Assessment • Bajaj Finserv Health Limited</p>
      </footer>
    </div>
  );
}

export default App;
