import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import ExportConfiguration from './components/ExportConfiguration';
import ExportPreview from './components/ExportPreview';
import ExportHistory from './components/ExportHistory';
import ExportQueue from './components/ExportQueue';

const ExportResultsManagement = () => {
  const navigate = useNavigate();
  const [exportConfig, setExportConfig] = useState({
    format: 'CSV',
    dateRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    selectedThreadGroups: ['thread-001', 'thread-002'],
    includeTimestamps: true,
    includeMetadata: false,
    compressionEnabled: false
  });

  const [exportQueue, setExportQueue] = useState([]);
  const [isExporting, setIsExporting] = useState(false);

  // Mock data for filtered results summary
  const filteredResultsSummary = {
    totalThreadGroups: 15,
    selectedThreadGroups: 8,
    totalLogEntries: 2847,
    filteredLogEntries: 1523,
    dateRange: '2024-01-15 to 2024-01-22',
    estimatedFileSize: '2.4 MB'
  };

  // Mock data for export history
  const exportHistory = [
    {
      id: 'exp-001',
      filename: 'thread_analysis_2024-01-22.csv',
      format: 'CSV',
      size: '1.8 MB',
      downloadDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
      threadGroups: 5,
      logEntries: 1205,
      status: 'completed'
    },
    {
      id: 'exp-002',
      filename: 'debug_logs_filtered.json',
      format: 'JSON',
      size: '3.2 MB',
      downloadDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      threadGroups: 12,
      logEntries: 2847,
      status: 'completed'
    },
    {
      id: 'exp-003',
      filename: 'error_threads_analysis.txt',
      format: 'TXT',
      size: '856 KB',
      downloadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      threadGroups: 3,
      logEntries: 456,
      status: 'completed'
    }
  ];

  const handleExportStart = () => {
    setIsExporting(true);
    
    const newExport = {
      id: `exp-${Date.now()}`,
      filename: `thread_analysis_${new Date().toISOString().split('T')[0]}.${exportConfig.format.toLowerCase()}`,
      format: exportConfig.format,
      progress: 0,
      status: 'processing',
      estimatedTime: '2 minutes',
      threadGroups: exportConfig.selectedThreadGroups.length,
      logEntries: filteredResultsSummary.filteredLogEntries
    };

    setExportQueue(prev => [...prev, newExport]);

    // Simulate export progress
    const progressInterval = setInterval(() => {
      setExportQueue(prev => prev.map(item => {
        if (item.id === newExport.id && item.progress < 100) {
          const newProgress = Math.min(item.progress + Math.random() * 15, 100);
          return {
            ...item,
            progress: newProgress,
            status: newProgress === 100 ? 'completed' : 'processing'
          };
        }
        return item;
      }));
    }, 500);

    setTimeout(() => {
      clearInterval(progressInterval);
      setIsExporting(false);
      
      // Simulate file download
      const blob = new Blob(['Mock export data'], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = newExport.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 3000);
  };

  const handleConfigChange = (newConfig) => {
    setExportConfig(prev => ({ ...prev, ...newConfig }));
  };

  const handleReDownload = (exportItem) => {
    // Simulate re-download
    const blob = new Blob(['Mock re-download data'], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportItem.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <BreadcrumbTrail />
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-text-primary mb-2">
                  Export & Results Management
                </h1>
                <p className="text-text-secondary">
                  Configure and download your filtered log analysis results
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate('/thread-analysis-filtering')}
                  className="btn-secondary px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                >
                  <Icon name="ArrowLeft" size={18} />
                  <span>Back to Analysis</span>
                </button>
                
                <button
                  onClick={handleExportStart}
                  disabled={isExporting || exportConfig.selectedThreadGroups.length === 0}
                  className="btn-primary px-6 py-2 rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon name="Download" size={18} />
                  <span>{isExporting ? 'Exporting...' : 'Start Export'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="bg-surface border border-border rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center space-x-2">
              <Icon name="BarChart3" size={20} className="text-primary" />
              <span>Filtered Results Summary</span>
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {filteredResultsSummary.selectedThreadGroups}
                </div>
                <div className="text-sm text-text-secondary">Selected Thread Groups</div>
                <div className="text-xs text-text-tertiary mt-1">
                  of {filteredResultsSummary.totalThreadGroups} total
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-success mb-1">
                  {filteredResultsSummary.filteredLogEntries.toLocaleString()}
                </div>
                <div className="text-sm text-text-secondary">Log Entries</div>
                <div className="text-xs text-text-tertiary mt-1">
                  of {filteredResultsSummary.totalLogEntries.toLocaleString()} total
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-accent mb-1">
                  {filteredResultsSummary.estimatedFileSize}
                </div>
                <div className="text-sm text-text-secondary">Estimated Size</div>
                <div className="text-xs text-text-tertiary mt-1">
                  {exportConfig.format} format
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-warning mb-1">7</div>
                <div className="text-sm text-text-secondary">Days Range</div>
                <div className="text-xs text-text-tertiary mt-1">
                  {exportConfig.dateRange.start} to {exportConfig.dateRange.end}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Left Column - Export Configuration */}
            <div className="xl:col-span-8 space-y-6">
              <ExportConfiguration
                config={exportConfig}
                onConfigChange={handleConfigChange}
                filteredResultsSummary={filteredResultsSummary}
              />
              
              <ExportPreview
                config={exportConfig}
                filteredResultsSummary={filteredResultsSummary}
              />
              
              {exportQueue.length > 0 && (
                <ExportQueue
                  queue={exportQueue}
                  onRemoveFromQueue={(id) => setExportQueue(prev => prev.filter(item => item.id !== id))}
                />
              )}
            </div>

            {/* Right Column - Export History */}
            <div className="xl:col-span-4">
              <ExportHistory
                history={exportHistory}
                onReDownload={handleReDownload}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportResultsManagement;