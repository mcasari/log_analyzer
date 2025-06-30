import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';

const PatternImportExport = ({ patterns, onImport, onExport, versionHistory, onLoadVersion }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef(null);

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        
        // Validate import data structure
        if (!importData.patterns || !Array.isArray(importData.patterns)) {
          throw new Error('Invalid file format: missing patterns array');
        }

        // Validate each pattern
        const validPatterns = importData.patterns.filter(pattern => {
          return pattern.name && pattern.pattern && pattern.description !== undefined;
        });

        if (validPatterns.length === 0) {
          throw new Error('No valid patterns found in the file');
        }

        onImport(validPatterns);
        setImportError('');
        setShowDropdown(false);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        setImportError(error.message);
      }
    };
    
    reader.onerror = () => {
      setImportError('Failed to read file');
    };
    
    reader.readAsText(file);
  };

  const handleExportCurrent = () => {
    onExport();
    setShowDropdown(false);
  };

  const handleExportEnabled = () => {
    const enabledPatterns = patterns.filter(p => p.enabled);
    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      patterns: enabledPatterns,
      metadata: {
        totalPatterns: patterns.length,
        enabledPatterns: enabledPatterns.length,
        exportType: 'enabled-only'
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thread-patterns-enabled-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setShowDropdown(false);
  };

  const handleLoadVersionHistory = (version) => {
    onLoadVersion(version);
    setShowVersionHistory(false);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="btn-secondary px-3 py-2 text-sm rounded flex items-center space-x-2"
      >
        <Icon name="Settings" size={16} />
        <span>Manage</span>
        <Icon name="ChevronDown" size={16} />
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-lg shadow-lg z-50">
          <div className="p-2">
            {/* Import Section */}
            <div className="mb-2">
              <div className="text-xs text-text-secondary px-2 py-1 font-medium">Import</div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-surface-hover rounded transition-colors duration-150 flex items-center space-x-2"
              >
                <Icon name="Upload" size={16} />
                <span>Import Patterns</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </div>

            {/* Export Section */}
            <div className="mb-2">
              <div className="text-xs text-text-secondary px-2 py-1 font-medium">Export</div>
              <button
                onClick={handleExportCurrent}
                className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-surface-hover rounded transition-colors duration-150 flex items-center space-x-2"
              >
                <Icon name="Download" size={16} />
                <span>Export All Patterns</span>
              </button>
              <button
                onClick={handleExportEnabled}
                className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-surface-hover rounded transition-colors duration-150 flex items-center space-x-2"
              >
                <Icon name="CheckCircle" size={16} />
                <span>Export Enabled Only</span>
              </button>
            </div>

            {/* Version History Section */}
            {versionHistory.length > 0 && (
              <div className="border-t border-border pt-2">
                <div className="text-xs text-text-secondary px-2 py-1 font-medium">Version History</div>
                <button
                  onClick={() => setShowVersionHistory(!showVersionHistory)}
                  className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-surface-hover rounded transition-colors duration-150 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <Icon name="History" size={16} />
                    <span>Load Previous Version</span>
                  </div>
                  <Icon name={showVersionHistory ? 'ChevronUp' : 'ChevronDown'} size={16} />
                </button>
                
                {showVersionHistory && (
                  <div className="mt-2 max-h-64 overflow-y-auto">
                    {versionHistory.map(version => (
                      <button
                        key={version.id}
                        onClick={() => handleLoadVersionHistory(version)}
                        className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-surface-hover rounded transition-colors duration-150"
                      >
                        <div className="text-xs text-text-secondary">
                          {formatTimestamp(version.timestamp)}
                        </div>
                        <div className="text-sm truncate">
                          {version.description}
                        </div>
                        <div className="text-xs text-text-tertiary">
                          {version.patterns.length} patterns
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Import Error Message */}
      {importError && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-error-50 border border-error-200 rounded-lg p-3 shadow-lg z-50">
          <div className="flex items-start space-x-2">
            <Icon name="AlertCircle" size={16} className="text-error mt-0.5" />
            <div>
              <div className="text-sm font-medium text-error">Import Failed</div>
              <div className="text-sm text-error-700 mt-1">{importError}</div>
              <button
                onClick={() => setImportError('')}
                className="text-xs text-error-600 hover:text-error-800 mt-2"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default PatternImportExport;