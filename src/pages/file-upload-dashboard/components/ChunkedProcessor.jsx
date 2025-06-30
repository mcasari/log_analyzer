import React, { useState, useCallback, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { createProgressiveReader } from '../../../utils/progressiveFileReader';

const ChunkedProcessor = ({
  files,
  onProgress,
  onComplete,
  onError,
  onChunkProcessed,
  maxConcurrency = 2,
  chunkSize = 1024 * 1024, // 1MB chunks
  autoStart = true
}) => {
  const [processingFiles, setProcessingFiles] = useState(new Map());
  const [completedFiles, setCompletedFiles] = useState(new Set());
  const [errorFiles, setErrorFiles] = useState(new Map());
  const [overallProgress, setOverallProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const readersRef = useRef(new Map());
  const processingQueueRef = useRef([]);

  // Initialize processing queue
  useEffect(() => {
    if (files.length > 0 && autoStart && !isProcessing) {
      startProcessing();
    }
  }, [files, autoStart]);

  const createFileReader = useCallback((file) => {
    const reader = createProgressiveReader({
      chunkSize,
      onProgress: (progressData) => {
        setProcessingFiles(prev => {
          const updated = new Map(prev);
          updated.set(file.id, {
            ...updated.get(file.id),
            progress: progressData.progress,
            processedBytes: progressData.processedBytes,
            totalBytes: progressData.totalBytes,
            estimatedTimeRemaining: progressData.estimatedTimeRemaining
          });
          return updated;
        });

        if (onProgress) {
          onProgress(file, progressData);
        }

        updateOverallProgress();
      },
      onChunk: (chunkData) => {
        if (onChunkProcessed) {
          onChunkProcessed(file, chunkData);
        }
      },
      onComplete: (result) => {
        setCompletedFiles(prev => new Set([...prev, file.id]));
        setProcessingFiles(prev => {
          const updated = new Map(prev);
          updated.delete(file.id);
          return updated;
        });

        if (onComplete) {
          onComplete(file, result);
        }

        // Start next file in queue
        processNextFile();
        updateOverallProgress();
      },
      onError: (error) => {
        setErrorFiles(prev => new Map([...prev, [file.id, error]]));
        setProcessingFiles(prev => {
          const updated = new Map(prev);
          updated.delete(file.id);
          return updated;
        });

        if (onError) {
          onError(file, error);
        }

        // Start next file in queue
        processNextFile();
        updateOverallProgress();
      }
    });

    readersRef.current.set(file.id, reader);
    return reader;
  }, [chunkSize, onProgress, onChunkProcessed, onComplete, onError]);

  const processNextFile = useCallback(() => {
    if (isPaused || processingQueueRef.current.length === 0) return;

    const activeProcessing = Array.from(processingFiles.keys());
    if (activeProcessing.length >= maxConcurrency) return;

    const nextFile = processingQueueRef.current.shift();
    if (!nextFile) return;

    const reader = createFileReader(nextFile);
    
    setProcessingFiles(prev => {
      const updated = new Map(prev);
      updated.set(nextFile.id, {
        file: nextFile,
        progress: 0,
        processedBytes: 0,
        totalBytes: nextFile.size,
        startTime: Date.now(),
        status: 'starting'
      });
      return updated;
    });

    // Start processing
    reader.readFile(nextFile.file || nextFile);
  }, [isPaused, processingFiles, maxConcurrency, createFileReader]);

  const startProcessing = useCallback(() => {
    if (isProcessing) return;

    setIsProcessing(true);
    setIsPaused(false);
    
    // Add files to queue that aren't already processed or in error
    const filesToProcess = files.filter(file => 
      !completedFiles.has(file.id) && 
      !errorFiles.has(file.id) && 
      !processingFiles.has(file.id)
    );

    processingQueueRef.current = [...filesToProcess];

    // Start initial batch
    for (let i = 0; i < Math.min(maxConcurrency, filesToProcess.length); i++) {
      processNextFile();
    }
  }, [files, completedFiles, errorFiles, processingFiles, maxConcurrency, processNextFile, isProcessing]);

  const pauseProcessing = useCallback(() => {
    setIsPaused(true);
    
    // Pause all active readers
    readersRef.current.forEach(reader => {
      reader.pause();
    });
  }, []);

  const resumeProcessing = useCallback(() => {
    setIsPaused(false);
    
    // Resume all active readers
    readersRef.current.forEach(reader => {
      reader.resume();
    });

    // Continue processing queue
    processNextFile();
  }, [processNextFile]);

  const stopProcessing = useCallback(() => {
    setIsProcessing(false);
    setIsPaused(false);
    
    // Abort all active readers
    readersRef.current.forEach(reader => {
      reader.abort();
    });
    
    readersRef.current.clear();
    processingQueueRef.current = [];
    setProcessingFiles(new Map());
  }, []);

  const retryFile = useCallback((fileId) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    // Remove from error state
    setErrorFiles(prev => {
      const updated = new Map(prev);
      updated.delete(fileId);
      return updated;
    });

    // Add back to queue
    processingQueueRef.current.unshift(file);
    
    if (!isPaused) {
      processNextFile();
    }
  }, [files, isPaused, processNextFile]);

  const updateOverallProgress = useCallback(() => {
    if (files.length === 0) return;

    const completed = completedFiles.size;
    const total = files.length;
    const processing = Array.from(processingFiles.values());
    
    // Calculate progress for currently processing files
    const processingProgress = processing.reduce((sum, fileData) => {
      return sum + (fileData.progress || 0);
    }, 0);

    const totalProgress = ((completed * 100) + processingProgress) / total;
    setOverallProgress(Math.round(totalProgress));
  }, [files.length, completedFiles.size, processingFiles]);

  const formatFileSize = useCallback((bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, []);

  const formatTime = useCallback((ms) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }, []);

  const getProcessingStats = () => {
    const processing = processingFiles.size;
    const completed = completedFiles.size;
    const errors = errorFiles.size;
    const pending = files.length - processing - completed - errors;

    return { processing, completed, errors, pending, total: files.length };
  };

  const stats = getProcessingStats();

  return (
    <div className="bg-surface rounded-lg border border-border">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Chunked File Processing</h3>
          <div className="flex items-center space-x-2">
            {isProcessing && !isPaused && (
              <button
                onClick={pauseProcessing}
                className="btn-secondary px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1"
              >
                <Icon name="Pause" size={16} />
                <span>Pause</span>
              </button>
            )}
            
            {isPaused && (
              <button
                onClick={resumeProcessing}
                className="btn-primary px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1"
              >
                <Icon name="Play" size={16} />
                <span>Resume</span>
              </button>
            )}
            
            {!isProcessing && (
              <button
                onClick={startProcessing}
                className="btn-primary px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1"
              >
                <Icon name="Play" size={16} />
                <span>Start</span>
              </button>
            )}
            
            <button
              onClick={stopProcessing}
              className="btn-secondary px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1"
            >
              <Icon name="Square" size={16} />
              <span>Stop</span>
            </button>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
            <span>Overall Progress</span>
            <span>{overallProgress}%</span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="text-center p-3 bg-background rounded-lg">
            <div className="text-lg font-bold text-text-primary">{stats.total}</div>
            <div className="text-xs text-text-secondary">Total</div>
          </div>
          <div className="text-center p-3 bg-accent-100 rounded-lg">
            <div className="text-lg font-bold text-accent">{stats.processing}</div>
            <div className="text-xs text-accent-600">Processing</div>
          </div>
          <div className="text-center p-3 bg-warning-100 rounded-lg">
            <div className="text-lg font-bold text-warning-600">{stats.pending}</div>
            <div className="text-xs text-warning-600">Pending</div>
          </div>
          <div className="text-center p-3 bg-success-100 rounded-lg">
            <div className="text-lg font-bold text-success">{stats.completed}</div>
            <div className="text-xs text-success-600">Completed</div>
          </div>
          <div className="text-center p-3 bg-error-100 rounded-lg">
            <div className="text-lg font-bold text-error">{stats.errors}</div>
            <div className="text-xs text-error-500">Errors</div>
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="max-h-80 overflow-y-auto">
        {files.map((file) => {
          const isProcessing = processingFiles.has(file.id);
          const isCompleted = completedFiles.has(file.id);
          const hasError = errorFiles.has(file.id);
          const processingData = processingFiles.get(file.id);
          const error = errorFiles.get(file.id);

          return (
            <div key={file.id} className="p-4 border-b border-border last:border-b-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center">
                      {isProcessing && (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                      )}
                      {isCompleted && (
                        <Icon name="CheckCircle" size={20} className="text-success" />
                      )}
                      {hasError && (
                        <Icon name="AlertCircle" size={20} className="text-error" />
                      )}
                      {!isProcessing && !isCompleted && !hasError && (
                        <Icon name="Clock" size={20} className="text-text-tertiary" />
                      )}
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-text-primary truncate">
                      {file.name || file.file?.name}
                    </h4>
                    <div className="flex items-center space-x-3 text-sm text-text-secondary">
                      <span>{formatFileSize(file.size || file.file?.size || 0)}</span>
                      {processingData && (
                        <>
                          <span>•</span>
                          <span>{Math.round(processingData.progress)}%</span>
                          <span>•</span>
                          <span>
                            {formatFileSize(processingData.processedBytes)} / {formatFileSize(processingData.totalBytes)}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {isProcessing && processingData && (
                      <div className="mt-2">
                        <div className="w-full bg-border rounded-full h-1.5">
                          <div 
                            className="bg-primary h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${processingData.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {hasError && error && (
                      <div className="mt-2 p-2 bg-error-100 rounded-md">
                        <p className="text-sm text-error-500">{error.message}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  {hasError && (
                    <button
                      onClick={() => retryFile(file.id)}
                      className="p-2 text-text-secondary hover:text-primary hover:bg-primary-50 rounded-md transition-colors"
                      title="Retry processing"
                    >
                      <Icon name="RotateCcw" size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChunkedProcessor;