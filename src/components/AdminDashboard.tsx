import React, { useState } from 'react';
import { 
  Users, 
  Settings, 
  Database, 
  Key, 
  Cloud, 
  Shield, 
  Activity,
  LogOut,
  Menu,
  X,
  MessageSquare,
  MoveLeftIcon
} from 'lucide-react';
import UserManagement from './admin/UserManagement';
import ConfigurationManagement from './admin/ConfigurationManagement';
import SystemMonitoring from './admin/SystemMonitoring';
import DislikedMessagesManagement from './admin/DislikedMessagesManagement';
import FeedbackManagement from './admin/FeedbackManagement';
import DataQueryPanel from './DataQueryPanel';
import WorkspaceManagement from './admin/WorkspaceManagement';
import KeyVaultManagement from './admin/KeyVaultManagement';

interface AdminDashboardProps {
  admin: any;
  onLogout: () => void;
}

type TabType = 'users' | 'config' | 'monitoring' | 'disliked' | 'feedback' | 'datasources' | 'workspaces' | 'keyvault';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ admin, onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const tabs = [
    { id: 'users' as TabType, name: 'User Management', icon: Users, color: 'text-blue-500' },
    { id: 'workspaces' as TabType, name: 'Workspaces', icon: Settings, color: 'text-indigo-500' },
    { id: 'config' as TabType, name: 'System Configuration', icon: Cloud, color: 'text-green-500' },
    { id: 'monitoring' as TabType, name: 'System Monitor', icon: Activity, color: 'text-orange-500' },
    { id: 'disliked' as TabType, name: 'Disliked Messages', icon: Shield, color: 'text-red-500' },
    { id: 'feedback' as TabType, name: 'User Feedback', icon: MessageSquare, color: 'text-purple-500' },
    { id: 'datasources' as TabType, name: 'Data Sources', icon: Database, color: 'text-cyan-500' },
    { id: 'keyvault' as TabType, name: 'Key Vault', icon: Key, color: 'text-amber-500' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'workspaces':
        return <WorkspaceManagement />;
      case 'config':
        return <ConfigurationManagement />;
      case 'monitoring':
        return <SystemMonitoring />;
      case 'disliked':
        return <DislikedMessagesManagement />;
      case 'feedback':
        return <FeedbackManagement />;
      case 'datasources':
        return (
          <div className="h-full overflow-auto">
            <DataQueryPanel />
          </div>
        );
      case 'keyvault':
        return <KeyVaultManagement />;
      default:
        return <UserManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-700/50 backdrop-blur-sm border-b border-slate-600/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/10  flex items-center justify-center rounded-[50%]">
              <img src="alyasra-logo.png" alt="logo" className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin Portal</h1>
              <p className="text-sm text-slate-400">AIVA Management System</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className=""></div>
              <span className="text-sm text-slate-400"></span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{admin.email}</p>
                <p className="text-xs text-slate-400">Administrator</p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-all duration-300"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-slate-700/30 backdrop-blur-sm border-r border-slate-600/30 flex flex-col`}>
          {/* Sidebar Toggle */}
          <div className="p-4 border-b border-slate-600/30">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center justify-center p-2 hover:bg-slate-600/50 rounded-lg transition-all duration-300 text-slate-400 hover:text-white"
            >
              {sidebarOpen ? <MoveLeftIcon className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-300 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'hover:bg-slate-600/50 text-slate-400 hover:text-white'
                  } ${!sidebarOpen && 'justify-center'}`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : tab.color}`} />
                  {sidebarOpen && (
                    <span className="ml-3 font-medium">{tab.name}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Content Header */}
          <div className="bg-white/5 backdrop-blur-sm border-b border-slate-600/30 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  {tabs.find(tab => tab.id === activeTab)?.name}
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Manage and configure your AIVA system
                </p>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <main className="flex-1 p-6 overflow-auto bg-slate-800/30">
            <div className="bg-white backdrop-blur-sm rounded-xl border border-slate-600/30 p-6 min-h-full">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;