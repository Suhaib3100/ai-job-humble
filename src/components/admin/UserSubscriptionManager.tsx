import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Users, Search, Crown, User as UserIcon } from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string;
  subscription_tier: 'free' | 'pro';
  created_at: string;
  onboarding_completed: boolean;
}

const UserSubscriptionManager = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<'all' | 'free' | 'pro'>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, subscription_tier, created_at, onboarding_completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = filterTier === 'all' || user.subscription_tier === filterTier;
    return matchesSearch && matchesTier;
  });

  const freeUsers = users.filter(user => user.subscription_tier === 'free').length;
  const proUsers = users.filter(user => user.subscription_tier === 'pro').length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Subscriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#008000]" />
          User Subscriptions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-600">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Free Users</p>
                <p className="text-2xl font-bold text-gray-600">{freeUsers}</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pro Users</p>
                <p className="text-2xl font-bold text-yellow-600">{proUsers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search users by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterTier} onValueChange={(value: 'all' | 'free' | 'pro') => setFilterTier(value)}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="free">Free Users</SelectItem>
              <SelectItem value="pro">Pro Users</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users List */}
        <div className="space-y-3">
          {filteredUsers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No users found</p>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    user.subscription_tier === 'pro' ? 'bg-yellow-100' : 'bg-gray-100'
                  }`}>
                    {user.subscription_tier === 'pro' ? (
                      <Crown className="w-5 h-5 text-yellow-600" />
                    ) : (
                      <UserIcon className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{user.full_name || 'Unnamed User'}</p>
                    <p className="text-sm text-gray-500">
                      ID: {user.id.slice(0, 8)}... • Joined {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={user.subscription_tier === 'pro' ? 'default' : 'secondary'}
                    className={user.subscription_tier === 'pro' ? 'bg-yellow-100 text-yellow-800' : ''}
                  >
                    {user.subscription_tier.toUpperCase()}
                  </Badge>
                  <Badge variant={user.onboarding_completed ? 'default' : 'destructive'}>
                    {user.onboarding_completed ? 'Complete' : 'Incomplete'}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserSubscriptionManager;
