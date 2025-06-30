import React, { useMemo, useState, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import VirtualizedLogTable from './VirtualizedLogTable';
import useProgressiveData from '../../../hooks/useProgressiveData';

const LogEntryTable = ({ entries, expandedEntries, onEntryExpand, searchTerm, enableVirtualization = true }) => {
  const [virtualizedEnabled, setVirtualizedEnabled] = useState(enableVirtualization && entries.length > 100);
  
  // Progressive data loading for large datasets
  const {
    data: progressiveEntries,
    loading,
    hasMore,
    loadNextPage,
    getVisibleData,
    totalCount
  } = useProgressiveData({
    pageSize: 50,
    maxMemoryPages: 20,
    initialData: entries.slice(0, 50),
    onLoadMore: useCallback(async ({ page, pageSize }) => {
      // Simulate async loading for large datasets
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const startIndex = page * pageSize;
      const endIndex = startIndex + pageSize;
      const pageEntries = entries.slice(startIndex, endIndex);
      
      return {
        data: pageEntries,
        totalCount: entries.length,
        hasMore: endIndex < entries.length
      };
    }, [entries])
  });

  const displayEntries = virtualizedEnabled ? progressiveEntries : entries;

  const getLogLevelColor = (level) => {
    switch (level?.toLowerCase()) {
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
    if (!searchTerm || !text) return text;
    
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
    if (!timestamp) return { date: '', time: '' };
    
    try {
      const date = new Date(timestamp);
      return {
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString([], { hour12: false })
      };
    } catch {
      return { date: '', time: timestamp };
    }
  };

  // Toggle virtualization mode
  const toggleVirtualization = () => {
    setVirtualizedEnabled(!virtualizedEnabled);
  };

  if (displayEntries.length === 0 && !loading) {
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

  // Use virtualized table for large datasets
  if (virtualizedEnabled && entries.length > 100) {
    return (
      <div className="space-y-4">
        {/* Performance Toggle */}
        <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
          <div className="flex items-center space-x-3">
            <Icon name="Zap" size={20} className="text-primary" />
            <div>
              <h4 className="font-medium text-text-primary">Performance Mode</h4>
              <p className="text-sm text-text-secondary">
                Virtualized rendering enabled for {entries.length.toLocaleString()} entries
              </p>
            </div>
          </div>
          <button
            onClick={toggleVirtualization}
            className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium"
          >
            Switch to Standard
          </button>
        </div>

        <VirtualizedLogTable
          entries={displayEntries}
          expandedEntries={expandedEntries}
          onEntryExpand={onEntryExpand}
          searchTerm={searchTerm}
          height={600}
          onLoadMore={hasMore ? loadNextPage : null}
          totalCount={entries.length}
          loading={loading}
        />
      </div>
    );
  }

  // Standard table for smaller datasets
  return (
    <div className="space-y-4">
      {/* Performance Toggle for large datasets */}
      {entries.length > 100 && (
        <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
          <div className="flex items-center space-x-3">
            <Icon name="List" size={20} className="text-text-secondary" />
            <div>
              <h4 className="font-medium text-text-primary">Standard Mode</h4>
              <p className="text-sm text-text-secondary">
                Showing all {entries.length.toLocaleString()} entries
              </p>
            </div>
          </div>
          <button
            onClick={toggleVirtualization}
            className="btn-primary px-4 py-2 rounded-lg text-sm font-medium"
          >
            Enable Performance Mode
          </button>
        </div>
      )}

      <div className="card overflow-hidden">
        {/* Table Header */}
        <div className="bg-surface border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">Log Entries</h2>
            <span className="text-sm text-text-secondary">
              {displayEntries.length} {displayEntries.length === 1 ? 'entry' : 'entries'}
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
              {displayEntries.map((entry) => {
                const isExpanded = expandedEntries?.has(entry.id);
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
                          onClick={() => onEntryExpand?.(entry.id)}
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
                                {highlightSearchTerm(entry.fullMessage || entry.message, searchTerm)}
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
          {displayEntries.map((entry) => {
            const isExpanded = expandedEntries?.has(entry.id);
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
                    onClick={() => onEntryExpand?.(entry.id)}
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
                        {highlightSearchTerm(entry.fullMessage || entry.message, searchTerm)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Load More Button for Progressive Loading */}
        {hasMore && virtualizedEnabled && (
          <div className="border-t border-border p-4 text-center">
            <button
              onClick={loadNextPage}
              disabled={loading}
              className="btn-secondary px-6 py-3 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                `Load More (${entries.length - displayEntries.length} remaining)`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogEntryTable;