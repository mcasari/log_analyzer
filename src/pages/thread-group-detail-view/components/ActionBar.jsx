import React from 'react';
import Icon from '../../../components/AppIcon';

const ActionBar = ({ 
  threadData, 
  filteredCount, 
  totalCount, 
  onExport, 
  onBackToAnalysis 
}) => {
  const handleShareView = () => {
    const shareData = {
      title: `Thread ${threadData.threadId} Analysis`,
      text: `Log analysis for thread ${threadData.threadId} with ${filteredCount} entries`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  const handlePrintView = () => {
    window.print();
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="floating-action rounded-full px-6 py-3 shadow-lg">
        <div className="flex items-center space-x-4">
          {/* Results Summary */}
          <div className="hidden sm:flex items-center space-x-2 text-sm text-text-secondary">
            <Icon name="Filter" size={16} />
            <span>
              {filteredCount} of {totalCount} entries
            </span>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-border" />

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onBackToAnalysis}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors duration-200"
              title="Back to Analysis"
            >
              <Icon name="ArrowLeft" size={18} />
            </button>

            <button
              onClick={handlePrintView}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors duration-200"
              title="Print View"
            >
              <Icon name="Printer" size={18} />
            </button>

            <button
              onClick={handleShareView}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors duration-200"
              title="Share View"
            >
              <Icon name="Share2" size={18} />
            </button>

            <button
              onClick={onExport}
              className="btn-primary px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
            >
              <Icon name="Download" size={16} />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionBar;