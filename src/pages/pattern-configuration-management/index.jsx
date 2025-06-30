import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import PatternDefinitionTools from './components/PatternDefinitionTools';
import PatternLibrary from './components/PatternLibrary';
import PatternPreview from './components/PatternPreview';
import PatternImportExport from './components/PatternImportExport';
import ConflictResolution from './components/ConflictResolution';
import { DEFAULT_THREAD_PATTERNS, groupLogEntriesByPattern } from '../../utils/threadPatternMatcher';

const PatternConfigurationManagement = () => {
  const navigate = useNavigate();
  const [patterns, setPatterns] = useState(DEFAULT_THREAD_PATTERNS);
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAutoSave, setIsAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [versionHistory, setVersionHistory] = useState([]);

  // Mock log entries for preview
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
    },
    {
      id: 'entry-009',
      timestamp: '2024-01-15 08:40:12.345',
      level: 'INFO',
      message: 'Regular log entry without pattern',
      source: 'General.java:100',
      fullMessage: 'Regular log entry without pattern - this should appear in ungrouped'
    }
  ];

  // Group log entries using current patterns for preview
  const groupedPreview = useMemo(() => {
    return groupLogEntriesByPattern(mockLogEntries, patterns);
  }, [patterns]);

  // Filter patterns based on search
  const filteredPatterns = useMemo(() => {
    if (!searchQuery.trim()) return patterns;
    
    const query = searchQuery.toLowerCase();
    return patterns.filter(pattern => 
      pattern.name.toLowerCase().includes(query) ||
      pattern.description.toLowerCase().includes(query) ||
      pattern.pattern.toString().toLowerCase().includes(query)
    );
  }, [patterns, searchQuery]);

  // Auto-save functionality
  useEffect(() => {
    if (isAutoSave && hasUnsavedChanges) {
      const timeoutId = setTimeout(() => {
        handleSave();
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [patterns, isAutoSave, hasUnsavedChanges]);

  const handleSave = () => {
    // In a real app, this would save to backend
    setLastSaved(new Date());
    setHasUnsavedChanges(false);
    
    // Add to version history
    const newVersion = {
      id: Date.now(),
      timestamp: new Date(),
      patterns: [...patterns],
      description: `Auto-saved configuration with ${patterns.length} patterns`
    };
    setVersionHistory(prev => [newVersion, ...prev.slice(0, 9)]); // Keep last 10 versions
  };

  const handlePatternChange = (updatedPatterns) => {
    setPatterns(updatedPatterns);
    setHasUnsavedChanges(true);
  };

  const handlePatternSelect = (pattern) => {
    setSelectedPattern(pattern);
  };

  const handlePatternCreate = (newPattern) => {
    const pattern = {
      ...newPattern,
      id: `pattern-${Date.now()}`,
      priority: patterns.length + 1,
      enabled: true,
      isCustom: true
    };
    
    const updatedPatterns = [...patterns, pattern];
    handlePatternChange(updatedPatterns);
    setSelectedPattern(pattern);
  };

  const handlePatternUpdate = (updatedPattern) => {
    const updatedPatterns = patterns.map(p => 
      p.id === updatedPattern.id ? updatedPattern : p
    );
    handlePatternChange(updatedPatterns);
  };

  const handlePatternDelete = (patternId) => {
    const updatedPatterns = patterns.filter(p => p.id !== patternId);
    handlePatternChange(updatedPatterns);
    if (selectedPattern?.id === patternId) {
      setSelectedPattern(null);
    }
  };

  const handlePatternDuplicate = (pattern) => {
    const duplicatedPattern = {
      ...pattern,
      id: `pattern-${Date.now()}`,
      name: `${pattern.name} (Copy)`,
      priority: patterns.length + 1,
      isCustom: true
    };
    
    const updatedPatterns = [...patterns, duplicatedPattern];
    handlePatternChange(updatedPatterns);
    setSelectedPattern(duplicatedPattern);
  };

  const handleImportPatterns = (importedPatterns) => {
    const newPatterns = importedPatterns.map((pattern, index) => ({
      ...pattern,
      id: `imported-${Date.now()}-${index}`,
      priority: patterns.length + index + 1,
      isCustom: true
    }));
    
    const updatedPatterns = [...patterns, ...newPatterns];
    handlePatternChange(updatedPatterns);
  };

  const handleExportPatterns = () => {
    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      patterns: patterns.filter(p => p.enabled),
      metadata: {
        totalPatterns: patterns.length,
        enabledPatterns: patterns.filter(p => p.enabled).length
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thread-patterns-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoadVersion = (version) => {
    setPatterns(version.patterns);
    setHasUnsavedChanges(true);
    setSelectedPattern(null);
  };

  const enabledPatternsCount = patterns.filter(p => p.enabled).length;
  const totalGroupedEntries = groupedPreview.totalGroupedEntries;
  const totalUngroupedEntries = groupedPreview.totalUngroupedEntries;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <BreadcrumbTrail />
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                Pattern Configuration Management
              </h1>
              <p className="text-text-secondary">
                Define, customize, and manage thread grouping patterns that replace default thread-based organization. 
                Configure patterns to identify threads like 'task-141', 'worker-ABC', or custom identifiers.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {hasUnsavedChanges && (
                <div className="flex items-center space-x-2 text-warning">
                  <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
                  <span className="text-sm">Unsaved changes</span>
                </div>
              )}
              {lastSaved && (
                <div className="text-sm text-text-secondary">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
                className="btn-primary px-4 py-2 text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Configuration
              </button>
            </div>
          </div>

          {/* Status Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="card p-4">
              <div className="text-2xl font-bold text-text-primary">{patterns.length}</div>
              <div className="text-sm text-text-secondary">Total Patterns</div>
            </div>
            <div className="card p-4">
              <div className="text-2xl font-bold text-success">{enabledPatternsCount}</div>
              <div className="text-sm text-text-secondary">Active Patterns</div>
            </div>
            <div className="card p-4">
              <div className="text-2xl font-bold text-primary">{totalGroupedEntries}</div>
              <div className="text-sm text-text-secondary">Grouped Entries</div>
            </div>
            <div className="card p-4">
              <div className="text-2xl font-bold text-warning">{totalUngroupedEntries}</div>
              <div className="text-sm text-text-secondary">Ungrouped Entries</div>
            </div>
          </div>

          {/* Search and Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patterns by name, description, or regex..."
                className="input-field w-full"
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  checked={isAutoSave}
                  onChange={(e) => setIsAutoSave(e.target.checked)}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                />
                <span>Auto-save</span>
              </label>
              <PatternImportExport
                patterns={patterns}
                onImport={handleImportPatterns}
                onExport={handleExportPatterns}
                versionHistory={versionHistory}
                onLoadVersion={handleLoadVersion}
              />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Section - Pattern Configuration (8 cols) */}
          <div className="xl:col-span-8 space-y-6">
            {/* Pattern Definition Tools */}
            <PatternDefinitionTools
              selectedPattern={selectedPattern}
              onPatternCreate={handlePatternCreate}
              onPatternUpdate={handlePatternUpdate}
              onPatternSelect={setSelectedPattern}
              sampleLogEntries={mockLogEntries}
            />

            {/* Pattern Library */}
            <PatternLibrary
              patterns={filteredPatterns}
              selectedPattern={selectedPattern}
              onPatternSelect={handlePatternSelect}
              onPatternUpdate={handlePatternUpdate}
              onPatternDelete={handlePatternDelete}
              onPatternDuplicate={handlePatternDuplicate}
              onPatternsReorder={handlePatternChange}
              searchQuery={searchQuery}
            />

            {/* Conflict Resolution */}
            <ConflictResolution
              patterns={patterns}
              groupedData={groupedPreview}
              onPatternUpdate={handlePatternUpdate}
            />
          </div>

          {/* Right Section - Preview (4 cols) */}
          <div className="xl:col-span-4">
            <PatternPreview
              patterns={patterns}
              groupedData={groupedPreview}
              sampleLogEntries={mockLogEntries}
              onNavigateToAnalysis={() => navigate('/thread-analysis-filtering')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatternConfigurationManagement;