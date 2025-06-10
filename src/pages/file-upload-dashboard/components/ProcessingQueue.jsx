import React from 'react';
import Icon from '../../../components/AppIcon';

const ProcessingQueue = ({
  files,
  isProcessing,
  onRemoveFile,
  onRetryFile,
  onClearAll,
  onPause,
  onResume,
  stats
}) => {
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'Clock';
      case 'uploading': return 'Upload';
      case 'parsing': return 'FileText';
      case 'extracting': return 'Filter';
      case 'completed': return 'CheckCircle';
      case 'error': return 'AlertCircle';
      default: return 'File';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-text-tertiary';
      case 'uploading': return 'text-accent';
      case 'parsing': return 'text-warning-500';
      case 'extracting': return 'text-primary';
      case 'completed': return 'text-success';
      case 'error': return 'text-error';
      default: return 'text-text-secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'uploading': return 'Uploading';
      case 'parsing': return 'Parsing';
      case 'extracting': return 'Extracting Threads';
      case 'completed': return 'Completed';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-border">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text-primary">Processing Queue</h2>
          <div className="flex items-center space-x-2">
            {isProcessing ? (
              <button
                onClick={onPause}
                className="btn-secondary px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1"
              >
                <Icon name="Pause" size={16} />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={onResume}
                className="btn-primary px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1"
              >
                <Icon name="Play" size={16} />
                <span>Resume</span>
              </button>
            )}
            <button
              onClick={onClearAll}
              className="btn-secondary px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1"
            >
              <Icon name="Trash2" size={16} />
              <span>Clear All</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-background rounded-lg">
            <div className="text-2xl font-bold text-text-primary">{stats.total}</div>
            <div className="text-sm text-text-secondary">Total Files</div>
          </div>
          <div className="text-center p-3 bg-success-100 rounded-lg">
            <div className="text-2xl font-bold text-success">{stats.completed}</div>
            <div className="text-sm text-success-600">Completed</div>
          </div>
          <div className="text-center p-3 bg-accent-100 rounded-lg">
            <div className="text-2xl font-bold text-accent">{stats.processing}</div>
            <div className="text-sm text-accent-600">Processing</div>
          </div>
          <div className="text-center p-3 bg-error-100 rounded-lg">
            <div className="text-2xl font-bold text-error">{stats.errors}</div>
            <div className="text-sm text-error-500">Errors</div>
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="max-h-96 overflow-y-auto">
        {files.map((file) => (
          <div key={file.id} className="p-4 border-b border-border last:border-b-0 data-row">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                {/* File Icon & Status */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                    <Icon 
                      name={getStatusIcon(file.status)} 
                      size={20} 
                      className={`${getStatusColor(file.status)} ${
                        ['uploading', 'parsing', 'extracting'].includes(file.status) ? 'animate-pulse' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-text-primary truncate">{file.name}</h3>
                    <span className={`text-sm font-medium ${getStatusColor(file.status)}`}>
                      {getStatusText(file.status)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-text-secondary">
                    <span>{formatFileSize(file.size)}</span>
                    <span>Uploaded: {formatTime(file.uploadedAt)}</span>
                    {file.processedAt && (
                      <span>Completed: {formatTime(file.processedAt)}</span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {['uploading', 'parsing', 'extracting'].includes(file.status) && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
                        <span>Progress</span>
                        <span>{Math.round(file.progress)}%</span>
                      </div>
                      <div className="w-full bg-border rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {file.status === 'error' && file.error && (
                    <div className="mt-2 p-2 bg-error-100 rounded-md">
                      <p className="text-sm text-error-500">{file.error}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                {file.status === 'error' && (
                  <button
                    onClick={() => onRetryFile(file.id)}
                    className="p-2 text-text-secondary hover:text-primary hover:bg-primary-50 rounded-md transition-colors duration-150"
                    title="Retry processing"
                  >
                    <Icon name="RotateCcw" size={16} />
                  </button>
                )}
                
                {!['uploading', 'parsing', 'extracting'].includes(file.status) && (
                  <button
                    onClick={() => onRemoveFile(file.id)}
                    className="p-2 text-text-secondary hover:text-error hover:bg-error-100 rounded-md transition-colors duration-150"
                    title="Remove file"
                  >
                    <Icon name="X" size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessingQueue;