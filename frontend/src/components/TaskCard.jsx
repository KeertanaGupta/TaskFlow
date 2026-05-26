import React, { useState } from 'react';

const TaskCard = ({ task, onComplete, onDelete }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const { _id, title, description, importance, dueDate, status, priorityScore } = task;

  const isHighPriority = priorityScore >= 50;
  const isCompleted = status === 'completed';

  const formatDueDate = (dateStr) => {
    const due = new Date(dateStr);
    const now = new Date();
    const diff = due - now;

    if (diff < 0) {
      return '⚠️ Overdue';
    }

    const diffMins = Math.floor(diff / (1000 * 60));
    if (diffMins < 60) {
      return `in ${diffMins} min${diffMins !== 1 ? 's' : ''}`;
    }

    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    if (diffHours < 24) {
      return `in ${diffHours} hr${diffHours !== 1 ? 's' : ''}`;
    }

    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    }

    return due.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getImportanceStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const handleCompleteClick = async () => {
    setIsCompleting(true);
    try {
      await onComplete(_id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete(_id);
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div 
      className={`task-card ${isHighPriority ? 'high-priority' : ''} ${isCompleted ? 'completed-card' : ''}`}
    >
      {/* High Priority Badge */}
      {isHighPriority && !isCompleted && (
        <span className="priority-badge-label">🔥 High Priority</span>
      )}

      <div className="card-top">
        <span className={`status-badge ${isCompleted ? 'badge-completed' : 'badge-pending'}`}>
          {isCompleted ? 'Completed' : 'Pending'}
        </span>
        <div className="importance-stars" title={`Importance: ${importance}/5`}>
          {getImportanceStars(importance)}
        </div>
      </div>

      <h4 className="task-title-text">{title}</h4>
      
      {description && <p className="task-desc-text">{description}</p>}

      <div className="card-middle">
        <div className="info-item">
          <span className="info-label">Due Date</span>
          <span className={`info-value ${!isCompleted && new Date(dueDate) < new Date() ? 'text-overdue' : ''}`}>
            {isCompleted ? 'Finished' : formatDueDate(dueDate)}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">Priority Score</span>
          <span className={`info-value score-badge ${isHighPriority && !isCompleted ? 'high-score' : ''}`}>
            {Number(priorityScore).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Action Buttons & Confirm Panel */}
      <div className="card-actions">
        {showConfirm ? (
          <div className="confirm-delete-panel">
            <span className="confirm-prompt">Delete task?</span>
            <div className="confirm-buttons">
              <button 
                className="btn btn-danger btn-xs"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes'}
              </button>
              <button 
                className="btn btn-secondary btn-xs"
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
              >
                No
              </button>
            </div>
          </div>
        ) : (
          <>
            {!isCompleted ? (
              <button 
                className="btn btn-success btn-sm flex-1"
                onClick={handleCompleteClick}
                disabled={isCompleting}
              >
                {isCompleting ? 'Saving...' : '✓ Complete'}
              </button>
            ) : (
              <span className="completed-placeholder">🎉 Well Done!</span>
            )}
            <button 
              className="btn btn-outline-danger btn-sm"
              onClick={() => setShowConfirm(true)}
              disabled={isCompleting || isDeleting}
            >
              🗑️
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
