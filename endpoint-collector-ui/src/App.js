import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { ThemeProvider, useTheme, ErrorPageTemplate } from '@hvantran/ui-component-library';
import ExtEndpointCreation from './components/ext-endpoints/ExtEndpointCreation';
import ExtEndpointDetails from './components/ext-endpoints/ExtEndpointDetails';
import ExtEndpointResponseDetails from './components/ext-endpoints/ExtEndpointResponseDetails';
import ExtResponseSummary from './components/ext-endpoints/ExtResponseSummary';
import ExtEndpointSummary from './components/ext-endpoints/ExtEndpointSummary';
import PrimarySearchAppBar from './ResponsiveAppBar';

function AppContent() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-surface-ground-light dark:bg-surface-ground-dark text-secondary-900 dark:text-secondary-100 font-sans">
      <PrimarySearchAppBar
        toggleDarkMode={resolvedTheme === 'dark'}
        setToggleDarkMode={toggleTheme}
      />
      <main className="w-full">
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/endpoints" />}
            errorElement={<ErrorPageTemplate />}
          />
          <Route path="/endpoints" element={<ExtEndpointSummary />} />
          <Route path="/responses" element={<ExtResponseSummary />} />
          <Route path="/endpoints/new" element={<ExtEndpointCreation />} />
          <Route path="/endpoints/:application" element={<ExtEndpointDetails />} />
          <Route
            path="/endpoints/:application/responses/:response"
            element={<ExtEndpointResponseDetails />}
          />
        </Routes>
      </main>
      <ToastContainer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="endpoint-collector-enable-dark-theme">
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
