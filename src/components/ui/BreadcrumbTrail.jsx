import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const BreadcrumbTrail = ({ customPath = null }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const routeMap = {
    '/file-upload-dashboard': { label: 'Upload', icon: 'Upload' },
    '/thread-analysis-filtering': { label: 'Analysis', icon: 'Filter' },
    '/thread-group-detail-view': { label: 'Details', icon: 'Search' },
    '/export-results-management': { label: 'Export', icon: 'Download' }
  };

  const generateBreadcrumbs = () => {
    const currentPath = location.pathname;
    const breadcrumbs = [];

    if (currentPath === '/thread-group-detail-view') {
      breadcrumbs.push(
        { label: 'Upload', path: '/file-upload-dashboard', icon: 'Upload' },
        { label: 'Analysis', path: '/thread-analysis-filtering', icon: 'Filter' },
        { label: 'Details', path: '/thread-group-detail-view', icon: 'Search', current: true }
      );
    } else if (currentPath === '/export-results-management') {
      breadcrumbs.push(
        { label: 'Analysis', path: '/thread-analysis-filtering', icon: 'Filter' },
        { label: 'Export', path: '/export-results-management', icon: 'Download', current: true }
      );
    } else if (customPath) {
      return customPath;
    } else {
      const currentRoute = routeMap[currentPath];
      if (currentRoute) {
        breadcrumbs.push({
          label: currentRoute.label,
          path: currentPath,
          icon: currentRoute.icon,
          current: true
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <nav className="flex items-center space-x-2 text-sm text-text-secondary mb-6" aria-label="Breadcrumb">
      <Icon name="Home" size={16} className="text-text-tertiary" />
      
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.path}>
          {index > 0 && (
            <Icon name="ChevronRight" size={16} className="text-text-tertiary" />
          )}
          
          {crumb.current ? (
            <div className="flex items-center space-x-1">
              <Icon name={crumb.icon} size={16} className="text-primary" />
              <span className="font-medium text-text-primary" aria-current="page">
                {crumb.label}
              </span>
            </div>
          ) : (
            <button
              onClick={() => handleNavigation(crumb.path)}
              className="flex items-center space-x-1 hover:text-text-primary transition-colors duration-150 ease-out group"
            >
              <Icon 
                name={crumb.icon} 
                size={16} 
                className="text-text-tertiary group-hover:text-text-secondary transition-colors duration-150" 
              />
              <span className="hover:underline">{crumb.label}</span>
            </button>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default BreadcrumbTrail;