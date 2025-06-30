import React, { useMemo, useCallback, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import Icon from '../../../components/AppIcon';

const VirtualizedLogTable = ({ 
  entries, 
  expandedEntries, 
  onEntryExpand, 
  searchTerm,
  height = 600,
  onLoadMore,
  totalCount = 0,
  loading = false
}) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });

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

  const highlightSearchTerm = useCallback((text, searchTerm) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-warning-100 text-warning-700 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  }, []);

  const formatTimestamp = useCallback((timestamp) => {
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
  }, []);

  // Calculate dynamic row height based on expansion
  const getItemSize = useCallback((index) => {
    const entry = entries[index];
    if (!entry) return 80;
    
    const isExpanded = expandedEntries?.has(entry.id);
    const baseHeight = 80;
    const expandedHeight = 200;
    
    return isExpanded ? baseHeight + expandedHeight : baseHeight;
  }, [entries, expandedEntries]);

  // Row renderer with dynamic height
  const Row = useCallback(({ index, style }) => {
    const entry = entries[index];
    if (!entry) return null;

    const isExpanded = expandedEntries?.has(entry.id);
    const { date, time } = formatTimestamp(entry.timestamp);

    const handleExpand = () => {
      if (onEntryExpand) {
        onEntryExpand(entry.id);
      }
    };

    return (
      <div style={style} className="border-b border-border">
        {/* Desktop View */}
        <div className="hidden lg:block">
          <div className="flex items-center hover:bg-surface-hover transition-colors duration-150 px-4 py-3">
            {/* Timestamp */}
            <div className="w-32 flex-shrink-0">
              <div className="text-sm font-medium text-text-primary">{time}</div>
              <div className="text-xs text-text-tertiary">{date}</div>
            </div>

            {/* Log Level */}
            <div className="w-20 flex-shrink-0 mr-4">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getLogLevelColor(entry.logLevel)}`}>
                {entry.logLevel}
              </span>
            </div>

            {/* Source */}
            <div className="w-32 flex-shrink-0 mr-4">
              <span className="text-sm font-medium text-text-primary truncate block">
                {highlightSearchTerm(entry.source, searchTerm)}
              </span>
            </div>

            {/* Message */}
            <div className="flex-1 mr-4">
              <div className="text-sm text-text-primary line-clamp-2">
                {highlightSearchTerm(entry.message, searchTerm)}
              </div>
            </div>

            {/* Actions */}
            <div className="w-12 flex-shrink-0 text-center">
              <button
                onClick={handleExpand}
                className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors duration-200"
                title={isExpanded ? "Collapse details" : "Expand details"}
              >
                <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} />
              </button>
            </div>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="px-4 pb-4 bg-surface">
              <div className="bg-background border border-border rounded-lg p-4">
                <h4 className="font-medium text-text-primary mb-3">Full Message Details</h4>
                <pre className="text-sm text-text-primary whitespace-pre-wrap font-mono max-h-32 overflow-y-auto">
                  {highlightSearchTerm(entry.fullMessage || entry.message, searchTerm)}
                </pre>
                <div className="flex items-center space-x-4 text-xs text-text-secondary mt-3 pt-3 border-t border-border">
                  <span>Entry ID: {entry.id}</span>
                  <span>•</span>
                  <span>Line: {entry.offset || index + 1}</span>
                  {entry.rawLine && (
                    <>
                      <span>•</span>
                      <span>Raw Size: {entry.rawLine.length} chars</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile View */}
        <div className="lg:hidden p-4">
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
              onClick={handleExpand}
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
            <div className="pt-3 border-t border-border">
              <h4 className="font-medium text-text-primary mb-2">Full Details</h4>
              <div className="bg-surface border border-border rounded-lg p-3">
                <pre className="text-xs text-text-primary whitespace-pre-wrap font-mono max-h-32 overflow-y-auto">
                  {highlightSearchTerm(entry.fullMessage || entry.message, searchTerm)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }, [entries, expandedEntries, onEntryExpand, searchTerm, formatTimestamp, highlightSearchTerm, getLogLevelColor]);

  // Handle scroll events for infinite loading
  const handleItemsRendered = useCallback(({ visibleStartIndex, visibleStopIndex }) => {
    setVisibleRange({ start: visibleStartIndex, end: visibleStopIndex });
    
    // Load more data when approaching the end
    if (onLoadMore && !loading && visibleStopIndex >= entries.length - 5) {
      onLoadMore();
    }
  }, [entries.length, loading, onLoadMore]);

  // Empty state
  if (entries.length === 0 && !loading) {
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
      {/* Header */}
      <div className="bg-surface border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Log Entries</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-text-secondary">
              Showing {visibleRange.start + 1}-{Math.min(visibleRange.end + 1, entries.length)} of {totalCount || entries.length}
            </span>
            {loading && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm text-text-secondary">Loading...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-surface border-b border-border">
        <div className="flex items-center px-4 py-3 text-sm font-medium text-text-secondary">
          <div className="w-32 flex-shrink-0">Timestamp</div>
          <div className="w-20 flex-shrink-0 mr-4">Level</div>
          <div className="w-32 flex-shrink-0 mr-4">Source</div>
          <div className="flex-1 mr-4">Message</div>
          <div className="w-12 flex-shrink-0 text-center">Actions</div>
        </div>
      </div>

      {/* Virtualized List */}
      <List
        height={height - 96} // Subtract header heights
        itemCount={entries.length}
        itemSize={getItemSize}
        onItemsRendered={handleItemsRendered}
        overscanCount={5}
      >
        {Row}
      </List>

      {/* Loading Footer */}
      {loading && entries.length > 0 && (
        <div className="border-t border-border p-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm text-text-secondary">Loading more entries...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualizedLogTable;