import React from 'react';
import TaskCard from './TaskCard';

const TaskList = ({ tasks, loading, error, onComplete, onDelete }) => {
  if (loading) {
    return (
      <div className="task-list-loading">
        {[1, 2, 3].map((i) => (
          <div key={i} className="task-card skeleton">
            <div className="skeleton-line top"></div>
            <div className="skeleton-line title"></div>
            <div className="skeleton-line desc"></div>
            <div className="skeleton-line middle"></div>
            <div className="skeleton-line actions"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state-card">
        <div className="error-icon">❌</div>
        <h4 className="error-title">Oops! Something went wrong</h4>
        <p className="error-desc">{error}</p>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="empty-state-card">
        <div className="empty-icon">📂</div>
        <h4 className="empty-title">No tasks found</h4>
        <p className="empty-desc">
          Try relaxing your filters or create a new task to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="task-grid-layout">
      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          onComplete={onComplete}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default TaskList;
