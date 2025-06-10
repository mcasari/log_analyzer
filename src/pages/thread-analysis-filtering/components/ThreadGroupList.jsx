// src/pages/thread-analysis-filtering/components/ThreadGroupList.jsx

import React from 'react';
import Icon from '../../../components/AppIcon';

const ThreadGroupList = ({
  threads,
  selectedThreads,
  expandedThreads,
  onThreadSelect,
  onThreadExpand,
  onViewDetails,
  getStatusColor,
  getLevelColor,
  searchQuery,
  usePatternGrouping
}) => {
  const highlightText = (text, query) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-accent-200 text-accent-800 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return 'Play';
      case 'completed': return 'CheckCircle';
      case 'error': return 'AlertCircle';
      default: return 'Circle';
    }
  };

  if (threads.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Search" size={32} className="text-text-tertiary" />
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-2">No threads found</h3>
        <p className="text-text-secondary">
          Try adjusting your filters or search query to find relevant thread groups.
          {usePatternGrouping && (
            <span className="block mt-2 text-sm">
              Make sure your patterns are configured to match the log content.
            </span>
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {usePatternGrouping && (
        <div className="mb-4 p-4 bg-accent-50 rounded-lg border border-accent-100">
          <div className="flex items-center mb-2">
            <Icon name="Zap" size={16} className="text-accent-600 mr-2" />
            <span className="text-sm font-medium text-text-primary">Pattern-Based Grouping Active</span>
          </div>
          <p className="text-sm text-text-secondary">
            Threads are automatically identified and grouped using configured patterns. 
            Thread names show the matched pattern identifiers (e.g., task-141, FileProcessingWorker-3).
          </p>
        </div>
      )}
      
      {threads.map((thread) => (
        <div key={thread.threadId} className="card overflow-hidden">
          {/* Thread Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedThreads.has(thread.threadId)}
                  onChange={() => onThreadSelect(thread.threadId)}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                />
                <div className="flex items-center space-x-2">
                  <Icon 
                    name={getStatusIcon(thread.status)} 
                    size={16} 
                    className={`
                      ${thread.status === 'active' ? 'text-success' : 
                        thread.status === 'completed' ? 'text-primary' : 'text-error'}
                    `}
                  />
                  <span className={`
                    text-xs px-2 py-1 rounded-full font-medium
                    ${getStatusColor(thread.status)}
                  `}>
                    {thread.status.toUpperCase()}
                  </span>
                  {usePatternGrouping && thread.identifier && (
                    <span className="text-xs px-2 py-1 bg-accent-100 text-accent-800 rounded-full font-medium">
                      {thread.identifier.pattern.name}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`
                  text-xs px-2 py-1 rounded font-medium
                  ${getLevelColor(thread.logLevel)}
                `}>
                  {thread.logLevel}
                </span>
                <button
                  onClick={() => onViewDetails(thread.threadId)}
                  className="text-sm text-primary hover:text-primary-700 font-medium transition-colors duration-150"
                >
                  View Details
                </button>
                <button
                  onClick={() => onThreadExpand(thread.threadId)}
                  className="p-1 text-text-secondary hover:text-text-primary transition-colors duration-150"
                >
                  <Icon 
                    name={expandedThreads.has(thread.threadId) ? 'ChevronUp' : 'ChevronDown'} 
                    size={20} 
                  />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-text-secondary mb-1">
                  {usePatternGrouping ? 'Pattern Match' : 'Thread ID'}
                </div>
                <div className="text-sm font-medium text-text-primary">
                  {usePatternGrouping && thread.identifier 
                    ? highlightText(thread.identifier.identifier, searchQuery)
                    : highlightText(thread.threadId, searchQuery)
                  }
                </div>
                {usePatternGrouping && thread.identifier && (
                  <div className="text-xs text-text-tertiary mt-1 font-mono">
                    Pattern: {thread.identifier.pattern.pattern.toString()}
                  </div>
                )}
              </div>
              <div>
                <div className="text-xs text-text-secondary mb-1">Thread Name</div>
                <div className="text-sm font-medium text-text-primary">
                  {highlightText(thread.threadName, searchQuery)}
                </div>
              </div>
              <div>
                <div className="text-xs text-text-secondary mb-1">Entry Count</div>
                <div className="text-sm font-medium text-text-primary">
                  {thread.entryCount.toLocaleString()} entries
                </div>
              </div>
              <div>
                <div className="text-xs text-text-secondary mb-1">Time Range</div>
                <div className="text-sm font-medium text-text-primary">
                  {formatTimestamp(thread.timeRange.start)} - {formatTimestamp(thread.timeRange.end)}
                </div>
              </div>
            </div>
          </div>

          {/* Expanded Thread Entries */}
          {expandedThreads.has(thread.threadId) && (
            <div className="p-6 bg-surface">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-text-primary">Log Entries</h4>
                <div className="text-xs text-text-secondary">
                  Showing {Math.min(thread.entries.length, 10)} of {thread.entries.length} entries
                </div>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {thread.entries.slice(0, 10).map((entry) => (
                  <div key={entry.id} className="p-4 bg-background rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className={`
                          text-xs px-2 py-1 rounded font-medium
                          ${getLevelColor(entry.level || entry.logLevel)}
                        `}>
                          {entry.level || entry.logLevel}
                        </span>
                        <span className="text-xs text-text-secondary font-mono">
                          {entry.timestamp}
                        </span>
                      </div>
                      <span className="text-xs text-text-tertiary">
                        {entry.source}
                      </span>
                    </div>
                    <div className="text-sm text-text-primary">
                      {highlightText(entry.message, searchQuery)}
                    </div>
                    {usePatternGrouping && thread.identifier && (
                      <div className="mt-2 text-xs text-accent-600">
                        <Icon name="Target" size={12} className="inline mr-1" />
                        Matched pattern: {thread.identifier.pattern.name}
                      </div>
                    )}
                  </div>
                ))}
                
                {thread.entries.length > 10 && (
                  <div className="text-center pt-4">
                    <button
                      onClick={() => onViewDetails(thread.threadId)}
                      className="text-sm text-primary hover:text-primary-700 font-medium transition-colors duration-150"
                    >
                      View all {thread.entries.length} entries →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ThreadGroupList;