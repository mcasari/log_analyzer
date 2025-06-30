import React, { useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';

const VirtualizedTable = ({
  data = [],
  height = 400,
  rowHeight = 60,
  columns = [],
  onRowClick,
  className = '',
  headerClassName = '',
  rowClassName = '',
  emptyStateComponent,
  loading = false,
  loadingComponent,
  overscan = 5
}) => {
  // Memoize row renderer for performance
  const Row = useCallback(({ index, style }) => {
    const item = data[index];
    if (!item) return null;

    const handleClick = () => {
      if (onRowClick) {
        onRowClick(item, index);
      }
    };

    return (
      <div
        style={style}
        className={`flex items-center border-b border-border hover:bg-surface-hover cursor-pointer transition-colors duration-150 ${rowClassName}`}
        onClick={handleClick}
      >
        {columns.map((column, colIndex) => {
          const cellValue = column.accessor ? item[column.accessor] : '';
          const cellContent = column.Cell ? column.Cell({ value: cellValue, row: item, index }) : cellValue;

          return (
            <div
              key={colIndex}
              className={`px-4 py-2 ${column.className || ''}`}
              style={{
                width: column.width || `${100 / columns.length}%`,
                minWidth: column.minWidth || 'auto',
                maxWidth: column.maxWidth || 'none',
                textAlign: column.align || 'left'
              }}
            >
              {cellContent}
            </div>
          );
        })}
      </div>
    );
  }, [data, columns, onRowClick, rowClassName]);

  // Memoize header for performance
  const Header = useMemo(() => (
    <div className={`flex items-center bg-surface border-b border-border font-medium text-text-secondary ${headerClassName}`}>
      {columns.map((column, index) => (
        <div
          key={index}
          className={`px-4 py-3 text-sm ${column.headerClassName || ''}`}
          style={{
            width: column.width || `${100 / columns.length}%`,
            minWidth: column.minWidth || 'auto',
            maxWidth: column.maxWidth || 'none',
            textAlign: column.align || 'left'
          }}
        >
          {column.Header}
        </div>
      ))}
    </div>
  ), [columns, headerClassName]);

  // Loading state
  if (loading) {
    return (
      <div className={`border border-border rounded-lg overflow-hidden ${className}`}>
        {Header}
        <div className="flex items-center justify-center p-8" style={{ height: height - 48 }}>
          {loadingComponent || (
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-text-secondary">Loading...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className={`border border-border rounded-lg overflow-hidden ${className}`}>
        {Header}
        <div className="flex items-center justify-center p-8" style={{ height: height - 48 }}>
          {emptyStateComponent || (
            <div className="text-center">
              <div className="text-text-tertiary mb-2">No data available</div>
              <div className="text-sm text-text-secondary">Try adjusting your filters or search criteria</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`border border-border rounded-lg overflow-hidden ${className}`}>
      {Header}
      <List
        height={height - 48} // Subtract header height
        itemCount={data.length}
        itemSize={rowHeight}
        overscanCount={overscan}
      >
        {Row}
      </List>
    </div>
  );
};

export default VirtualizedTable;