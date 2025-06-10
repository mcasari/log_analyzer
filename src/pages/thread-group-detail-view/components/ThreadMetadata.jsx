import React from 'react';
import Icon from '../../../components/AppIcon';

const ThreadMetadata = ({ threadData }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-success bg-success-100 border-success';
      case 'completed':
        return 'text-primary bg-primary-100 border-primary';
      case 'error':
        return 'text-error bg-error-100 border-error';
      default:
        return 'text-text-secondary bg-secondary-100 border-secondary-300';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'text-error bg-error-100 border-error';
      case 'warning':
        return 'text-warning bg-warning-100 border-warning';
      case 'info':
        return 'text-primary bg-primary-100 border-primary';
      default:
        return 'text-text-secondary bg-secondary-100 border-secondary-300';
    }
  };

  return (
    <div className="card p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Thread ID */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <Icon name="Hash" size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">Thread ID</p>
            <p className="font-semibold text-text-primary">{threadData.threadId}</p>
          </div>
        </div>

        {/* Total Entries */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
            <Icon name="FileText" size={20} className="text-accent" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">Total Entries</p>
            <p className="font-semibold text-text-primary">{threadData.totalEntries.toLocaleString()}</p>
          </div>
        </div>

        {/* Time Span */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
            <Icon name="Clock" size={20} className="text-secondary" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">Time Span</p>
            <p className="font-semibold text-text-primary text-sm">{threadData.timeSpan}</p>
          </div>
        </div>

        {/* Status & Severity */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center border border-border">
            <Icon name="AlertCircle" size={20} className="text-text-secondary" />
          </div>
          <div className="space-y-1">
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(threadData.status)}`}>
              {threadData.status}
            </div>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(threadData.severity)}`}>
              {threadData.severity}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metadata */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-text-secondary">First Entry:</span>
            <span className="ml-2 font-medium text-text-primary">2024-01-15 09:30:45</span>
          </div>
          <div>
            <span className="text-text-secondary">Last Entry:</span>
            <span className="ml-2 font-medium text-text-primary">2024-01-15 11:45:22</span>
          </div>
          <div>
            <span className="text-text-secondary">Duration:</span>
            <span className="ml-2 font-medium text-text-primary">2h 14m 37s</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreadMetadata;