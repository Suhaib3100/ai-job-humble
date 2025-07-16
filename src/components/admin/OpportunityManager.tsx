import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Trash2, Edit, Plus, Eye, Upload } from 'lucide-react';
import AdminOpportunityForm from '@/components/admin/AdminOpportunityForm';
import { useNavigate } from 'react-router-dom';

interface Opportunity {
  id: string;
  title: string;
  organization: string;
  status: string;
  created_at: string;
  view_count: number;
  application_count: number;
  is_published: boolean;
}

const OpportunityManager = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const { data: opportunitiesData } = await supabase
        .from('opportunities')
        .select('id, title, organization, status, created_at, view_count, application_count, is_published')
        .order('created_at', { ascending: false })
        .limit(20);

      setOpportunities(opportunitiesData || []);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      toast.error('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  const deleteOpportunity = async (opportunityId: string) => {
    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', opportunityId);

      if (error) throw error;

      toast.success('Opportunity deleted successfully');
      fetchOpportunities();
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      toast.error('Failed to delete opportunity');
    }
  };

  const togglePublishStatus = async (opportunityId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('opportunities')
        .update({ 
          is_published: !currentStatus,
          published_at: !currentStatus ? new Date().toISOString() : null
        })
        .eq('id', opportunityId);

      if (error) throw error;

      toast.success(`Opportunity ${!currentStatus ? 'published' : 'unpublished'} successfully`);
      fetchOpportunities();
    } catch (error) {
      console.error('Error updating publish status:', error);
      toast.error('Failed to update publish status');
    }
  };

  const viewOpportunity = (opportunityId: string) => {
    navigate(`/opportunity/${opportunityId}`);
  };

  const handleCreateSuccess = () => {
    fetchOpportunities();
    setShowCreateForm(false);
  };

  const handleEditSuccess = () => {
    fetchOpportunities();
    setEditingOpportunity(null);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Manage Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Manage Opportunities</CardTitle>
            <Button 
              className="bg-[#008000] hover:bg-[#218c1b] text-white"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="h-4 w-4 mr-2 text-[#008000]" />
              Add Opportunity
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {opportunities.map((opportunity) => (
              <div key={opportunity.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{opportunity.title}</h3>
                  <p className="text-sm text-gray-600">{opportunity.organization}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge 
                      className="text-[#008000] border-[#008000]"
                      variant={opportunity.status === 'approved' ? 'default' : 'secondary'}
                    >
                      {opportunity.status}
                    </Badge>
                    <Badge 
                      className="text-[#008000] border-[#008000]"
                      variant={opportunity.is_published ? 'default' : 'outline'}
                    >
                      {opportunity.is_published ? 'Published' : 'Draft'}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {opportunity.view_count} views • {opportunity.application_count} applications
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    className="bg-white hover:bg-[#008000] text-[#008000] border border-[#008000] transition-colors duration-200"
                    variant="outline" 
                    size="sm"
                    onClick={() => viewOpportunity(opportunity.id)}
                  >
                    <Eye className="h-4 w-4 text-[#008000]" />
                  </Button>
                  <Button 
                    className="bg-white hover:bg-[#008000] text-[#008000] border border-[#008000] transition-colors duration-200"
                    variant="outline" 
                    size="sm"
                    onClick={() => togglePublishStatus(opportunity.id, opportunity.is_published)}
                  >
                    <Upload className="h-4 w-4 text-[#008000]" />
                  </Button>
                  <Button 
                    className="bg-white hover:bg-[#008000] text-[#008000] border border-[#008000] transition-colors duration-200"
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingOpportunity(opportunity)}
                  >
                    <Edit className="h-4 w-4 text-[#008000]" />
                  </Button>
                  <Button 
                    className="bg-[#c62828] hover:bg-[#e53935] text-white"
                    variant="destructive" 
                    size="sm"
                    onClick={() => deleteOpportunity(opportunity.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AdminOpportunityForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSuccess={handleCreateSuccess}
        mode="create"
      />

      {editingOpportunity && (
        <AdminOpportunityForm
          isOpen={true}
          onClose={() => setEditingOpportunity(null)}
          onSuccess={handleEditSuccess}
          mode="edit"
          opportunityId={editingOpportunity.id}
          initialData={editingOpportunity}
        />
      )}
    </>
  );
};

export default OpportunityManager;
