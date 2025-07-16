import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';
import { 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  Filter,
  ExternalLink,
  Calendar,
  MapPin,
  Building
} from 'lucide-react';
import { format } from 'date-fns';

type OpportunityStatus = Database['public']['Enums']['opportunity_status'];

interface Opportunity {
  id: string;
  title: string;
  organization: string;
  location?: string;
  status: OpportunityStatus;
  source: string;
  is_published: boolean;
  view_count: number;
  application_count: number;
  created_at: string;
  application_deadline?: string;
  application_url?: string;
  category: { name: string };
}

interface Submission {
  id: string;
  title: string;
  organization: string;
  location?: string;
  status: OpportunityStatus;
  created_at: string;
  reviewed_at?: string;
  user_id: string;
  application_deadline?: string;
  submission_notes?: string;
  review_notes?: string;
}

const ListingsSubmissionsManager = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch opportunities
      const { data: opportunitiesData } = await supabase
        .from('opportunities')
        .select(`
          id,
          title,
          organization,
          location,
          status,
          source,
          is_published,
          view_count,
          application_count,
          created_at,
          application_deadline,
          application_url,
          category:categories(name)
        `)
        .order('created_at', { ascending: false });

      // Fetch submissions
      const { data: submissionsData } = await supabase
        .from('user_submissions')
        .select(`
          id,
          title,
          organization,
          location,
          status,
          created_at,
          reviewed_at,
          user_id,
          application_deadline,
          submission_notes,
          review_notes
        `)
        .order('created_at', { ascending: false });

      setOpportunities(opportunitiesData || []);
      setSubmissions(submissionsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const updateOpportunityStatus = async (id: string, newStatus: OpportunityStatus) => {
    try {
      const { error } = await supabase
        .from('opportunities')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success('Opportunity status updated');
      fetchData();
    } catch (error) {
      console.error('Error updating opportunity:', error);
      toast.error('Failed to update opportunity');
    }
  };

  const togglePublishStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('opportunities')
        .update({ 
          is_published: !currentStatus,
          published_at: !currentStatus ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Opportunity ${!currentStatus ? 'published' : 'unpublished'}`);
      fetchData();
    } catch (error) {
      console.error('Error updating publish status:', error);
      toast.error('Failed to update publish status');
    }
  };

  const updateSubmissionStatus = async (id: string, newStatus: OpportunityStatus, reviewNotes?: string) => {
    try {
      const { error } = await supabase
        .from('user_submissions')
        .update({ 
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Submission status updated');
      fetchData();
    } catch (error) {
      console.error('Error updating submission:', error);
      toast.error('Failed to update submission');
    }
  };

  const deleteOpportunity = async (id: string) => {
    if (!confirm('Are you sure you want to delete this opportunity?')) return;

    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Opportunity deleted');
      fetchData();
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      toast.error('Failed to delete opportunity');
    }
  };

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.organization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || opp.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || opp.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.organization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      approved: { variant: 'default' as const, color: 'text-green-600' },
      pending: { variant: 'secondary' as const, color: 'text-yellow-600' },
      rejected: { variant: 'destructive' as const, color: 'text-red-600' },
      draft: { variant: 'outline' as const, color: 'text-gray-600' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant} className={config.color}>{status}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Listings & Submissions</h2>
          <p className="text-gray-600">Manage all opportunities and user submissions</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by title or organization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="scraped">Scraped</SelectItem>
                <SelectItem value="bulk_scraped">Bulk Scraped</SelectItem>
                <SelectItem value="user_submitted">User Submitted</SelectItem>
                <SelectItem value="admin_created">Admin Created</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="opportunities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="opportunities">
            All Opportunities ({filteredOpportunities.length})
          </TabsTrigger>
          <TabsTrigger value="submissions">
            User Submissions ({filteredSubmissions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities">
          <Card>
            <CardHeader>
              <CardTitle>All Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title & Organization</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead>Stats</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOpportunities.map((opportunity) => (
                      <TableRow key={opportunity.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{opportunity.title}</div>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Building className="h-3 w-3 text-[#008000]" />
                                {opportunity.organization}
                              </span>
                              {opportunity.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-[#008000]" />
                                  {opportunity.location}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-blue-600 mt-1">
                              {opportunity.category?.name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(opportunity.status)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{opportunity.source}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={opportunity.is_published ? 'default' : 'secondary'}>
                            {opportunity.is_published ? 'Published' : 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{opportunity.view_count} views</div>
                            <div>{opportunity.application_count} applications</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{format(new Date(opportunity.created_at), 'MMM dd, yyyy')}</div>
                            <div className="text-gray-500">{format(new Date(opportunity.created_at), 'HH:mm')}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {opportunity.application_url && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={opportunity.application_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 text-[#008000]" />
                                </a>
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => togglePublishStatus(opportunity.id, opportunity.is_published)}
                              className="bg-[#008000] hover:bg-[#218c1b] text-white"
                            >
                              {opportunity.is_published ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteOpportunity(opportunity.id)}
                              className="bg-[#008000] hover:bg-[#218c1b] text-white"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle>User Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title & Organization</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Reviewed</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{submission.title}</div>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Building className="h-3 w-3 text-[#008000]" />
                                {submission.organization}
                              </span>
                              {submission.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-[#008000]" />
                                  {submission.location}
                                </span>
                              )}
                            </div>
                            {submission.application_deadline && (
                              <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
                                <Calendar className="h-3 w-3" />
                                Deadline: {format(new Date(submission.application_deadline), 'MMM dd, yyyy')}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(submission.status)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(submission.created_at), 'MMM dd, yyyy HH:mm')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {submission.reviewed_at 
                              ? format(new Date(submission.reviewed_at), 'MMM dd, yyyy HH:mm')
                              : '-'
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm max-w-xs">
                            {submission.submission_notes && (
                              <div className="mb-1">
                                <span className="font-medium">User:</span> {submission.submission_notes.substring(0, 50)}...
                              </div>
                            )}
                            {submission.review_notes && (
                              <div>
                                <span className="font-medium">Review:</span> {submission.review_notes.substring(0, 50)}...
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => updateSubmissionStatus(submission.id, 'approved')}
                              disabled={submission.status === 'approved'}
                              className="bg-[#008000] hover:bg-[#218c1b] text-white"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => updateSubmissionStatus(submission.id, 'rejected')}
                              disabled={submission.status === 'rejected'}
                              className="bg-[#008000] hover:bg-[#218c1b] text-white"
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ListingsSubmissionsManager;
