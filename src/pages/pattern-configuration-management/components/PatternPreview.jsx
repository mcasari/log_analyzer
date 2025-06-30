import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const PatternPreview = ({ patterns, groupedData, sampleLogEntries, onNavigateToAnalysis }) => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showUngrouped, setShowUngrouped] = useState(false);

  const enabledPatterns = patterns.filter(p => p.enabled);
  const { threadGroups = [], ungroupedEntries = [] } = groupedData || {};

  const handleGroupSelect = (group) => {
    setSelectedGroup(selectedGroup?.threadId === group.threadId ? null : group);
  };

  const getLogLevelColor = (level) => {
    switch (level) {
      case 'ERROR': return 'text-error bg-error-100';
      case 'WARN': return 'text-warning bg-warning-100';
      case 'INFO': return 'text-primary bg-primary-100';
      case 'DEBUG': return 'text-text-secondary bg-secondary-100';
      default: return 'text-text-secondary bg-secondary-100';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary flex items-center">
            <Icon name="Eye" size={20} className="mr-2" />
            Live Preview
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            See how patterns group your log data
          </p>
        </div>
        <button
          onClick={onNavigateToAnalysis}
          className="btn-primary px-3 py-2 text-sm rounded"
        >
          <Icon name="ArrowRight" size={16} className="mr-1" />
          Analyze
        </button>
      </div>

      {/* Grouping Summary */}
      <div className="mb-6 p-4 bg-surface rounded-lg border border-border">
        <h4 className="text-sm font-medium text-text-primary mb-3">Grouping Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium text-text-primary">{threadGroups.length}</div>
            <div className="text-text-secondary">Thread Groups</div>
          </div>
          <div>
            <div className="font-medium text-primary">{groupedData.totalGroupedEntries}</div>
            <div className="text-text-secondary">Grouped Entries</div>
          </div>
          <div>
            <div className="font-medium text-warning">{ungroupedEntries.length}</div>
            <div className="text-text-secondary">Ungrouped Entries</div>
          </div>
          <div>
            <div className="font-medium text-success">{enabledPatterns.length}</div>
            <div className="text-text-secondary">Active Patterns</div>
          </div>
        </div>
      </div>

      {/* Pattern Status */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-text-primary mb-3">Active Patterns</h4>
        <div className="space-y-2">
          {enabledPatterns.length === 0 ? (
            <div className="text-sm text-text-secondary p-3 bg-warning-50 rounded border border-warning-200">
              No patterns enabled. Enable patterns to see grouping results.
            </div>
          ) : (
            enabledPatterns.map(pattern => (
              <div key={pattern.id} className="flex items-center justify-between p-2 bg-background rounded border border-border">
                <div className="flex items-center space-x-2">
                  <span className="text-xs px-2 py-1 bg-primary-100 text-primary-800 rounded">
                    #{pattern.priority}
                  </span>
                  <span className="text-sm text-text-primary">{pattern.name}</span>
                </div>
                <div className="text-xs text-text-secondary">
                  {threadGroups.filter(group => 
                    group.identifier?.pattern?.id === pattern.id
                  ).length} matches
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Thread Groups */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-text-primary">Thread Groups</h4>
          <button
            onClick={() => setShowUngrouped(!showUngrouped)}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-150"
          >
            {showUngrouped ? 'Hide' : 'Show'} Ungrouped ({ungroupedEntries.length})
          </button>
        </div>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {threadGroups.length === 0 ? (
            <div className="text-center py-6 text-text-secondary">
              <Icon name="Layers" size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No thread groups created</p>
              <p className="text-xs">Enable patterns to see grouping results</p>
            </div>
          ) : (
            threadGroups.map(group => (
              <div key={group.threadId} className="border border-border rounded-lg overflow-hidden">
                <div
                  className="p-3 bg-surface hover:bg-surface-hover cursor-pointer transition-colors duration-150"
                  onClick={() => handleGroupSelect(group)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`text-xs px-2 py-1 rounded-full font-medium ${getLogLevelColor(group.logLevel)}`}>
                        {group.logLevel}
                      </div>
                      <div>
                        <div className="font-medium text-text-primary text-sm truncate">
                          {group.threadName}
                        </div>
                        <div className="text-xs text-text-secondary">
                          {group.entryCount} entries • {group.identifier?.pattern?.name || 'Unknown pattern'}
                        </div>
                      </div>
                    </div>
                    <Icon 
                      name={selectedGroup?.threadId === group.threadId ? 'ChevronUp' : 'ChevronDown'} 
                      size={16} 
                      className="text-text-secondary" 
                    />
                  </div>
                </div>
                
                {selectedGroup?.threadId === group.threadId && (
                  <div className="p-3 bg-background border-t border-border">
                    <div className="space-y-2">
                      {group.entries.slice(0, 3).map(entry => (
                        <div key={entry.id} className="p-2 bg-surface rounded border border-border">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs px-2 py-1 rounded font-medium ${getLogLevelColor(entry.level)}`}>
                              {entry.level}
                            </span>
                            <span className="text-xs text-text-secondary">
                              {formatTimestamp(entry.timestamp)}
                            </span>
                          </div>
                          <div className="text-sm text-text-primary truncate">
                            {entry.message}
                          </div>
                          <div className="text-xs text-text-secondary truncate">
                            {entry.source}
                          </div>
                        </div>
                      ))}
                      {group.entries.length > 3 && (
                        <div className="text-xs text-text-secondary text-center">
                          ... and {group.entries.length - 3} more entries
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Ungrouped Entries */}
      {showUngrouped && ungroupedEntries.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-text-primary mb-3">Ungrouped Entries</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {ungroupedEntries.map(entry => (
              <div key={entry.id} className="p-2 bg-warning-50 rounded border border-warning-200">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs px-2 py-1 rounded font-medium ${getLogLevelColor(entry.level)}`}>
                    {entry.level}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {formatTimestamp(entry.timestamp)}
                  </span>
                </div>
                <div className="text-sm text-text-primary truncate">
                  {entry.message}
                </div>
                <div className="text-xs text-text-secondary truncate">
                  {entry.source}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-text-secondary">
            These entries don't match any active patterns. Consider creating additional patterns to group them.
          </div>
        </div>
      )}
    </div>
  );
};

export default PatternPreview;