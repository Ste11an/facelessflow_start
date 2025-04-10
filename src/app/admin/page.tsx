'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';
import ApiKeyService from '@/lib/api-key-service';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  isVisible: boolean;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState<Record<string, ApiKey>>({
    openai: { id: 'openai', name: 'OpenAI API Key', key: '', isVisible: false },
    elevenlabs: { id: 'elevenlabs', name: 'ElevenLabs API Key', key: '', isVisible: false },
    shotstack: { id: 'shotstack', name: 'Shotstack API Key', key: '', isVisible: false },
    pexels: { id: 'pexels', name: 'Pexels API Key', key: '', isVisible: false },
    youtube: { id: 'youtube', name: 'YouTube API Key', key: '', isVisible: false },
    tiktok: { id: 'tiktok', name: 'TikTok API Key', key: '', isVisible: false },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string } | null>(null);
  const apiKeyService = ApiKeyService();

  // Fetch API keys from Supabase when component mounts
  useEffect(() => {
    const fetchKeys = async () => {
      if (user) {
        const result = await apiKeyService.fetchApiKeys();
        
        if (result.success && result.keys) {
          // Update state with fetched keys
          const updatedKeys = { ...apiKeys };
          Object.entries(result.keys).forEach(([keyId, value]) => {
            if (updatedKeys[keyId]) {
              updatedKeys[keyId] = {
                ...updatedKeys[keyId],
                key: value
              };
            }
          });
          
          setApiKeys(updatedKeys);
        }
      }
    };

    fetchKeys();
  }, [user]);

  const handleKeyChange = (id: string, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        key: value
      }
    }));
  };

  const toggleKeyVisibility = (id: string) => {
    setApiKeys(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isVisible: !prev[id].isVisible
      }
    }));
  };

  const handleSaveKeys = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      // Extract just the key values for saving
      const keysToSave: Record<string, string> = {};
      Object.entries(apiKeys).forEach(([id, apiKey]) => {
        keysToSave[id] = apiKey.key;
      });
      
      // Save keys using the service
      const result = await apiKeyService.saveApiKeys(keysToSave);
      
      setSaveStatus({
        success: result.success,
        message: result.message
      });
    } catch (error: any) {
      setSaveStatus({
        success: false,
        message: `Error: ${error.message || 'Failed to save API keys'}`
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-950">
        <header className="bg-gray-900 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <motion.h1 
                className="text-2xl font-bold text-white"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                FacelessFlow
              </motion.h1>
              <nav className="hidden md:flex space-x-4">
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => router.push('/admin')}
                  className="bg-gray-800 text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Admin
                </button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 text-sm">{user?.email}</span>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            className="bg-gray-900 rounded-xl shadow-xl p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-semibold text-white mb-4">API Key Management</h2>
            <p className="text-gray-300 mb-6">
              Securely manage your API keys for various services used by FacelessFlow.
            </p>
            
            <div className="space-y-6">
              {Object.values(apiKeys).map((apiKey) => (
                <motion.div 
                  key={apiKey.id}
                  className="bg-gray-800 rounded-lg p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {apiKey.name}
                  </label>
                  <div className="flex">
                    <input
                      type={apiKey.isVisible ? "text" : "password"}
                      value={apiKey.key}
                      onChange={(e) => handleKeyChange(apiKey.id, e.target.value)}
                      className="flex-grow px-3 py-2 bg-gray-700 border border-gray-600 rounded-l-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder={`Enter your ${apiKey.name}`}
                    />
                    <button
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                      className="px-3 py-2 bg-gray-600 text-gray-200 rounded-r-md hover:bg-gray-500 transition-colors"
                    >
                      {apiKey.isVisible ? "Hide" : "Show"}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8 flex justify-end">
              <motion.button
                onClick={handleSaveKeys}
                disabled={isSaving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSaving ? "Saving..." : "Save API Keys"}
              </motion.button>
            </div>
            
            {saveStatus && (
              <motion.div 
                className={`mt-4 p-3 rounded-md ${saveStatus.success ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className={saveStatus.success ? 'text-green-400' : 'text-red-400'}>
                  {saveStatus.message}
                </p>
              </motion.div>
            )}
          </motion.div>
          
          <motion.div
            className="bg-gray-900 rounded-xl shadow-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-white mb-4">Security Information</h2>
            <p className="text-gray-300 mb-4">
              Your API keys are stored securely in our database with encryption. Only you can access and manage these keys.
            </p>
            <div className="bg-gray-800 p-4 rounded-md">
              <h3 className="text-md font-medium text-white mb-2">Best Practices:</h3>
              <ul className="list-disc pl-5 text-gray-300 space-y-1">
                <li>Never share your API keys with anyone</li>
                <li>Regularly rotate your API keys for enhanced security</li>
                <li>Use environment-specific keys for development and production</li>
                <li>Monitor your API usage for any suspicious activity</li>
              </ul>
            </div>
          </motion.div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
