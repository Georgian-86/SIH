import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Upload, 
  Download, 
  Code,
  Clock,
  TrendingUp
} from 'lucide-react';

const RecentActivity: React.FC = () => {
  const activities = [
    {
      type: 'search',
      action: 'Searched for "fever"',
      time: '2 minutes ago',
      icon: Search,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      type: 'upload',
      action: 'Uploaded CSV file',
      time: '15 minutes ago',
      icon: Upload,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      type: 'download',
      action: 'Downloaded CodeSystem',
      time: '1 hour ago',
      icon: Download,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      type: 'translation',
      action: 'Translated AY001',
      time: '2 hours ago',
      icon: Code,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      type: 'search',
      action: 'Searched for "cough"',
      time: '3 hours ago',
      icon: Search,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          <p className="text-gray-600">Latest system interactions</p>
        </div>
        <TrendingUp className="h-5 w-5 text-gray-400" />
      </div>
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className={`p-2 rounded-lg ${activity.bgColor}`}>
              <activity.icon className={`h-4 w-4 ${activity.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{activity.action}</p>
              <div className="flex items-center space-x-1 mt-1">
                <Clock className="h-3 w-3 text-gray-400" />
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium">
          View all activity
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;
