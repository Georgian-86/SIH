import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from 'react-query';
import { 
  Languages, 
  ArrowRight, 
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { apiEndpoints } from '../services/api';
import toast from 'react-hot-toast';

interface TranslationResult {
  code: string;
  system: string;
  display: string;
}

interface TranslationResponse {
  source: {
    code: string;
    system: string;
  };
  translations: TranslationResult[];
  total: number;
  timestamp: string;
}

const TranslationPage: React.FC = () => {
  const [sourceCode, setSourceCode] = useState('');
  const [sourceSystem, setSourceSystem] = useState<'NAMASTE' | 'ICD-11-TM2'>('NAMASTE');
  const [copiedText, setCopiedText] = useState<string>('');

  // Translation mutation
  const translateMutation = useMutation(
    (data: { code: string; system: string }) => apiEndpoints.translateCode(data.code, data.system),
    {
      onSuccess: () => {
        toast.success('Translation completed!');
      },
      onError: () => {
        toast.error('Translation failed. Please check the code and try again.');
      }
    }
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedText(''), 2000);
  };

  const handleTranslate = () => {
    if (!sourceCode.trim()) {
      toast.error('Please enter a code to translate');
      return;
    }
    
    translateMutation.mutate({
      code: sourceCode.trim(),
      system: sourceSystem
    });
  };

  const swapSystems = () => {
    setSourceSystem(sourceSystem === 'NAMASTE' ? 'ICD-11-TM2' : 'NAMASTE');
    setSourceCode('');
    translateMutation.reset();
  };

  const getSystemDisplayName = (system: string) => {
    return system === 'NAMASTE' ? 'NAMASTE (Traditional Medicine)' : 'ICD-11 TM2 (International)';
  };

  const getSystemColor = (system: string) => {
    return system === 'NAMASTE' ? 'from-green-500 to-green-600' : 'from-blue-500 to-blue-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-accent-100 rounded-lg">
            <Languages className="h-6 w-6 text-accent-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Code Translation</h1>
            <p className="text-gray-600">Convert between NAMASTE and ICD-11 TM2 codes</p>
          </div>
        </div>

        {/* Translation Interface */}
        <div className="space-y-6">
          {/* Source System Selection */}
          <div className="flex items-center justify-center space-x-4">
            <div className="flex-1 max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source System
              </label>
              <select
                value={sourceSystem}
                onChange={(e) => setSourceSystem(e.target.value as 'NAMASTE' | 'ICD-11-TM2')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="NAMASTE">NAMASTE (Traditional Medicine)</option>
                <option value="ICD-11-TM2">ICD-11 TM2 (International)</option>
              </select>
            </div>

            <button
              onClick={swapSystems}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors mt-6"
              title="Swap systems"
            >
              <RefreshCw className="h-5 w-5 text-gray-600" />
            </button>

            <div className="flex-1 max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target System
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
                {sourceSystem === 'NAMASTE' ? 'ICD-11 TM2 (International)' : 'NAMASTE (Traditional Medicine)'}
              </div>
            </div>
          </div>

          {/* Source Code Input */}
          <div className="flex items-center justify-center space-x-4">
            <div className="flex-1 max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source Code
              </label>
              <input
                type="text"
                value={sourceCode}
                onChange={(e) => setSourceCode(e.target.value)}
                placeholder={sourceSystem === 'NAMASTE' ? 'e.g., AY001' : 'e.g., TM2-AY134'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <button
              onClick={handleTranslate}
              disabled={translateMutation.isLoading || !sourceCode.trim()}
              className="btn-primary px-6 py-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {translateMutation.isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="spinner"></div>
                  <span>Translating...</span>
                </div>
              ) : (
                'Translate'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <AnimatePresence>
        {translateMutation.data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Translation Results</h2>
                <p className="text-gray-600">
                  {translateMutation.data.data.total} translation(s) found
                </p>
              </div>
            </div>

            {/* Source Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${getSystemColor(sourceSystem)}`}>
                  <span className="text-white font-medium text-sm">
                    {sourceSystem}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{sourceCode}</p>
                  <p className="text-sm text-gray-600">
                    {getSystemDisplayName(sourceSystem)}
                  </p>
                </div>
              </div>
            </div>

            {/* Translation Results */}
            {translateMutation.data.data.translations.length > 0 ? (
              <div className="space-y-4">
                {translateMutation.data.data.translations.map((translation, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                        
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${
                          translation.system === 'NAMASTE' ? 'from-green-500 to-green-600' : 'from-blue-500 to-blue-600'
                        }`}>
                          <span className="text-white font-medium text-sm">
                            {translation.system}
                          </span>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900">{translation.code}</p>
                          <p className="text-sm text-gray-600">{translation.display}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleCopy(translation.code)}
                          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                          title="Copy code"
                        >
                          {copiedText === translation.code ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-500" />
                          )}
                        </button>

                        {translation.system === 'ICD-11-TM2' && (
                          <button
                            onClick={() => window.open(`https://icd.who.int/browse11/l-m/en#/http://id.who.int/icd/entity/${translation.code}`, '_blank')}
                            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                            title="View in ICD-11"
                          >
                            <ExternalLink className="h-4 w-4 text-gray-500" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No translations found</h3>
                <p className="text-gray-600">
                  The code "{sourceCode}" doesn't have any mappings in the {sourceSystem} system.
                </p>
              </div>
            )}

            {/* Translation Info */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  Translation completed at {new Date(translateMutation.data.data.timestamp).toLocaleString()}
                </span>
                <span>
                  Source: {translateMutation.data.data.source.system} → Target: {
                    translateMutation.data.data.translations[0]?.system || 'Unknown'
                  }
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Section */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How to use Code Translation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">NAMASTE Codes:</h4>
            <ul className="space-y-1">
              <li>• Format: AY001, UN001, SI001</li>
              <li>• Ayurvedic (AY), Unani (UN), Siddha (SI)</li>
              <li>• Traditional medicine terminology</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">ICD-11 TM2 Codes:</h4>
            <ul className="space-y-1">
              <li>• Format: TM2-AY134, TM2-UN045</li>
              <li>• International classification</li>
              <li>• WHO standardized codes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslationPage;
