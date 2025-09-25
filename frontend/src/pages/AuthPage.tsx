import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from 'react-query';
import { 
  Shield, 
  Key, 
  User, 
  Eye, 
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  Info
} from 'lucide-react';
import { apiEndpoints } from '../services/api';
import toast from 'react-hot-toast';

const AuthPage: React.FC = () => {
  const [abhaId, setAbhaId] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedAbhaId, setCopiedAbhaId] = useState(false);

  // Mock ABHA authentication mutation
  const authMutation = useMutation(
    (abhaId: string) => apiEndpoints.getAuthToken(abhaId),
    {
      onSuccess: (data) => {
        localStorage.setItem('authToken', data.data.access_token);
        localStorage.setItem('abhaId', abhaId);
        toast.success('Authentication successful!');
      },
      onError: () => {
        toast.error('Authentication failed. Please check your ABHA ID.');
      }
    }
  );

  const handleAuthenticate = () => {
    if (!abhaId.trim()) {
      toast.error('Please enter a mock ABHA ID');
      return;
    }

    authMutation.mutate(abhaId.trim());
  };

  const handleCopyToken = () => {
    if (authMutation.data?.data.access_token) {
      navigator.clipboard.writeText(authMutation.data.data.access_token);
      setCopiedToken(true);
      toast.success('Token copied to clipboard!');
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const handleCopyAbhaId = () => {
    if (abhaId) {
      navigator.clipboard.writeText(abhaId);
      setCopiedAbhaId(true);
      toast.success('ABHA ID copied to clipboard!');
      setTimeout(() => setCopiedAbhaId(false), 2000);
    }
  };

  const generateMockAbhaId = () => {
    const randomId = Math.floor(Math.random() * 9000000000) + 1000000000;
    setAbhaId(randomId.toString());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Shield className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Authentication</h1>
            <p className="text-gray-600">Mock ABHA-like OAuth simulation</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Authentication Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Key className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Generate Access Token</h2>
              <p className="text-gray-600">Simulate ABHA authentication</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* ABHA ID Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mock ABHA ID
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={abhaId}
                  onChange={(e) => setAbhaId(e.target.value)}
                  placeholder="Enter or generate a mock ABHA ID"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={generateMockAbhaId}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span>Generate</span>
                </button>
              </div>
              {abhaId && (
                <button
                  onClick={handleCopyAbhaId}
                  className="mt-2 text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                >
                  {copiedAbhaId ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  <span>Copy ABHA ID</span>
                </button>
              )}
            </div>

            {/* Authenticate Button */}
            <button
              onClick={handleAuthenticate}
              disabled={authMutation.isLoading || !abhaId.trim()}
              className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {authMutation.isLoading ? (
                <>
                  <div className="spinner"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Key className="h-4 w-4" />
                  <span>Generate Access Token</span>
                </>
              )}
            </button>

            {/* Auth Result */}
            <AnimatePresence>
              {authMutation.data && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-green-50 border border-green-200 rounded-lg p-4"
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="p-1 bg-green-600 rounded">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium text-green-800">Authentication Successful</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-1">
                        Access Token
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type={showToken ? 'text' : 'password'}
                          value={authMutation.data.data.access_token}
                          readOnly
                          className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-lg text-sm font-mono"
                        />
                        <button
                          onClick={() => setShowToken(!showToken)}
                          className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                        >
                          {showToken ? (
                            <EyeOff className="h-4 w-4 text-green-600" />
                          ) : (
                            <Eye className="h-4 w-4 text-green-600" />
                          )}
                        </button>
                        <button
                          onClick={handleCopyToken}
                          className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                        >
                          {copiedToken ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-green-600" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-green-700">Token Type:</span>
                        <span className="ml-2 text-green-600">{authMutation.data.data.token_type}</span>
                      </div>
                      <div>
                        <span className="font-medium text-green-700">Expires In:</span>
                        <span className="ml-2 text-green-600">{authMutation.data.data.expires_in}s</span>
                      </div>
                    </div>

                    <div>
                      <span className="font-medium text-green-700">Scope:</span>
                      <span className="ml-2 text-green-600">{authMutation.data.data.scope}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Information Panel */}
        <div className="space-y-6">
          {/* ABHA Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Info className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">About ABHA</h3>
                <p className="text-gray-600">Ayushman Bharat Health Account</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-gray-600">
              <p>
                ABHA (Ayushman Bharat Health Account) is a unique 14-digit health ID that 
                allows you to digitally store all your health records.
              </p>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Features:</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Unique health identifier</li>
                  <li>Digital health records storage</li>
                  <li>Interoperability across health systems</li>
                  <li>Consent-based data sharing</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">In This Demo:</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Mock ABHA ID generation</li>
                  <li>JWT token simulation</li>
                  <li>OAuth 2.0 flow demonstration</li>
                  <li>Patient consent simulation</li>
                </ul>
              </div>
            </div>
          </div>

          {/* OAuth Flow */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">OAuth 2.0 Flow</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900">Client Request</p>
                  <p className="text-sm text-gray-600">Application requests access with ABHA ID</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900">User Consent</p>
                  <p className="text-sm text-gray-600">User grants permission for data access</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900">Token Generation</p>
                  <p className="text-sm text-gray-600">Server generates JWT access token</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  4
                </div>
                <div>
                  <p className="font-medium text-gray-900">API Access</p>
                  <p className="text-sm text-gray-600">Client uses token for authenticated requests</p>
                </div>
              </div>
            </div>
          </div>

          {/* External Links */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Learn More</h3>
            
            <div className="space-y-3">
              <a
                href="https://abdm.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <ExternalLink className="h-4 w-4 text-blue-600" />
                <span className="text-blue-600 hover:text-blue-700">ABDM Official Website</span>
              </a>
              
              <a
                href="https://sandbox.abdm.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <ExternalLink className="h-4 w-4 text-blue-600" />
                <span className="text-blue-600 hover:text-blue-700">ABDM Sandbox</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
