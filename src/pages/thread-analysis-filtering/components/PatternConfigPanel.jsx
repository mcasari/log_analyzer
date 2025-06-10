// src/pages/thread-analysis-filtering/components/PatternConfigPanel.jsx

import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { validatePattern, testPattern } from '../../../utils/threadPatternMatcher';

const PatternConfigPanel = ({ patterns, onPatternsChange, sampleLogEntry }) => {
  const [expandedPattern, setExpandedPattern] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [customPattern, setCustomPattern] = useState('');
  const [customPatternName, setCustomPatternName] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);

  const handlePatternToggle = (patternId) => {
    const updatedPatterns = patterns.map(pattern => 
      pattern.id === patternId 
        ? { ...pattern, enabled: !pattern.enabled }
        : pattern
    );
    onPatternsChange(updatedPatterns);
  };

  const handlePatternEdit = (patternId, newPatternString) => {
    const validation = validatePattern(newPatternString);
    
    if (validation.valid) {
      const updatedPatterns = patterns.map(pattern => 
        pattern.id === patternId 
          ? { ...pattern, pattern: newPatternString }
          : pattern
      );
      onPatternsChange(updatedPatterns);
    }
  };

  const handleTestPattern = (patternId, patternString) => {
    if (sampleLogEntry) {
      const matches = testPattern(patternString, sampleLogEntry);
      setTestResults(prev => ({
        ...prev,
        [patternId]: matches
      }));
    }
  };

  const handleAddCustomPattern = () => {
    const validation = validatePattern(customPattern);
    
    if (validation.valid && customPatternName.trim()) {
      const newPattern = {
        id: `custom-${Date.now()}`,
        name: customPatternName.trim(),
        pattern: customPattern,
        description: 'User-defined custom pattern',
        enabled: true,
        priority: patterns.length + 1,
        isCustom: true
      };
      
      onPatternsChange([...patterns, newPattern]);
      setCustomPattern('');
      setCustomPatternName('');
      setShowAddCustom(false);
    }
  };

  const handleRemoveCustomPattern = (patternId) => {
    const updatedPatterns = patterns.filter(pattern => pattern.id !== patternId);
    onPatternsChange(updatedPatterns);
  };

  const handlePriorityChange = (patternId, direction) => {
    const patternIndex = patterns.findIndex(p => p.id === patternId);
    if (patternIndex === -1) return;

    const newPatterns = [...patterns];
    const currentPattern = newPatterns[patternIndex];
    const targetIndex = direction === 'up' ? patternIndex - 1 : patternIndex + 1;

    if (targetIndex >= 0 && targetIndex < newPatterns.length) {
      const targetPattern = newPatterns[targetIndex];
      
      // Swap priorities
      const tempPriority = currentPattern.priority;
      currentPattern.priority = targetPattern.priority;
      targetPattern.priority = tempPriority;
      
      // Swap positions in array
      newPatterns[patternIndex] = targetPattern;
      newPatterns[targetIndex] = currentPattern;
      
      onPatternsChange(newPatterns.sort((a, b) => a.priority - b.priority));
    }
  };

  const getPatternStatusColor = (pattern) => {
    if (!pattern.enabled) return 'text-text-tertiary bg-secondary-100';
    
    const validation = validatePattern(pattern.pattern.toString());
    if (!validation.valid) return 'text-error bg-error-100';
    
    return 'text-success bg-success-100';
  };

  const enabledPatternsCount = patterns.filter(p => p.enabled).length;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary flex items-center">
            <Icon name="Settings" size={20} className="mr-2" />
            Thread Patterns
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Configure patterns to identify and group threads
          </p>
        </div>
        <div className="text-sm text-text-secondary">
          {enabledPatternsCount} of {patterns.length} enabled
        </div>
      </div>

      {/* Pattern Status Summary */}
      <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-text-primary">Pattern Status</span>
          <button
            onClick={() => setShowAddCustom(!showAddCustom)}
            className="text-sm text-primary hover:text-primary-700 font-medium transition-colors duration-150"
          >
            <Icon name="Plus" size={16} className="mr-1" />
            Add Custom
          </button>
        </div>
        <div className="text-sm text-text-secondary">
          {enabledPatternsCount} pattern{enabledPatternsCount !== 1 ? 's' : ''} active for thread identification
        </div>
      </div>

      {/* Add Custom Pattern Form */}
      {showAddCustom && (
        <div className="mb-6 p-4 bg-surface rounded-lg border border-border">
          <h4 className="text-sm font-medium text-text-primary mb-3">Add Custom Pattern</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-text-secondary mb-1">Pattern Name</label>
              <input
                type="text"
                value={customPatternName}
                onChange={(e) => setCustomPatternName(e.target.value)}
                placeholder="Enter pattern name..."
                className="input-field w-full text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Regular Expression</label>
              <input
                type="text"
                value={customPattern}
                onChange={(e) => setCustomPattern(e.target.value)}
                placeholder="Enter regex pattern (e.g., task-\\d+)..."
                className="input-field w-full text-sm font-mono"
              />
              {customPattern && (
                <div className="mt-1">
                  {validatePattern(customPattern).valid ? (
                    <span className="text-xs text-success flex items-center">
                      <Icon name="CheckCircle" size={12} className="mr-1" />
                      Valid pattern
                    </span>
                  ) : (
                    <span className="text-xs text-error flex items-center">
                      <Icon name="AlertCircle" size={12} className="mr-1" />
                      {validatePattern(customPattern).error}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleAddCustomPattern}
                disabled={!validatePattern(customPattern).valid || !customPatternName.trim()}
                className="btn-primary px-3 py-2 text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Pattern
              </button>
              <button
                onClick={() => {
                  setShowAddCustom(false);
                  setCustomPattern('');
                  setCustomPatternName('');
                }}
                className="btn-secondary px-3 py-2 text-sm rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pattern List */}
      <div className="space-y-3">
        {patterns.map((pattern, index) => (
          <div key={pattern.id} className="border border-border rounded-lg overflow-hidden">
            <div className="p-4 bg-surface hover:bg-surface-hover transition-colors duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={pattern.enabled}
                      onChange={() => handlePatternToggle(pattern.id)}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                    />
                    <span className={`
                      text-xs px-2 py-1 rounded-full font-medium
                      ${getPatternStatusColor(pattern)}
                    `}>
                      #{pattern.priority}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-text-primary">
                        {pattern.name}
                      </span>
                      {pattern.isCustom && (
                        <span className="text-xs px-2 py-1 bg-accent-100 text-accent-800 rounded">
                          Custom
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-text-secondary mt-1">
                      {pattern.description}
                    </div>
                    <div className="text-xs font-mono text-text-tertiary mt-1 truncate">
                      {pattern.pattern.toString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Priority Controls */}
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => handlePriorityChange(pattern.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                      title="Move up"
                    >
                      <Icon name="ChevronUp" size={14} />
                    </button>
                    <button
                      onClick={() => handlePriorityChange(pattern.id, 'down')}
                      disabled={index === patterns.length - 1}
                      className="p-1 text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                      title="Move down"
                    >
                      <Icon name="ChevronDown" size={14} />
                    </button>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleTestPattern(pattern.id, pattern.pattern.toString())}
                      disabled={!sampleLogEntry}
                      className="p-2 text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                      title="Test pattern"
                    >
                      <Icon name="Play" size={16} />
                    </button>
                    <button
                      onClick={() => setExpandedPattern(expandedPattern === pattern.id ? null : pattern.id)}
                      className="p-2 text-text-secondary hover:text-text-primary transition-colors duration-150"
                      title="Configure pattern"
                    >
                      <Icon name={expandedPattern === pattern.id ? 'ChevronUp' : 'ChevronDown'} size={16} />
                    </button>
                    {pattern.isCustom && (
                      <button
                        onClick={() => handleRemoveCustomPattern(pattern.id)}
                        className="p-2 text-error hover:text-error-700 transition-colors duration-150"
                        title="Remove custom pattern"
                      >
                        <Icon name="Trash2" size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Test Results */}
              {testResults[pattern.id] && (
                <div className="mt-3 p-3 bg-background rounded border border-border">
                  <div className="text-xs text-text-secondary mb-2">Test Results:</div>
                  {testResults[pattern.id].length > 0 ? (
                    <div className="space-y-1">
                      {testResults[pattern.id].map((match, matchIndex) => (
                        <div key={matchIndex} className="text-xs font-mono text-success bg-success-50 px-2 py-1 rounded">
                          "{match}"
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-text-tertiary">No matches found</div>
                  )}
                </div>
              )}
            </div>
            
            {/* Expanded Configuration */}
            {expandedPattern === pattern.id && (
              <div className="p-4 bg-background border-t border-border">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-text-secondary mb-1">Pattern Description</label>
                    <input
                      type="text"
                      value={pattern.description}
                      onChange={(e) => {
                        const updatedPatterns = patterns.map(p => 
                          p.id === pattern.id 
                            ? { ...p, description: e.target.value }
                            : p
                        );
                        onPatternsChange(updatedPatterns);
                      }}
                      className="input-field w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-secondary mb-1">Regular Expression Pattern</label>
                    <input
                      type="text"
                      value={pattern.pattern.toString()}
                      onChange={(e) => handlePatternEdit(pattern.id, e.target.value)}
                      className="input-field w-full text-sm font-mono"
                    />
                    <div className="text-xs text-text-tertiary mt-1">
                      Use regular expressions to match thread identifiers (e.g., task-\d+, thread-\w+)
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sample Text for Testing */}
      {sampleLogEntry && (
        <div className="mt-6 p-4 bg-surface rounded-lg border border-border">
          <h4 className="text-sm font-medium text-text-primary mb-2">Sample Log Entry</h4>
          <div className="text-xs font-mono text-text-secondary bg-background p-3 rounded border border-border overflow-x-auto">
            {sampleLogEntry}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatternConfigPanel;