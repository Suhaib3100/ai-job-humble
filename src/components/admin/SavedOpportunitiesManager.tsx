import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Trash2, Edit, Eye, Send } from 'lucide-react';
import AdminOpportunityForm from '@/components/admin/AdminOpportunityForm';

interface DraftOpportunity {
  id: string;
  title: string;
  organization: string;
  status: string;
  created_at: string;
  view_count: number;
  application_count: number;
  is_published: boolean;
  author?: string;
  preview_text?: string;
  description: string;
  category_id: string;
  location?: string;
  salary_range?: string;
  is_remote?: boolean;
  application_deadline?: string;
  application_url?: string;
  requirements?: string[];
  benefits?: string[];
  tags?: string[];
  featured_image_url?: string;
}

const SavedOpportunitiesManager = () => {
  const [draftOpportunities, setDraftOpportunities] = useState<DraftOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOpportunity, setEditingOpportunity] = useState<DraftOpportunity | null>(null);
  const [viewingOpportunity, setViewingOpportunity] = useState<DraftOpportunity | null>(null);

  useEffect(() => {
    fetchDraftOpportunities();
  }, []);

  const fetchDraftOpportunities = async () => {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('is_published', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDraftOpportunities(data || []);
    } catch (error) {
      console.error('Error fetching draft opportunities:', error);
      toast.error('Failed to load draft opportunities');
    } finally {
      setLoading(false);
    }
  };

  const publishOpportunity = async (opportunityId: string) => {
    try {
      const { error } = await supabase
        .from('opportunities')
        .update({ 
          is_published: true,
          published_at: new Date().toISOString()
        })
        .eq('id', opportunityId);

      if (error) throw error;

      toast.success('Opportunity published successfully');
      fetchDraftOpportunities();
    } catch (error) {
      console.error('Error publishing opportunity:', error);
      toast.error('Failed to publish opportunity');
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
      fetchDraftOpportunities();
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      toast.error('Failed to delete opportunity');
    }
  };

  const handleEditSuccess = () => {
    fetchDraftOpportunities();
    setEditingOpportunity(null);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved Opportunities (Drafts)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
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
          <CardTitle>Saved Opportunities (Drafts)</CardTitle>
        </CardHeader>
        <CardContent>
          {draftOpportunities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No draft opportunities found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {draftOpportunities.map((opportunity) => (
                <div key={opportunity.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{opportunity.title}</h3>
                    <p className="text-sm text-gray-600">{opportunity.organization}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge className="text-[#008000] border-[#008000]">Draft</Badge>
                      <span className="text-sm text-gray-500">
                        Created: {new Date(opportunity.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-[#008000] hover:bg-[#218c1b] text-white"
                      onClick={() => setViewingOpportunity(opportunity)}
                    >
                      <Eye className="h-4 w-4 text-[#008000]" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-[#008000] hover:bg-[#218c1b] text-white"
                      onClick={() => setEditingOpportunity(opportunity)}
                    >
                      <Edit className="h-4 w-4 text-[#008000]" />
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      className="bg-[#008000] hover:bg-[#218c1b] text-white"
                      onClick={() => publishOpportunity(opportunity.id)}
                    >
                      <Send className="h-4 w-4 mr-1 text-[#008000]" />
                      Publish
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="bg-[#ff0000] hover:bg-[#cc0000] text-white"
                      onClick={() => deleteOpportunity(opportunity.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Modal */}
      {viewingOpportunity && (
        <Card className="fixed inset-4 z-50 overflow-y-auto bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>View Opportunity</CardTitle>
              <Button variant="outline" onClick={() => setViewingOpportunity(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{viewingOpportunity.title}</h3>
                <p className="text-gray-600">{viewingOpportunity.organization}</p>
              </div>
              {viewingOpportunity.preview_text && (
                <div>
                  <h4 className="font-medium">Preview</h4>
                  <p className="text-sm text-gray-600">{viewingOpportunity.preview_text}</p>
                </div>
              )}
              <div>
                <h4 className="font-medium">Description</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{viewingOpportunity.description}</p>
              </div>
              {viewingOpportunity.location && (
                <div>
                  <h4 className="font-medium">Location</h4>
                  <p className="text-sm text-gray-600">{viewingOpportunity.location}</p>
                </div>
              )}
              {viewingOpportunity.salary_range && (
                <div>
                  <h4 className="font-medium">Salary Range</h4>
                  <p className="text-sm text-gray-600">{viewingOpportunity.salary_range}</p>
                </div>
              )}
              {viewingOpportunity.requirements && viewingOpportunity.requirements.length > 0 && (
                <div>
                  <h4 className="font-medium">Requirements</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {viewingOpportunity.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
              {viewingOpportunity.benefits && viewingOpportunity.benefits.length > 0 && (
                <div>
                  <h4 className="font-medium">Benefits</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {viewingOpportunity.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Modal */}
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

export default SavedOpportunitiesManager;
