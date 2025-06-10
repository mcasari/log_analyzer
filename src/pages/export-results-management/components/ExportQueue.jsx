import React from 'react';
import Icon from '../../../components/AppIcon';

const ExportQueue = ({ queue, onRemoveFromQueue }) => {
  const formatProgress = (progress) => {
    return Math.round(progress);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return 'Loader';
      case 'completed':
        return 'CheckCircle';
      case 'failed':
        return 'XCircle';
      default:
        return 'Clock';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing':
        return 'text-accent';
      case 'completed':
        return 'text-success';
      case 'failed':
        return 'text-error';
      default:
        return 'text-text-secondary';
    }
  };

  const getProgressBarColor = (status) => {
    switch (status) {
      case 'processing':
        return 'bg-accent';
      case 'completed':
        return 'bg-success';
      case 'failed':
        return 'bg-error';
      default:
        return 'bg-text-secondary';
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold text-text-primary mb-6 flex items-center space-x-2">
        <Icon name="Clock" size={20} className="text-primary" />
        <span>Export Queue</span>
        <span className="text-sm font-normal text-text-secondary">
          ({queue.length} {queue.length === 1 ? 'item' : 'items'})
        </span>
      </h2>

      <div className="space-y-4">
        {queue.map((item) => (
          <div
            key={item.id}
            className="bg-background border border-border rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Icon 
                  name={getStatusIcon(item.status)} 
                  size={20} 
                  className={`${getStatusColor(item.status)} ${
                    item.status === 'processing' ? 'animate-spin' : ''
                  }`}
                />
                
                <div>
                  <div className="font-medium text-text-primary">
                    {item.filename}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {item.format} • {item.threadGroups} groups • {item.logEntries.toLocaleString()} entries
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {item.status === 'processing' && (
                  <div className="text-sm text-text-secondary">
                    {item.estimatedTime} remaining
                  </div>
                )}
                
                <button
                  onClick={() => onRemoveFromQueue(item.id)}
                  className="p-1 text-text-secondary hover:text-error hover:bg-error-100 rounded transition-all duration-200"
                  title="Remove from queue"
                >
                  <Icon name="X" size={16} />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-text-primary capitalize">
                  {item.status}
                </span>
                <span className="text-sm text-text-secondary">
                  {formatProgress(item.progress)}%
                </span>
              </div>
              
              <div className="w-full bg-border rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ease-out ${getProgressBarColor(item.status)}`}
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>

            {/* Status Messages */}
            {item.status === 'completed' && (
              <div className="mt-3 p-2 bg-success-100 border border-success-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Icon name="CheckCircle" size={16} className="text-success" />
                  <span className="text-sm text-success-600 font-medium">
                    Export completed successfully
                  </span>
                </div>
              </div>
            )}

            {item.status === 'failed' && (
              <div className="mt-3 p-2 bg-error-100 border border-error-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Icon name="XCircle" size={16} className="text-error" />
                  <span className="text-sm text-error-600 font-medium">
                    Export failed - please try again
                  </span>
                </div>
              </div>
            )}

            {item.status === 'processing' && (
              <div className="mt-3 p-2 bg-accent-100 border border-accent-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Icon name="Loader" size={16} className="text-accent animate-spin" />
                  <span className="text-sm text-accent-600 font-medium">
                    Processing export... {formatProgress(item.progress)}% complete
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}

        {queue.length === 0 && (
          <div className="text-center py-8">
            <Icon name="Clock" size={48} className="text-text-tertiary mx-auto mb-3" />
            <p className="text-text-secondary">No exports in queue</p>
            <p className="text-sm text-text-tertiary mt-1">
              Start an export to see progress here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportQueue;