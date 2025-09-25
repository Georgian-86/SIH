import React from 'react';
import { motion } from 'framer-motion';
import { Database, Tag, Link, TrendingUp } from 'lucide-react';

interface QuickStatsProps {
  data?: {
    totalTerms: number;
    categoryCount: number;
    indexSize: number;
    cacheStats: {
      keys: number;
      hits: number;
      misses: number;
    };
  };
}

const QuickStats: React.FC<QuickStatsProps> = ({ data }) => {
  const stats = [
    {
      title: 'Total Terms',
      value: data?.totalTerms || 0,
      icon: Database,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Categories',
      value: data?.categoryCount || 0,
      icon: Tag,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+5%',
      changeType: 'positive' as const
    },
    {
      title: 'Mapped Terms',
      value: Math.floor((data?.totalTerms || 0) * 0.6), // Approximate
      icon: Link,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      title: 'Cache Hit Rate',
      value: data?.cacheStats ? 
        Math.round((data.cacheStats.hits / (data.cacheStats.hits + data.cacheStats.misses)) * 100) : 0,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: '+3%',
      changeType: 'positive' as const,
      suffix: '%'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">
                {stat.value.toLocaleString()}{stat.suffix || ''}
              </p>
              <div className="flex items-center mt-1">
                <span className={`text-xs font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-xs text-gray-500 ml-1">vs last week</span>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default QuickStats;
