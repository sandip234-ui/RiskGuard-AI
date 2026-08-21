import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

const App = () => {
  return (
    <BrowserRouter>
      <div className="app-root">
        <Navbar />
        <Routes>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/reports"   element={<Reports />} />
          <Route path="/settings"  element={<Settings />} />
          {/* Fallback */}
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
        <footer className="app-footer">
          <span>RiskGuard-AI &copy; {new Date().getFullYear()}</span>
          <span className="footer-sep">·</span>
          <span>XGBoost + SHAP Fraud Risk Engine</span>
          <span className="footer-sep">·</span>
          <span>Powered by FastAPI</span>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
