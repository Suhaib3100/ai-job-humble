import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Users, Mail, Calendar, Crown, Search, Filter, Download } from 'lucide-react';

interface AdminUserDetail {
  user_id: string;
  email: string;
  full_name: string;
  subscription_tier: string;
  created_at: string;
  last_sign_in: string | null;
  is_active: boolean;
}

const UserManagement = () => {
  const [users, setUsers] = useState<AdminUserDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('get_admin_user_details' as any);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTier = filterTier === 'all' || user.subscription_tier === filterTier;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && user.is_active) ||
      (filterStatus === 'inactive' && !user.is_active);

    return matchesSearch && matchesTier && matchesStatus;
  });

  const exportUserEmails = () => {
    const emails = filteredUsers.map(user => user.email).join('\n');
    const blob = new Blob([emails], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_emails.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Email list exported');
  };

  const copyAllEmails = () => {
    const emails = filteredUsers.map(user => user.email).join(', ');
    navigator.clipboard.writeText(emails);
    toast.success('All emails copied to clipboard');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Management
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
          <Users className="w-5 h-5" />
          User Management
        </CardTitle>
        <p className="text-sm text-gray-600">
          View and manage all users. Access emails for communication purposes.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={filterTier} onValueChange={setFilterTier}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Export Actions */}
        <div className="flex gap-2">
          <Button
            className="bg-[#008000] hover:bg-[#218c1b] text-white"
            variant="outline"
            size="sm"
            onClick={copyAllEmails}
            disabled={filteredUsers.length === 0}
          >
            <Mail className="w-4 h-4 mr-2 text-[#008000]" />
            Copy All Emails
          </Button>
          <Button
            className="bg-[#008000] hover:bg-[#218c1b] text-white"
            variant="outline"
            size="sm"
            onClick={exportUserEmails}
            disabled={filteredUsers.length === 0}
          >
            <Download className="w-4 h-4 mr-2 text-[#008000]" />
            Export Emails
          </Button>
        </div>

        {/* Results Summary */}
        <div className="text-sm text-gray-600">
          Showing {filteredUsers.length} of {users.length} users
        </div>

        {/* Users List */}
        <div className="space-y-3">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No users found matching your criteria</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.user_id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#008000]" />
                  </div>
                  <div>
                    <p className="font-medium">{user.full_name || 'Unnamed User'}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-[#008000]" />
                        {user.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Crown className="w-3 h-3 text-[#008000]" />
                        {user.subscription_tier}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#008000]" />
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={user.is_active ? "default" : "secondary"}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button
                    className="bg-[#008000] hover:bg-[#218c1b] text-white"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(user.email);
                      toast.success('Email copied to clipboard');
                    }}
                  >
                    Copy Email
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserManagement;