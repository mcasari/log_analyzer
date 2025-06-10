import React from 'react';
import Icon from '../AppIcon';

const WorkflowProgress = ({ 
  currentStep = 1, 
  totalSteps = 4, 
  steps = null,
  isProcessing = false,
  processingMessage = "Processing...",
  showLabels = true 
}) => {
  const defaultSteps = [
    { label: 'Upload', icon: 'Upload', description: 'Upload log files' },
    { label: 'Parse', icon: 'FileText', description: 'Parse file content' },
    { label: 'Analyze', icon: 'Filter', description: 'Analyze threads' },
    { label: 'Complete', icon: 'CheckCircle', description: 'Analysis complete' }
  ];

  const workflowSteps = steps || defaultSteps;

  const getStepStatus = (stepIndex) => {
    const stepNumber = stepIndex + 1;
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return isProcessing ? 'processing' : 'current';
    return 'pending';
  };

  const getStepIcon = (step, status) => {
    if (status === 'completed') return 'CheckCircle';
    if (status === 'processing') return 'Loader';
    return step.icon;
  };

  const getStepClasses = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-white border-success';
      case 'current':
        return 'bg-primary text-white border-primary';
      case 'processing':
        return 'bg-accent text-white border-accent animate-pulse';
      default:
        return 'bg-surface text-text-tertiary border-border';
    }
  };

  const getConnectorClasses = (stepIndex) => {
    const stepNumber = stepIndex + 1;
    return stepNumber < currentStep 
      ? 'bg-success' :'bg-border';
  };

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-4">
        {workflowSteps.map((step, index) => (
          <React.Fragment key={index}>
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div className={`
                w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ease-out
                ${getStepClasses(getStepStatus(index))}
              `}>
                <Icon 
                  name={getStepIcon(step, getStepStatus(index))} 
                  size={20}
                  className={getStepStatus(index) === 'processing' ? 'animate-spin' : ''}
                />
              </div>
              
              {/* Step Label */}
              {showLabels && (
                <div className="mt-2 text-center">
                  <div className={`text-sm font-medium ${
                    getStepStatus(index) === 'completed' || getStepStatus(index) === 'current' || getStepStatus(index) === 'processing'
                      ? 'text-text-primary' :'text-text-tertiary'
                  }`}>
                    {step.label}
                  </div>
                  <div className="text-xs text-text-secondary mt-1 hidden sm:block">
                    {step.description}
                  </div>
                </div>
              )}
            </div>

            {/* Connector Line */}
            {index < workflowSteps.length - 1 && (
              <div className="flex-1 mx-4">
                <div className={`h-0.5 transition-all duration-300 ease-out ${getConnectorClasses(index)}`} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Processing Message */}
      {isProcessing && (
        <div className="flex items-center justify-center space-x-2 mt-4 p-3 bg-accent-100 rounded-lg border border-accent-200">
          <Icon name="Loader" size={16} className="text-accent animate-spin" />
          <span className="text-sm font-medium text-accent-600">{processingMessage}</span>
        </div>
      )}

      {/* Progress Percentage */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-text-secondary">Progress</span>
          <span className="text-sm font-medium text-text-primary">
            {Math.round((currentStep / totalSteps) * 100)}%
          </span>
        </div>
        <div className="w-full bg-border rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default WorkflowProgress;