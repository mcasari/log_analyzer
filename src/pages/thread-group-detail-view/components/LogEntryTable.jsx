import React from 'react';
import Icon from '../../../components/AppIcon';

const LogEntryTable = ({ entries, expandedEntries, onEntryExpand, searchTerm }) => {
  const getLogLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'text-error bg-error-100 border-error';
      case 'warn':
        return 'text-warning bg-warning-100 border-warning';
      case 'info':
        return 'text-primary bg-primary-100 border-primary';
      case 'debug':
        return 'text-text-secondary bg-secondary-100 border-secondary-300';
      default:
        return 'text-text-secondary bg-secondary-100 border-secondary-300';
    }
  };

  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-warning-100 text-warning-700 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour12: false })
    };
  };

  if (entries.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Search" size={32} className="text-text-tertiary" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">No Entries Found</h3>
        <p className="text-text-secondary">
          No log entries match your current search and filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {/* Table Header */}
      <div className="bg-surface border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Log Entries</h2>
          <span className="text-sm text-text-secondary">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface border-b border-border">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-text-secondary">Timestamp</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-text-secondary">Level</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-text-secondary">Source</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-text-secondary">Message</th>
              <th className="text-center px-6 py-3 text-sm font-medium text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.map((entry) => {
              const isExpanded = expandedEntries.has(entry.id);
              const { date, time } = formatTimestamp(entry.timestamp);
              
              return (
                <React.Fragment key={entry.id}>
                  <tr className="data-row">
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-text-primary">{time}</div>
                        <div className="text-text-tertiary">{date}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getLogLevelColor(entry.logLevel)}`}>
                        {entry.logLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-text-primary">
                        {highlightSearchTerm(entry.source, searchTerm)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-text-primary max-w-md">
                        {highlightSearchTerm(entry.message, searchTerm)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => onEntryExpand(entry.id)}
                        className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors duration-200"
                        title={isExpanded ? "Collapse details" : "Expand details"}
                      >
                        <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} />
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 bg-surface">
                        <div className="space-y-3">
                          <h4 className="font-medium text-text-primary">Full Message Details</h4>
                          <div className="bg-background border border-border rounded-lg p-4">
                            <pre className="text-sm text-text-primary whitespace-pre-wrap font-mono">
                              {highlightSearchTerm(entry.fullMessage, searchTerm)}
                            </pre>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-text-secondary">
                            <span>Entry ID: {entry.id}</span>
                            <span>•</span>
                            <span>Thread: THREAD-001</span>
                            <span>•</span>
                            <span>Sequence: {entry.id}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden divide-y divide-border">
        {entries.map((entry) => {
          const isExpanded = expandedEntries.has(entry.id);
          const { date, time } = formatTimestamp(entry.timestamp);
          
          return (
            <div key={entry.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getLogLevelColor(entry.logLevel)}`}>
                    {entry.logLevel}
                  </span>
                  <span className="text-sm font-medium text-text-primary">
                    {highlightSearchTerm(entry.source, searchTerm)}
                  </span>
                </div>
                <button
                  onClick={() => onEntryExpand(entry.id)}
                  className="p-1 rounded text-text-secondary hover:text-text-primary"
                >
                  <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} />
                </button>
              </div>
              
              <div className="text-xs text-text-tertiary mb-2">
                {time} • {date}
              </div>
              
              <div className="text-sm text-text-primary mb-3">
                {highlightSearchTerm(entry.message, searchTerm)}
              </div>
              
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="font-medium text-text-primary mb-2">Full Details</h4>
                  <div className="bg-surface border border-border rounded-lg p-3">
                    <pre className="text-xs text-text-primary whitespace-pre-wrap font-mono">
                      {highlightSearchTerm(entry.fullMessage, searchTerm)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LogEntryTable;