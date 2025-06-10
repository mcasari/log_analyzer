// src/pages/thread-analysis-filtering/components/FilterSidebar.jsx

import React from 'react';
import Icon from '../../../components/AppIcon';

const FilterSidebar = ({ 
  filters, 
  onFiltersChange, 
  threadData, 
  selectedThreads, 
  onSelectAll,
  filteredCount,
  totalCount,
  usePatternGrouping,
  ungroupedCount
}) => {
  const logLevels = ['ERROR', 'WARN', 'INFO', 'DEBUG'];
  const threadStatuses = ['active', 'completed', 'error'];

  const handleLogLevelChange = (level) => {
    const newLevels = new Set(filters.logLevels);
    if (newLevels.has(level)) {
      newLevels.delete(level);
    } else {
      newLevels.add(level);
    }
    onFiltersChange({ ...filters, logLevels: newLevels });
  };

  const handleThreadGroupChange = (threadId) => {
    const newGroups = new Set(filters.threadGroups);
    if (newGroups.has(threadId)) {
      newGroups.delete(threadId);
    } else {
      newGroups.add(threadId);
    }
    onFiltersChange({ ...filters, threadGroups: newGroups });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      logLevels: new Set(['INFO', 'WARN', 'ERROR', 'DEBUG']),
      timeRange: { start: null, end: null },
      threadGroups: new Set()
    });
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'ERROR': return 'text-error border-error-100 bg-error-50';
      case 'WARN': return 'text-warning border-warning-100 bg-warning-50';
      case 'INFO': return 'text-primary border-primary-100 bg-primary-50';
      case 'DEBUG': return 'text-text-secondary border-secondary-200 bg-secondary-50';
      default: return 'text-text-secondary border-border bg-surface';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return 'Play';
      case 'completed': return 'CheckCircle';
      case 'error': return 'AlertCircle';
      default: return 'Circle';
    }
  };

  return (
    <div className="card p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Filters</h3>
        <button
          onClick={clearAllFilters}
          className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-150"
        >
          Clear All
        </button>
      </div>

      {/* Pattern Grouping Status */}
      {usePatternGrouping && (
        <div className="mb-6 p-4 bg-accent-50 rounded-lg border border-accent-100">
          <div className="flex items-center mb-2">
            <Icon name="Zap" size={16} className="text-accent-600 mr-2" />
            <span className="text-sm font-medium text-text-primary">Pattern Grouping Active</span>
          </div>
          <div className="text-sm text-text-secondary">
            Threads identified using configured patterns
          </div>
          {ungroupedCount > 0 && (
            <div className="text-xs text-warning mt-1">
              {ungroupedCount} entries without pattern matches
            </div>
          )}
        </div>
      )}

      {/* Selection Summary */}
      <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-text-primary">Thread Selection</span>
          <button
            onClick={onSelectAll}
            className="text-sm text-primary hover:text-primary-700 font-medium transition-colors duration-150"
          >
            {selectedThreads.size === filteredCount ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        <div className="text-sm text-text-secondary">
          {selectedThreads.size} of {filteredCount} threads selected
        </div>
        {filteredCount !== totalCount && (
          <div className="text-xs text-text-tertiary mt-1">
            ({totalCount - filteredCount} filtered out)
          </div>
        )}
      </div>

      {/* Log Levels Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center">
          <Icon name="Filter" size={16} className="mr-2" />
          Log Levels
        </h4>
        <div className="space-y-2">
          {logLevels.map(level => (
            <label key={level} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.logLevels.has(level)}
                onChange={() => handleLogLevelChange(level)}
                className="sr-only"
              />
              <div className={`
                w-4 h-4 rounded border-2 flex items-center justify-center mr-3 transition-all duration-150
                ${filters.logLevels.has(level) 
                  ? 'bg-primary border-primary' :'border-border group-hover:border-primary-300'
                }
              `}>
                {filters.logLevels.has(level) && (
                  <Icon name="Check" size={12} color="white" />
                )}
              </div>
              <span className={`
                text-sm px-2 py-1 rounded border font-medium transition-colors duration-150
                ${getLevelColor(level)}
              `}>
                {level}
              </span>
              <span className="ml-auto text-xs text-text-tertiary">
                {threadData.filter(t => t.logLevel === level).length}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Thread Groups Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center">
          <Icon name="Layers" size={16} className="mr-2" />
          {usePatternGrouping ? 'Pattern-Based Groups' : 'Thread Groups'}
        </h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {threadData.map(thread => (
            <label key={thread.threadId} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.threadGroups.size === 0 || filters.threadGroups.has(thread.threadId)}
                onChange={() => handleThreadGroupChange(thread.threadId)}
                className="sr-only"
              />
              <div className={`
                w-4 h-4 rounded border-2 flex items-center justify-center mr-3 transition-all duration-150
                ${filters.threadGroups.size === 0 || filters.threadGroups.has(thread.threadId)
                  ? 'bg-primary border-primary' :'border-border group-hover:border-primary-300'
                }
              `}>
                {(filters.threadGroups.size === 0 || filters.threadGroups.has(thread.threadId)) && (
                  <Icon name="Check" size={12} color="white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <Icon 
                    name={getStatusIcon(thread.status)} 
                    size={12} 
                    className={`
                      ${thread.status === 'active' ? 'text-success' : 
                        thread.status === 'completed' ? 'text-primary' : 'text-error'}
                    `}
                  />
                  <span className="text-sm text-text-primary truncate">
                    {thread.threadName}
                  </span>
                  {usePatternGrouping && thread.identifier && (
                    <span className="text-xs px-1 py-0.5 bg-accent-100 text-accent-800 rounded">
                      {thread.identifier.pattern.name}
                    </span>
                  )}
                </div>
                <div className="text-xs text-text-tertiary">
                  {thread.entryCount} entries
                  {usePatternGrouping && thread.identifier && (
                    <span className="ml-2 font-mono">
                      • {thread.identifier.identifier}
                    </span>
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Time Range Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center">
          <Icon name="Clock" size={16} className="mr-2" />
          Time Range
        </h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-text-secondary mb-1">Start Time</label>
            <input
              type="datetime-local"
              className="input-field w-full text-sm"
              value={filters.timeRange.start || ''}
              onChange={(e) => onFiltersChange({
                ...filters,
                timeRange: { ...filters.timeRange, start: e.target.value }
              })}
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">End Time</label>
            <input
              type="datetime-local"
              className="input-field w-full text-sm"
              value={filters.timeRange.end || ''}
              onChange={(e) => onFiltersChange({
                ...filters,
                timeRange: { ...filters.timeRange, end: e.target.value }
              })}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-4 bg-surface rounded-lg border border-border">
        <h4 className="text-sm font-medium text-text-primary mb-3">Quick Stats</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Total Threads:</span>
            <span className="font-medium text-text-primary">{totalCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Filtered:</span>
            <span className="font-medium text-text-primary">{filteredCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Selected:</span>
            <span className="font-medium text-primary">{selectedThreads.size}</span>
          </div>
          {usePatternGrouping && ungroupedCount > 0 && (
            <div className="flex justify-between">
              <span className="text-text-secondary">Ungrouped:</span>
              <span className="font-medium text-warning">{ungroupedCount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;