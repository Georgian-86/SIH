import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/Common/LoadingSpinner';

// Lazy load components for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const SearchPage = React.lazy(() => import('./pages/SearchPage'));
const TranslationPage = React.lazy(() => import('./pages/TranslationPage'));
const FHIRPage = React.lazy(() => import('./pages/FHIRPage'));
const AdminPage = React.lazy(() => import('./pages/AdminPage'));
const AuthPage = React.lazy(() => import('./pages/AuthPage'));
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage'));

const App: React.FC = () => {
  return (
    <Layout>
      <Suspense fallback={<LoadingSpinner />}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen bg-gray-50"
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/translation" element={<TranslationPage />} />
            <Route path="/fhir" element={<FHIRPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Routes>
        </motion.div>
      </Suspense>
    </Layout>
  );
};

export default App;
