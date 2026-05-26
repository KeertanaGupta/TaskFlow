import React from 'react';

const StatsCard = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="stats-container loading">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="stat-box skeleton">
            <div className="skeleton-line label"></div>
            <div className="skeleton-line value"></div>
          </div>
        ))}
      </div>
    );
  }

  const {
    totalTasks = 0,
    pendingTasks = 0,
    completedTasks = 0,
    averageImportance = 0,
    overdueTasks = 0
  } = stats || {};

  return (
    <div className="stats-container">
      <div className="stat-box card-total">
        <div className="stat-icon">📊</div>
        <div className="stat-details">
          <span className="stat-label">Total Tasks</span>
          <span className="stat-value">{totalTasks}</span>
        </div>
      </div>
      <div className="stat-box card-pending">
        <div className="stat-icon">⏳</div>
        <div className="stat-details">
          <span className="stat-label">Pending</span>
          <span className="stat-value">{pendingTasks}</span>
        </div>
      </div>
      <div className="stat-box card-completed">
        <div className="stat-icon">✅</div>
        <div className="stat-details">
          <span className="stat-label">Completed</span>
          <span className="stat-value">{completedTasks}</span>
        </div>
      </div>
      <div className="stat-box card-overdue">
        <div className="stat-icon">⚠️</div>
        <div className="stat-details">
          <span className="stat-label">Overdue</span>
          <span className={`stat-value ${overdueTasks > 0 ? 'overdue-alert' : ''}`}>
            {overdueTasks}
          </span>
        </div>
      </div>
      <div className="stat-box card-importance">
        <div className="stat-icon">⭐</div>
        <div className="stat-details">
          <span className="stat-label">Avg. Importance</span>
          <span className="stat-value">{Number(averageImportance).toFixed(2)}/5</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
