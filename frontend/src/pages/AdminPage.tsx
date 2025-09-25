import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Settings, 
  Upload, 
  Database, 
  Trash2, 
  RefreshCw,
  FileText,
  AlertTriangle,
  CheckCircle,
  Download,
  BarChart3
} from 'lucide-react';
import { apiEndpoints } from '../services/api';
import toast from 'react-hot-toast';

const AdminPage: React.FC = () => {
  const [csvContent, setCsvContent] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Fetch statistics
  const { data: statsData, isLoading: statsLoading } = useQuery(
    'statistics',
    () => apiEndpoints.getStatistics().then(res => res.data),
    { refetchInterval: 30000 }
  );

  // CSV upload mutation
  const uploadMutation = useMutation(
    (csvData: string) => apiEndpoints.ingestCSV(csvData),
    {
      onSuccess: () => {
        toast.success('CSV uploaded and processed successfully!');
        setUploadStatus('success');
        queryClient.invalidateQueries('statistics');
        queryClient.invalidateQueries('search');
      },
      onError: () => {
        toast.error('Failed to upload CSV');
        setUploadStatus('error');
      }
    }
  );

  // Load sample data mutation
  const loadSampleMutation = useMutation(
    () => apiEndpoints.loadSampleData(),
    {
      onSuccess: () => {
        toast.success('Sample data loaded successfully!');
        queryClient.invalidateQueries('statistics');
        queryClient.invalidateQueries('search');
      },
      onError: () => {
        toast.error('Failed to load sample data');
      }
    }
  );

  // Clear data mutation
  const clearMutation = useMutation(
    () => apiEndpoints.clearData(),
    {
      onSuccess: () => {
        toast.success('All data cleared successfully!');
        queryClient.invalidateQueries('statistics');
        queryClient.invalidateQueries('search');
      },
      onError: () => {
        toast.error('Failed to clear data');
      }
    }
  );

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv') {
      toast.error('Please select a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvContent(content);
      setUploadStatus('idle');
    };
    reader.readAsText(file);
  };

  const handleUpload = () => {
    if (!csvContent.trim()) {
      toast.error('Please select a CSV file or enter CSV content');
      return;
    }

    setUploadStatus('uploading');
    uploadMutation.mutate(csvContent);
  };

  const handleDownloadSample = () => {
    const sampleCSV = `id,term,category,synonyms,icd11_tm2_code,references,description
AY001,"Amlapitta","Ayurvedic Disease","Dyspepsia,Sour indigestion","TM2-AY134","Charaka Samhita","Acid dyspepsia characterized by sour belching and heartburn"
AY002,"Vata Dosha Imbalance","Ayurvedic Constitutional Disorder","Wind disorder,Nervous system imbalance","","Sushruta Samhita","Imbalance of Vata dosha affecting movement and nervous functions"
UN001,"Mizaj-e-Har","Unani Temperament","Hot temperament,Warm constitution","TM2-UN045","Canon of Medicine","Hot temperament in Unani medicine system"`;

    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-namaste.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Sample CSV downloaded!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Settings className="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600">Manage data and system settings</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistics */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">System Statistics</h2>
                <p className="text-gray-600">Current data store metrics</p>
              </div>
            </div>

            {statsLoading ? (
              <div className="text-center py-8">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-gray-600">Loading statistics...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Terms</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {statsData?.statistics?.totalTerms || 0}
                      </p>
                    </div>
                    <Database className="h-8 w-8 text-gray-400" />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Categories</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {statsData?.statistics?.categoryCount || 0}
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Index Size</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {statsData?.statistics?.indexSize || 0}
                      </p>
                    </div>
                    <RefreshCw className="h-8 w-8 text-gray-400" />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Cache Keys</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {statsData?.statistics?.cacheStats?.keys || 0}
                      </p>
                    </div>
                    <Database className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Load Sample Data */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-4">
              <button
                onClick={() => loadSampleMutation.mutate()}
                disabled={loadSampleMutation.isLoading}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                {loadSampleMutation.isLoading ? (
                  <>
                    <div className="spinner"></div>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    <span>Load Sample Data</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadSample}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download Sample CSV</span>
              </button>

              <button
                onClick={() => clearMutation.mutate()}
                disabled={clearMutation.isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {clearMutation.isLoading ? (
                  <>
                    <div className="spinner"></div>
                    <span>Clearing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Clear All Data</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Backend API</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Online</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Connected</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">ICD-11 API</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSV Upload */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <Upload className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Upload CSV Data</h2>
            <p className="text-gray-600">Ingest NAMASTE terminology from CSV files</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV File
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* CSV Content Preview */}
          {csvContent && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CSV Content Preview
              </label>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto max-h-40">
                <pre>{csvContent.split('\n').slice(0, 5).join('\n')}</pre>
                {csvContent.split('\n').length > 5 && (
                  <div className="text-gray-500">... and {csvContent.split('\n').length - 5} more lines</div>
                )}
              </div>
            </div>
          )}

          {/* Upload Status */}
          <AnimatePresence>
            {uploadStatus !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`p-4 rounded-lg ${
                  uploadStatus === 'success' ? 'bg-green-50 border border-green-200' :
                  uploadStatus === 'error' ? 'bg-red-50 border border-red-200' :
                  'bg-blue-50 border border-blue-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {uploadStatus === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : uploadStatus === 'error' ? (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  ) : (
                    <div className="spinner"></div>
                  )}
                  <span className={`font-medium ${
                    uploadStatus === 'success' ? 'text-green-800' :
                    uploadStatus === 'error' ? 'text-red-800' :
                    'text-blue-800'
                  }`}>
                    {uploadStatus === 'success' ? 'Upload successful!' :
                     uploadStatus === 'error' ? 'Upload failed!' :
                     'Uploading...'}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={uploadMutation.isLoading || !csvContent}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadMutation.isLoading ? (
              <>
                <div className="spinner"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Upload CSV</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
