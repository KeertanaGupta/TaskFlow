import React, { useState, useEffect } from 'react';

const CreateTaskForm = ({ onTaskCreated, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [importance, setImportance] = useState(3);
  const [dueDate, setDueDate] = useState('');
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [minDateTime, setMinDateTime] = useState('');

  // Dynamically set minimum date-time to now to prevent selecting past times
  useEffect(() => {
    const updateMinDateTime = () => {
      const now = new Date();
      // Adjust offset to get local time string in YYYY-MM-DDTHH:MM format
      const tzOffset = now.getTimezoneOffset() * 60000;
      const localISOTime = new Date(now - tzOffset).toISOString().slice(0, 16);
      setMinDateTime(localISOTime);
    };

    updateMinDateTime();
    const interval = setInterval(updateMinDateTime, 30000); // Update min time every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const validate = () => {
    const newErrors = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (title.trim().length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
    }

    if (description && description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    const impNum = Number(importance);
    if (!Number.isInteger(impNum) || impNum < 1 || impNum > 5) {
      newErrors.importance = 'Importance must be an integer between 1 and 5';
    }

    if (!dueDate) {
      newErrors.dueDate = 'Due date and time is required';
    } else {
      const selectedDate = new Date(dueDate);
      if (selectedDate <= new Date()) {
        newErrors.dueDate = 'Due date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        importance: Number(importance),
        dueDate: new Date(dueDate).toISOString()
      };

      await onTaskCreated(taskData);
      
      // Reset form
      setTitle('');
      setDescription('');
      setImportance(3);
      setDueDate('');
      setErrors({});
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
      setErrors({ apiError: err.message || 'Failed to create task. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-card">
      <div className="form-header">
        <h3 className="form-title">⚡ Create New Task</h3>
        {onClose && (
          <button type="button" className="close-btn" onClick={onClose}>
            &times;
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} noValidate>
        {errors.apiError && (
          <div className="error-alert">
            <span>⚠️ {errors.apiError}</span>
          </div>
        )}

        {/* Title */}
        <div className="form-group">
          <label htmlFor="task-title" className="form-label">
            Task Title <span className="required-star">*</span>
          </label>
          <input
            type="text"
            id="task-title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
            }}
            placeholder="e.g. Implement user authentication"
            className={`form-input ${errors.title ? 'is-invalid' : ''}`}
            disabled={isSubmitting}
          />
          {errors.title && <div className="invalid-feedback">{errors.title}</div>}
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="task-desc" className="form-label">Description</label>
          <textarea
            id="task-desc"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
            }}
            placeholder="Provide details about the task (optional)..."
            rows="3"
            className={`form-textarea ${errors.description ? 'is-invalid' : ''}`}
            disabled={isSubmitting}
          />
          <div className="textarea-footer">
            <span className="char-count">{description.length}/500</span>
            {errors.description && <div className="invalid-feedback">{errors.description}</div>}
          </div>
        </div>

        <div className="form-row">
          {/* Importance */}
          <div className="form-group col-6">
            <label htmlFor="task-importance" className="form-label">
              Importance: <span className="importance-badge">{importance}/5</span>
            </label>
            <select
              id="task-importance"
              value={importance}
              onChange={(e) => {
                setImportance(Number(e.target.value));
              }}
              className="form-select"
              disabled={isSubmitting}
            >
              <option value="1">1 - Low Importance</option>
              <option value="2">2 - Medium-Low</option>
              <option value="3">3 - Medium</option>
              <option value="4">4 - High</option>
              <option value="5">5 - Critical Priority</option>
            </select>
          </div>

          {/* Due Date */}
          <div className="form-group col-6">
            <label htmlFor="task-due" className="form-label">
              Due Date & Time <span className="required-star">*</span>
            </label>
            <input
              type="datetime-local"
              id="task-due"
              min={minDateTime}
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: '' }));
              }}
              className={`form-input ${errors.dueDate ? 'is-invalid' : ''}`}
              disabled={isSubmitting}
            />
            {errors.dueDate && <div className="invalid-feedback">{errors.dueDate}</div>}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="form-actions">
          {onClose && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="spinner-border"></span> Creating...
              </>
            ) : (
              'Add Task'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTaskForm;
