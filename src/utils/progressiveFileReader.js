/**
 * Progressive File Reader Utility
 * Handles large file reading with chunked processing and memory optimization
 */

export class ProgressiveFileReader {
  constructor(options = {}) {
    this.chunkSize = options.chunkSize || 1024 * 1024; // 1MB chunks
    this.maxMemoryUsage = options.maxMemoryUsage || 100 * 1024 * 1024; // 100MB max memory
    this.onProgress = options.onProgress || (() => {});
    this.onChunk = options.onChunk || (() => {});
    this.onComplete = options.onComplete || (() => {});
    this.onError = options.onError || (() => {});
    
    this.isReading = false;
    this.isPaused = false;
    this.currentOffset = 0;
    this.totalSize = 0;
    this.processedChunks = [];
    this.abortController = null;
  }

  async readFile(file, options = {}) {
    if (this.isReading) {
      throw new Error('Reader is already processing a file');
    }

    this.isReading = true;
    this.isPaused = false;
    this.currentOffset = 0;
    this.totalSize = file.size;
    this.processedChunks = [];
    this.abortController = new AbortController();

    const startTime = Date.now();
    
    try {
      await this._processFileInChunks(file, options);
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      this.onComplete({
        file,
        totalChunks: this.processedChunks.length,
        totalSize: this.totalSize,
        processingTime,
        averageChunkSize: this.totalSize / this.processedChunks.length
      });
    } catch (error) {
      this.onError(error);
    } finally {
      this.isReading = false;
      this.abortController = null;
    }
  }

  async _processFileInChunks(file, options) {
    const reader = new FileReader();
    
    while (this.currentOffset < this.totalSize && !this.abortController.signal.aborted) {
      if (this.isPaused) {
        await this._waitForResume();
        continue;
      }

      const chunk = file.slice(this.currentOffset, this.currentOffset + this.chunkSize);
      const chunkData = await this._readChunk(reader, chunk);
      
      if (this.abortController.signal.aborted) break;

      // Process chunk
      const processedChunk = await this._processChunk(chunkData, {
        offset: this.currentOffset,
        size: chunk.size,
        isLastChunk: this.currentOffset + this.chunkSize >= this.totalSize,
        ...options
      });

      this.processedChunks.push(processedChunk);
      this.currentOffset += chunk.size;

      // Memory management
      await this._manageMemory();

      // Progress callback
      const progress = (this.currentOffset / this.totalSize) * 100;
      this.onProgress({
        progress,
        processedBytes: this.currentOffset,
        totalBytes: this.totalSize,
        currentChunk: this.processedChunks.length,
        estimatedTimeRemaining: this._calculateETA(progress)
      });

      // Yield control to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  _readChunk(reader, chunk) {
    return new Promise((resolve, reject) => {
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = reject;
      reader.readAsText(chunk);
    });
  }

  async _processChunk(chunkData, metadata) {
    const lines = chunkData.split('\n');
    const logEntries = [];

    lines.forEach((line, index) => {
      if (line.trim()) {
        try {
          const entry = this._parseLogLine(line, metadata.offset + index);
          if (entry) {
            logEntries.push(entry);
          }
        } catch (error) {
          console.warn('Failed to parse log line:', line, error);
        }
      }
    });

    const processedChunk = {
      id: `chunk_${metadata.offset}_${Date.now()}`,
      offset: metadata.offset,
      size: metadata.size,
      entries: logEntries,
      isLastChunk: metadata.isLastChunk,
      processedAt: new Date()
    };

    // Call chunk callback
    this.onChunk(processedChunk);

    return processedChunk;
  }

  _parseLogLine(line, offset) {
    // Basic log parsing - can be extended for different formats
    const timestampRegex = /^(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}[.\d]*)/;
    const levelRegex = /\b(DEBUG|INFO|WARN|WARNING|ERROR|FATAL|TRACE)\b/i;
    const sourceRegex = /\[([\w\.\-]+)\]/;

    const timestampMatch = line.match(timestampRegex);
    const levelMatch = line.match(levelRegex);
    const sourceMatch = line.match(sourceRegex);

    if (!timestampMatch) {
      return null; // Skip lines without timestamp
    }

    return {
      id: `entry_${offset}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: timestampMatch[1],
      logLevel: levelMatch ? levelMatch[1].toUpperCase() : 'INFO',
      source: sourceMatch ? sourceMatch[1] : 'Unknown',
      message: line.replace(timestampMatch[0], '').trim(),
      fullMessage: line,
      offset,
      rawLine: line
    };
  }

  async _manageMemory() {
    // Simple memory management - remove old chunks if memory usage is high
    const memoryUsage = this._estimateMemoryUsage();
    
    if (memoryUsage > this.maxMemoryUsage && this.processedChunks.length > 10) {
      // Keep only the last 10 chunks in memory
      const chunksToRemove = this.processedChunks.length - 10;
      this.processedChunks.splice(0, chunksToRemove);
      
      // Force garbage collection if available
      if (window.gc) {
        window.gc();
      }
    }
  }

  _estimateMemoryUsage() {
    // Rough estimation of memory usage
    return this.processedChunks.reduce((total, chunk) => {
      return total + (chunk.entries.length * 500); // ~500 bytes per entry estimate
    }, 0);
  }

  _calculateETA(progress) {
    if (progress <= 0 || !this.startTime) return null;
    
    const elapsed = Date.now() - this.startTime;
    const rate = progress / elapsed;
    const remaining = (100 - progress) / rate;
    
    return Math.round(remaining);
  }

  _waitForResume() {
    return new Promise(resolve => {
      const checkResume = () => {
        if (!this.isPaused) {
          resolve();
        } else {
          setTimeout(checkResume, 100);
        }
      };
      checkResume();
    });
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  abort() {
    if (this.abortController) {
      this.abortController.abort();
    }
    this.isReading = false;
    this.isPaused = false;
  }

  // Utility methods for data retrieval
  getAllEntries() {
    return this.processedChunks.flatMap(chunk => chunk.entries);
  }

  getEntriesPage(page = 0, pageSize = 100) {
    const allEntries = this.getAllEntries();
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      entries: allEntries.slice(startIndex, endIndex),
      page,
      pageSize,
      totalEntries: allEntries.length,
      totalPages: Math.ceil(allEntries.length / pageSize),
      hasNextPage: endIndex < allEntries.length,
      hasPreviousPage: page > 0
    };
  }

  searchEntries(query, options = {}) {
    const {
      caseSensitive = false,
      searchFields = ['message', 'source', 'fullMessage'],
      logLevels = []
    } = options;

    const allEntries = this.getAllEntries();
    const searchTerm = caseSensitive ? query : query.toLowerCase();

    return allEntries.filter(entry => {
      // Log level filter
      if (logLevels.length > 0 && !logLevels.includes(entry.logLevel)) {
        return false;
      }

      // Search in specified fields
      return searchFields.some(field => {
        const fieldValue = entry[field] || '';
        const searchableValue = caseSensitive ? fieldValue : fieldValue.toLowerCase();
        return searchableValue.includes(searchTerm);
      });
    });
  }
}

// Factory function for easy instantiation
export const createProgressiveReader = (options = {}) => {
  return new ProgressiveFileReader(options);
};

// Helper function for batch processing multiple files
export const processFilesProgressively = async (files, options = {}) => {
  const results = [];
  const { onFileComplete, onAllComplete, onError, ...readerOptions } = options;

  for (const file of files) {
    try {
      const reader = createProgressiveReader(readerOptions);
      
      const fileResult = await new Promise((resolve, reject) => {
        reader.onComplete = resolve;
        reader.onError = reject;
        reader.readFile(file);
      });

      results.push({ file, result: fileResult, success: true });
      
      if (onFileComplete) {
        onFileComplete(fileResult, file);
      }
    } catch (error) {
      results.push({ file, error, success: false });
      
      if (onError) {
        onError(error, file);
      }
    }
  }

  if (onAllComplete) {
    onAllComplete(results);
  }

  return results;
};