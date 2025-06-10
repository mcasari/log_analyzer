// src/utils/threadPatternMatcher.js

/**
 * Thread Pattern Matcher Utility
 * Provides pattern-based thread identification from log entries
 */

// Default thread identification patterns
export const DEFAULT_THREAD_PATTERNS = [
  {
    id: 'task-pattern',
    name: 'Task Pattern',
    pattern: /task-\d+/gi,
    description: 'Matches task-### format (e.g., task-141)',
    enabled: true,
    priority: 1
  },
  {
    id: 'thread-pattern',
    name: 'Thread Pattern',
    pattern: /thread-\d+/gi,
    description: 'Matches thread-### format (e.g., thread-001)',
    enabled: true,
    priority: 2
  },
  {
    id: 'worker-pattern',
    name: 'Worker Pattern',
    pattern: /\w+Worker-\d+/gi,
    description: 'Matches worker patterns (e.g., FileProcessingWorker-3)',
    enabled: true,
    priority: 3
  },
  {
    id: 'session-pattern',
    name: 'Session Pattern',
    pattern: /sess_[a-zA-Z0-9]+/gi,
    description: 'Matches session IDs (e.g., sess_abc123xyz789)',
    enabled: false,
    priority: 4
  },
  {
    id: 'custom-pattern',
    name: 'Custom Pattern',
    pattern: '',
    description: 'User-defined custom pattern',
    enabled: false,
    priority: 5
  }
];

/**
 * Extract thread identifiers from log entry using defined patterns
 * @param {string} logEntry - The log entry text to analyze
 * @param {Array} patterns - Array of pattern objects to match against
 * @returns {Array} Array of matched thread identifiers with their patterns
 */
export const extractThreadIdentifiers = (logEntry, patterns = DEFAULT_THREAD_PATTERNS) => {
  const matches = [];
  
  // Sort patterns by priority (lower number = higher priority)
  const enabledPatterns = patterns
    .filter(pattern => pattern.enabled && pattern.pattern)
    .sort((a, b) => a.priority - b.priority);
  
  for (const patternObj of enabledPatterns) {
    let regex;
    
    // Handle string patterns by converting to RegExp
    if (typeof patternObj.pattern === 'string') {
      try {
        regex = new RegExp(patternObj.pattern, 'gi');
      } catch (e) {
        console.warn(`Invalid pattern: ${patternObj.pattern}`, e);
        continue;
      }
    } else {
      regex = patternObj.pattern;
    }
    
    const patternMatches = logEntry.match(regex);
    
    if (patternMatches) {
      patternMatches.forEach(match => {
        // Avoid duplicate matches
        if (!matches.some(m => m.identifier === match)) {
          matches.push({
            identifier: match,
            pattern: patternObj,
            position: logEntry.indexOf(match)
          });
        }
      });
      
      // If we found matches with this pattern and it's high priority, we can stop
      if (patternMatches.length > 0 && patternObj.priority <= 2) {
        break;
      }
    }
  }
  
  return matches;
};

/**
 * Group log entries by extracted thread identifiers
 * @param {Array} logEntries - Array of log entry objects
 * @param {Array} patterns - Array of pattern objects to use for matching
 * @returns {Object} Object with thread groups and ungrouped entries
 */
export const groupLogEntriesByPattern = (logEntries, patterns = DEFAULT_THREAD_PATTERNS) => {
  const threadGroups = {};
  const ungroupedEntries = [];
  
  logEntries.forEach(entry => {
    // Check message, source, and any other relevant fields
    const searchText = `${entry.message || ''} ${entry.source || ''} ${entry.fullMessage || ''}`;
    const identifiers = extractThreadIdentifiers(searchText, patterns);
    
    if (identifiers.length > 0) {
      // Use the first (highest priority) identifier
      const primaryIdentifier = identifiers[0];
      const threadId = primaryIdentifier.identifier;
      
      if (!threadGroups[threadId]) {
        threadGroups[threadId] = {
          threadId,
          threadName: threadId,
          identifier: primaryIdentifier,
          entries: [],
          entryCount: 0,
          logLevels: new Set(),
          timeRange: { start: null, end: null },
          status: 'active',
          logLevel: 'INFO'
        };
      }
      
      threadGroups[threadId].entries.push(entry);
      threadGroups[threadId].entryCount++;
      threadGroups[threadId].logLevels.add(entry.level || entry.logLevel);
      
      // Update time range
      const entryTime = new Date(entry.timestamp);
      if (!threadGroups[threadId].timeRange.start || entryTime < new Date(threadGroups[threadId].timeRange.start)) {
        threadGroups[threadId].timeRange.start = entry.timestamp;
      }
      if (!threadGroups[threadId].timeRange.end || entryTime > new Date(threadGroups[threadId].timeRange.end)) {
        threadGroups[threadId].timeRange.end = entry.timestamp;
      }
      
      // Determine overall log level (highest severity)
      const levels = Array.from(threadGroups[threadId].logLevels);
      if (levels.includes('ERROR')) {
        threadGroups[threadId].logLevel = 'ERROR';
        threadGroups[threadId].status = 'error';
      } else if (levels.includes('WARN')) {
        threadGroups[threadId].logLevel = 'WARN';
      } else if (levels.includes('INFO')) {
        threadGroups[threadId].logLevel = 'INFO';
      } else {
        threadGroups[threadId].logLevel = 'DEBUG';
      }
    } else {
      ungroupedEntries.push(entry);
    }
  });
  
  return {
    threadGroups: Object.values(threadGroups),
    ungroupedEntries,
    totalThreads: Object.keys(threadGroups).length,
    totalGroupedEntries: Object.values(threadGroups).reduce((sum, group) => sum + group.entryCount, 0),
    totalUngroupedEntries: ungroupedEntries.length
  };
};

/**
 * Validate a pattern string
 * @param {string} patternString - The pattern string to validate
 * @returns {Object} Validation result with valid flag and error message
 */
export const validatePattern = (patternString) => {
  if (!patternString || patternString.trim() === '') {
    return { valid: false, error: 'Pattern cannot be empty' };
  }
  
  try {
    new RegExp(patternString, 'gi');
    return { valid: true };
  } catch (e) {
    return { valid: false, error: `Invalid regular expression: ${e.message}` };
  }
};

/**
 * Test a pattern against sample text
 * @param {string} pattern - The pattern to test
 * @param {string} sampleText - Sample text to test against
 * @returns {Array} Array of matches found
 */
export const testPattern = (pattern, sampleText) => {
  try {
    const regex = new RegExp(pattern, 'gi');
    return sampleText.match(regex) || [];
  } catch (e) {
    return [];
  }
};