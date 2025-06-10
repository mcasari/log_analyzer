import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const NavigationBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      label: 'Upload',
      path: '/file-upload-dashboard',
      icon: 'Upload',
      tooltip: 'Start new analysis'
    },
    {
      label: 'Analysis',
      path: '/thread-analysis-filtering',
      icon: 'Filter',
      tooltip: 'Filter and examine threads'
    },
    {
      label: 'Details',
      path: '/thread-group-detail-view',
      icon: 'Search',
      tooltip: 'Detailed thread investigation'
    },
    {
      label: 'Export',
      path: '/export-results-management',
      icon: 'Download',
      tooltip: 'Download results'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-100 bg-surface border-b border-border">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Activity" size={20} color="white" />
            </div>
            <span className="text-xl font-semibold text-text-primary">LogAnalyzer</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ease-out group ${
                  isActivePath(item.path)
                    ? 'text-primary bg-primary-50 border-b-2 border-primary' :'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                }`}
                title={item.tooltip}
              >
                <Icon 
                  name={item.icon} 
                  size={18} 
                  className={`transition-colors duration-200 ${
                    isActivePath(item.path) ? 'text-primary' : 'text-text-secondary group-hover:text-text-primary'
                  }`}
                />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors duration-200"
            aria-label="Toggle navigation menu"
          >
            <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={24} />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-border">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md text-left transition-all duration-200 ease-out ${
                    isActivePath(item.path)
                      ? 'text-primary bg-primary-50 border-l-4 border-primary' :'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                  }`}
                  title={item.tooltip}
                >
                  <Icon 
                    name={item.icon} 
                    size={20} 
                    className={`transition-colors duration-200 ${
                      isActivePath(item.path) ? 'text-primary' : 'text-text-secondary'
                    }`}
                  />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;