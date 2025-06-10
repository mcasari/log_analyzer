// src/pages/thread-analysis-filtering/index.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import FilterSidebar from './components/FilterSidebar';
import ThreadGroupList from './components/ThreadGroupList';
import ActionPanel from './components/ActionPanel';
import SearchBar from './components/SearchBar';
import PatternConfigPanel from './components/PatternConfigPanel';
import { DEFAULT_THREAD_PATTERNS, groupLogEntriesByPattern } from '../../utils/threadPatternMatcher';

const ThreadAnalysisFiltering = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThreads, setSelectedThreads] = useState(new Set());
  const [filters, setFilters] = useState({
    logLevels: new Set(['INFO', 'WARN', 'ERROR', 'DEBUG']),
    timeRange: { start: null, end: null },
    threadGroups: new Set()
  });
  const [expandedThreads, setExpandedThreads] = useState(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [threadPatterns, setThreadPatterns] = useState(DEFAULT_THREAD_PATTERNS);
  const [showPatternConfig, setShowPatternConfig] = useState(false);
  const [usePatternGrouping, setUsePatternGrouping] = useState(true);

  // Mock log entries data - in real app this would come from uploaded files
  const mockLogEntries = [
    {
      id: 'entry-001',
      timestamp: '2024-01-15 08:30:15.123',
      level: 'INFO',
      message: 'Starting task-141 processing with user authentication',
      source: 'TaskManager.java:45',
      fullMessage: 'Starting task-141 processing with user authentication for user ID: 12345'
    },
    {
      id: 'entry-002',
      timestamp: '2024-01-15 08:30:16.456',
      level: 'DEBUG',
      message: 'task-141: Database connection established',
      source: 'DatabaseConnector.java:23',
      fullMessage: 'task-141: Database connection established with pool size 10'
    },
    {
      id: 'entry-003',
      timestamp: '2024-01-15 08:30:17.789',
      level: 'WARN',
      message: 'task-141: Connection timeout detected',
      source: 'ConnectionMonitor.java:67',
      fullMessage: 'task-141: Connection timeout detected for connection #3'
    },
    {
      id: 'entry-004',
      timestamp: '2024-01-15 08:32:10.234',
      level: 'INFO',
      message: 'task-142 started user authentication service',
      source: 'AuthService.java:12',
      fullMessage: 'task-142 started user authentication service for session management'
    },
    {
      id: 'entry-005',
      timestamp: '2024-01-15 08:32:11.567',
      level: 'ERROR',
      message: 'task-142: Failed to authenticate user',
      source: 'AuthValidator.java:89',
      fullMessage: 'task-142: Failed to authenticate user - invalid credentials provided'
    },
    {
      id: 'entry-006',
      timestamp: '2024-01-15 08:35:20.345',
      level: 'INFO',
      message: 'FileProcessingWorker-3 initialized for task processing',
      source: 'FileWorker.java:15',
      fullMessage: 'FileProcessingWorker-3 initialized for task processing with 16GB memory allocation'
    },
    {
      id: 'entry-007',
      timestamp: '2024-01-15 08:35:21.678',
      level: 'ERROR',
      message: 'FileProcessingWorker-3: Failed to process file',
      source: 'FileProcessor.java:156',
      fullMessage: 'FileProcessingWorker-3: Failed to process file - corrupted data detected'
    },
    {
      id: 'entry-008',
      timestamp: '2024-01-15 08:28:05.123',
      level: 'DEBUG',
      message: 'sess_abc123xyz789 cache manager started',
      source: 'CacheManager.java:28',
      fullMessage: 'sess_abc123xyz789 cache manager started with 1GB memory allocation'
    }
  ];

  // Group log entries using pattern matching when enabled
  const groupedData = useMemo(() => {
    if (usePatternGrouping) {
      return groupLogEntriesByPattern(mockLogEntries, threadPatterns);
    } else {
      // Fall back to original mock data structure
      return {
        threadGroups: mockThreadData,
        ungroupedEntries: [],
        totalThreads: mockThreadData.length,
        totalGroupedEntries: mockThreadData.reduce((sum, group) => sum + group.entryCount, 0),
        totalUngroupedEntries: 0
      };
    }
  }, [mockLogEntries, threadPatterns, usePatternGrouping]);

  // Original mock thread data for fallback
  const mockThreadData = [
    {
      threadId: "thread-001",
      threadName: "DatabaseConnectionPool-1",
      entryCount: 245,
      timeRange: { start: "2024-01-15 08:30:15", end: "2024-01-15 09:45:22" },
      status: "active",
      logLevel: "INFO",
      entries: mockLogEntries.slice(0, 3)
    },
    {
      threadId: "thread-002",
      threadName: "UserAuthenticationService-2",
      entryCount: 156,
      timeRange: { start: "2024-01-15 08:32:10", end: "2024-01-15 09:12:45" },
      status: "completed",
      logLevel: "ERROR",
      entries: mockLogEntries.slice(3, 5)
    }
  ];

  // Filter threads based on search and filters
  const filteredThreads = useMemo(() => {
    return groupedData.threadGroups.filter(thread => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          thread.threadName.toLowerCase().includes(searchLower) ||
          thread.threadId.toLowerCase().includes(searchLower) ||
          thread.entries.some(entry => 
            entry.message.toLowerCase().includes(searchLower)
          );
        if (!matchesSearch) return false;
      }

      // Log level filter
      if (filters.logLevels.size > 0 && !filters.logLevels.has(thread.logLevel)) {
        return false;
      }

      // Thread group filter
      if (filters.threadGroups.size > 0 && !filters.threadGroups.has(thread.threadId)) {
        return false;
      }

      return true;
    });
  }, [searchQuery, filters, groupedData.threadGroups]);

  const handleThreadSelect = (threadId) => {
    const newSelected = new Set(selectedThreads);
    if (newSelected.has(threadId)) {
      newSelected.delete(threadId);
    } else {
      newSelected.add(threadId);
    }
    setSelectedThreads(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedThreads.size === filteredThreads.length) {
      setSelectedThreads(new Set());
    } else {
      setSelectedThreads(new Set(filteredThreads.map(t => t.threadId)));
    }
  };

  const handleThreadExpand = (threadId) => {
    const newExpanded = new Set(expandedThreads);
    if (newExpanded.has(threadId)) {
      newExpanded.delete(threadId);
    } else {
      newExpanded.add(threadId);
    }
    setExpandedThreads(newExpanded);
  };

  const handleExport = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      navigate('/export-results-management');
    }, 2000);
  };

  const handleViewDetails = (threadId) => {
    navigate('/thread-group-detail-view', { state: { threadId } });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-success bg-success-100';
      case 'completed': return 'text-primary bg-primary-100';
      case 'error': return 'text-error bg-error-100';
      default: return 'text-text-secondary bg-secondary-100';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'ERROR': return 'text-error bg-error-100';
      case 'WARN': return 'text-warning bg-warning-100';
      case 'INFO': return 'text-primary bg-primary-100';
      case 'DEBUG': return 'text-text-secondary bg-secondary-100';
      default: return 'text-text-secondary bg-secondary-100';
    }
  };

  // Get sample log entry for pattern testing
  const sampleLogEntry = mockLogEntries.length > 0 
    ? `${mockLogEntries[0].message} ${mockLogEntries[0].source} ${mockLogEntries[0].fullMessage}`
    : '';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <BreadcrumbTrail />
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">Thread Analysis & Filtering</h1>
              <p className="text-text-secondary">
                {usePatternGrouping 
                  ? 'Analyze log entries grouped by pattern-based thread identification'
                  : 'Analyze and filter log entries grouped by threads'
                }. Select specific thread groups for detailed investigation.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPatternConfig(!showPatternConfig)}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-150 flex items-center space-x-2
                  ${showPatternConfig ? 'bg-primary text-white' : 'bg-surface text-text-primary hover:bg-surface-hover border border-border'}
                `}
              >
                <span>Configure Patterns</span>
              </button>
              <div className="text-sm text-text-secondary">
                {filteredThreads.length} of {groupedData.totalThreads} threads
              </div>
              <div className="text-sm text-text-secondary">
                {selectedThreads.size} selected
              </div>
            </div>
          </div>

          {/* Pattern Grouping Toggle */}
          <div className="mb-4 p-4 bg-surface rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="pattern-grouping"
                  checked={usePatternGrouping}
                  onChange={(e) => setUsePatternGrouping(e.target.checked)}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                />
                <label htmlFor="pattern-grouping" className="text-sm font-medium text-text-primary cursor-pointer">
                  Enable Pattern-Based Thread Grouping
                </label>
              </div>
              {usePatternGrouping && (
                <div className="text-sm text-text-secondary">
                  {groupedData.totalGroupedEntries} entries grouped • {groupedData.totalUngroupedEntries} ungrouped
                </div>
              )}
            </div>
            {usePatternGrouping && (
              <p className="text-xs text-text-secondary mt-2">
                Uses configured patterns to identify threads from log content (e.g., task-141, FileProcessingWorker-3)
              </p>
            )}
          </div>

          {/* Search Bar */}
          <SearchBar 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            placeholder="Search threads, messages, or thread IDs..."
          />
        </div>

        {/* Pattern Configuration Panel */}
        {showPatternConfig && (
          <div className="mb-6">
            <PatternConfigPanel
              patterns={threadPatterns}
              onPatternsChange={setThreadPatterns}
              sampleLogEntry={sampleLogEntry}
            />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Filter Sidebar */}
          <div className="lg:col-span-3">
            <FilterSidebar
              filters={filters}
              onFiltersChange={setFilters}
              threadData={groupedData.threadGroups}
              selectedThreads={selectedThreads}
              onSelectAll={handleSelectAll}
              filteredCount={filteredThreads.length}
              totalCount={groupedData.totalThreads}
              usePatternGrouping={usePatternGrouping}
              ungroupedCount={groupedData.totalUngroupedEntries}
            />
          </div>

          {/* Thread Groups List */}
          <div className="lg:col-span-7">
            <ThreadGroupList
              threads={filteredThreads}
              selectedThreads={selectedThreads}
              expandedThreads={expandedThreads}
              onThreadSelect={handleThreadSelect}
              onThreadExpand={handleThreadExpand}
              onViewDetails={handleViewDetails}
              getStatusColor={getStatusColor}
              getLevelColor={getLevelColor}
              searchQuery={searchQuery}
              usePatternGrouping={usePatternGrouping}
            />
          </div>

          {/* Action Panel */}
          <div className="lg:col-span-2">
            <ActionPanel
              selectedCount={selectedThreads.size}
              totalCount={filteredThreads.length}
              onExport={handleExport}
              isProcessing={isProcessing}
              threadData={filteredThreads}
              usePatternGrouping={usePatternGrouping}
              groupingStats={groupedData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreadAnalysisFiltering;