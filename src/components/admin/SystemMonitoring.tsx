import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Server, 
  Database, 
  Users, 
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  HardDrive,
  Cpu,
  MemoryStick
} from 'lucide-react';

interface SystemMetric {
  id: string;
  name: string;
  value: string;
  change: string;
  status: 'good' | 'warning' | 'error';
  icon: React.ComponentType<any>;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  source: string;
}

const SystemMonitoring: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchSystemMetrics();
    fetchSystemLogs();
    
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        updateMetrics();
        addNewLog();
      }, 10000); // Refresh every 10 seconds for real-time feel
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, selectedTimeRange]);

  const fetchSystemMetrics = async () => {
    try {
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch system metrics:', error);
      setLoading(false);
    }
  };

  const fetchSystemLogs = async () => {
    // Initial logs will be set in the mock data useEffect
  };

  const updateMetrics = () => {
    setMetrics(prev => prev.map(metric => {
      const change = (Math.random() - 0.5) * 10; // Random change between -5 and +5
      let newValue = metric.value;
      
      // Update values with some randomness
      if (metric.id === 'cpu') {
        const current = parseInt(metric.value);
        const updated = Math.max(10, Math.min(90, current + change));
        newValue = `${Math.round(updated)}%`;
      } else if (metric.id === 'memory') {
        const current = parseInt(metric.value);
        const updated = Math.max(30, Math.min(95, current + change));
        newValue = `${Math.round(updated)}%`;
      } else if (metric.id === 'active-users') {
        const current = parseInt(metric.value.replace(',', ''));
        const updated = Math.max(1000, current + Math.round(Math.random() * 100 - 50));
        newValue = updated.toLocaleString();
      } else if (metric.id === 'messages-today') {
        const current = parseInt(metric.value.replace(',', ''));
        const updated = current + Math.round(Math.random() * 50);
        newValue = updated.toLocaleString();
      }
      
      return {
        ...metric,
        value: newValue,
        change: change > 0 ? `+${Math.round(change)}%` : `${Math.round(change)}%`
      };
    }));
  };

  const addNewLog = () => {
    const logMessages = [
      'Database query optimization completed',
      'User session initiated successfully',
      'Cache refresh completed',
      'Backup process started',
      'API rate limit warning threshold reached',
      'New user registration completed',
      'File upload processed successfully',
      'Azure service health check passed',
      'Memory usage within normal parameters',
      'Network latency optimization applied'
    ];
    
    const levels: ('info' | 'warning' | 'error')[] = ['info', 'info', 'info', 'warning', 'error'];
    const sources = ['api-server', 'database', 'auth-service', 'storage-service', 'monitoring'];
    
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      level: levels[Math.floor(Math.random() * levels.length)],
      message: logMessages[Math.floor(Math.random() * logMessages.length)],
      source: sources[Math.floor(Math.random() * sources.length)]
    };
    
    setLogs(prev => [newLog, ...prev.slice(0, 9)]); // Keep only last 10 logs
  };

  // Mock data - in real app this would come from the backend
  useEffect(() => {
    if (!loading && metrics.length === 0) {
      setMetrics([
        {
          id: 'cpu',
          name: 'CPU Usage',
          value: '45%',
          change: '+2%',
          status: 'good',
          icon: Cpu
        },
        {
          id: 'memory',
          name: 'Memory Usage',
          value: '78%',
          change: '+5%',
          status: 'warning',
          icon: MemoryStick
        },
        {
          id: 'disk',
          name: 'Disk Usage',
          value: '23%',
          change: '+1%',
          status: 'good',
          icon: HardDrive
        },
        {
          id: 'active-users',
          name: 'Active Users',
          value: '1,247',
          change: '+12%',
          status: 'good',
          icon: Users
        },
        {
          id: 'messages-today',
          name: 'Messages Today',
          value: '8,432',
          change: '+18%',
          status: 'good',
          icon: MessageSquare
        },
        {
          id: 'db-connections',
          name: 'DB Connections',
          value: '15/100',
          change: '+3',
          status: 'good',
          icon: Database
        },
        {
          id: 'response-time',
          name: 'Avg Response Time',
          value: '127ms',
          change: '-5ms',
          status: 'good',
          icon: Clock
        },
        {
          id: 'uptime',
          name: 'System Uptime',
          value: '99.9%',
          change: '0%',
          status: 'good',
          icon: Activity
        }
      ]);

      setLogs([
        {
          id: '1',
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'User authentication successful',
          source: 'auth-service'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 5000).toISOString(),
          level: 'warning',
          message: 'High memory usage detected',
          source: 'system-monitor'
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 10000).toISOString(),
          level: 'info',
          message: 'Database backup completed successfully',
          source: 'backup-service'
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 15000).toISOString(),
          level: 'error',
          message: 'Failed to connect to Azure OpenAI service',
          source: 'openai-service'
        },
        {
          id: '5',
          timestamp: new Date(Date.now() - 20000).toISOString(),
          level: 'info',
          message: 'New user registration',
          source: 'user-service'
        }
      ]);
    }
  }, [loading, metrics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'text-blue-600 bg-blue-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getLogLevelIcon = (level: string) => {
    switch (level) {
      case 'info':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">System Monitoring</h3>
          <p className="text-sm text-muted-foreground">
            Real-time system performance and health metrics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
          <label className="flex items-center space-x-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-border"
            />
            <span>Auto-refresh</span>
          </label>
        </div>
      </div>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(metric.status)}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-foreground">{metric.name}</p>
                    <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                  </div>
                </div>
                <div className={`text-right ${
                  metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp className="h-4 w-4 mb-1" />
                  <p className="text-sm font-medium">{metric.change}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Health */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="text-lg font-semibold text-foreground mb-4">System Health</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Overall Status</span>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm font-medium text-foreground">Healthy</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Critical Issues</span>
              <span className="text-sm font-medium text-foreground">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Warnings</span>
              <span className="text-sm font-medium text-foreground">2</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Updated</span>
              <span className="text-sm font-medium text-foreground">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* Service Status */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="text-lg font-semibold text-foreground mb-4">Service Status</h4>
          <div className="space-y-3">
            {[
              { name: 'API Server', status: 'good' },
              { name: 'Database', status: 'good' },
              { name: 'Azure OpenAI', status: 'good' },
              { name: 'Blob Storage', status: 'good' },
              { name: 'Authentication', status: 'good' }
            ].map((service, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{service.name}</span>
                <div className="flex items-center">
                  {service.status === 'good' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h4>
          <div className="space-y-3">
            <button className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all">
              Restart Services
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all">
              Clear Cache
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all">
              Export Logs
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all">
              Run Health Check
            </button>
          </div>
        </div>
      </div>

      {/* System Logs */}
      <div className="bg-card border border-border rounded-lg">
        <div className="border-b border-border p-6">
          <h4 className="text-lg font-semibold text-foreground">Recent System Logs</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Latest system events and notifications
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start space-x-3 p-3 hover:bg-muted/30 rounded-lg transition-colors"
              >
                <div className={`flex items-center justify-center w-6 h-6 rounded-full ${getLogLevelColor(log.level)}`}>
                  {getLogLevelIcon(log.level)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{log.message}</p>
                    <time className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </time>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Source: {log.source}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitoring;