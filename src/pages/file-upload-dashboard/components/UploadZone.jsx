import React from 'react';
import Icon from '../../../components/AppIcon';

const UploadZone = ({
  dragActive,
  onDrag,
  onDrop,
  onFileSelect,
  fileInputRef,
  supportedFormats,
  maxFileSize,
  uploadedFilesCount,
  maxFiles
}) => {
  const formatFileSize = (bytes) => {
    return `${Math.round(bytes / (1024 * 1024))}MB`;
  };

  const isUploadDisabled = uploadedFilesCount >= maxFiles;

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <h2 className="text-xl font-semibold text-text-primary mb-6">Upload Log Files</h2>
      
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200 ease-out
          ${dragActive 
            ? 'border-primary bg-primary-50 scale-102' 
            : isUploadDisabled
              ? 'border-border bg-secondary-100 cursor-not-allowed' :'border-border hover:border-primary hover:bg-primary-50 cursor-pointer'
          }
        `}
        onDragEnter={!isUploadDisabled ? onDrag : undefined}
        onDragLeave={!isUploadDisabled ? onDrag : undefined}
        onDragOver={!isUploadDisabled ? onDrag : undefined}
        onDrop={!isUploadDisabled ? onDrop : undefined}
        onClick={!isUploadDisabled ? () => fileInputRef.current?.click() : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".txt,.log,.csv"
          onChange={onFileSelect}
          className="hidden"
          disabled={isUploadDisabled}
        />

        <div className="space-y-4">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
            isUploadDisabled ? 'bg-secondary-200' : 'bg-primary-100'
          }`}>
            <Icon 
              name={dragActive ? "Download" : "Upload"} 
              size={32} 
              className={`${
                isUploadDisabled ? 'text-secondary-400' : dragActive ? 'text-primary animate-bounce' : 'text-primary'
              }`}
            />
          </div>

          {isUploadDisabled ? (
            <div>
              <h3 className="text-lg font-medium text-secondary-600 mb-2">Upload Limit Reached</h3>
              <p className="text-secondary-500">
                Maximum {maxFiles} files allowed. Remove some files to upload more.
              </p>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-medium text-text-primary mb-2">
                {dragActive ? 'Drop files here' : 'Drag & drop log files here'}
              </h3>
              <p className="text-text-secondary mb-4">
                or <span className="text-primary font-medium">browse</span> to choose files
              </p>
            </div>
          )}

          {!isUploadDisabled && (
            <div className="flex flex-wrap justify-center gap-4 text-sm text-text-secondary">
              <div className="flex items-center space-x-1">
                <Icon name="FileText" size={16} />
                <span>Formats: {supportedFormats.join(', ')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="HardDrive" size={16} />
                <span>Max: {formatFileSize(maxFileSize)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="Files" size={16} />
                <span>{uploadedFilesCount}/{maxFiles} files</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Upload Tips */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-start space-x-3 p-4 bg-primary-50 rounded-lg">
          <Icon name="Zap" size={20} className="text-primary mt-0.5" />
          <div>
            <h4 className="font-medium text-text-primary">Fast Processing</h4>
            <p className="text-sm text-text-secondary">Automatic thread detection and grouping</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3 p-4 bg-success-100 rounded-lg">
          <Icon name="Shield" size={20} className="text-success mt-0.5" />
          <div>
            <h4 className="font-medium text-text-primary">Secure Upload</h4>
            <p className="text-sm text-text-secondary">Files processed locally and securely</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3 p-4 bg-accent-100 rounded-lg">
          <Icon name="Filter" size={20} className="text-accent mt-0.5" />
          <div>
            <h4 className="font-medium text-text-primary">Smart Analysis</h4>
            <p className="text-sm text-text-secondary">Advanced filtering and search capabilities</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadZone;