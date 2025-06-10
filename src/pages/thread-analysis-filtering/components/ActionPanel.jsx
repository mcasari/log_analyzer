// src/pages/thread-analysis-filtering/components/ActionPanel.jsx

import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const ActionPanel = ({ 
  selectedCount, 
  totalCount, 
  onExport, 
  isProcessing, 
  threadData, 
  usePatternGrouping, 
  groupingStats 
}) => {
  const [showExportOptions, setShowExportOptions] = useState(false);

  const getSelectionPercentage = () => {
    if (totalCount === 0) return 0;
    return Math.round((selectedCount / totalCount) * 100);
  };

  const getExportData = () => {
    const selectedThreads = threadData.filter(thread => 
      selectedCount === 0 || selectedCount === totalCount
    );
    
    const totalEntries = selectedThreads.reduce((sum, thread) => sum + thread.entryCount, 0);
    const logLevels = new Set();
    
    selectedThreads.forEach(thread => {
      if (thread.entries) {
        thread.entries.forEach(entry => {
          logLevels.add(entry.level || entry.logLevel);
        });
      }
    });
    
    return {
      threadCount: selectedThreads.length,
      entryCount: totalEntries,
      logLevels: Array.from(logLevels),
      usePatternGrouping
    };
  };

  const exportData = getExportData();

  return (
    <div className="space-y-4">
      {/* Selection Summary Card */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Selection</h3>
          <div className="text-sm text-text-secondary">
            {getSelectionPercentage()}%
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">Selected Threads</span>
            <span className="text-lg font-bold text-primary">{selectedCount}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">Total Threads</span>
            <span className="text-sm font-medium text-text-primary">{totalCount}</span>
          </div>
          
          {usePatternGrouping && groupingStats && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-secondary">Grouped Entries</span>
                <span className="text-sm font-medium text-success">{groupingStats.totalGroupedEntries}</span>
              </div>
              
              {groupingStats.totalUngroupedEntries > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Ungrouped</span>
                  <span className="text-sm font-medium text-warning">{groupingStats.totalUngroupedEntries}</span>
                </div>
              )}
            </>
          )}
          
          <div className="w-full bg-secondary-200 rounded-full h-2 mt-3">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${getSelectionPercentage()}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Pattern Grouping Status */}
      {usePatternGrouping && (
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <Icon name="Zap" size={20} className="text-accent-600 mr-2" />
            <h3 className="text-lg font-semibold text-text-primary">Pattern Analysis</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Identification Method</span>
              <span className="text-sm font-medium text-accent-600">Pattern-Based</span>
            </div>
            
            {groupingStats && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Match Rate</span>
                  <span className="text-sm font-medium text-text-primary">
                    {Math.round((groupingStats.totalGroupedEntries / (groupingStats.totalGroupedEntries + groupingStats.totalUngroupedEntries)) * 100)}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Thread Groups</span>
                  <span className="text-sm font-medium text-text-primary">{groupingStats.totalThreads}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Export Options</h3>
        
        <div className="space-y-3 mb-4">
          <div className="text-sm text-text-secondary">
            Ready to export {exportData.threadCount} thread{exportData.threadCount !== 1 ? 's' : ''} 
            with {exportData.entryCount.toLocaleString()} log entries
            {usePatternGrouping && ' (pattern-grouped)'}
          </div>
          
          {exportData.logLevels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {exportData.logLevels.map(level => (
                <span key={level} className={`
                  text-xs px-2 py-1 rounded font-medium
                  ${level === 'ERROR' ? 'text-error bg-error-100' :
                    level === 'WARN' ? 'text-warning bg-warning-100' :
                    level === 'INFO'? 'text-primary bg-primary-100' : 'text-text-secondary bg-secondary-100'
                  }
                `}>
                  {level}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <button
            onClick={onExport}
            disabled={selectedCount === 0 || isProcessing}
            className={`
              w-full btn-primary px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200
              ${selectedCount === 0 || isProcessing 
                ? 'opacity-50 cursor-not-allowed' :'hover:shadow-lg transform hover:-translate-y-0.5'
              }
            `}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Icon name="Download" size={18} />
                <span>Export Selected</span>
              </div>
            )}
          </button>
          
          {selectedCount === 0 && (
            <div className="text-xs text-text-tertiary text-center">
              Select threads to enable export
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
        
        <div className="space-y-2">
          <button className="w-full btn-secondary px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center space-x-2">
            <Icon name="Filter" size={16} />
            <span>Advanced Filters</span>
          </button>
          
          <button className="w-full btn-secondary px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center space-x-2">
            <Icon name="BarChart3" size={16} />
            <span>Generate Report</span>
          </button>
          
          {usePatternGrouping && (
            <button className="w-full btn-secondary px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center space-x-2">
              <Icon name="Settings" size={16} />
              <span>Pattern Settings</span>
            </button>
          )}
        </div>
      </div>

      {/* Help Card */}
      <div className="card p-6 bg-primary-50 border-primary-100">
        <div className="flex items-start space-x-3">
          <Icon name="HelpCircle" size={20} className="text-primary mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-1">Pattern Grouping</h4>
            <p className="text-xs text-text-secondary">
              {usePatternGrouping 
                ? 'Threads are automatically identified using configured patterns like "task-141" or "FileProcessingWorker-3". Configure patterns to improve grouping accuracy.'
                : 'Enable pattern-based grouping to automatically identify threads from log content using configurable patterns.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionPanel;