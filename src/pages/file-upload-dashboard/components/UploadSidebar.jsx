import React from 'react';
import Icon from '../../../components/AppIcon';

const UploadSidebar = ({ supportedFormats, maxFileSize, maxFiles, stats }) => {
  const formatFileSize = (bytes) => {
    return `${Math.round(bytes / (1024 * 1024))}MB`;
  };

  const uploadTips = [
    {
      icon: 'FileText',
      title: 'Supported Formats',
      description: `Upload ${supportedFormats.join(', ')} files for analysis`,
      color: 'text-primary'
    },
    {
      icon: 'HardDrive',
      title: 'File Size Limit',
      description: `Maximum ${formatFileSize(maxFileSize)} per file`,
      color: 'text-warning-500'
    },
    {
      icon: 'Files',
      title: 'Batch Upload',
      description: `Upload up to ${maxFiles} files simultaneously`,
      color: 'text-success'
    },
    {
      icon: 'Zap',
      title: 'Fast Processing',
      description: 'Automatic thread detection and extraction',
      color: 'text-accent'
    }
  ];

  const bestPractices = [
    'Use descriptive file names for easier identification',
    'Ensure log files contain thread identifiers',
    'Remove sensitive information before uploading',
    'Group related log files for better analysis',
    'Check file encoding (UTF-8 recommended)'
  ];

  return (
    <div className="space-y-6">
      {/* Upload Summary */}
      <div className="bg-surface rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Upload Summary</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Total Files</span>
            <span className="font-medium text-text-primary">{stats.total}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Completed</span>
            <span className="font-medium text-success">{stats.completed}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Processing</span>
            <span className="font-medium text-accent">{stats.processing}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Errors</span>
            <span className="font-medium text-error">{stats.errors}</span>
          </div>
        </div>

        {stats.total > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-text-secondary">Success Rate</span>
              <span className="font-medium text-text-primary">
                {Math.round((stats.completed / stats.total) * 100)}%
              </span>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div 
                className="bg-success h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${(stats.completed / stats.total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Upload Guidelines */}
      <div className="bg-surface rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Upload Guidelines</h3>
        
        <div className="space-y-4">
          {uploadTips.map((tip, index) => (
            <div key={index} className="flex items-start space-x-3">
              <Icon name={tip.icon} size={20} className={`${tip.color} mt-0.5`} />
              <div>
                <h4 className="font-medium text-text-primary text-sm">{tip.title}</h4>
                <p className="text-xs text-text-secondary mt-1">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-surface rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Best Practices</h3>
        
        <ul className="space-y-2">
          {bestPractices.map((practice, index) => (
            <li key={index} className="flex items-start space-x-2 text-sm">
              <Icon name="CheckCircle" size={16} className="text-success mt-0.5 flex-shrink-0" />
              <span className="text-text-secondary">{practice}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Help Section */}
      <div className="bg-primary-50 rounded-lg border border-primary-200 p-6">
        <div className="flex items-start space-x-3">
          <Icon name="HelpCircle" size={20} className="text-primary mt-0.5" />
          <div>
            <h3 className="font-semibold text-primary mb-2">Need Help?</h3>
            <p className="text-sm text-primary-700 mb-3">
              Having trouble with file uploads or processing? Check our documentation for detailed guidance.
            </p>
            <button className="text-sm font-medium text-primary hover:text-primary-700 transition-colors duration-150">
              View Documentation →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadSidebar;