import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Shield, Key, RefreshCw, AlertCircle, CheckCircle, Plus, Trash2, Settings, Database, Eye, EyeOff } from 'lucide-react';

interface KeyVaultStatus {
  enabled: boolean;
  initialized: boolean;
  keyVaultUrl: string;
  timestamp: string;
}

interface KeyVaultManagementProps {
  className?: string;
}

export function KeyVaultManagement({ className }: KeyVaultManagementProps) {
  const [keyVaultStatus, setKeyVaultStatus] = useState<KeyVaultStatus | null>(null);
  const [secrets, setSecrets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSetupForm, setShowSetupForm] = useState(false);
  const [showAddSecretForm, setShowAddSecretForm] = useState(false);
  const [setupForm, setSetupForm] = useState({
    keyVaultUrl: '',
    tenantId: '',
    clientId: '',
    clientSecret: ''
  });
  const [secretForm, setSecretForm] = useState({
    name: '',
    value: '',
    contentType: 'text/plain'
  });

  useEffect(() => {
    loadKeyVaultStatus();
  }, []);

  const loadKeyVaultStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      const response = await fetch('/api/admin/keyvault/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Check if response is HTML (indicating server routing issue)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        throw new Error('Backend API not available. Please ensure the server is running.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      setKeyVaultStatus(data.data);
      
      if (data.data.enabled) {
        await loadSecrets();
      }
    } catch (err: any) {
      console.error('Key Vault status error:', err);
      setError(err.message);
      toast.error(`Key Vault Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadSecrets = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) return;
      
      const response = await fetch('/api/admin/keyvault/secrets', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Check if response is HTML
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        return;
      }

      if (!response.ok) return;

      const data = await response.json();
      setSecrets(data.data.secrets || []);
    } catch (err: any) {
      console.error('Error loading secrets:', err);
    }
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!setupForm.keyVaultUrl) {
      toast.error('Key Vault URL is required');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/admin/keyvault/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(setupForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initialize Key Vault');
      }

      const data = await response.json();
      toast.success('Key Vault initialized successfully!');
      setShowSetupForm(false);
      await loadKeyVaultStatus();
    } catch (err: any) {
      console.error('Setup error:', err);
      toast.error(`Setup failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!secretForm.name || !secretForm.value) {
      toast.error('Secret name and value are required');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/admin/keyvault/secrets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          secretName: secretForm.name,
          secretValue: secretForm.value,
          contentType: secretForm.contentType
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add secret');
      }

      toast.success(`Secret '${secretForm.name}' added successfully!`);
      setSecretForm({ name: '', value: '', contentType: 'text/plain' });
      setShowAddSecretForm(false);
      await loadSecrets();
    } catch (err: any) {
      console.error('Add secret error:', err);
      toast.error(`Failed to add secret: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !keyVaultStatus) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
        <div className="p-6">
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading Key Vault status...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Azure Key Vault Management
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Secure storage for API keys, passwords, and sensitive configuration
          </p>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center">
                  {keyVaultStatus?.enabled ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">Enabled</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                      <span className="text-sm font-medium text-amber-800 dark:text-amber-200">Disabled</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Integration Status</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center">
                  {keyVaultStatus?.initialized ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">Connected</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                      <span className="text-sm font-medium text-amber-800 dark:text-amber-200">Disconnected</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Connection Status</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center">
                  <Key className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{secrets.length} Secrets</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Stored in Vault</p>
              </div>
            </div>

            {/* Key Vault URL */}
            {keyVaultStatus?.keyVaultUrl && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Key Vault URL</p>
                <code className="text-sm text-gray-600 dark:text-gray-300 break-all">
                  {keyVaultStatus.keyVaultUrl}
                </code>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={loadKeyVaultStatus}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Refresh Status
              </button>
              
              <button
                onClick={() => setShowSetupForm(!showSetupForm)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Settings className="h-4 w-4 mr-2" />
                Configure Key Vault
              </button>
              
              {keyVaultStatus?.enabled && (
                <button
                  onClick={() => setShowAddSecretForm(!showAddSecretForm)}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Secret
                </button>
              )}
            </div>

            {/* Key Vault Setup Form */}
            {showSetupForm && (
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Configure Azure Key Vault
                </h3>
                <form onSubmit={handleSetupSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="keyVaultUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Key Vault URL *
                    </label>
                    <input
                      id="keyVaultUrl"
                      type="url"
                      required
                      placeholder="https://your-keyvault.vault.azure.net/"
                      value={setupForm.keyVaultUrl}
                      onChange={(e) => setSetupForm({ ...setupForm, keyVaultUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="tenantId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tenant ID
                      </label>
                      <input
                        id="tenantId"
                        type="text"
                        placeholder="Azure AD Tenant ID"
                        value={setupForm.tenantId}
                        onChange={(e) => setSetupForm({ ...setupForm, tenantId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Client ID
                      </label>
                      <input
                        id="clientId"
                        type="text"
                        placeholder="Service Principal Client ID"
                        value={setupForm.clientId}
                        onChange={(e) => setSetupForm({ ...setupForm, clientId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="clientSecret" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Client Secret
                      </label>
                      <input
                        id="clientSecret"
                        type="password"
                        placeholder="Service Principal Secret"
                        value={setupForm.clientSecret}
                        onChange={(e) => setSetupForm({ ...setupForm, clientSecret: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      * Key Vault URL is required. Other fields are optional if using managed identity.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowSetupForm(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        {loading ? 'Initializing...' : 'Initialize Key Vault'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Add Secret Form */}
            {showAddSecretForm && keyVaultStatus?.enabled && (
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Add New Secret
                </h3>
                <form onSubmit={handleAddSecret} className="space-y-4">
                  <div>
                    <label htmlFor="secretName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Secret Name *
                    </label>
                    <input
                      id="secretName"
                      type="text"
                      required
                      placeholder="e.g., openai-api-key, database-connection-string"
                      value={secretForm.name}
                      onChange={(e) => setSecretForm({ ...secretForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Use descriptive names like 'openai-api-key' or 'database-connection-string'
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="secretValue" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Secret Value *
                    </label>
                    <textarea
                      id="secretValue"
                      required
                      rows={3}
                      placeholder="Enter the secret value (API key, connection string, etc.)"
                      value={secretForm.value}
                      onChange={(e) => setSecretForm({ ...secretForm, value: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="contentType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Content Type
                    </label>
                    <select
                      id="contentType"
                      value={secretForm.contentType}
                      onChange={(e) => setSecretForm({ ...secretForm, contentType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="text/plain">Text/Plain</option>
                      <option value="application/json">JSON</option>
                      <option value="application/x-connection-string">Connection String</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Secrets are encrypted and stored securely in Azure Key Vault
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddSecretForm(false);
                          setSecretForm({ name: '', value: '', contentType: 'text/plain' });
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        {loading ? 'Adding...' : 'Add Secret'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Secrets List */}
            {keyVaultStatus?.enabled && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Stored Secrets ({secrets.length})
                </h3>
                {secrets.length > 0 ? (
                  <div className="space-y-2">
                    {secrets.map((secretName) => (
                      <div key={secretName} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4 text-gray-400" />
                          <code className="text-sm text-gray-900 dark:text-gray-100">{secretName}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                    <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No secrets found in Key Vault</p>
                    <p className="text-sm">Configure Key Vault to manage secrets securely</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default KeyVaultManagement;