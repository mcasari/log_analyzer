import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import WorkflowProgress from '../../components/ui/WorkflowProgress';
import UploadZone from './components/UploadZone';
import ProcessingQueue from './components/ProcessingQueue';
import UploadSidebar from './components/UploadSidebar';

const FileUploadDashboard = () => {
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const supportedFormats = ['txt', 'log', 'csv'];
  const maxFileSize = 50 * 1024 * 1024; // 50MB
  const maxFiles = 10;

  const mockProcessingSteps = [
    { label: 'Upload', icon: 'Upload', description: 'Upload log files' },
    { label: 'Parse', icon: 'FileText', description: 'Parse file content' },
    { label: 'Extract', icon: 'Filter', description: 'Extract threads' },
    { label: 'Complete', icon: 'CheckCircle', description: 'Ready for analysis' }
  ];

  const validateFile = (file) => {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!supportedFormats.includes(fileExtension)) {
      return { valid: false, error: `Unsupported format. Please use: ${supportedFormats.join(', ')}` };
    }
    
    if (file.size > maxFileSize) {
      return { valid: false, error: 'File size exceeds 50MB limit' };
    }
    
    return { valid: true };
  };

  const generateFileId = () => {
    return Date.now() + Math.random().toString(36).substr(2, 9);
  };

  const simulateFileProcessing = async (file) => {
    const fileId = file.id;
    const steps = ['uploading', 'parsing', 'extracting', 'completed'];
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { 
              ...f, 
              status: steps[i], 
              progress: ((i + 1) / steps.length) * 100,
              processedAt: i === steps.length - 1 ? new Date() : null
            }
          : f
      ));
    }
  };

  const handleFileUpload = useCallback(async (files) => {
    if (uploadedFiles.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles = [];
    const errors = [];

    Array.from(files).forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        const fileWithId = {
          id: generateFileId(),
          file,
          name: file.name,
          size: file.size,
          status: 'pending',
          progress: 0,
          uploadedAt: new Date(),
          processedAt: null,
          error: null
        };
        validFiles.push(fileWithId);
      } else {
        errors.push({ fileName: file.name, error: validation.error });
      }
    });

    if (errors.length > 0) {
      const errorMessage = errors.map(e => `${e.fileName}: ${e.error}`).join('\n');
      alert(`Upload errors:\n${errorMessage}`);
    }

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
      setIsProcessing(true);

      // Process files sequentially
      for (const file of validFiles) {
        await simulateFileProcessing(file);
      }

      setIsProcessing(false);
    }
  }, [uploadedFiles.length]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files);
    }
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const retryFile = async (fileId) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (file) {
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'pending', progress: 0, error: null }
          : f
      ));
      await simulateFileProcessing(file);
    }
  };

  const clearAllFiles = () => {
    setUploadedFiles([]);
  };

  const pauseProcessing = () => {
    setIsProcessing(false);
  };

  const resumeProcessing = () => {
    setIsProcessing(true);
  };

  const handleAnalyzeThreads = () => {
    const completedFiles = uploadedFiles.filter(f => f.status === 'completed');
    if (completedFiles.length > 0) {
      navigate('/thread-analysis-filtering');
    }
  };

  const getUploadStats = () => {
    const total = uploadedFiles.length;
    const completed = uploadedFiles.filter(f => f.status === 'completed').length;
    const processing = uploadedFiles.filter(f => ['uploading', 'parsing', 'extracting'].includes(f.status)).length;
    const errors = uploadedFiles.filter(f => f.status === 'error').length;
    
    return { total, completed, processing, errors };
  };

  const stats = getUploadStats();
  const hasCompletedFiles = stats.completed > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <BreadcrumbTrail />
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Upload" size={24} color="white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">File Upload Dashboard</h1>
              <p className="text-text-secondary">Upload and process log files for thread analysis</p>
            </div>
          </div>

          {/* Workflow Progress */}
          <div className="bg-surface rounded-lg border border-border p-6">
            <WorkflowProgress 
              currentStep={hasCompletedFiles ? 2 : 1}
              totalSteps={4}
              steps={mockProcessingSteps}
              isProcessing={isProcessing}
              processingMessage="Processing uploaded files..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-6">
            {/* Upload Zone */}
            <UploadZone
              dragActive={dragActive}
              onDrag={handleDrag}
              onDrop={handleDrop}
              onFileSelect={handleFileSelect}
              fileInputRef={fileInputRef}
              supportedFormats={supportedFormats}
              maxFileSize={maxFileSize}
              uploadedFilesCount={uploadedFiles.length}
              maxFiles={maxFiles}
            />

            {/* Processing Queue */}
            {uploadedFiles.length > 0 && (
              <ProcessingQueue
                files={uploadedFiles}
                isProcessing={isProcessing}
                onRemoveFile={removeFile}
                onRetryFile={retryFile}
                onClearAll={clearAllFiles}
                onPause={pauseProcessing}
                onResume={resumeProcessing}
                stats={stats}
              />
            )}

            {/* Action Buttons */}
            {hasCompletedFiles && (
              <div className="bg-surface rounded-lg border border-border p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">Ready for Analysis</h3>
                    <p className="text-text-secondary">
                      {stats.completed} file{stats.completed !== 1 ? 's' : ''} processed successfully. 
                      You can now proceed to analyze threads.
                    </p>
                  </div>
                  <button
                    onClick={handleAnalyzeThreads}
                    className="btn-primary px-6 py-3 rounded-lg font-medium flex items-center space-x-2 micro-interaction"
                  >
                    <Icon name="Filter" size={20} />
                    <span>Analyze Threads</span>
                    <Icon name="ArrowRight" size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1">
            <UploadSidebar
              supportedFormats={supportedFormats}
              maxFileSize={maxFileSize}
              maxFiles={maxFiles}
              stats={stats}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadDashboard;