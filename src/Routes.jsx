import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
// Add your imports here
import FileUploadDashboard from "pages/file-upload-dashboard";
import FileProcessingStatus from "pages/file-processing-status";
import LogAnalysisWorkspace from "pages/log-analysis-workspace";
import GroupedContentViewer from "pages/grouped-content-viewer";
import RegexPatternConfiguration from "pages/regex-pattern-configuration";
import NotFound from "pages/NotFound";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your routes here */}
        <Route path="/" element={<FileUploadDashboard />} />
        <Route path="/file-upload-dashboard" element={<FileUploadDashboard />} />
        <Route path="/file-processing-status" element={<FileProcessingStatus />} />
        <Route path="/log-analysis-workspace" element={<LogAnalysisWorkspace />} />
        <Route path="/grouped-content-viewer" element={<GroupedContentViewer />} />
        <Route path="/regex-pattern-configuration" element={<RegexPatternConfiguration />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;