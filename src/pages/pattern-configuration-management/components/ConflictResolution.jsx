import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';

const ConflictResolution = ({ patterns, groupedData, onPatternUpdate }) => {
  const [showConflicts, setShowConflicts] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState(null);

  // Detect pattern conflicts
  const conflicts = useMemo(() => {
    const detectedConflicts = [];
    const enabledPatterns = patterns.filter(p => p.enabled);
    
    // Check for overlapping patterns
    for (let i = 0; i < enabledPatterns.length; i++) {
      for (let j = i + 1; j < enabledPatterns.length; j++) {
        const pattern1 = enabledPatterns[i];
        const pattern2 = enabledPatterns[j];
        
        // Test if patterns might overlap using sample data
        const sampleTexts = [
          'task-141 processing',
          'thread-001 started',
          'FileProcessingWorker-3 initialized',
          'sess_abc123xyz789 cache',
          'worker-ABC task execution'
        ];
        
        let hasOverlap = false;
        for (const text of sampleTexts) {
          try {
            const regex1 = new RegExp(pattern1.pattern, 'gi');
            const regex2 = new RegExp(pattern2.pattern, 'gi');
            
            const matches1 = text.match(regex1);
            const matches2 = text.match(regex2);
            
            if (matches1 && matches2) {
              hasOverlap = true;
              break;
            }
          } catch (e) {
            // Skip invalid patterns
          }
        }
        
        if (hasOverlap) {
          detectedConflicts.push({
            id: `conflict-${i}-${j}`,
            type: 'overlap',
            patterns: [pattern1, pattern2],
            severity: 'medium',
            description: `Patterns "${pattern1.name}" and "${pattern2.name}" may match the same text`,
            resolution: 'Consider adjusting pattern priorities or making patterns more specific'
          });
        }
      }
    }
    
    // Check for unused patterns (patterns that don't match any sample data)
    const sampleData = groupedData?.threadGroups || [];
    enabledPatterns.forEach(pattern => {
      const hasMatches = sampleData.some(group => 
        group.identifier?.pattern?.id === pattern.id
      );
      
      if (!hasMatches) {
        detectedConflicts.push({
          id: `unused-${pattern.id}`,
          type: 'unused',
          patterns: [pattern],
          severity: 'low',
          description: `Pattern "${pattern.name}" doesn't match any current log entries`,
          resolution: 'Review pattern or disable if not needed'
        });
      }
    });
    
    // Check for duplicate names
    const nameMap = new Map();
    enabledPatterns.forEach(pattern => {
      if (nameMap.has(pattern.name)) {
        detectedConflicts.push({
          id: `duplicate-name-${pattern.id}`,
          type: 'duplicate',
          patterns: [nameMap.get(pattern.name), pattern],
          severity: 'high',
          description: `Multiple patterns have the same name: "${pattern.name}"`,
          resolution: 'Rename patterns to have unique names'
        });
      } else {
        nameMap.set(pattern.name, pattern);
      }
    });
    
    return detectedConflicts;
  }, [patterns, groupedData]);

  const conflictsBySeverity = useMemo(() => {
    return {
      high: conflicts.filter(c => c.severity === 'high'),
      medium: conflicts.filter(c => c.severity === 'medium'),
      low: conflicts.filter(c => c.severity === 'low')
    };
  }, [conflicts]);

  const handleResolveConflict = (conflict, action) => {
    switch (action) {
      case 'disable-first':
        if (conflict.patterns[0]) {
          onPatternUpdate({
            ...conflict.patterns[0],
            enabled: false
          });
        }
        break;
      case 'disable-second':
        if (conflict.patterns[1]) {
          onPatternUpdate({
            ...conflict.patterns[1],
            enabled: false
          });
        }
        break;
      case 'adjust-priority':
        // Swap priorities
        if (conflict.patterns[0] && conflict.patterns[1]) {
          const temp = conflict.patterns[0].priority;
          onPatternUpdate({
            ...conflict.patterns[0],
            priority: conflict.patterns[1].priority
          });
          onPatternUpdate({
            ...conflict.patterns[1],
            priority: temp
          });
        }
        break;
      default:
        break;
    }
    setSelectedConflict(null);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-error bg-error-100 border-error-200';
      case 'medium': return 'text-warning bg-warning-100 border-warning-200';
      case 'low': return 'text-text-secondary bg-secondary-100 border-border';
      default: return 'text-text-secondary bg-secondary-100 border-border';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return 'AlertTriangle';
      case 'medium': return 'AlertCircle';
      case 'low': return 'Info';
      default: return 'Info';
    }
  };

  if (conflicts.length === 0) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-text-primary flex items-center">
              <Icon name="CheckCircle" size={20} className="mr-2 text-success" />
              Conflict Resolution
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              No conflicts detected in your pattern configuration
            </p>
          </div>
        </div>
        
        <div className="text-center py-8">
          <Icon name="CheckCircle" size={48} className="mx-auto mb-4 text-success opacity-50" />
          <p className="text-lg text-success mb-2">All Clear!</p>
          <p className="text-sm text-text-secondary">
            Your patterns are configured correctly with no conflicts detected.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary flex items-center">
            <Icon name="AlertTriangle" size={20} className="mr-2 text-warning" />
            Conflict Resolution
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Detected {conflicts.length} potential issues with your pattern configuration
          </p>
        </div>
        <button
          onClick={() => setShowConflicts(!showConflicts)}
          className="btn-secondary px-3 py-2 text-sm rounded"
        >
          {showConflicts ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {/* Conflict Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-3 bg-error-50 rounded-lg border border-error-200">
          <div className="text-xl font-bold text-error">{conflictsBySeverity.high.length}</div>
          <div className="text-sm text-error-700">High Priority</div>
        </div>
        <div className="p-3 bg-warning-50 rounded-lg border border-warning-200">
          <div className="text-xl font-bold text-warning">{conflictsBySeverity.medium.length}</div>
          <div className="text-sm text-warning-700">Medium Priority</div>
        </div>
        <div className="p-3 bg-secondary-50 rounded-lg border border-border">
          <div className="text-xl font-bold text-text-secondary">{conflictsBySeverity.low.length}</div>
          <div className="text-sm text-text-secondary">Low Priority</div>
        </div>
      </div>

      {/* Conflict Details */}
      {showConflicts && (
        <div className="space-y-3">
          {conflicts.map(conflict => (
            <div
              key={conflict.id}
              className={`border rounded-lg p-4 ${getSeverityColor(conflict.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <Icon name={getSeverityIcon(conflict.severity)} size={20} className="mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-sm mb-1">
                      {conflict.description}
                    </div>
                    <div className="text-sm opacity-75 mb-3">
                      {conflict.resolution}
                    </div>
                    
                    {/* Affected Patterns */}
                    <div className="space-y-1">
                      <div className="text-xs font-medium opacity-75">Affected Patterns:</div>
                      {conflict.patterns.map(pattern => (
                        <div key={pattern.id} className="text-xs bg-background/50 px-2 py-1 rounded">
                          {pattern.name} (Priority: {pattern.priority})
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => setSelectedConflict(
                      selectedConflict?.id === conflict.id ? null : conflict
                    )}
                    className="p-1 opacity-75 hover:opacity-100 transition-opacity duration-150"
                  >
                    <Icon name="Settings" size={16} />
                  </button>
                </div>
              </div>
              
              {/* Resolution Actions */}
              {selectedConflict?.id === conflict.id && (
                <div className="mt-4 pt-4 border-t border-current/20">
                  <div className="text-xs font-medium opacity-75 mb-2">Quick Actions:</div>
                  <div className="flex flex-wrap gap-2">
                    {conflict.type === 'overlap' && conflict.patterns.length === 2 && (
                      <>
                        <button
                          onClick={() => handleResolveConflict(conflict, 'disable-first')}
                          className="text-xs px-2 py-1 bg-background/50 hover:bg-background/75 rounded transition-colors duration-150"
                        >
                          Disable "{conflict.patterns[0].name}"
                        </button>
                        <button
                          onClick={() => handleResolveConflict(conflict, 'disable-second')}
                          className="text-xs px-2 py-1 bg-background/50 hover:bg-background/75 rounded transition-colors duration-150"
                        >
                          Disable "{conflict.patterns[1].name}"
                        </button>
                        <button
                          onClick={() => handleResolveConflict(conflict, 'adjust-priority')}
                          className="text-xs px-2 py-1 bg-background/50 hover:bg-background/75 rounded transition-colors duration-150"
                        >
                          Swap Priorities
                        </button>
                      </>
                    )}
                    {conflict.type === 'unused' && (
                      <button
                        onClick={() => handleResolveConflict(conflict, 'disable-first')}
                        className="text-xs px-2 py-1 bg-background/50 hover:bg-background/75 rounded transition-colors duration-150"
                      >
                        Disable Pattern
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConflictResolution;