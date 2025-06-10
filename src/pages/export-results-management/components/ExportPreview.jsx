import React from 'react';
import Icon from '../../../components/AppIcon';

const ExportPreview = ({ config, filteredResultsSummary }) => {
  const generatePreviewData = () => {
    switch (config.format) {
      case 'CSV':
        return `Thread ID,Timestamp,Level,Message,Source
thread-001,2024-01-22 10:15:23,INFO,"User authentication successful for user@example.com",AuthService
thread-001,2024-01-22 10:15:24,DEBUG,"Session token generated: abc123...",AuthService thread-002,2024-01-22 10:15:25,ERROR,"Database connection timeout after 30s",DatabasePool thread-002,2024-01-22 10:15:26,INFO,"Retrying database connection (attempt 2/3)",DatabasePool`;

      case 'JSON':
        return `{
  "export_metadata": {
    "generated_at": "2024-01-22T10:30:00Z",
    "thread_groups": 8,
    "total_entries": 1523,
    "date_range": {
      "start": "${config.dateRange.start}",
      "end": "${config.dateRange.end}"
    }
  },
  "log_entries": [
    {
      "thread_id": "thread-001",
      "timestamp": "2024-01-22T10:15:23Z",
      "level": "INFO",
      "message": "User authentication successful for user@example.com",
      "source": "AuthService"
    },
    {
      "thread_id": "thread-001",
      "timestamp": "2024-01-22T10:15:24Z",
      "level": "DEBUG",
      "message": "Session token generated: abc123...",
      "source": "AuthService"
    }
  ]
}`;

      case 'TXT':
        return `LogThread Analyzer Export
Generated: 2024-01-22 10:30:00
Thread Groups: 8 selected
Total Entries: 1523
Date Range: ${config.dateRange.start} to ${config.dateRange.end}

=====================================

[thread-001] 2024-01-22 10:15:23 [INFO] User authentication successful for user@example.com (AuthService)
[thread-001] 2024-01-22 10:15:24 [DEBUG] Session token generated: abc123... (AuthService)
[thread-002] 2024-01-22 10:15:25 [ERROR] Database connection timeout after 30s (DatabasePool)
[thread-002] 2024-01-22 10:15:26 [INFO] Retrying database connection (attempt 2/3) (DatabasePool)`;

      default:
        return 'Preview not available for selected format.';
    }
  };

  const getEstimatedFileSize = () => {
    const baseSize = filteredResultsSummary.filteredLogEntries * 0.15; // KB per entry estimate
    let multiplier = 1;
    
    switch (config.format) {
      case 'JSON':
        multiplier = 1.8;
        break;
      case 'CSV':
        multiplier = 1.2;
        break;
      case 'TXT':
        multiplier = 1.0;
        break;
    }
    
    if (config.includeMetadata) multiplier += 0.1;
    if (config.includeTimestamps) multiplier += 0.05;
    
    const sizeKB = baseSize * multiplier;
    const sizeMB = sizeKB / 1024;
    
    if (config.compressionEnabled) {
      return `${(sizeMB * 0.3).toFixed(1)} MB (compressed)`;
    }
    
    return sizeMB > 1 ? `${sizeMB.toFixed(1)} MB` : `${sizeKB.toFixed(0)} KB`;
  };

  const getFormatIcon = () => {
    switch (config.format) {
      case 'CSV': return 'FileSpreadsheet';
      case 'JSON': return 'FileCode';
      case 'TXT': return 'FileText';
      default: return 'File';
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold text-text-primary mb-6 flex items-center space-x-2">
        <Icon name="Eye" size={20} className="text-primary" />
        <span>Export Preview</span>
      </h2>

      <div className="space-y-6">
        {/* File Information */}
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Icon name={getFormatIcon()} size={20} className="text-primary" />
              </div>
              <div>
                <div className="font-medium text-text-primary">
                  thread_analysis_{new Date().toISOString().split('T')[0]}.{config.format.toLowerCase()}
                </div>
                <div className="text-sm text-text-secondary">
                  {config.format} format • {getEstimatedFileSize()}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm font-medium text-text-primary">
                {config.selectedThreadGroups?.length || 0} thread groups
              </div>
              <div className="text-xs text-text-secondary">
                {filteredResultsSummary.filteredLogEntries.toLocaleString()} entries
              </div>
            </div>
          </div>

          {/* Configuration Summary */}
          <div className="flex flex-wrap gap-2">
            {config.includeTimestamps && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-success-100 text-success-600">
                <Icon name="Clock" size={12} className="mr-1" />
                Timestamps
              </span>
            )}
            {config.includeMetadata && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-accent-100 text-accent-600">
                <Icon name="Info" size={12} className="mr-1" />
                Metadata
              </span>
            )}
            {config.compressionEnabled && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-warning-100 text-warning-600">
                <Icon name="Archive" size={12} className="mr-1" />
                Compressed
              </span>
            )}
          </div>
        </div>

        {/* Sample Output */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-text-primary">
              Sample Output
            </label>
            <button className="text-xs text-primary hover:text-primary-700 font-medium flex items-center space-x-1">
              <Icon name="Copy" size={12} />
              <span>Copy Sample</span>
            </button>
          </div>
          
          <div className="bg-secondary-800 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
              {generatePreviewData()}
            </pre>
          </div>
        </div>

        {/* Export Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-background rounded-lg border border-border">
            <div className="text-lg font-bold text-primary mb-1">
              {config.selectedThreadGroups?.length || 0}
            </div>
            <div className="text-xs text-text-secondary">Thread Groups</div>
          </div>
          
          <div className="text-center p-3 bg-background rounded-lg border border-border">
            <div className="text-lg font-bold text-success mb-1">
              {filteredResultsSummary.filteredLogEntries.toLocaleString()}
            </div>
            <div className="text-xs text-text-secondary">Log Entries</div>
          </div>
          
          <div className="text-center p-3 bg-background rounded-lg border border-border">
            <div className="text-lg font-bold text-accent mb-1">
              {getEstimatedFileSize()}
            </div>
            <div className="text-xs text-text-secondary">File Size</div>
          </div>
          
          <div className="text-center p-3 bg-background rounded-lg border border-border">
            <div className="text-lg font-bold text-warning mb-1">
              ~2 min
            </div>
            <div className="text-xs text-text-secondary">Est. Time</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPreview;