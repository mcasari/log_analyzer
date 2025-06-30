import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { validatePattern, testPattern } from '../../../utils/threadPatternMatcher';

const PatternDefinitionTools = ({ 
  selectedPattern, 
  onPatternCreate, 
  onPatternUpdate, 
  onPatternSelect,
  sampleLogEntries 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    pattern: '',
    description: '',
    enabled: true
  });
  const [isCreating, setIsCreating] = useState(false);
  const [validationResult, setValidationResult] = useState({ valid: true });
  const [testResults, setTestResults] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // Pattern templates for common use cases
  const patternTemplates = [
    {
      id: 'task-number',
      name: 'Task Number',
      pattern: 'task-\\d+',
      description: 'Matches task-### format (e.g., task-141, task-999)',
      example: 'task-141'
    },
    {
      id: 'worker-alpha',
      name: 'Worker Alpha',
      pattern: 'worker-[A-Z]+',
      description: 'Matches worker-LETTERS format (e.g., worker-ABC, worker-XYZ)',
      example: 'worker-ABC'
    },
    {
      id: 'thread-uuid',
      name: 'Thread UUID',
      pattern: 'thread-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}',
      description: 'Matches thread-UUID format',
      example: 'thread-12345678-1234-1234-1234-123456789abc'
    },
    {
      id: 'session-id',
      name: 'Session ID',
      pattern: 'sess_[a-zA-Z0-9]+',
      description: 'Matches session ID format (e.g., sess_abc123xyz789)',
      example: 'sess_abc123xyz789'
    },
    {
      id: 'processing-worker',
      name: 'Processing Worker',
      pattern: '\\w+Worker-\\d+',
      description: 'Matches worker patterns with numbers (e.g., FileProcessingWorker-3)',
      example: 'FileProcessingWorker-3'
    }
  ];

  // Update form when selected pattern changes
  useEffect(() => {
    if (selectedPattern) {
      setFormData({
        name: selectedPattern.name,
        pattern: selectedPattern.pattern.toString(),
        description: selectedPattern.description,
        enabled: selectedPattern.enabled
      });
      setIsCreating(false);
    } else {
      setFormData({
        name: '',
        pattern: '',
        description: '',
        enabled: true
      });
      setIsCreating(true);
    }
    setValidationResult({ valid: true });
    setTestResults([]);
  }, [selectedPattern]);

  // Validate pattern on change
  useEffect(() => {
    if (formData.pattern) {
      const result = validatePattern(formData.pattern);
      setValidationResult(result);
      
      if (result.valid && sampleLogEntries?.length > 0) {
        const allSampleText = sampleLogEntries
          .map(entry => `${entry.message} ${entry.source} ${entry.fullMessage}`)
          .join(' ');
        const matches = testPattern(formData.pattern, allSampleText);
        setTestResults(matches);
      } else {
        setTestResults([]);
      }
    }
  }, [formData.pattern, sampleLogEntries]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template.id);
    setFormData(prev => ({
      ...prev,
      name: template.name,
      pattern: template.pattern,
      description: template.description
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.pattern.trim() || !validationResult.valid) {
      return;
    }

    const patternData = {
      name: formData.name.trim(),
      pattern: formData.pattern.trim(),
      description: formData.description.trim(),
      enabled: formData.enabled
    };

    if (isCreating) {
      onPatternCreate(patternData);
    } else {
      onPatternUpdate({
        ...selectedPattern,
        ...patternData
      });
    }

    // Reset form for new pattern creation
    if (isCreating) {
      setFormData({
        name: '',
        pattern: '',
        description: '',
        enabled: true
      });
      setSelectedTemplate('');
    }
  };

  const handleCancel = () => {
    if (isCreating) {
      setFormData({
        name: '',
        pattern: '',
        description: '',
        enabled: true
      });
      setSelectedTemplate('');
    } else {
      onPatternSelect(null);
    }
  };

  const canSubmit = formData.name.trim() && formData.pattern.trim() && validationResult.valid;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary flex items-center">
            <Icon name="Settings" size={20} className="mr-2" />
            {isCreating ? 'Create New Pattern' : 'Edit Pattern'}
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            {isCreating 
              ? 'Define a new pattern to identify threads in log entries' 
              : `Editing pattern: ${selectedPattern?.name}`
            }
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setIsCreating(true);
              onPatternSelect(null);
            }}
            className="btn-secondary px-3 py-2 text-sm rounded"
          >
            <Icon name="Plus" size={16} className="mr-1" />
            New Pattern
          </button>
        </div>
      </div>

      {/* Template Selection */}
      {isCreating && (
        <div className="mb-6 p-4 bg-surface rounded-lg border border-border">
          <h4 className="text-sm font-medium text-text-primary mb-3">Choose Template</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {patternTemplates.map(template => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className={`
                  p-3 text-left rounded-lg border transition-all duration-150 hover:shadow-sm
                  ${selectedTemplate === template.id 
                    ? 'border-primary bg-primary-50 shadow-sm' 
                    : 'border-border hover:border-primary-200'
                  }
                `}
              >
                <div className="font-medium text-text-primary text-sm">{template.name}</div>
                <div className="text-xs text-text-secondary mt-1">{template.description}</div>
                <div className="text-xs font-mono text-primary mt-2 bg-background px-2 py-1 rounded">
                  {template.example}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pattern Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Pattern Name */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Pattern Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter a descriptive name for this pattern..."
            className="input-field w-full"
            required
          />
        </div>

        {/* Regular Expression */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Regular Expression Pattern *
          </label>
          <input
            type="text"
            value={formData.pattern}
            onChange={(e) => handleInputChange('pattern', e.target.value)}
            placeholder="Enter regex pattern (e.g., task-\\d+, worker-[A-Z]+)..."
            className={`input-field w-full font-mono ${
              formData.pattern && !validationResult.valid ? 'border-error' : ''
            }`}
            required
          />
          {formData.pattern && (
            <div className="mt-2">
              {validationResult.valid ? (
                <div className="flex items-center text-success text-sm">
                  <Icon name="CheckCircle" size={16} className="mr-1" />
                  Valid regular expression
                </div>
              ) : (
                <div className="flex items-center text-error text-sm">
                  <Icon name="AlertCircle" size={16} className="mr-1" />
                  {validationResult.error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe what this pattern matches and when to use it..."
            className="input-field w-full"
            rows={3}
          />
        </div>

        {/* Enabled Toggle */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="pattern-enabled"
            checked={formData.enabled}
            onChange={(e) => handleInputChange('enabled', e.target.checked)}
            className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
          />
          <label htmlFor="pattern-enabled" className="text-sm text-text-primary cursor-pointer">
            Enable this pattern for thread grouping
          </label>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="p-4 bg-background rounded-lg border border-border">
            <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center">
              <Icon name="Play" size={16} className="mr-2" />
              Pattern Test Results
            </h4>
            <div className="space-y-2">
              {testResults.slice(0, 5).map((match, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-success-50 rounded border border-success-200">
                  <span className="font-mono text-sm text-success-800">"{match}"</span>
                  <Icon name="CheckCircle" size={16} className="text-success" />
                </div>
              ))}
              {testResults.length > 5 && (
                <div className="text-sm text-text-secondary">
                  And {testResults.length - 5} more matches...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <button
            type="button"
            onClick={handleCancel}
            className="btn-secondary px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-primary px-6 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Create Pattern' : 'Update Pattern'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatternDefinitionTools;