import React from 'react';
import Icon from '../../../components/AppIcon';

const FilterPanel = ({
  searchTerm,
  onSearchChange,
  selectedLogLevels,
  onLogLevelsChange,
  sortOrder,
  onSortOrderChange,
  totalEntries,
  filteredEntries
}) => {
  const logLevels = [
    { value: 'ERROR', label: 'Error', color: 'text-error bg-error-100 border-error' },
    { value: 'WARN', label: 'Warning', color: 'text-warning bg-warning-100 border-warning' },
    { value: 'INFO', label: 'Info', color: 'text-primary bg-primary-100 border-primary' },
    { value: 'DEBUG', label: 'Debug', color: 'text-text-secondary bg-secondary-100 border-secondary-300' }
  ];

  const handleLogLevelToggle = (level) => {
    const newSelected = selectedLogLevels.includes(level)
      ? selectedLogLevels.filter(l => l !== level)
      : [...selectedLogLevels, level];
    onLogLevelsChange(newSelected);
  };

  const clearAllFilters = () => {
    onSearchChange("");
    onLogLevelsChange([]);
    onSortOrderChange("asc");
  };

  const hasActiveFilters = searchTerm || selectedLogLevels.length > 0 || sortOrder !== "asc";

  return (
    <div className="space-y-6">
      {/* Filter Summary */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-text-primary">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-primary hover:text-primary-700 transition-colors duration-200"
            >
              Clear All
            </button>
          )}
        </div>
        
        <div className="text-sm text-text-secondary">
          Showing <span className="font-medium text-text-primary">{filteredEntries}</span> of{' '}
          <span className="font-medium text-text-primary">{totalEntries}</span> entries
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <label className="block text-sm font-medium text-text-primary mb-3">
          Search Entries
        </label>
        <div className="relative">
          <Icon 
            name="Search" 
            size={18} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" 
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search messages, sources..."
            className="input-field w-full pl-10 pr-4"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary hover:text-text-primary"
            >
              <Icon name="X" size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Log Levels */}
      <div className="card p-4">
        <label className="block text-sm font-medium text-text-primary mb-3">
          Log Levels
        </label>
        <div className="space-y-2">
          {logLevels.map((level) => (
            <label key={level.value} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedLogLevels.includes(level.value)}
                onChange={() => handleLogLevelToggle(level.value)}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
              />
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${level.color}`}>
                {level.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort Order */}
      <div className="card p-4">
        <label className="block text-sm font-medium text-text-primary mb-3">
          Sort Order
        </label>
        <div className="space-y-2">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="sortOrder"
              value="asc"
              checked={sortOrder === "asc"}
              onChange={(e) => onSortOrderChange(e.target.value)}
              className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-2"
            />
            <div className="flex items-center space-x-2">
              <Icon name="ArrowUp" size={16} className="text-text-secondary" />
              <span className="text-sm text-text-primary">Oldest First</span>
            </div>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="sortOrder"
              value="desc"
              checked={sortOrder === "desc"}
              onChange={(e) => onSortOrderChange(e.target.value)}
              className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-2"
            />
            <div className="flex items-center space-x-2">
              <Icon name="ArrowDown" size={16} className="text-text-secondary" />
              <span className="text-sm text-text-primary">Newest First</span>
            </div>
          </label>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-4">
        <h4 className="text-sm font-medium text-text-primary mb-3">Quick Filters</h4>
        <div className="space-y-2">
          <button
            onClick={() => onLogLevelsChange(['ERROR'])}
            className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-md transition-colors duration-200"
          >
            Errors Only
          </button>
          <button
            onClick={() => onLogLevelsChange(['ERROR', 'WARN'])}
            className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-md transition-colors duration-200"
          >
            Errors & Warnings
          </button>
          <button
            onClick={() => {
              onLogLevelsChange([]);
              onSortOrderChange('desc');
            }}
            className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-md transition-colors duration-200"
          >
            Latest Activity
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;