import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { validatePattern } from '../../../utils/threadPatternMatcher';

const PatternLibrary = ({ 
  patterns, 
  selectedPattern, 
  onPatternSelect, 
  onPatternUpdate, 
  onPatternDelete, 
  onPatternDuplicate,
  onPatternsReorder,
  searchQuery 
}) => {
  const [sortBy, setSortBy] = useState('priority');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showOnlyEnabled, setShowOnlyEnabled] = useState(false);

  // Sort patterns
  const sortedPatterns = [...patterns].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'priority':
        aValue = a.priority;
        bValue = b.priority;
        break;
      case 'enabled':
        aValue = a.enabled ? 1 : 0;
        bValue = b.enabled ? 1 : 0;
        break;
      default:
        aValue = a.priority;
        bValue = b.priority;
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // Filter patterns
  const filteredPatterns = sortedPatterns.filter(pattern => {
    if (showOnlyEnabled && !pattern.enabled) return false;
    return true;
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleToggleEnabled = (pattern) => {
    onPatternUpdate({
      ...pattern,
      enabled: !pattern.enabled
    });
  };

  const handlePriorityChange = (pattern, direction) => {
    const currentIndex = patterns.findIndex(p => p.id === pattern.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex >= 0 && targetIndex < patterns.length) {
      const updatedPatterns = [...patterns];
      const targetPattern = updatedPatterns[targetIndex];
      
      // Swap priorities
      const tempPriority = pattern.priority;
      updatedPatterns[currentIndex] = { ...pattern, priority: targetPattern.priority };
      updatedPatterns[targetIndex] = { ...targetPattern, priority: tempPriority };
      
      onPatternsReorder(updatedPatterns.sort((a, b) => a.priority - b.priority));
    }
  };

  const getPatternStatus = (pattern) => {
    if (!pattern.enabled) return { color: 'text-text-tertiary bg-secondary-100', text: 'Disabled' };
    
    const validation = validatePattern(pattern.pattern.toString());
    if (!validation.valid) return { color: 'text-error bg-error-100', text: 'Invalid' };
    
    return { color: 'text-success bg-success-100', text: 'Active' };
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return 'ArrowUpDown';
    return sortOrder === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary flex items-center">
            <Icon name="Library" size={20} className="mr-2" />
            Pattern Library
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Manage and organize your thread identification patterns
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={showOnlyEnabled}
              onChange={(e) => setShowOnlyEnabled(e.target.checked)}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
            />
            <span>Show enabled only</span>
          </label>
          <span className="text-sm text-text-secondary">
            {filteredPatterns.length} of {patterns.length} patterns
          </span>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center space-x-4 mb-4 p-3 bg-surface rounded-lg border border-border">
        <span className="text-sm text-text-secondary">Sort by:</span>
        <button
          onClick={() => handleSort('priority')}
          className={`flex items-center space-x-1 px-2 py-1 rounded text-sm transition-colors duration-150 ${
            sortBy === 'priority' ? 'text-primary bg-primary-50' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <span>Priority</span>
          <Icon name={getSortIcon('priority')} size={14} />
        </button>
        <button
          onClick={() => handleSort('name')}
          className={`flex items-center space-x-1 px-2 py-1 rounded text-sm transition-colors duration-150 ${
            sortBy === 'name' ? 'text-primary bg-primary-50' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <span>Name</span>
          <Icon name={getSortIcon('name')} size={14} />
        </button>
        <button
          onClick={() => handleSort('enabled')}
          className={`flex items-center space-x-1 px-2 py-1 rounded text-sm transition-colors duration-150 ${
            sortBy === 'enabled' ? 'text-primary bg-primary-50' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <span>Status</span>
          <Icon name={getSortIcon('enabled')} size={14} />
        </button>
      </div>

      {/* Pattern List */}
      <div className="space-y-2">
        {filteredPatterns.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            <Icon name="Search" size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No patterns found</p>
            <p className="text-sm">
              {searchQuery ? 'Try adjusting your search query' : 'Create your first pattern to get started'}
            </p>
          </div>
        ) : (
          filteredPatterns.map((pattern, index) => {
            const status = getPatternStatus(pattern);
            const isSelected = selectedPattern?.id === pattern.id;
            
            return (
              <div
                key={pattern.id}
                className={`
                  border rounded-lg transition-all duration-150 cursor-pointer
                  ${isSelected 
                    ? 'border-primary bg-primary-50 shadow-sm' 
                    : 'border-border hover:border-primary-200'
                  }
                `}
                onClick={() => onPatternSelect(pattern)}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {/* Priority and Status */}
                      <div className="flex flex-col items-center space-y-1">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.color}`}>
                          #{pattern.priority}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.color}`}>
                          {status.text}
                        </span>
                      </div>
                      
                      {/* Pattern Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-text-primary truncate">
                            {pattern.name}
                          </h4>
                          {pattern.isCustom && (
                            <span className="text-xs px-2 py-1 bg-accent-100 text-accent-800 rounded">
                              Custom
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-text-secondary truncate mb-2">
                          {pattern.description}
                        </p>
                        <div className="text-xs font-mono text-text-tertiary bg-background px-2 py-1 rounded truncate">
                          {pattern.pattern.toString()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      {/* Enable/Disable Toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleEnabled(pattern);
                        }}
                        className={`
                          p-2 rounded transition-colors duration-150
                          ${pattern.enabled 
                            ? 'text-success hover:text-success-700' :'text-text-tertiary hover:text-text-primary'
                          }
                        `}
                        title={pattern.enabled ? 'Disable pattern' : 'Enable pattern'}
                      >
                        <Icon name={pattern.enabled ? 'Eye' : 'EyeOff'} size={16} />
                      </button>
                      
                      {/* Priority Controls */}
                      <div className="flex flex-col">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePriorityChange(pattern, 'up');
                          }}
                          disabled={index === 0}
                          className="p-1 text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                          title="Move up"
                        >
                          <Icon name="ChevronUp" size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePriorityChange(pattern, 'down');
                          }}
                          disabled={index === filteredPatterns.length - 1}
                          className="p-1 text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                          title="Move down"
                        >
                          <Icon name="ChevronDown" size={12} />
                        </button>
                      </div>
                      
                      {/* More Actions */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPatternDuplicate(pattern);
                        }}
                        className="p-2 text-text-secondary hover:text-text-primary transition-colors duration-150"
                        title="Duplicate pattern"
                      >
                        <Icon name="Copy" size={16} />
                      </button>
                      
                      {pattern.isCustom && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Are you sure you want to delete this pattern?')) {
                              onPatternDelete(pattern.id);
                            }
                          }}
                          className="p-2 text-error hover:text-error-700 transition-colors duration-150"
                          title="Delete pattern"
                        >
                          <Icon name="Trash2" size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PatternLibrary;