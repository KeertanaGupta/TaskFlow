import React from 'react';

const Filters = ({ filters, setFilters }) => {
  const handleStatusChange = (status) => {
    setFilters((prev) => ({ ...prev, status }));
  };

  const handleImportanceChange = (e) => {
    const val = e.target.value;
    setFilters((prev) => ({
      ...prev,
      minImportance: val === '1' ? '' : val // Treat 1 as no min requirement to clear it
    }));
  };

  const handleReset = () => {
    setFilters({ status: 'all', minImportance: '' });
  };

  return (
    <div className="filters-card">
      <h3 className="filters-title">Filter Tasks</h3>
      <div className="filters-content">
        {/* Status Filter */}
        <div className="filter-group">
          <span className="filter-label">Task Status</span>
          <div className="status-toggle">
            {[
              { label: 'All Tasks', value: 'all' },
              { label: 'Pending', value: 'pending' },
              { label: 'Completed', value: 'completed' }
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`toggle-btn ${filters.status === opt.value ? 'active' : ''}`}
                onClick={() => handleStatusChange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Importance Filter */}
        <div className="filter-group">
          <label htmlFor="minImportanceRange" className="filter-label">
            Minimum Importance: <span className="highlight-badge">{filters.minImportance || 'Any'}</span>
          </label>
          <div className="slider-container">
            <input
              type="range"
              id="minImportanceRange"
              min="1"
              max="5"
              step="1"
              value={filters.minImportance || 1}
              onChange={handleImportanceChange}
              className="slider-input"
            />
            <div className="slider-labels">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(filters.status !== 'all' || filters.minImportance !== '') && (
          <div className="clear-filters-container">
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleReset}>
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Filters;
