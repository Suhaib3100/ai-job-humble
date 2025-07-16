import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  Eye, 
  Check, 
  X, 
  FileText,
  MapPin,
  Calendar,
  DollarSign,
  Building,
  Tag
} from 'lucide-react';

interface UserSubmission {
  id: string;
  title: string;
  organization: string;
  description: string;
  status: string;
  created_at: string;
  user_id: string;
  location?: string;
  salary_range?: string;
  is_remote?: boolean;
  application_deadline?: string;
  application_url?: string;
  requirements?: string[];
  benefits?: string[];
  tags?: string[];
  submission_notes?: string;
  category_id: string;
  full_name?: string;
  category_name?: string;
}

const EnhancedSubmissionManager = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<UserSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<UserSubmission | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      // Fetch submissions with user and category data separately
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('user_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (submissionsError) throw submissionsError;

      if (submissionsData && submissionsData.length > 0) {
        // Get user profiles
        const userIds = submissionsData.map(sub => sub.user_id);
        const { data: usersData } = await supabase
          .from('user_profiles')
          .select('id, full_name')
          .in('id', userIds);

        // Get categories
        const categoryIds = submissionsData.map(sub => sub.category_id);
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('id, name')
          .in('id', categoryIds);

        // Merge the data
        const formattedSubmissions = submissionsData.map(sub => ({
          ...sub,
          full_name: usersData?.find(u => u.id === sub.user_id)?.full_name || 'Unknown User',
          category_name: categoriesData?.find(c => c.id === sub.category_id)?.name || 'Unknown Category'
        }));

        setSubmissions(formattedSubmissions);
      } else {
        setSubmissions([]);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const updateSubmissionStatus = async (submissionId: string, status: 'approved' | 'rejected', notes?: string) => {
    setProcessing(true);
    try {
      const { error: updateError } = await supabase
        .from('user_submissions')
        .update({
          status,
          review_notes: notes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        })
        .eq('id', submissionId);

      if (updateError) throw updateError;

      // If approved, create opportunity from submission
      if (status === 'approved') {
        const submission = submissions.find(s => s.id === submissionId);
        if (submission) {
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
              approved_by: user?.id,
              approved_at: new Date().toISOString()
            });

          if (opportunityError) throw opportunityError;
        }
      }

      // Log admin activity
      await supabase
        .from('admin_activity_logs')
        .insert({
          admin_id: user?.id,
          action: status === 'approved' ? 'SUBMISSION_APPROVED' : 'SUBMISSION_REJECTED',
          target_type: 'user_submission',
          target_id: submissionId,
          details: { notes }
        });

      toast.success(`Submission ${status} successfully`);
      fetchSubmissions();
      setSelectedSubmission(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Error updating submission:', error);
      toast.error('Failed to update submission');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Submissions</CardTitle>
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          User Submissions ({submissions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No submissions found</p>
          ) : (
            submissions.map((submission) => (
              <div key={submission.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{submission.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {submission.organization}
                      </span>
                      <span>by {submission.full_name}</span>
                      <span>{new Date(submission.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(submission.status)}>
                    {submission.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {submission.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {submission.location}
                    </span>
                  )}
                  {submission.salary_range && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {submission.salary_range}
                    </span>
                  )}
                  {submission.is_remote && (
                    <Badge variant="outline">Remote</Badge>
                  )}
                  <Badge variant="secondary">{submission.category_name}</Badge>
                </div>

                <p className="text-gray-700 line-clamp-2">{submission.description}</p>

                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedSubmission(submission)}
                        className="bg-[#008000] hover:bg-[#218c1b] text-white transition-colors duration-200"
                      >
                        <Eye className="w-4 h-4 mr-2 text-[#008000]" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Submission Details</DialogTitle>
                      </DialogHeader>
                      {selectedSubmission && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h3 className="font-semibold mb-2">Basic Information</h3>
                              <div className="space-y-2 text-sm">
                                <p><strong>Title:</strong> {selectedSubmission.title}</p>
                                <p><strong>Organization:</strong> {selectedSubmission.organization}</p>
                                <p><strong>Category:</strong> {selectedSubmission.category_name}</p>
                                <p><strong>Submitted by:</strong> {selectedSubmission.full_name}</p>
                                <p><strong>Date:</strong> {new Date(selectedSubmission.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div>
                              <h3 className="font-semibold mb-2">Job Details</h3>
                              <div className="space-y-2 text-sm">
                                {selectedSubmission.location && <p><strong>Location:</strong> {selectedSubmission.location}</p>}
                                {selectedSubmission.salary_range && <p><strong>Salary:</strong> {selectedSubmission.salary_range}</p>}
                                <p><strong>Remote:</strong> {selectedSubmission.is_remote ? 'Yes' : 'No'}</p>
                                {selectedSubmission.application_deadline && (
                                  <p><strong>Deadline:</strong> {new Date(selectedSubmission.application_deadline).toLocaleDateString()}</p>
                                )}
                                {selectedSubmission.application_url && (
                                  <p><strong>Apply URL:</strong> <a href={selectedSubmission.application_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a></p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">Description</h3>
                            <p className="text-sm bg-gray-50 p-3 rounded">{selectedSubmission.description}</p>
                          </div>

                          {selectedSubmission.requirements && selectedSubmission.requirements.length > 0 && (
                            <div>
                              <h3 className="font-semibold mb-2">Requirements</h3>
                              <ul className="list-disc list-inside text-sm space-y-1">
                                {selectedSubmission.requirements.map((req, index) => (
                                  <li key={index}>{req}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {selectedSubmission.benefits && selectedSubmission.benefits.length > 0 && (
                            <div>
                              <h3 className="font-semibold mb-2">Benefits</h3>
                              <ul className="list-disc list-inside text-sm space-y-1">
                                {selectedSubmission.benefits.map((benefit, index) => (
                                  <li key={index}>{benefit}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {selectedSubmission.tags && selectedSubmission.tags.length > 0 && (
                            <div>
                              <h3 className="font-semibold mb-2">Tags</h3>
                              <div className="flex flex-wrap gap-2">
                                {selectedSubmission.tags.map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-[#008000] border-[#008000]">
                                    <Tag className="w-3 h-3 mr-1 text-[#008000]" />
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {selectedSubmission.submission_notes && (
                            <div>
                              <h3 className="font-semibold mb-2">Submission Notes</h3>
                              <p className="text-sm bg-blue-50 p-3 rounded">{selectedSubmission.submission_notes}</p>
                            </div>
                          )}

                          {selectedSubmission.status === 'pending' && (
                            <div className="border-t pt-4">
                              <h3 className="font-semibold mb-2">Review</h3>
                              <Textarea
                                placeholder="Add review notes..."
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                className="mb-3"
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => updateSubmissionStatus(selectedSubmission.id, 'approved', reviewNotes)}
                                  disabled={processing}
                                  className="bg-[#008000] hover:bg-[#218c1b] text-white transition-colors duration-200"
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => updateSubmissionStatus(selectedSubmission.id, 'rejected', reviewNotes)}
                                  disabled={processing}
                                  className="bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  {submission.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateSubmissionStatus(submission.id, 'approved')}
                        disabled={processing}
                        className="bg-[#008000] hover:bg-[#218c1b] text-white transition-colors duration-200"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => updateSubmissionStatus(submission.id, 'rejected')}
                        disabled={processing}
                        className="bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedSubmissionManager;
