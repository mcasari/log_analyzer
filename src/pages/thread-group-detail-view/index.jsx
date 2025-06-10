import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import ThreadMetadata from './components/ThreadMetadata';
import LogEntryTable from './components/LogEntryTable';
import FilterPanel from './components/FilterPanel';
import ActionBar from './components/ActionBar';

const ThreadGroupDetailView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get thread data from navigation state or use mock data
  const threadData = location.state?.threadData || {
    threadId: "THREAD-001",
    totalEntries: 156,
    timeSpan: "2024-01-15 09:30:45 - 2024-01-15 11:45:22",
    status: "Active",
    severity: "Warning"
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLogLevels, setSelectedLogLevels] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [expandedEntries, setExpandedEntries] = useState(new Set());

  // Mock log entries data
  const mockLogEntries = [
    {
      id: 1,
      timestamp: "2024-01-15 09:30:45.123",
      logLevel: "INFO",
      source: "UserService",
      message: "User authentication initiated for user ID: 12345",
      fullMessage: `User authentication initiated for user ID: 12345
Processing authentication request with the following parameters:
- Username: john.doe@example.com
- Session ID: sess_abc123xyz789
- IP Address: 192.168.1.100
- User Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36`
    },
    {
      id: 2,
      timestamp: "2024-01-15 09:30:46.456",
      logLevel: "DEBUG",
      source: "DatabaseConnector",
      message: "Executing query: SELECT * FROM users WHERE email = ?",
      fullMessage: `Executing query: SELECT * FROM users WHERE email = ?
Query parameters: [john.doe@example.com]
Connection pool status: 8/10 connections active
Query execution time: 45ms
Rows returned: 1`
    },
    {
      id: 3,
      timestamp: "2024-01-15 09:30:47.789",
      logLevel: "WARN",
      source: "SecurityModule",
      message: "Multiple login attempts detected from IP: 192.168.1.100",
      fullMessage: `Multiple login attempts detected from IP: 192.168.1.100
Previous attempts in last 5 minutes: 3
Account lockout threshold: 5 attempts
Remaining attempts before lockout: 2
Recommended action: Monitor for suspicious activity`
    },
    {
      id: 4,
      timestamp: "2024-01-15 09:30:48.012",
      logLevel: "INFO",
      source: "UserService",
      message: "Password validation successful for user ID: 12345",
      fullMessage: `Password validation successful for user ID: 12345
Validation method: bcrypt hash comparison
Hash algorithm: bcrypt with salt rounds: 12
Validation time: 156ms
Next step: Generate session token`
    },
    {
      id: 5,
      timestamp: "2024-01-15 09:30:49.345",
      logLevel: "ERROR",
      source: "TokenService",
      message: "Failed to generate JWT token: Invalid signing key",
      fullMessage: `Failed to generate JWT token: Invalid signing key
Error details:
- Error code: JWT_SIGNING_ERROR
- Key ID: key_prod_2024
- Key status: EXPIRED
- Expiration date: 2024-01-10 00:00:00
- Fallback key available: Yes
- Auto-rotation enabled: No
Stack trace: TokenService.generateToken() line 145`
    },
    {
      id: 6,
      timestamp: "2024-01-15 09:30:50.678",
      logLevel: "INFO",
      source: "TokenService",
      message: "Using fallback signing key for token generation",
      fullMessage: `Using fallback signing key for token generation
Fallback key ID: key_fallback_2024
Key status: ACTIVE
Expiration date: 2024-06-15 00:00:00
Token generated successfully with 24h expiration`
    },
    {
      id: 7,
      timestamp: "2024-01-15 09:30:51.901",
      logLevel: "INFO",
      source: "SessionManager",
      message: "Session created successfully for user ID: 12345",
      fullMessage: `Session created successfully for user ID: 12345
Session details:
- Session ID: sess_abc123xyz789
- Expiration: 2024-01-16 09:30:51
- Permissions: [read, write, admin]
- Device fingerprint: fp_device_xyz123
- Location: New York, NY, US`
    },
    {
      id: 8,
      timestamp: "2024-01-15 09:30:52.234",
      logLevel: "DEBUG",
      source: "AuditLogger",
      message: "Login event recorded in audit trail",
      fullMessage: `Login event recorded in audit trail
Audit entry ID: audit_20240115_093052_001
Event type: USER_LOGIN_SUCCESS
User ID: 12345
Timestamp: 2024-01-15 09:30:52.234
IP Address: 192.168.1.100
Compliance flags: SOX, GDPR, HIPAA`
    }
  ];

  // Filter and search logic
  const filteredEntries = useMemo(() => {
    let filtered = mockLogEntries;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.fullMessage.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply log level filter
    if (selectedLogLevels.length > 0) {
      filtered = filtered.filter(entry =>
        selectedLogLevels.includes(entry.logLevel)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const timeA = new Date(a.timestamp);
      const timeB = new Date(b.timestamp);
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });

    return filtered;
  }, [searchTerm, selectedLogLevels, sortOrder]);

  const handleEntryExpand = (entryId) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  const handleExport = () => {
    navigate('/export-results-management', {
      state: {
        exportData: {
          type: 'thread-group',
          threadId: threadData.threadId,
          entries: filteredEntries,
          filters: {
            searchTerm,
            selectedLogLevels,
            sortOrder
          }
        }
      }
    });
  };

  const handleBackToAnalysis = () => {
    navigate('/thread-analysis-filtering');
  };

  const customBreadcrumbs = [
    { label: 'Upload', path: '/file-upload-dashboard', icon: 'Upload' },
    { label: 'Analysis', path: '/thread-analysis-filtering', icon: 'Filter' },
    { label: 'Thread Details', path: '/thread-group-detail-view', icon: 'Search', current: true }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb Navigation */}
        <BreadcrumbTrail customPath={customBreadcrumbs} />

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBackToAnalysis}
                className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors duration-200"
                title="Back to Analysis"
              >
                <Icon name="ArrowLeft" size={20} />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-text-primary">Thread Group Details</h1>
                <p className="text-text-secondary mt-1">
                  Detailed analysis of thread {threadData.threadId}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleExport}
                className="btn-primary px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
              >
                <Icon name="Download" size={18} />
                <span>Export Thread</span>
              </button>
            </div>
          </div>

          {/* Thread Metadata */}
          <ThreadMetadata threadData={threadData} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Panel */}
          <div className="lg:col-span-1">
            <FilterPanel
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedLogLevels={selectedLogLevels}
              onLogLevelsChange={setSelectedLogLevels}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
              totalEntries={mockLogEntries.length}
              filteredEntries={filteredEntries.length}
            />
          </div>

          {/* Log Entries Table */}
          <div className="lg:col-span-3">
            <LogEntryTable
              entries={filteredEntries}
              expandedEntries={expandedEntries}
              onEntryExpand={handleEntryExpand}
              searchTerm={searchTerm}
            />
          </div>
        </div>

        {/* Sticky Action Bar */}
        <ActionBar
          threadData={threadData}
          filteredCount={filteredEntries.length}
          totalCount={mockLogEntries.length}
          onExport={handleExport}
          onBackToAnalysis={handleBackToAnalysis}
        />
      </div>
    </div>
  );
};

export default ThreadGroupDetailView;