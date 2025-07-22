import React, { useEffect, useState } from 'react';
import { OpportunityCard } from '@/components/opportunity/OpportunityCard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Briefcase, CheckCircle, Bookmark, Eye, Edit, Trash2, Check, X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import OpportunityForm from '@/components/shared/OpportunityForm';

// Placeholder role check (replace with real logic)
const isStaffAdmin = true; // TODO: Replace with real role check

const analyticsIcons = [CheckCircle, Bookmark, Eye, Briefcase];

const StaffAdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState([
    { label: 'Pending Submissions', value: 0, icon: CheckCircle },
    { label: 'Saved Opportunities', value: 0, icon: Bookmark },
    { label: 'Published Opportunities', value: 0, icon: Eye },
    { label: 'Total Opportunities', value: 0, icon: Briefcase },
  ]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [subLoading, setSubLoading] = useState(true);
  const [savedOpportunities, setSavedOpportunities] = useState<any[]>([]);
  const [savedLoading, setSavedLoading] = useState(true);
  const [discoverOpportunities, setDiscoverOpportunities] = useState<any[]>([]);
  const [discoverLoading, setDiscoverLoading] = useState(true);
  const [processingSubmission, setProcessingSubmission] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Pagination state for Discover tab
  const [discoverPage, setDiscoverPage] = useState(1);
  const DISCOVER_PAGE_SIZE = 6;

  // Paginated opportunities for Discover tab
  const paginatedDiscoverOpportunities = discoverOpportunities.slice(
    (discoverPage - 1) * DISCOVER_PAGE_SIZE,
    discoverPage * DISCOVER_PAGE_SIZE
  );

  useEffect(() => {
    fetchAnalytics();
    fetchOpportunities();
    fetchSubmissions();
    fetchSavedOpportunities();
    fetchDiscoverOpportunities();
  }, []);

  // Update analytics count for Saved Opportunities
  useEffect(() => {
    setAnalytics((prev) => prev.map((a) =>
      a.label === 'Saved Opportunities'
        ? { ...a, value: savedOpportunities.length }
        : a
    ));
  }, [savedOpportunities]);

  const fetchAnalytics = async () => {
    try {
      // Replace with real user id for saved opportunities
      const userId = 'staff-admin-id';
      const [pending, saved, published, total] = await Promise.all([
        supabase.from('user_submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('user_bookmarks').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('opportunities').select('*', { count: 'exact', head: true }),
      ]);
      setAnalytics([
        { label: 'Pending Submissions', value: pending.count || 0, icon: CheckCircle },
        { label: 'Saved Opportunities', value: saved.count || 0, icon: Bookmark },
        { label: 'Published Opportunities', value: published.count || 0, icon: Eye },
        { label: 'Total Opportunities', value: total.count || 0, icon: Briefcase },
      ]);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    }
  };

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOpportunities(data || []);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      toast.error('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      setSubLoading(true);
      const { data, error } = await supabase
        .from('user_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setSubLoading(false);
    }
  };

  const fetchSavedOpportunities = async () => {
    try {
      setSavedLoading(true);
      const userId = user?.id || '';
      const { data: bookmarks, error } = await supabase
        .from('user_bookmarks')
        .select('opportunity_id, opportunities(*)')
        .eq('user_id', userId);

      if (error) throw error;
      setSavedOpportunities((bookmarks || []).map((b: any) => b.opportunities).filter(Boolean));
    } catch (error) {
      console.error('Error fetching saved opportunities:', error);
      toast.error('Failed to load saved opportunities');
    } finally {
      setSavedLoading(false);
    }
  };

  const fetchDiscoverOpportunities = async () => {
    try {
      setDiscoverLoading(true);
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('is_published', true)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiscoverOpportunities(data || []);
    } catch (error) {
      console.error('Error fetching discover opportunities:', error);
      toast.error('Failed to load discover opportunities');
    } finally {
      setDiscoverLoading(false);
    }
  };

  const handleEdit = (opp: any) => {
    // TODO: Open edit modal
    toast.info('Edit functionality coming soon');
  };

  const handleDelete = async (opp: any) => {
    if (!window.confirm('Are you sure you want to delete this opportunity?')) return;

    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', opp.id);

      if (error) throw error;

      toast.success('Opportunity deleted successfully');
      fetchOpportunities();
      fetchAnalytics();
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      toast.error('Failed to delete opportunity');
    }
  };

  const handleSubmissionAction = async (submission: any, status: 'approved' | 'rejected') => {
    if (processingSubmission) return; // Prevent multiple clicks

    setProcessingSubmission(submission.id);

    try {
      // Update submission status
      const { error: updateError } = await supabase
        .from('user_submissions')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id || 'unknown'
        })
        .eq('id', submission.id);

      if (updateError) throw updateError;

      // If approved, create opportunity from submission
      if (status === 'approved') {
        const { error: opportunityError } = await supabase
          .from('opportunities')
          .insert({
            title: submission.title,
            organization: submission.organization,
            description: submission.description,
            category_id: submission.category_id,
            application_url: submission.application_url,
            location: submission.location,
            salary_range: submission.salary_range,
            is_remote: submission.is_remote,
            application_deadline: submission.application_deadline,
            requirements: submission.requirements,
            benefits: submission.benefits,
            tags: submission.tags,
            status: 'approved',
            source: 'user_submitted',
            submitted_by: submission.user_id,
            approved_by: user?.id || 'unknown',
            approved_at: new Date().toISOString(),
            is_published: true
          });

        if (opportunityError) throw opportunityError;
      }

      // Refresh all data
      await Promise.all([
        fetchSubmissions(),
        fetchOpportunities(),
        fetchAnalytics()
      ]);

      toast.success(`Submission ${status} successfully`);
    } catch (error) {
      console.error('Error updating submission:', error);
      toast.error(`Failed to ${status} submission`);
    } finally {
      setProcessingSubmission(null);
    }
  };

  const handleRemoveBookmark = async (opp: any) => {
    try {
      const userId = user?.id || 'staff-admin-id'; // Use actual staff-admin id if available
      const { error } = await supabase
        .from('user_bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('opportunity_id', opp.id);

      if (error) throw error;

      toast.success('Bookmark removed successfully');
      fetchSavedOpportunities();
      fetchAnalytics();
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast.error('Failed to remove bookmark');
    }
  };

  const handleCreateOpportunity = async (formData: any, isDraft: boolean = false) => {
    setCreateLoading(true);
    try {
      const { error } = await supabase
        .from('opportunities')
        .insert({
          title: formData.title,
          organization: formData.organization,
          description: formData.description,
          category_id: formData.category_id,
          application_url: formData.application_url,
          location: formData.location,
          salary_range: formData.salary_range,
          is_remote: formData.is_remote,
          application_deadline: formData.application_deadline,
          requirements: formData.requirements,
          benefits: formData.benefits,
          tags: formData.tags,
          featured_image_url: formData.featured_image_url,
          status: 'approved',
          source: 'user_submitted',
          submitted_by: 'staff-admin-id', // TODO: Replace with real user id
          approved_by: 'staff-admin-id', // TODO: Replace with real user id
          approved_at: new Date().toISOString(),
          is_published: formData.is_published || false
        });

      if (error) throw error;

      toast.success('Opportunity created successfully');
      setShowCreateModal(false);

      // Refresh all data
      await Promise.all([
        fetchOpportunities(),
        fetchAnalytics(),
        fetchDiscoverOpportunities()
      ]);
    } catch (error) {
      console.error('Error creating opportunity:', error);
      toast.error('Failed to create opportunity');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCancelCreate = () => {
    setShowCreateModal(false);
  };

  if (!isStaffAdmin) {
    return <div className="p-8 text-center text-lg">Access denied. Staff Admins only.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#e6f5ec]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="text-[#008000] border-[#008000] hover:bg-[#008000]/10"
              onClick={() => navigate('/dashboard')}
            >
              &larr; Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-[#008000]">Staff Admin Dashboard</h1>
          </div>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="bg-[#008000] text-white hover:bg-[#008000]/90 shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Create Opportunity
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Opportunity</DialogTitle>
              </DialogHeader>
              <OpportunityForm
                mode="create"
                userRole="staff_admin"
                onSubmit={handleCreateOpportunity}
                onCancel={handleCancelCreate}
                loading={createLoading}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {analytics.map((a, i) => (
            <Card key={a.label} className="bg-white/80 border border-[#e6f5ec]/30 shadow rounded-xl">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[#008000]/10">
                  <a.icon className="w-6 h-6 text-[#008000]" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 font-medium mb-1">{a.label}</div>
                  <div className="text-2xl font-bold text-[#008000]">{a.value}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6 bg-white/80 border border-[#e6f5ec]/30 rounded-xl">
            <TabsTrigger value="all" className="data-[state=active]:bg-[#008000] data-[state=active]:text-white">All Listings & Submissions</TabsTrigger>
            <TabsTrigger value="manage" className="data-[state=active]:bg-[#008000] data-[state=active]:text-white">Manage Submissions</TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:bg-[#008000] data-[state=active]:text-white">Saved Opportunities</TabsTrigger>
            <TabsTrigger value="discover" className="data-[state=active]:bg-[#008000] data-[state=active]:text-white">Discover</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl">
                <thead>
                  <tr className="bg-[#008000]/10 text-[#008000]">
                    <th className="p-3 text-left">Title</th>
                    <th className="p-3 text-left">Organization</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Published</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="p-6 text-center">Loading...</td></tr>
                  ) : opportunities.length === 0 ? (
                    <tr><td colSpan={5} className="p-6 text-center text-gray-400">No opportunities found.</td></tr>
                  ) : opportunities.map((opp) => (
                    <tr key={opp.id} className="border-b">
                      <td className="p-3 font-medium">{opp.title}</td>
                      <td className="p-3">{opp.organization}</td>
                      <td className="p-3 capitalize">{opp.status}</td>
                      <td className="p-3">{opp.is_published ? 'Yes' : 'No'}</td>
                      <td className="p-3 flex gap-2">
                        <Button size="sm" className="bg-[#008000] text-white" onClick={() => handleEdit(opp)}><Edit className="w-4 h-4" /></Button>
                        <Button size="sm" className="bg-red-600 text-white" onClick={() => handleDelete(opp)}><Trash2 className="w-4 h-4" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
          <TabsContent value="manage">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl">
                <thead>
                  <tr className="bg-[#008000]/10 text-[#008000]">
                    <th className="p-3 text-left">Title</th>
                    <th className="p-3 text-left">Organization</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Submitted By</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subLoading ? (
                    <tr><td colSpan={5} className="p-6 text-center">Loading...</td></tr>
                  ) : submissions.length === 0 ? (
                    <tr><td colSpan={5} className="p-6 text-center text-gray-400">No submissions found.</td></tr>
                  ) : submissions.map((sub) => (
                    <tr key={sub.id} className="border-b">
                      <td className="p-3 font-medium">{sub.title}</td>
                      <td className="p-3">{sub.organization}</td>
                      <td className="p-3 capitalize">{sub.status}</td>
                      <td className="p-3">{sub.user_id?.slice(0, 8) || 'N/A'}</td>
                      <td className="p-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-[#008000] border-[#008000]"
                          onClick={() => {
                            let toastId: string | number | undefined;
                            toastId = toast(
                              <div className="max-w-md relative">
                                <button
                                  onClick={() => toast.dismiss(toastId)}
                                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-lg font-bold"
                                  aria-label="Close"
                                >
                                  &times;
                                </button>
                                <h3 className="font-bold text-lg mb-2">Opportunity Details</h3>
                                <div className="space-y-1 text-sm">
                                  <div><strong>Title:</strong> {sub.title}</div>
                                  <div><strong>Organization:</strong> {sub.organization}</div>
                                  <div><strong>Description:</strong> {sub.description}</div>
                                  <div><strong>Category:</strong> {sub.category_id}</div>
                                  <div><strong>Location:</strong> {sub.location}</div>
                                  <div><strong>Salary Range:</strong> {sub.salary_range}</div>
                                  <div><strong>Deadline:</strong> {sub.application_deadline ? new Date(sub.application_deadline).toLocaleDateString() : 'N/A'}</div>
                                  <div><strong>Requirements:</strong> {sub.requirements}</div>
                                  <div><strong>Benefits:</strong> {sub.benefits}</div>
                                  <div><strong>Tags:</strong> {Array.isArray(sub.tags) ? sub.tags.join(', ') : sub.tags}</div>
                                </div>
                              </div>,
                              { duration: 8000 }
                            );
                          }}
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 text-white hover:bg-green-700"
                          disabled={sub.status !== 'pending' || processingSubmission === sub.id}
                          onClick={() => handleSubmissionAction(sub, 'approved')}
                        >
                          {processingSubmission === sub.id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-600 text-white hover:bg-red-700"
                          disabled={sub.status !== 'pending' || processingSubmission === sub.id}
                          onClick={() => handleSubmissionAction(sub, 'rejected')}
                        >
                          {processingSubmission === sub.id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                          Reject
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
          <TabsContent value="saved">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl">
                <thead>
                  <tr className="bg-[#008000]/10 text-[#008000]">
                    <th className="p-3 text-left">Title</th>
                    <th className="p-3 text-left">Organization</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {savedLoading ? (
                    <tr><td colSpan={3} className="p-6 text-center">Loading...</td></tr>
                  ) : savedOpportunities.length === 0 ? (
                    <tr><td colSpan={3} className="p-6 text-center text-gray-400">No saved opportunities.</td></tr>
                  ) : savedOpportunities.map((opp) => (
                    <tr key={opp.id} className="border-b">
                      <td className="p-3 font-medium">{opp.title}</td>
                      <td className="p-3">{opp.organization}</td>
                      <td className="p-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-[#008000] border-[#008000]"
                          onClick={() => {
                            let toastId;
                            toastId = toast(
                              <div className="max-w-md relative">
                                <button
                                  onClick={() => toast.dismiss(toastId)}
                                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-lg font-bold"
                                  aria-label="Close"
                                >
                                  &times;
                                </button>
                                <h3 className="font-bold text-lg mb-2">Opportunity Details</h3>
                                <div className="space-y-1 text-sm">
                                  <div><strong>Title:</strong> {opp.title}</div>
                                  <div><strong>Organization:</strong> {opp.organization}</div>
                                  <div><strong>Description:</strong> {opp.description}</div>
                                  <div><strong>Location:</strong> {opp.location}</div>
                                  <div><strong>Salary Range:</strong> {opp.salary_range}</div>
                                  <div><strong>Deadline:</strong> {opp.application_deadline ? new Date(opp.application_deadline).toLocaleDateString() : 'N/A'}</div>
                                  <div><strong>Tags:</strong> {Array.isArray(opp.tags) ? opp.tags.join(', ') : opp.tags}</div>
                                </div>
                              </div>,
                              { duration: 8000 }
                            );
                          }}
                        >
                          View
                        </Button>
                        <Button size="sm" className="bg-red-600 text-white" onClick={() => handleRemoveBookmark(opp)}>Remove</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
          <TabsContent value="discover">
            <section className="py-8">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-[#008000] mb-2">Published Opportunities</h2>
                <p className="text-gray-600 text-lg">Browse all published and approved opportunities. Click any card to view full details or take action.</p>
              </div>
              {discoverLoading ? (
                <div className="py-12 text-center text-lg text-gray-500">Loading opportunities...</div>
              ) : discoverOpportunities.length === 0 ? (
                <div className="py-12 text-center text-lg text-gray-400">No published opportunities.</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedDiscoverOpportunities.map((opp) => (
                      <OpportunityCard key={opp.id} opportunity={opp} />
                    ))}
                  </div>
                  <div className="flex justify-center mt-8 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[#008000] border-[#008000]"
                      disabled={discoverPage === 1}
                      onClick={() => setDiscoverPage(discoverPage - 1)}
                    >
                      Previous
                    </Button>
                    <span className="px-4 py-2 text-[#008000] font-semibold">Page {discoverPage}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[#008000] border-[#008000]"
                      disabled={discoverPage * DISCOVER_PAGE_SIZE >= discoverOpportunities.length}
                      onClick={() => setDiscoverPage(discoverPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </>
              )}
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StaffAdminDashboard;
