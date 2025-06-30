import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import WorkflowProgress from '../../components/ui/WorkflowProgress';
import UploadZone from './components/UploadZone';
import ProcessingQueue from './components/ProcessingQueue';
import ChunkedProcessor from './components/ChunkedProcessor';
import UploadSidebar from './components/UploadSidebar';

const FileUploadDashboard = () => {
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [processingMode, setProcessingMode] = useState('standard'); // 'standard' or 'chunked'
  const [performanceMetrics, setPerformanceMetrics] = useState({
    totalProcessingTime: 0,
    averageFileSize: 0,
    memoryUsage: 0
  });
  const fileInputRef = useRef(null);

  const supportedFormats = ['txt', 'log', 'csv'];
  const maxFileSize = 500 * 1024 * 1024; // Increased to 500MB for large files
  const maxFiles = 20; // Increased limit
  const largeFileThreshold = 50 * 1024 * 1024; // 50MB threshold for chunked processing

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
      return { valid: false, error: `File size exceeds ${maxFileSize / (1024 * 1024)}MB limit` };
    }
    
    return { valid: true };
  };

  const generateFileId = () => {
    return Date.now() + Math.random().toString(36).substr(2, 9);
  };

  const simulateFileProcessing = async (file) => {
    const fileId = file.id;
    const steps = ['uploading', 'parsing', 'extracting', 'completed'];
    const startTime = Date.now();
    
    for (let i = 0; i < steps.length; i++) {
      // Simulate processing time based on file size
      const processingDelay = Math.min(1000 + (file.size / (1024 * 1024)) * 100, 5000);
      await new Promise(resolve => setTimeout(resolve, processingDelay));
      
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { 
              ...f, 
              status: steps[i], 
              progress: ((i + 1) / steps.length) * 100,
              processedAt: i === steps.length - 1 ? new Date() : null,
              processingTime: i === steps.length - 1 ? Date.now() - startTime : null
            }
          : f
      ));
    }

    // Update performance metrics
    const processingTime = Date.now() - startTime;
    setPerformanceMetrics(prev => ({
      totalProcessingTime: prev.totalProcessingTime + processingTime,
      averageFileSize: (prev.averageFileSize + file.size) / 2,
      memoryUsage: Math.max(prev.memoryUsage, file.size)
    }));
  };

  const handleFileUpload = useCallback(async (files) => {
    if (uploadedFiles.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles = [];
    const errors = [];
    let hasLargeFiles = false;

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
          processingTime: null,
          error: null,
          isLarge: file.size > largeFileThreshold
        };
        validFiles.push(fileWithId);
        
        if (file.size > largeFileThreshold) {
          hasLargeFiles = true;
        }
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
      
      // Auto-switch to chunked processing for large files
      if (hasLargeFiles && processingMode === 'standard') {
        setProcessingMode('chunked');
      }
      
      setIsProcessing(true);

      if (processingMode === 'chunked' || hasLargeFiles) {
        // Use chunked processing - handled by ChunkedProcessor component
        return;
      }

      // Standard processing for smaller files
      for (const file of validFiles) {
        await simulateFileProcessing(file);
      }

      setIsProcessing(false);
    }
  }, [uploadedFiles.length, processingMode, largeFileThreshold]);

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
          ? { ...f, status: 'pending', progress: 0, error: null, processingTime: null }
          : f
      ));
      
      if (processingMode === 'chunked' || file.isLarge) {
        // Retry will be handled by ChunkedProcessor
        return;
      }
      
      await simulateFileProcessing(file);
    }
  };

  const clearAllFiles = () => {
    setUploadedFiles([]);
    setPerformanceMetrics({
      totalProcessingTime: 0,
      averageFileSize: 0,
      memoryUsage: 0
    });
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
    const largeFiles = uploadedFiles.filter(f => f.isLarge).length;
    
    return { total, completed, processing, errors, largeFiles };
  };

  const stats = getUploadStats();
  const hasCompletedFiles = stats.completed > 0;
  const hasLargeFiles = stats.largeFiles > 0;

  // Chunked processing handlers
  const handleChunkedProgress = (file, progressData) => {
    setUploadedFiles(prev => prev.map(f => 
      f.id === file.id 
        ? { 
            ...f, 
            progress: progressData.progress,
            status: 'processing'
          }
        : f
    ));
  };

  const handleChunkedComplete = (file, result) => {
    setUploadedFiles(prev => prev.map(f => 
      f.id === file.id 
        ? { 
            ...f, 
            status: 'completed',
            progress: 100,
            processedAt: new Date(),
            processingTime: result.processingTime
          }
        : f
    ));
    
    // Check if all files are completed
    const allCompleted = uploadedFiles.every(f => 
      f.id === file.id || f.status === 'completed' || f.status === 'error'
    );
    
    if (allCompleted) {
      setIsProcessing(false);
    }
  };

  const handleChunkedError = (file, error) => {
    setUploadedFiles(prev => prev.map(f => 
      f.id === file.id 
        ? { 
            ...f, 
            status: 'error',
            error: error.message
          }
        : f
    ));
  };

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
              <p className="text-text-secondary">
                Upload and process log files for thread analysis
                {hasLargeFiles && (
                  <span className="ml-2 text-primary font-medium">
                    • Optimized for large files
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Performance Metrics */}
          {hasCompletedFiles && performanceMetrics.totalProcessingTime > 0 && (
            <div className="mb-4 p-4 bg-success-50 border border-success-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Icon name="Zap" size={20} className="text-success-600" />
                  <div>
                    <h4 className="font-medium text-success-800">Processing Performance</h4>
                    <div className="flex items-center space-x-4 text-sm text-success-700">
                      <span>Total time: {Math.round(performanceMetrics.totalProcessingTime / 1000)}s</span>
                      <span>•</span>
                      <span>Avg file size: {Math.round(performanceMetrics.averageFileSize / (1024 * 1024))}MB</span>
                      <span>•</span>
                      <span>Mode: {processingMode === 'chunked' ? 'Chunked (Optimized)' : 'Standard'}</span>
                    </div>
                  </div>
                </div>
                
                {hasLargeFiles && (
                  <button
                    onClick={() => setProcessingMode(processingMode === 'chunked' ? 'standard' : 'chunked')}
                    className="btn-secondary px-3 py-2 rounded-lg text-sm font-medium"
                  >
                    Switch to {processingMode === 'chunked' ? 'Standard' : 'Chunked'} Mode
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Workflow Progress */}
          <div className="bg-surface rounded-lg border border-border p-6">
            <WorkflowProgress 
              currentStep={hasCompletedFiles ? 2 : 1}
              totalSteps={4}
              steps={mockProcessingSteps}
              isProcessing={isProcessing}
              processingMessage={
                hasLargeFiles 
                  ? "Processing large files with chunked optimization..." :"Processing uploaded files..."
              }
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
              largeFileSupport={true}
            />

            {/* Processing Components */}
            {uploadedFiles.length > 0 && (
              <>
                {processingMode === 'chunked' || hasLargeFiles ? (
                  <ChunkedProcessor
                    files={uploadedFiles.filter(f => f.status === 'pending' || ['uploading', 'parsing', 'extracting'].includes(f.status))}
                    onProgress={handleChunkedProgress}
                    onComplete={handleChunkedComplete}
                    onError={handleChunkedError}
                    maxConcurrency={2}
                    autoStart={true}
                  />
                ) : (
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
              </>
            )}

            {/* Action Buttons */}
            {hasCompletedFiles && (
              <div className="bg-surface rounded-lg border border-border p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">Ready for Analysis</h3>
                    <p className="text-text-secondary">
                      {stats.completed} file{stats.completed !== 1 ? 's' : ''} processed successfully
                      {hasLargeFiles && ' using optimized chunked processing'}. 
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
              largeFileSupport={true}
              processingMode={processingMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadDashboard;