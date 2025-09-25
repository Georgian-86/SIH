import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { 
  Search, 
  Languages, 
  FileCode, 
  BarChart3,
  Activity,
  Heart,
  Database,
  Globe
} from 'lucide-react';
import { apiEndpoints } from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import QuickStats from '../components/Dashboard/QuickStats';
import RecentActivity from '../components/Dashboard/RecentActivity';
import QuickActions from '../components/Dashboard/QuickActions';

const Dashboard: React.FC = () => {
  const { data: healthData, isLoading: healthLoading } = useQuery(
    'health',
    () => apiEndpoints.health().then(res => res.data),
    { refetchInterval: 30000 }
  );

  const { data: statsData, isLoading: statsLoading } = useQuery(
    'statistics',
    () => apiEndpoints.getStatistics().then(res => res.data),
    { refetchInterval: 60000 }
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  if (healthLoading || statsLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Hero Section */}
      <motion.div variants={itemVariants} className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-accent-600 to-secondary-600 opacity-90"></div>
        <div className="relative bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 text-white">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-white bg-opacity-20 rounded-xl">
              <Heart className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Ayush FHIR Microservice</h1>
              <p className="text-white text-opacity-90">Traditional Indian Medicine meets Modern Healthcare Standards</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Database className="h-6 w-6" />
                <div>
                  <p className="text-sm text-white text-opacity-80">Total Terms</p>
                  <p className="text-2xl font-bold">{statsData?.statistics?.totalTerms || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Activity className="h-6 w-6" />
                <div>
                  <p className="text-sm text-white text-opacity-80">System Status</p>
                  <p className="text-2xl font-bold text-green-300">Healthy</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Globe className="h-6 w-6" />
                <div>
                  <p className="text-sm text-white text-opacity-80">ICD-11 API</p>
                  <p className="text-2xl font-bold text-green-300">Online</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants}>
        <QuickStats data={statsData?.statistics} />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <QuickActions />
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <RecentActivity />
        </motion.div>
      </div>

      {/* Feature Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Search className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Advanced Search</h3>
              <p className="text-sm text-gray-600">Fuzzy search with scoring</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-accent-100 rounded-lg">
              <Languages className="h-6 w-6 text-accent-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Translation</h3>
              <p className="text-sm text-gray-600">NAMASTE ↔ ICD-11</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-secondary-100 rounded-lg">
              <FileCode className="h-6 w-6 text-secondary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">FHIR Resources</h3>
              <p className="text-sm text-gray-600">CodeSystem & ConceptMap</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Analytics</h3>
              <p className="text-sm text-gray-600">Data insights & metrics</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
