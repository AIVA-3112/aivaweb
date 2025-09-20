import React, { useState, useEffect } from 'react';
import { X, Database, Play, BarChart3, Table, Download, Copy } from 'lucide-react';

interface DataQueryPanelProps {
  onClose?: () => void;
}

interface Dataset {
  id: string;
  name: string;
  workspace: string;
  tables: string[];
  lastRefresh: string;
  connectionType: 'fabric' | 'sql-server' | 'mysql' | 'postgresql' | 'oracle' | 'mongodb';
  status: 'connected' | 'disconnected' | 'error';
}

interface DatabaseConnection {
  id: string;
  name: string;
  type: 'fabric' | 'sql-server' | 'mysql' | 'postgresql' | 'oracle' | 'mongodb';
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  status: 'connected' | 'disconnected' | 'error';
  lastConnected?: string;
  isDefault: boolean;
}

interface QueryResult {
  answer: string;
  data?: {
    rowCount: number;
    columns: string[];
    executionTime: number;
    queryType: string;
    cached: boolean;
    preview: any[];
  };
  query?: string;
  queryType?: string;
  visualization?: any;
  confidence: number;
  executionTime: number;
  tokens: number;
}

const DataQueryPanel: React.FC<DataQueryPanelProps> = ({ onClose }) => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [selectedConnection, setSelectedConnection] = useState<string>('');
  const [question, setQuestion] = useState('');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'question' | 'query' | 'connections' | 'results'>('question');
  const [directQuery, setDirectQuery] = useState('');
  const [queryType, setQueryType] = useState<'sql' | 'dax'>('sql');
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [newConnection, setNewConnection] = useState({
    name: '',
    type: 'sql-server' as const,
    host: '',
    port: 1433,
    database: '',
    username: '',
    password: '',
    isDefault: false
  });

  // Sample questions for different scenarios
  const sampleQuestions = [
    "What are the top 5 performing products this month?",
    "Show me sales trends over the last 6 months",
    "What is the total revenue for this quarter?",
    "Which customers have the highest order values?",
    "How many orders were placed last week?",
    "What is the average order value by region?",
    "Show me inventory levels for low-stock items",
    "What are the most popular product categories?"
  ];

  useEffect(() => {
    loadDatasets();
    loadConnections();
  }, []);

  const loadDatasets = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/data/datasets`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDatasets(data.datasets || []);
        if (data.datasets?.length > 0) {
          setSelectedDataset(data.datasets[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load datasets:', error);
      setError('Failed to load available datasets');
    }
  };

  const loadConnections = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/data/connections`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConnections(data.connections || []);
        const defaultConnection = data.connections?.find((conn: DatabaseConnection) => conn.isDefault);
        if (defaultConnection) {
          setSelectedConnection(defaultConnection.id);
        }
      }
    } catch (error) {
      console.error('Failed to load connections:', error);
      setError('Failed to load database connections');
    }
  };

  const handleCreateConnection = async () => {
    if (!newConnection.name.trim() || !newConnection.host.trim()) {
      setError('Connection name and host are required');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/data/connections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(newConnection)
      });
      
      if (response.ok) {
        await loadConnections();
        setShowConnectionModal(false);
        setNewConnection({
          name: '',
          type: 'sql-server',
          host: '',
          port: 1433,
          database: '',
          username: '',
          password: '',
          isDefault: false
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create connection');
      }
    } catch (error) {
      setError('Network error occurred while creating connection');
    }
  };

  const handleTestConnection = async (connectionId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/data/connections/${connectionId}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        await loadConnections();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Connection test failed');
      }
    } catch (error) {
      setError('Network error occurred while testing connection');
    }
  };

  const handleDeleteConnection = async (connectionId: string) => {
    if (!confirm('Are you sure you want to delete this connection?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/data/connections/${connectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        await loadConnections();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete connection');
      }
    } catch (error) {
      setError('Network error occurred while deleting connection');
    }
  };

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'fabric': return '🏢';
      case 'sql-server': return '🗄️';
      case 'mysql': return '🐬';
      case 'postgresql': return '🐘';
      case 'oracle': return '🔶';
      case 'mongodb': return '🍃';
      default: return '💾';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'disconnected': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleQuestionSubmit = async () => {
    if (!question.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/data/question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          question,
          datasetId: selectedDataset || undefined,
          connectionId: selectedConnection || undefined,
          includeVisualization: true
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setQueryResult(data.result);
        setActiveTab('results');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to process question');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectQuery = async () => {
    if (!directQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/data/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          query: directQuery,
          queryType,
          datasetId: queryType === 'dax' ? selectedDataset : undefined,
          connectionId: selectedConnection || undefined
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setQueryResult({
          answer: `Query executed successfully. Retrieved ${data.result.rowCount} rows in ${data.result.executionTime}ms.`,
          data: data.result,
          query: directQuery,
          queryType,
          confidence: 1.0,
          executionTime: data.result.executionTime,
          tokens: 0
        });
        setActiveTab('results');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to execute query');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={`${onClose ? 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' : 'h-full flex flex-col'}`}>
      <div className={`bg-white rounded-lg flex flex-col ${onClose ? 'w-full max-w-6xl h-5/6 mx-4' : 'w-full h-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Database className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Data Insights</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Dataset Selection */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Connection:</label>
              <select
                value={selectedConnection}
                onChange={(e) => setSelectedConnection(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a connection</option>
                {connections.map((connection) => (
                  <option key={connection.id} value={connection.id}>
                    {getConnectionIcon(connection.type)} {connection.name} ({connection.type})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Dataset:</label>
              <select
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a dataset</option>
                {datasets.map((dataset) => (
                  <option key={dataset.id} value={dataset.id}>
                    {getConnectionIcon(dataset.connectionType)} {dataset.name} ({dataset.workspace})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('question')}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'question'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Ask Question
          </button>
          <button
            onClick={() => setActiveTab('query')}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'query'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Direct Query
          </button>
          <button
            onClick={() => setActiveTab('connections')}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'connections'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Connections
          </button>
          {queryResult && (
            <button
              onClick={() => setActiveTab('results')}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'results'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Results
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'question' && (
            <div className="p-6 h-full flex flex-col">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ask a question about your data:
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g., What are the top 5 performing products this month?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Sample Questions:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {sampleQuestions.map((sample, index) => (
                    <button
                      key={index}
                      onClick={() => setQuestion(sample)}
                      className="text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded border border-blue-200 transition-colors"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleQuestionSubmit}
                disabled={loading || !question.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>{loading ? 'Processing...' : 'Ask Question'}</span>
              </button>
            </div>
          )}

          {activeTab === 'query' && (
            <div className="p-6 h-full flex flex-col">
              <div className="mb-4">
                <div className="flex items-center space-x-4 mb-2">
                  <label className="text-sm font-medium text-gray-700">Query Type:</label>
                  <select
                    value={queryType}
                    onChange={(e) => setQueryType(e.target.value as 'sql' | 'dax')}
                    className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sql">SQL</option>
                    <option value="dax">DAX</option>
                  </select>
                </div>
                <textarea
                  value={directQuery}
                  onChange={(e) => setDirectQuery(e.target.value)}
                  placeholder={queryType === 'sql' ? 'SELECT * FROM [Table] WHERE...' : 'EVALUATE TOPN(10, [Table])'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  rows={8}
                />
              </div>

              <button
                onClick={handleDirectQuery}
                disabled={loading || !directQuery.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>{loading ? 'Executing...' : 'Execute Query'}</span>
              </button>
            </div>
          )}

          {activeTab === 'connections' && (
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Database Connections</h3>
                <button
                  onClick={() => setShowConnectionModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Database className="w-4 h-4" />
                  <span>Add Connection</span>
                </button>
              </div>

              <div className="space-y-4 flex-1 overflow-auto">
                {connections.length === 0 ? (
                  <div className="text-center py-12">
                    <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No database connections</h3>
                    <p className="text-gray-500 mb-4">Connect to your databases to start querying data</p>
                    <button
                      onClick={() => setShowConnectionModal(true)}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Add Your First Connection
                    </button>
                  </div>
                ) : (
                  connections.map((connection) => (
                    <div
                      key={connection.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{getConnectionIcon(connection.type)}</div>
                          <div>
                            <h4 className="font-semibold text-gray-800 flex items-center space-x-2">
                              <span>{connection.name}</span>
                              {connection.isDefault && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Default</span>
                              )}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {connection.type.toUpperCase()} • {connection.host}
                              {connection.port && `:${connection.port}`}
                              {connection.database && ` • ${connection.database}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(connection.status)}`}>
                            {connection.status}
                          </span>
                          <button
                            onClick={() => handleTestConnection(connection.id)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                          >
                            Test
                          </button>
                          <button
                            onClick={() => handleDeleteConnection(connection.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      {connection.lastConnected && (
                        <div className="mt-2 text-xs text-gray-500">
                          Last connected: {new Date(connection.lastConnected).toLocaleString()}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'results' && queryResult && (
            <div className="p-6 h-full overflow-auto">
              {/* AI Response */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Analysis</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-gray-800">{queryResult.answer}</p>
                </div>
              </div>

              {/* Query Info */}
              {queryResult.query && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">Generated Query</h3>
                    <button
                      onClick={() => copyToClipboard(queryResult.query!)}
                      className="flex items-center space-x-1 px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-sm overflow-x-auto">
                    {queryResult.query}
                  </pre>
                </div>
              )}

              {/* Data Results */}
              {queryResult.data && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">Data Results</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{queryResult.data.rowCount} rows</span>
                      <span>{queryResult.data.executionTime}ms</span>
                      <span>{queryResult.data.queryType?.toUpperCase()}</span>
                      {queryResult.data.cached && <span className="text-green-600">Cached</span>}
                    </div>
                  </div>
                  
                  {queryResult.data.preview && queryResult.data.preview.length > 0 && (
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {queryResult.data.columns.map((column, index) => (
                                <th
                                  key={index}
                                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  {column}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {queryResult.data.preview.slice(0, 20).map((row, rowIndex) => (
                              <tr key={rowIndex}>
                                {queryResult.data!.columns.map((column, colIndex) => (
                                  <td
                                    key={colIndex}
                                    className="px-4 py-2 whitespace-nowrap text-sm text-gray-900"
                                  >
                                    {row[column] !== null && row[column] !== undefined 
                                      ? String(row[column]) 
                                      : 'NULL'
                                    }
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {queryResult.data.rowCount > 20 && (
                        <div className="bg-gray-50 px-4 py-2 text-sm text-gray-600 text-center">
                          Showing first 20 rows of {queryResult.data.rowCount} total rows
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Performance Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Confidence:</span>
                    <span className="ml-2 font-medium">{Math.round(queryResult.confidence * 100)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Time:</span>
                    <span className="ml-2 font-medium">{queryResult.executionTime}ms</span>
                  </div>
                  <div>
                    <span className="text-gray-600">AI Tokens:</span>
                    <span className="ml-2 font-medium">{queryResult.tokens}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Query Type:</span>
                    <span className="ml-2 font-medium">{queryResult.queryType?.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border-t border-red-200">
            <div className="text-red-800 text-sm">{error}</div>
          </div>
        )}
      </div>

      {/* Add Connection Modal */}
      {showConnectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg h-full max-h-[95vh] overflow-y-auto mx-2">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Add Database Connection</h3>
                <button
                  onClick={() => setShowConnectionModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {/* Connection Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Connection Name
                  </label>
                  <input
                    type="text"
                    value={newConnection.name}
                    onChange={(e) => setNewConnection(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Production Database"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Database Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Database Type
                  </label>
                  <select
                    value={newConnection.type}
                    onChange={(e) => {
                      const type = e.target.value as any;
                      setNewConnection(prev => ({ 
                        ...prev, 
                        type,
                        port: type === 'mysql' ? 3306 : 
                              type === 'postgresql' ? 5432 : 
                              type === 'oracle' ? 1521 :
                              type === 'mongodb' ? 27017 : 1433
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="fabric">Microsoft Fabric</option>
                    <option value="sql-server">SQL Server</option>
                    <option value="mysql">MySQL</option>
                    <option value="postgresql">PostgreSQL</option>
                    <option value="oracle">Oracle</option>
                    <option value="mongodb">MongoDB</option>
                  </select>
                </div>

                {/* Connection Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Host/Server
                    </label>
                    <input
                      type="text"
                      value={newConnection.host}
                      onChange={(e) => setNewConnection(prev => ({ ...prev, host: e.target.value }))}
                      placeholder="localhost or server.domain.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Port
                    </label>
                    <input
                      type="number"
                      value={newConnection.port}
                      onChange={(e) => setNewConnection(prev => ({ ...prev, port: parseInt(e.target.value) || 1433 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Database Name
                  </label>
                  <input
                    type="text"
                    value={newConnection.database}
                    onChange={(e) => setNewConnection(prev => ({ ...prev, database: e.target.value }))}
                    placeholder="database_name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={newConnection.username}
                      onChange={(e) => setNewConnection(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="username"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={newConnection.password}
                      onChange={(e) => setNewConnection(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Default Connection */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={newConnection.isDefault}
                    onChange={(e) => setNewConnection(prev => ({ ...prev, isDefault: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                    Set as default connection
                  </label>
                </div>

                {/* Connection Help */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Connection Tips:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Ensure your database allows connections from this application</li>
                    <li>• For cloud databases, whitelist the application's IP address</li>
                    <li>• Use read-only credentials when possible for security</li>
                    <li>• Test the connection before saving</li>
                  </ul>
                </div>
              </div>

              <div className="flex space-x-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={() => setShowConnectionModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateConnection}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Create Connection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataQueryPanel;