import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NavigationBar from "components/ui/NavigationBar";
import FileUploadDashboard from "pages/file-upload-dashboard";
import ThreadAnalysisFiltering from "pages/thread-analysis-filtering";
import ThreadGroupDetailView from "pages/thread-group-detail-view";
import ExportResultsManagement from "pages/export-results-management";
import PatternConfigurationManagement from "pages/pattern-configuration-management";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <NavigationBar />
        <div className="pt-20">
          <RouterRoutes>
            <Route path="/" element={<FileUploadDashboard />} />
            <Route path="/file-upload-dashboard" element={<FileUploadDashboard />} />
            <Route path="/thread-analysis-filtering" element={<ThreadAnalysisFiltering />} />
            <Route path="/thread-group-detail-view" element={<ThreadGroupDetailView />} />
            <Route path="/export-results-management" element={<ExportResultsManagement />} />
            <Route path="/pattern-configuration-management" element={<PatternConfigurationManagement />} />
          </RouterRoutes>
        </div>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;