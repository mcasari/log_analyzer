import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const ExportHistory = ({ history, onReDownload }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');

  const filteredHistory = history
    .filter(item => 
      item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.format.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.downloadDate) - new Date(a.downloadDate);
        case 'size':
          return parseFloat(b.size) - parseFloat(a.size);
        case 'name':
          return a.filename.localeCompare(b.filename);
        default:
          return 0;
      }
    });

  const formatFileSize = (size) => {
    return size;
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getFormatIcon = (format) => {
    switch (format) {
      case 'CSV': return 'FileSpreadsheet';
      case 'JSON': return 'FileCode';
      case 'TXT': return 'FileText';
      default: return 'File';
    }
  };

  const getFormatColor = (format) => {
    switch (format) {
      case 'CSV': return 'text-success';
      case 'JSON': return 'text-primary';
      case 'TXT': return 'text-warning';
      default: return 'text-text-secondary';
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold text-text-primary mb-6 flex items-center space-x-2">
        <Icon name="History" size={20} className="text-primary" />
        <span>Export History</span>
      </h2>

      <div className="space-y-4">
        {/* Search and Sort */}
        <div className="space-y-3">
          <div className="relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search exports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full pl-10"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field w-full"
          >
            <option value="date">Sort by Date</option>
            <option value="size">Sort by Size</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>

        {/* Export List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="FileX" size={48} className="text-text-tertiary mx-auto mb-3" />
              <p className="text-text-secondary">No export history found</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-primary hover:text-primary-700 text-sm mt-2"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="bg-background border border-border rounded-lg p-4 hover:border-primary-300 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon 
                        name={getFormatIcon(item.format)} 
                        size={16} 
                        className={getFormatColor(item.format)} 
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-text-primary truncate mb-1">
                        {item.filename}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-text-secondary">
                        <span className="flex items-center space-x-1">
                          <Icon name="Calendar" size={12} />
                          <span>{formatDate(item.downloadDate)}</span>
                        </span>
                        
                        <span className="flex items-center space-x-1">
                          <Icon name="HardDrive" size={12} />
                          <span>{formatFileSize(item.size)}</span>
                        </span>
                        
                        <span className="flex items-center space-x-1">
                          <Icon name="Layers" size={12} />
                          <span>{item.threadGroups} groups</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.format === 'CSV' ? 'bg-success-100 text-success-600' :
                          item.format === 'JSON'? 'bg-primary-100 text-primary-600' : 'bg-warning-100 text-warning-600'
                        }`}>
                          {item.format}
                        </span>
                        
                        <span className="text-xs text-text-tertiary">
                          {item.logEntries.toLocaleString()} entries
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-3">
                    <button
                      onClick={() => onReDownload(item)}
                      className="p-2 text-text-secondary hover:text-primary hover:bg-primary-50 rounded-lg transition-all duration-200"
                      title="Re-download"
                    >
                      <Icon name="Download" size={16} />
                    </button>
                    
                    <button
                      className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-all duration-200"
                      title="More options"
                    >
                      <Icon name="MoreVertical" size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Stats */}
        {filteredHistory.length > 0 && (
          <div className="border-t border-border pt-4 mt-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-primary">
                  {filteredHistory.length}
                </div>
                <div className="text-xs text-text-secondary">Total Exports</div>
              </div>
              
              <div>
                <div className="text-lg font-bold text-success">
                  {filteredHistory.reduce((sum, item) => sum + item.logEntries, 0).toLocaleString()}
                </div>
                <div className="text-xs text-text-secondary">Total Entries</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportHistory;