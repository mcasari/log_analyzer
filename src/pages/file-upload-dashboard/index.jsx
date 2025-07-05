import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import WorkflowProgress from '../../components/ui/WorkflowProgress';
import QuickActionToolbar from '../../components/ui/QuickActionToolbar';
import FileUploadZone from './components/FileUploadZone';
import UploadedFilesList from './components/UploadedFilesList';
import RegexConfigurationPanel from './components/RegexConfigurationPanel';
import ProcessingControls from './components/ProcessingControls';
import Icon from '../../components/AppIcon';

const FileUploadDashboard = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [regexPattern, setRegexPattern] = useState('');
  const [isRegexValid, setIsRegexValid] = useState(false);
  const [regexValidationMessage, setRegexValidationMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  // Validate regex pattern
  const validateRegexPattern = useCallback((pattern) => {
    if (!pattern.trim()) {
      setIsRegexValid(false);
      setRegexValidationMessage('');
      return;
    }

    try {
      new RegExp(pattern);
      setIsRegexValid(true);
      setRegexValidationMessage('Valid regex pattern');
    } catch (error) {
      setIsRegexValid(false);
      setRegexValidationMessage(`Invalid pattern: ${error.message}`);
    }
  }, []);

  // Handle file selection
  const handleFilesSelected = useCallback((selectedFiles) => {
    const newFiles = selectedFiles.map((file, index) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      uploadTime: Date.now(),
      file: file,
      id: `${file.name}-${Date.now()}-${index}`,
      processing: false,
      error: null,
      lineCount: Math.floor(Math.random() * 10000) + 100, // Mock line count
      progress: 0
    }));

    // Validate files
    const validatedFiles = newFiles.map(file => {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        return { ...file, error: 'File size exceeds 100MB limit' };
      }
      if (!file.name.match(/\.(log|txt)$/i)) {
        return { ...file, error: 'Only .log and .txt files are supported' };
      }
      return file;
    });

    setFiles(prevFiles => [...prevFiles, ...validatedFiles]);
  }, []);

  // Handle file removal
  const handleRemoveFile = useCallback((index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  }, []);

  // Handle clear all files
  const handleClearAll = useCallback(() => {
    setFiles([]);
  }, []);

  // Handle regex pattern change
  const handlePatternChange = useCallback((pattern) => {
    setRegexPattern(pattern);
    validateRegexPattern(pattern);
  }, [validateRegexPattern]);

  // Handle pattern testing
  const handleTestPattern = useCallback((pattern, testText) => {
    console.log('Testing pattern:', pattern, 'against:', testText);
  }, []);

  // Handle file processing
  const handleProcessFiles = useCallback(() => {
    if (files.length === 0 || !isRegexValid) return;

    setIsProcessing(true);
    setProcessingProgress(0);

    // Simulate file processing
    const processFiles = async () => {
      const totalFiles = files.filter(f => !f.error).length;
      let processedCount = 0;

      for (let i = 0; i < files.length; i++) {
        if (files[i].error) continue;

        // Update file processing status
        setFiles(prevFiles => 
          prevFiles.map((file, index) => 
            index === i ? { ...file, processing: true, progress: 0 } : file
          )
        );

        // Simulate processing time
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          
          setFiles(prevFiles => 
            prevFiles.map((file, index) => 
              index === i ? { ...file, progress } : file
            )
          );
        }

        // Mark as completed
        setFiles(prevFiles => 
          prevFiles.map((file, index) => 
            index === i ? { ...file, processing: false, progress: 100 } : file
          )
        );

        processedCount++;
        setProcessingProgress((processedCount / totalFiles) * 100);
      }

      // Complete processing
      setTimeout(() => {
        setIsProcessing(false);
        navigate('/file-processing-status');
      }, 1000);
    };

    processFiles();
  }, [files, isRegexValid, navigate]);

  // Handle advanced settings
  const handleAdvancedSettings = useCallback(() => {
    navigate('/regex-pattern-configuration');
  }, [navigate]);

  // Effect to validate regex on mount
  useEffect(() => {
    validateRegexPattern(regexPattern);
  }, [regexPattern, validateRegexPattern]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <QuickActionToolbar />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Icon name="Upload" size={24} color="white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text-primary">
                  File Upload Dashboard
                </h1>
                <p className="text-text-secondary">
                  Upload log files and configure analysis patterns
                </p>
              </div>
            </div>
            
            {/* Processing Progress */}
            {isProcessing && (
              <div className="bg-accent-50 border border-accent-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Icon name="Loader2" size={16} className="animate-spin" color="var(--color-accent)" />
                    <span className="font-medium text-accent-700">
                      Processing Files...
                    </span>
                  </div>
                  <span className="text-sm text-accent-600">
                    {Math.round(processingProgress)}%
                  </span>
                </div>
                <div className="w-full bg-accent-100 rounded-full h-2">
                  <div 
                    className="bg-accent h-2 rounded-full transition-all duration-300"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* File Upload Zone */}
              <FileUploadZone
                onFilesSelected={handleFilesSelected}
                isProcessing={isProcessing}
              />

              {/* Uploaded Files List */}
              <UploadedFilesList
                files={files}
                onRemoveFile={handleRemoveFile}
                onClearAll={handleClearAll}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Workflow Progress */}
              <WorkflowProgress />

              {/* Regex Configuration */}
              <RegexConfigurationPanel
                regexPattern={regexPattern}
                onPatternChange={handlePatternChange}
                onTestPattern={handleTestPattern}
                isValid={isRegexValid}
                validationMessage={regexValidationMessage}
              />

              {/* Processing Controls */}
              <ProcessingControls
                files={files}
                regexPattern={regexPattern}
                isRegexValid={isRegexValid}
                isProcessing={isProcessing}
                onProcessFiles={handleProcessFiles}
                onClearAll={handleClearAll}
                onAdvancedSettings={handleAdvancedSettings}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-surface border border-border rounded-lg p-6 text-center">
              <Icon name="Files" size={32} color="var(--color-primary)" className="mx-auto mb-2" />
              <div className="text-2xl font-bold text-text-primary">{files.length}</div>
              <div className="text-sm text-text-secondary">Files Uploaded</div>
            </div>
            
            <div className="bg-surface border border-border rounded-lg p-6 text-center">
              <Icon name="HardDrive" size={32} color="var(--color-accent)" className="mx-auto mb-2" />
              <div className="text-2xl font-bold text-text-primary">
                {(files.reduce((total, file) => total + file.size, 0) / (1024 * 1024)).toFixed(1)}
              </div>
              <div className="text-sm text-text-secondary">MB Total Size</div>
            </div>
            
            <div className="bg-surface border border-border rounded-lg p-6 text-center">
              <Icon name="Settings" size={32} color="var(--color-success)" className="mx-auto mb-2" />
              <div className="text-2xl font-bold text-text-primary">
                {isRegexValid ? '1' : '0'}
              </div>
              <div className="text-sm text-text-secondary">Pattern Configured</div>
            </div>
            
            <div className="bg-surface border border-border rounded-lg p-6 text-center">
              <Icon name="Activity" size={32} color="var(--color-warning)" className="mx-auto mb-2" />
              <div className="text-2xl font-bold text-text-primary">
                {files.filter(f => !f.error && !f.processing).length}
              </div>
              <div className="text-sm text-text-secondary">Ready to Process</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FileUploadDashboard;