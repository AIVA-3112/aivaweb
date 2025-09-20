import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Key, 
  Server, 
  Save, 
  RefreshCw, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Settings,
  Shield,
  Cloud,
  HardDrive,
  Brain,
  Activity,
  XCircle,
  ExternalLink
} from 'lucide-react';

interface ConfigSection {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  status: 'connected' | 'disconnected' | 'error' | 'configuring';
}

interface ConfigItem {
  key: string;
  label: string;
  value: string;
  type: 'text' | 'password' | 'number' | 'url';
  required: boolean;
  description?: string;
  placeholder?: string;
}

interface ServiceStatus {
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  lastChecked: string;
  endpoint?: string;
}

const ConfigurationManagement: React.FC = () => {
  const [activeSection, setActiveSection] = useState('database');
  const [configs, setConfigs] = useState<Record<string, ConfigItem[]>>({});
  const [serviceStatuses, setServiceStatuses] = useState<Record<string, ServiceStatus>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingService, setTestingService] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<string[]>([]);
  const [unsavedChanges, setUnsavedChanges] = useState<string[]>([]);

  const sections: ConfigSection[] = [
    {
      id: 'database',
      name: 'SQL Database',
      icon: Database,
      description: 'Azure SQL Database connection settings',
      status: serviceStatuses.database?.status || 'disconnected'
    },
    {
      id: 'openai',
      name: 'Azure OpenAI',
      icon: Brain,
      description: 'Azure OpenAI API configuration',
      status: serviceStatuses.openai?.status || 'disconnected'
    },
    {
      id: 'storage',
      name: 'Blob Storage',
      icon: HardDrive,
      description: 'Azure Blob Storage configuration',
      status: serviceStatuses.storage?.status || 'disconnected'
    },
    {
      id: 'identity',
      name: 'Active Directory',
      icon: Shield,
      description: 'Azure Active Directory settings',
      status: serviceStatuses.identity?.status || 'disconnected'
    },
    {
      id: 'fabric',
      name: 'Microsoft Fabric',
      icon: Activity,
      description: 'Microsoft Fabric data platform',
      status: serviceStatuses.fabric?.status || 'disconnected'
    },
    {
      id: 'security',
      name: 'Security',
      icon: Key,
      description: 'Authentication and security settings',
      status: serviceStatuses.security?.status || 'disconnected'
    }
  ];

  useEffect(() => {
    fetchConfigs();
    fetchServiceStatuses();
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await fetch('/api/admin/config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Transform backend config to our format
        setConfigs(transformBackendConfig(data));
      } else {
        throw new Error('Failed to fetch configuration');
      }
    } catch (error) {
      console.error('Failed to fetch configs:', error);
      // Load mock data for development
      loadMockConfigs();
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceStatuses = async () => {
    try {
      const response = await fetch('/api/admin/azure-services', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const statusMap = data.services.reduce((acc: any, service: any) => {
          acc[service.id.replace('-', '')] = {
            name: service.name,
            status: service.status,
            lastChecked: service.lastChecked,
            endpoint: service.endpoint || service.server || service.accountName
          };
          return acc;
        }, {});
        setServiceStatuses(statusMap);
      }
    } catch (error) {
      console.error('Failed to fetch service statuses:', error);
    }
  };

  const loadMockConfigs = () => {
    setConfigs({
      database: [
        { key: 'SQL_SERVER', label: 'Server', value: 'aiva-sql-server.database.windows.net', type: 'text', required: true, description: 'SQL Server hostname' },
        { key: 'SQL_DATABASE', label: 'Database', value: 'aiva-production', type: 'text', required: true, description: 'Database name' },
        { key: 'SQL_USERNAME', label: 'Username', value: 'aivaadmin', type: 'text', required: true, description: 'Database username' },
        { key: 'SQL_PASSWORD', label: 'Password', value: '••••••••••••', type: 'password', required: true, description: 'Database password' },
        { key: 'SQL_ENCRYPT', label: 'Encrypt Connection', value: 'true', type: 'text', required: false, description: 'Enable SSL encryption' },
        { key: 'SQL_TRUST_SERVER_CERTIFICATE', label: 'Trust Server Certificate', value: 'true', type: 'text', required: false, description: 'Trust server certificate' },
        { key: 'SQL_POOL_MAX', label: 'Max Pool Size', value: '10', type: 'number', required: false, description: 'Maximum connection pool size' },
        { key: 'SQL_POOL_MIN', label: 'Min Pool Size', value: '0', type: 'number', required: false, description: 'Minimum connection pool size' },
        { key: 'SQL_REQUEST_TIMEOUT', label: 'Request Timeout (ms)', value: '30000', type: 'number', required: false, description: 'Request timeout in milliseconds' },
        { key: 'SQL_CONNECTION_TIMEOUT', label: 'Connection Timeout (ms)', value: '15000', type: 'number', required: false, description: 'Connection timeout in milliseconds' }
      ],
      openai: [
        { key: 'AZURE_OPENAI_ENDPOINT', label: 'Azure OpenAI Endpoint', value: 'https://aiva-openai.openai.azure.com', type: 'url', required: true, description: 'Azure OpenAI service endpoint' },
        { key: 'AZURE_OPENAI_API_KEY', label: 'API Key', value: '••••••••••••••••••••••••••••••••', type: 'password', required: true, description: 'Azure OpenAI API key' },
        { key: 'AZURE_OPENAI_DEPLOYMENT_NAME', label: 'Deployment Name', value: 'gpt-4o', type: 'text', required: true, description: 'OpenAI model deployment name' }
      ],
      storage: [
        { key: 'AZURE_STORAGE_ACCOUNT_NAME', label: 'Storage Account Name', value: 'aivastorage', type: 'text', required: true, description: 'Azure Storage account name' },
        { key: 'AZURE_STORAGE_CONNECTION_STRING', label: 'Connection String', value: '••••••••••••••••••••••••••••••••', type: 'password', required: false, description: 'Storage connection string (alternative to managed identity)' },
        { key: 'AZURE_STORAGE_CONTAINER_NAME', label: 'Container Name', value: 'aiva-files', type: 'text', required: false, description: 'Default storage container name' }
      ],
      identity: [
        { key: 'AZURE_TENANT_ID', label: 'Tenant ID', value: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', type: 'text', required: true, description: 'Azure AD tenant ID' },
        { key: 'AZURE_CLIENT_ID', label: 'Client ID', value: 'f9e8d7c6-b5a4-3210-9876-543210fedcba', type: 'text', required: true, description: 'Azure AD application ID' },
        { key: 'AZURE_CLIENT_SECRET', label: 'Client Secret', value: '••••••••••••••••••••••••••••••••', type: 'password', required: true, description: 'Azure AD client secret' }
      ],
      fabric: [
        { key: 'FABRIC_WORKSPACE_ID', label: 'Workspace ID', value: '', type: 'text', required: false, description: 'Microsoft Fabric workspace ID' },
        { key: 'FABRIC_CAPACITY_ID', label: 'Capacity ID', value: '', type: 'text', required: false, description: 'Microsoft Fabric capacity ID' },
        { key: 'FABRIC_DATASET_ID', label: 'Dataset ID', value: '', type: 'text', required: false, description: 'Default dataset ID for queries' }
      ],
      security: [
        { key: 'JWT_SECRET', label: 'JWT Secret', value: '••••••••••••••••••••••••••••••••', type: 'password', required: true, description: 'Secret for JWT token signing' },
        { key: 'ADMIN_EMAILS', label: 'Admin Emails', value: 'admin@aiva.com', type: 'text', required: false, description: 'Comma-separated list of admin emails' },
        { key: 'SESSION_TIMEOUT', label: 'Session Timeout', value: '24h', type: 'text', required: false, description: 'Session expiration time' }
      ]
    });

    // Mock service statuses
    setServiceStatuses({
      database: { name: 'Azure SQL Database', status: 'connected', lastChecked: new Date().toISOString(), endpoint: 'aiva-sql-server.database.windows.net' },
      openai: { name: 'Azure OpenAI', status: 'connected', lastChecked: new Date().toISOString(), endpoint: 'aiva-openai.openai.azure.com' },
      storage: { name: 'Azure Blob Storage', status: 'connected', lastChecked: new Date().toISOString(), endpoint: 'aivastorage.blob.core.windows.net' },
      identity: { name: 'Azure Active Directory', status: 'connected', lastChecked: new Date().toISOString() },
      fabric: { name: 'Microsoft Fabric', status: 'disconnected', lastChecked: new Date().toISOString() },
      security: { name: 'Security Settings', status: 'connected', lastChecked: new Date().toISOString() }
    });
  };

  const transformBackendConfig = (backendData: any) => {
    if (!backendData?.config) return configs;
    
    const backendConfig = backendData.config;
    const transformedConfigs: Record<string, ConfigItem[]> = {};
    
    for (const [section, sectionData] of Object.entries(backendConfig)) {
      const sectionConfigs: ConfigItem[] = [];
      
      if (sectionData && typeof sectionData === 'object') {
        for (const [key, value] of Object.entries(sectionData as Record<string, string>)) {
          const configItem: ConfigItem = {
            key,
            label: formatLabel(key),
            value: value || '',
            type: getInputType(key),
            required: isRequiredField(section, key),
            description: getFieldDescription(section, key),
            placeholder: getFieldPlaceholder(key)
          };
          sectionConfigs.push(configItem);
        }
      }
      
      transformedConfigs[section] = sectionConfigs;
    }
    
    return transformedConfigs;
  };

  const formatLabel = (key: string): string => {
    return key.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const getInputType = (key: string): 'text' | 'password' | 'number' | 'url' => {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('password') || lowerKey.includes('secret') || lowerKey.includes('key')) {
      return 'password';
    }
    if (lowerKey.includes('endpoint') || lowerKey.includes('url') || lowerKey.includes('server')) {
      return 'url';
    }
    if (lowerKey.includes('timeout') || lowerKey.includes('pool') || lowerKey.includes('port')) {
      return 'number';
    }
    return 'text';
  };

  const isRequiredField = (section: string, key: string): boolean => {
    const requiredFields: Record<string, string[]> = {
      database: ['SQL_SERVER', 'SQL_DATABASE', 'SQL_USERNAME', 'SQL_PASSWORD'],
      openai: ['AZURE_OPENAI_ENDPOINT', 'AZURE_OPENAI_API_KEY'],
      storage: ['AZURE_STORAGE_ACCOUNT_NAME'],
      identity: ['AZURE_TENANT_ID', 'AZURE_CLIENT_ID', 'AZURE_CLIENT_SECRET'],
      security: ['JWT_SECRET']
    };
    return requiredFields[section]?.includes(key) || false;
  };

  const getFieldDescription = (section: string, key: string): string => {
    const descriptions: Record<string, string> = {
      'SQL_SERVER': 'SQL Server hostname or IP address',
      'SQL_DATABASE': 'Name of the SQL database',
      'SQL_USERNAME': 'Database user account',
      'SQL_PASSWORD': 'Database user password',
      'AZURE_OPENAI_ENDPOINT': 'Azure OpenAI service endpoint URL',
      'AZURE_OPENAI_API_KEY': 'Azure OpenAI API access key',
      'AZURE_OPENAI_DEPLOYMENT_NAME': 'Name of the OpenAI model deployment',
      'AZURE_STORAGE_ACCOUNT_NAME': 'Azure Storage account name',
      'AZURE_STORAGE_CONNECTION_STRING': 'Storage connection string (optional)',
      'AZURE_STORAGE_CONTAINER_NAME': 'Default storage container name',
      'AZURE_TENANT_ID': 'Azure Active Directory tenant ID',
      'AZURE_CLIENT_ID': 'Azure AD application (client) ID',
      'AZURE_CLIENT_SECRET': 'Azure AD client secret value',
      'JWT_SECRET': 'Secret key for JWT token signing',
      'ADMIN_EMAILS': 'Comma-separated list of admin email addresses'
    };
    return descriptions[key] || '';
  };

  const getFieldPlaceholder = (key: string): string => {
    const placeholders: Record<string, string> = {
      'SQL_SERVER': 'server.database.windows.net',
      'SQL_DATABASE': 'mydatabase',
      'SQL_USERNAME': 'adminuser',
      'AZURE_OPENAI_ENDPOINT': 'https://myopenai.openai.azure.com',
      'AZURE_OPENAI_DEPLOYMENT_NAME': 'gpt-4o',
      'AZURE_STORAGE_ACCOUNT_NAME': 'mystorageaccount',
      'AZURE_STORAGE_CONTAINER_NAME': 'aiva-files',
      'ADMIN_EMAILS': 'admin@company.com,manager@company.com'
    };
    return placeholders[key] || '';
  };

  const handleConfigChange = (section: string, key: string, value: string) => {
    setConfigs(prev => ({
      ...prev,
      [section]: prev[section]?.map(item => 
        item.key === key ? { ...item, value } : item
      ) || []
    }));

    const changeKey = `${section}.${key}`;
    if (!unsavedChanges.includes(changeKey)) {
      setUnsavedChanges(prev => [...prev, changeKey]);
    }
  };

  const handleSaveSection = async (section: string) => {
    setSaving(true);
    
    try {
      const sectionConfigs = configs[section] || [];
      const configData = sectionConfigs.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {} as Record<string, string>);

      const response = await fetch(`/api/admin/config/${section}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(configData)
      });

      if (response.ok) {
        const result = await response.json();
        // Remove saved changes from unsaved list
        setUnsavedChanges(prev => 
          prev.filter(change => !change.startsWith(`${section}.`))
        );
        
        // Update service status
        await testServiceConnection(section);
        
        // Show success message
        console.log(`✅ ${section} configuration saved successfully`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Failed to save config:', error);
    } finally {
      setSaving(false);
    }
  };

  const testServiceConnection = async (serviceId: string) => {
    setTestingService(serviceId);
    
    try {
      const response = await fetch(`/api/admin/config/${serviceId}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update service status
        setServiceStatuses(prev => ({
          ...prev,
          [serviceId]: {
            ...prev[serviceId],
            status: data.success ? 'connected' : 'error',
            lastChecked: new Date().toISOString()
          }
        }));
        
        // Log test result
        if (data.success) {
          console.log(`✅ ${serviceId} connection test passed`);
        } else {
          console.warn(`⚠️ ${serviceId} connection test failed: ${data.error}`);
        }
      } else {
        throw new Error('Test request failed');
      }
    } catch (error) {
      console.error('Service test failed:', error);
      setServiceStatuses(prev => ({
        ...prev,
        [serviceId]: {
          ...prev[serviceId],
          status: 'error',
          lastChecked: new Date().toISOString()
        }
      }));
    } finally {
      setTestingService(null);
    }
  };

  const togglePasswordVisibility = (key: string) => {
    setVisiblePasswords(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'configuring':
        return <Settings className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'configuring':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const currentSectionConfigs = configs[activeSection] || [];
  const sectionHasUnsavedChanges = unsavedChanges.some(change => change.startsWith(`${activeSection}.`));
  const currentService = serviceStatuses[activeSection];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">System Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Manage Azure services and system settings
          </p>
        </div>
        {unsavedChanges.length > 0 && (
          <div className="flex items-center space-x-2 text-orange-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">{unsavedChanges.length} unsaved changes</span>
          </div>
        )}
      </div>

      {/* Services Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-foreground">
                {Object.values(serviceStatuses).filter(s => s.status === 'connected').length}
              </p>
              <p className="text-sm text-muted-foreground">Connected</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-foreground">
                {Object.values(serviceStatuses).filter(s => s.status === 'error').length}
              </p>
              <p className="text-sm text-muted-foreground">Errors</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-foreground">
                {Object.values(serviceStatuses).filter(s => s.status === 'disconnected').length}
              </p>
              <p className="text-sm text-muted-foreground">Disconnected</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-3">Services</h4>
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                const hasUnsaved = unsavedChanges.some(change => change.startsWith(`${section.id}.`));
                const serviceStatus = serviceStatuses[section.id];
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-all ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{section.name}</span>
                        <div className="flex items-center space-x-1">
                          {hasUnsaved && (
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          )}
                          {getStatusIcon(serviceStatus?.status || 'disconnected')}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-card border border-border rounded-lg">
            {/* Section Header */}
            <div className="border-b border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3">
                    <h4 className="text-lg font-semibold text-foreground">
                      {sections.find(s => s.id === activeSection)?.name}
                    </h4>
                    {currentService && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentService.status)}`}>
                        {currentService.status.charAt(0).toUpperCase() + currentService.status.slice(1)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {sections.find(s => s.id === activeSection)?.description}
                  </p>
                  {currentService?.endpoint && (
                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                      <span>Endpoint: </span>
                      <span className="font-mono ml-1">{currentService.endpoint}</span>
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => testServiceConnection(activeSection)}
                    disabled={testingService === activeSection}
                    className="flex items-center px-3 py-2 text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${testingService === activeSection ? 'animate-spin' : ''}`} />
                    Test
                  </button>
                  <button
                    onClick={() => handleSaveSection(activeSection)}
                    disabled={!sectionHasUnsavedChanges || saving}
                    className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>

            {/* Configuration Form */}
            <div className="p-6 space-y-6">
              {currentSectionConfigs.map((config) => (
                <div key={config.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-foreground">
                      {config.label}
                      {config.required && <span className="text-destructive ml-1">*</span>}
                    </label>
                    {config.type === 'password' && (
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(config.key)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {visiblePasswords.includes(config.key) ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                  
                  <input
                    type={
                      config.type === 'password' && !visiblePasswords.includes(config.key)
                        ? 'password'
                        : config.type === 'number'
                        ? 'number'
                        : 'text'
                    }
                    value={config.value}
                    onChange={(e) => handleConfigChange(activeSection, config.key, e.target.value)}
                    placeholder={config.placeholder || config.description}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                    required={config.required}
                  />
                  
                  {config.description && (
                    <p className="text-xs text-muted-foreground">{config.description}</p>
                  )}
                  
                  {unsavedChanges.includes(`${activeSection}.${config.key}`) && (
                    <div className="flex items-center text-orange-600 text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Unsaved changes
                    </div>
                  )}
                </div>
              ))}

              {currentSectionConfigs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No configuration items available for this section.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationManagement;