import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingCount, setProcessingCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      label: 'Upload',
      path: '/file-upload-dashboard',
      stage: 1,
      icon: 'Upload',
      tooltip: 'Upload and manage log files'
    },
    {
      label: 'Configure',
      path: '/regex-pattern-configuration',
      stage: 2,
      icon: 'Settings',
      tooltip: 'Configure regex patterns for analysis'
    },
    {
      label: 'Analyze',
      path: '/log-analysis-workspace',
      stage: 3,
      icon: 'BarChart3',
      tooltip: 'Analyze merged log content'
    },
    {
      label: 'Groups',
      path: '/grouped-content-viewer',
      stage: 4,
      icon: 'Layers',
      tooltip: 'View grouped content analysis'
    },
    {
      label: 'Status',
      path: '/file-processing-status',
      stage: 5,
      icon: 'Activity',
      tooltip: 'Monitor file processing status'
    }
  ];

  const currentItem = navigationItems.find(item => item.path === location.pathname);
  const currentStage = currentItem?.stage || 1;

  useEffect(() => {
    const processingTimer = setInterval(() => {
      const mockProcessing = Math.random() > 0.7;
      setIsProcessing(mockProcessing);
      if (mockProcessing) {
        setProcessingCount(Math.floor(Math.random() * 5) + 1);
      }
    }, 3000);

    return () => clearInterval(processingTimer);
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleStatusClick = () => {
    navigate('/file-processing-status');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-background border-b border-border z-100">
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-md">
              <Icon name="Merge" size={20} color="white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-semibold text-text-primary">LogMerger Pro</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              const isCompleted = item.stage < currentStage;
              
              return (
                <div key={item.path} className="relative">
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium
                      transition-all duration-150 ease-out hover-lift
                      ${isActive 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                      }
                    `}
                    title={item.tooltip}
                  >
                    <Icon 
                      name={item.icon} 
                      size={16} 
                      color={isActive ? 'currentColor' : 'var(--color-text-secondary)'} 
                    />
                    <span>{item.label}</span>
                    {isCompleted && (
                      <Icon name="Check" size={12} color="var(--color-success)" />
                    )}
                  </button>
                  
                  {/* Progress Indicator */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-border rounded-full overflow-hidden">
                    <div 
                      className={`
                        h-full transition-all duration-300 ease-out
                        ${isCompleted ? 'w-full bg-success' : isActive ? 'w-1/2 bg-primary' : 'w-0'}
                      `}
                    />
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Processing Status Badge */}
            <button
              onClick={handleStatusClick}
              className={`
                hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm
                transition-all duration-150 ease-out hover-lift
                ${isProcessing 
                  ? 'bg-accent-50 text-accent-700 border border-accent-200' :'bg-surface text-text-secondary hover:bg-surface-hover'
                }
              `}
              title="View processing status"
            >
              <Icon 
                name={isProcessing ? "Loader2" : "CheckCircle"} 
                size={14} 
                className={isProcessing ? "animate-spin" : ""}
                color={isProcessing ? 'var(--color-accent)' : 'var(--color-success)'}
              />
              <span>
                {isProcessing ? `Processing ${processingCount}` : 'Ready'}
              </span>
            </button>

            {/* Quick Actions */}
            <div className="hidden md:flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                iconName="Download"
                iconSize={16}
                onClick={() => console.log('Export results')}
                className="text-text-secondary hover:text-text-primary"
              >
                Export
              </Button>
              <Button
                variant="ghost"
                size="sm"
                iconName="Save"
                iconSize={16}
                onClick={() => console.log('Save configuration')}
                className="text-text-secondary hover:text-text-primary"
              >
                Save
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              iconName={isMobileMenuOpen ? "X" : "Menu"}
              iconSize={20}
              onClick={toggleMobileMenu}
              className="lg:hidden text-text-secondary hover:text-text-primary"
            />
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-surface">
            <nav className="py-4 space-y-1">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.path;
                const isCompleted = item.stage < currentStage;
                
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`
                      flex items-center justify-between w-full px-4 py-3 text-left
                      transition-all duration-150 ease-out
                      ${isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon 
                        name={item.icon} 
                        size={18} 
                        color={isActive ? 'currentColor' : 'var(--color-text-secondary)'} 
                      />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isCompleted && (
                        <Icon name="Check" size={14} color="var(--color-success)" />
                      )}
                      <Icon name="ChevronRight" size={14} color="currentColor" />
                    </div>
                  </button>
                );
              })}
            </nav>
            
            {/* Mobile Quick Actions */}
            <div className="border-t border-border px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Quick Actions</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="Download"
                    iconSize={16}
                    onClick={() => console.log('Export results')}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="Save"
                    iconSize={16}
                    onClick={() => console.log('Save configuration')}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;