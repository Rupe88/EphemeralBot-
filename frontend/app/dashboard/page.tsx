'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Bot,
  LogOut,
  Settings,
  Plus,
  Trash2,
  Clock,
  Users,
  MessageSquare,
} from 'lucide-react';
import { AnimatedButton } from '../../components/ui/Button';

interface Server {
  id: string;
  name: string;
  icon: string | null;
  botPresent: boolean;
  subscription: 'free' | 'premium';
  stats: {
    totalMessagesTracked: number;
    totalMessagesDeleted: number;
    channelsWithRules: number;
  };
}

interface ChannelRule {
  _id: string;
  serverId: string;
  channelId: string;
  channelName: string;
  expirationHours: number;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [channelRules, setChannelRules] = useState<ChannelRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('auth-token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        }/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        localStorage.removeItem('auth-token');
        router.push('/login');
        return;
      }

      const userData = await response.json();
      setUser(userData);
      setIsAuthenticated(true);
      fetchServers(token);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    }
  };

  const fetchServers = async (token: string) => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        }/api/servers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const serversData = await response.json();
        setServers(serversData);
        if (serversData.length > 0) {
          setSelectedServer(serversData[0]);
          fetchChannelRules(serversData[0].id, token);
        }
      }
    } catch (error) {
      console.error('Failed to fetch servers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChannelRules = async (serverId: string, token: string) => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        }/api/servers/${serverId}/channels`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const rules = await response.json();
        setChannelRules(rules);
      }
    } catch (error) {
      console.error('Failed to fetch channel rules:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    router.push('/');
  };

  const handleServerSelect = (server: Server) => {
    setSelectedServer(server);
    const token = localStorage.getItem('auth-token');
    if (token) {
      fetchChannelRules(server.id, token);
    }
  };

  const createChannelRule = async (
    channelId: string,
    channelName: string,
    expirationHours: number
  ) => {
    if (!selectedServer) return;

    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        }/api/servers/${selectedServer.id}/channels`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            channelId,
            channelName,
            expirationHours,
          }),
        }
      );

      if (response.ok) {
        const newRule = await response.json();
        setChannelRules([...channelRules, newRule]);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create rule');
      }
    } catch (error) {
      console.error('Failed to create channel rule:', error);
      alert('Failed to create channel rule');
    }
  };

  const deleteChannelRule = async (ruleId: string) => {
    if (!selectedServer) return;

    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        }/api/servers/${selectedServer.id}/channels/${ruleId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setChannelRules(channelRules.filter((rule) => rule._id !== ruleId));
      }
    } catch (error) {
      console.error('Failed to delete channel rule:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-16 h-16 border-4 border-discord-blurple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Bot className="h-8 w-8 text-discord-blurple" />
              <h1 className="text-2xl font-bold text-gray-900">
                EphemeralBot Dashboard
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-2">
                  <img
                    src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`}
                    alt={user.username}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-gray-700 font-medium">
                    {user.username}
                  </span>
                </div>
              )}
              <AnimatedButton
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </AnimatedButton>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Server Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Your Servers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {servers.map((server) => (
              <motion.div
                key={server.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedServer?.id === server.id
                    ? 'border-discord-blurple bg-discord-blurple/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleServerSelect(server)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-3">
                  {server.icon ? (
                    <img
                      src={`https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png`}
                      alt={server.name}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <Bot className="h-6 w-6 text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {server.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          server.subscription === 'premium'
                            ? 'bg-discord-blurple text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {server.subscription}
                      </span>
                      {server.botPresent && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-discord-green text-white">
                          Bot Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Selected Server Dashboard */}
        {selectedServer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  {selectedServer.icon ? (
                    <img
                      src={`https://cdn.discordapp.com/icons/${selectedServer.id}/${selectedServer.icon}.png`}
                      alt={selectedServer.name}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <Bot className="h-6 w-6 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedServer.name}
                    </h2>
                    <p className="text-gray-600">Server Dashboard</p>
                  </div>
                </div>

                <AnimatedButton
                  onClick={() => {
                    // Open channel rule creation modal
                    const channelId = prompt('Enter channel ID:');
                    const channelName = prompt('Enter channel name:');
                    const hours = prompt(
                      'Enter expiration hours (1, 6, 24, or 168):'
                    );

                    if (channelId && channelName && hours) {
                      createChannelRule(
                        channelId,
                        channelName,
                        parseInt(hours)
                      );
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Channel Rule
                </AnimatedButton>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">
                      Messages Tracked
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900 mt-2">
                    {selectedServer.stats.totalMessagesTracked.toLocaleString()}
                  </p>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Trash2 className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-medium text-red-600">
                      Messages Deleted
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-red-900 mt-2">
                    {selectedServer.stats.totalMessagesDeleted.toLocaleString()}
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-600">
                      Active Rules
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-green-900 mt-2">
                    {selectedServer.stats.channelsWithRules}
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-600">
                      Subscription
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900 mt-2 capitalize">
                    {selectedServer.subscription}
                  </p>
                </div>
              </div>

              {/* Channel Rules */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Channel Rules
                </h3>
                {channelRules.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No channel rules configured yet.</p>
                    <p className="text-sm">
                      Add a channel rule to start auto-deleting messages.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {channelRules.map((rule) => (
                      <motion.div
                        key={rule._id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-discord-blurple/10 rounded-full flex items-center justify-center">
                            <Clock className="h-5 w-5 text-discord-blurple" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              #{rule.channelName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Expires after {rule.expirationHours} hours
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              rule.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </span>

                          <AnimatedButton
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteChannelRule(rule._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </AnimatedButton>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
