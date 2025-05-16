import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SearchConfig from './pages/SearchConfig';
import ResultsViewer from './pages/ResultsViewer';
import Documents from './pages/Documents';
import History from './pages/History';
import Settings from './pages/Settings';
import { AuthProvider } from './utils/AuthContext';
import './App.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/search" element={<SearchConfig />} />
            <Route path="/results" element={<ResultsViewer />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;