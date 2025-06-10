import React from 'react';
import Icon from '../../../components/AppIcon';

const ExportConfiguration = ({ config, onConfigChange, filteredResultsSummary }) => {
  const formatOptions = [
    { value: 'CSV', label: 'CSV', icon: 'FileSpreadsheet', description: 'Comma-separated values for spreadsheet applications' },
    { value: 'JSON', label: 'JSON', icon: 'FileCode', description: 'JavaScript Object Notation for programmatic use' },
    { value: 'TXT', label: 'TXT', icon: 'FileText', description: 'Plain text format for simple viewing' }
  ];

  const threadGroups = [
    { id: 'thread-001', name: 'Authentication Service', entries: 245, selected: true },
    { id: 'thread-002', name: 'Database Connection Pool', entries: 189, selected: true },
    { id: 'thread-003', name: 'API Request Handler', entries: 156, selected: false },
    { id: 'thread-004', name: 'Background Task Processor', entries: 298, selected: false },
    { id: 'thread-005', name: 'Cache Management', entries: 134, selected: false },
    { id: 'thread-006', name: 'File Upload Handler', entries: 167, selected: false },
    { id: 'thread-007', name: 'Email Service', entries: 89, selected: false },
    { id: 'thread-008', name: 'Payment Processing', entries: 245, selected: false }
  ];

  const handleFormatChange = (format) => {
    onConfigChange({ format });
  };

  const handleDateRangeChange = (field, value) => {
    onConfigChange({
      dateRange: {
        ...config.dateRange,
        [field]: value
      }
    });
  };

  const handleThreadGroupToggle = (threadId) => {
    const currentSelected = config.selectedThreadGroups || [];
    const newSelected = currentSelected.includes(threadId)
      ? currentSelected.filter(id => id !== threadId)
      : [...currentSelected, threadId];
    
    onConfigChange({ selectedThreadGroups: newSelected });
  };

  const handleSelectAllThreads = () => {
    const allThreadIds = threadGroups.map(thread => thread.id);
    onConfigChange({ selectedThreadGroups: allThreadIds });
  };

  const handleDeselectAllThreads = () => {
    onConfigChange({ selectedThreadGroups: [] });
  };

  const handleOptionToggle = (option) => {
    onConfigChange({ [option]: !config[option] });
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold text-text-primary mb-6 flex items-center space-x-2">
        <Icon name="Settings" size={20} className="text-primary" />
        <span>Export Configuration</span>
      </h2>

      <div className="space-y-6">
        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-3">
            Export Format
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {formatOptions.map((format) => (
              <button
                key={format.value}
                onClick={() => handleFormatChange(format.value)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  config.format === format.value
                    ? 'border-primary bg-primary-50 text-primary' :'border-border bg-background hover:border-primary-300 text-text-secondary'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <Icon 
                    name={format.icon} 
                    size={20} 
                    className={config.format === format.value ? 'text-primary' : 'text-text-tertiary'} 
                  />
                  <span className="font-medium">{format.label}</span>
                </div>
                <p className="text-xs opacity-80">{format.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-3">
            Date Range
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1">Start Date</label>
              <input
                type="date"
                value={config.dateRange.start}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">End Date</label>
              <input
                type="date"
                value={config.dateRange.end}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                className="input-field w-full"
              />
            </div>
          </div>
        </div>

        {/* Thread Group Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-text-primary">
              Thread Groups ({config.selectedThreadGroups?.length || 0} selected)
            </label>
            <div className="flex space-x-2">
              <button
                onClick={handleSelectAllThreads}
                className="text-xs text-primary hover:text-primary-700 font-medium"
              >
                Select All
              </button>
              <span className="text-xs text-text-tertiary">|</span>
              <button
                onClick={handleDeselectAllThreads}
                className="text-xs text-text-secondary hover:text-text-primary font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
          
          <div className="max-h-64 overflow-y-auto border border-border rounded-lg">
            {threadGroups.map((thread) => (
              <label
                key={thread.id}
                className="flex items-center space-x-3 p-3 hover:bg-surface-hover cursor-pointer border-b border-border last:border-b-0"
              >
                <input
                  type="checkbox"
                  checked={config.selectedThreadGroups?.includes(thread.id) || false}
                  onChange={() => handleThreadGroupToggle(thread.id)}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary-500"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-text-primary">{thread.name}</div>
                  <div className="text-xs text-text-secondary">{thread.entries} log entries</div>
                </div>
                <Icon name="ChevronRight" size={16} className="text-text-tertiary" />
              </label>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-3">
            Export Options
          </label>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.includeTimestamps}
                onChange={() => handleOptionToggle('includeTimestamps')}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary-500"
              />
              <div>
                <div className="text-sm text-text-primary">Include Timestamps</div>
                <div className="text-xs text-text-secondary">Add original log entry timestamps to export</div>
              </div>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.includeMetadata}
                onChange={() => handleOptionToggle('includeMetadata')}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary-500"
              />
              <div>
                <div className="text-sm text-text-primary">Include Metadata</div>
                <div className="text-xs text-text-secondary">Add thread analysis metadata and statistics</div>
              </div>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.compressionEnabled}
                onChange={() => handleOptionToggle('compressionEnabled')}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary-500"
              />
              <div>
                <div className="text-sm text-text-primary">Enable Compression</div>
                <div className="text-xs text-text-secondary">Compress export file to reduce download size</div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportConfiguration;