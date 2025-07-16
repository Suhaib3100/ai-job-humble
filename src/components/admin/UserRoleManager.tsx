import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Users, Shield, Search, Plus, Mail, Calendar, Crown } from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string;
  email?: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: 'user' | 'staff_admin' | 'admin';
  assigned_at: string;
  full_name?: string;
  email?: string;
}

interface AdminUserDetail {
  user_id: string;
  email: string;
  full_name: string;
  subscription_tier: string;
  created_at: string;
  last_sign_in: string | null;
  is_active: boolean;
}

const UserRoleManager = () => {
  const { user } = useAuth();
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [adminUserDetails, setAdminUserDetails] = useState<AdminUserDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'staff_admin' | 'admin'>('staff_admin');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchUserRoles();
    fetchAllUsers();
    fetchAdminUserDetails();
  }, []);

  const fetchUserRoles = async () => {
    try {
      // Fetch user roles separately and then get user data
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .in('role', ['admin', 'staff_admin'])
        .order('assigned_at', { ascending: false });

      if (rolesError) throw rolesError;

      if (rolesData && rolesData.length > 0) {
        // Get user profiles for the roles
        const userIds = rolesData.map(role => role.user_id);
        const { data: usersData } = await supabase
          .from('user_profiles')
          .select('id, full_name')
          .in('id', userIds);

        // Get email information using the admin function
        const { data: emailData } = await supabase
          .rpc('get_user_emails_for_admin' as any);

        // Merge the data
        const formattedRoles = rolesData.map(role => {
          const userProfile = usersData?.find(u => u.id === role.user_id);
          const emailInfo = emailData?.find(e => e.user_id === role.user_id);
          return {
            ...role,
            full_name: userProfile?.full_name || 'Unknown User',
            email: emailInfo?.email || 'No email'
          };
        });

        setUserRoles(formattedRoles);
      } else {
        setUserRoles([]);
      }
    } catch (error) {
      console.error('Error fetching user roles:', error);
      toast.error('Failed to load user roles');
    }
  };

  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name')
        .order('full_name');

      if (error) throw error;
      setAllUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminUserDetails = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_admin_user_details' as any);

      if (error) throw error;
      setAdminUserDetails(data || []);
    } catch (error) {
      console.error('Error fetching admin user details:', error);
      toast.error('Failed to load user details');
    }
  };

  const assignRole = async () => {
    if (!selectedUser || !selectedRole) {
      toast.error('Please select a user and role');
      return;
    }

    setAssigning(true);
    try {
      // Check if user already has this role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', selectedUser)
        .eq('role', selectedRole)
        .maybeSingle();

      if (existingRole) {
        toast.error('User already has this role');
        return;
      }

      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: selectedUser,
          role: selectedRole,
          assigned_by: user?.id
        });

      if (error) throw error;

      // Log admin activity
      await supabase
        .from('admin_activity_logs')
        .insert({
          admin_id: user?.id,
          action: 'ROLE_ASSIGNED',
          target_type: 'user',
          target_id: selectedUser,
          details: { role: selectedRole }
        });

      toast.success(`${selectedRole.replace('_', ' ')} role assigned successfully`);
      setSelectedUser('');
      fetchUserRoles();
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error('Failed to assign role');
    } finally {
      setAssigning(false);
    }
  };

  const removeRole = async (roleId: string, userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      // Log admin activity
      await supabase
        .from('admin_activity_logs')
        .insert({
          admin_id: user?.id,
          action: 'ROLE_REMOVED',
          target_type: 'user',
          target_id: userId,
          details: { role }
        });

      toast.success('Role removed successfully');
      fetchUserRoles();
    } catch (error) {
      console.error('Error removing role:', error);
      toast.error('Failed to remove role');
    }
  };

  const filteredRoles = userRoles.filter(role => 
    role.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUserDetails = adminUserDetails.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableUsers = allUsers.filter(u => 
    !userRoles.some(role => role.user_id === u.id && role.role === selectedRole)
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
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
          <Shield className="w-5 h-5" />
          User Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="all-users" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all-users">All Users</TabsTrigger>
            <TabsTrigger value="admin-roles">Admin Roles</TabsTrigger>
          </TabsList>

          <TabsContent value="all-users" className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* All Users List */}
            <div className="space-y-3">
              {filteredUserDetails.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No users found</p>
              ) : (
                filteredUserDetails.map((userDetail) => (
                  <div key={userDetail.user_id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-[#008000]" />
                      <div>
                        <p className="font-medium">{userDetail.full_name || 'Unnamed User'}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-[#008000]" />
                            {userDetail.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Crown className="w-3 h-3 text-[#008000]" />
                            {userDetail.subscription_tier}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#008000]" />
                            Joined {new Date(userDetail.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={userDetail.is_active ? "default" : "secondary"}>
                        {userDetail.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        className="bg-[#008000] hover:bg-[#218c1b] text-white"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(userDetail.email);
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
          </TabsContent>

          <TabsContent value="admin-roles" className="space-y-6">
            {/* Assign New Role */}
            <div className="p-4 border rounded-lg space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Assign Admin Role
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name || 'Unnamed User'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedRole} onValueChange={(value: 'staff_admin' | 'admin') => setSelectedRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff_admin">Staff Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  className="bg-[#008000] hover:bg-[#218c1b] text-white"
                  onClick={assignRole} disabled={assigning || !selectedUser}>
                  {assigning ? 'Assigning...' : 'Assign Role'}
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search admin users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Admin Users List */}
            <div className="space-y-3">
              {filteredRoles.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No admin users found</p>
              ) : (
                filteredRoles.map((roleEntry) => (
                  <div key={roleEntry.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-[#008000]" />
                      <div>
                        <p className="font-medium">{roleEntry.full_name || 'Unnamed User'}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-[#008000]" />
                            {roleEntry.email}
                          </span>
                          <span>
                            Assigned {new Date(roleEntry.assigned_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={roleEntry.role === 'admin' ? 'default' : 'secondary'}>
                        {roleEntry.role.replace('_', ' ')}
                      </Badge>
                      <Button
                        className="bg-[#008000] hover:bg-[#218c1b] text-white"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(roleEntry.email || '');
                          toast.success('Email copied to clipboard');
                        }}
                      >
                        Copy Email
                      </Button>
                      <Button
                        className="bg-[#008000] hover:bg-[#218c1b] text-white"
                        variant="outline"
                        size="sm"
                        onClick={() => removeRole(roleEntry.id, roleEntry.user_id, roleEntry.role)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UserRoleManager;
