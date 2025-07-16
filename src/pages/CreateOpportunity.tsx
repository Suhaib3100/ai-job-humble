
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFeatureToggle } from '@/hooks/useFeatureToggle';
import { toast } from 'sonner';
import OpportunityForm from '@/components/shared/OpportunityForm';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, CheckCircle, Clock, FileText, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface OpportunityFormData {
  title: string;
  author: string;
  category_id: string;
  preview_text: string;
  description: string;
  organization: string;
  location?: string;
  salary_range?: string;
  is_remote?: boolean;
  application_deadline?: string;
  application_url?: string;
  requirements?: string[];
  benefits?: string[];
  tags?: string[];
  featured_image_url?: string;
  is_published?: boolean;
}

const CreateOpportunity = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isEnabled: canCreatePosts, loading: featureLoading } = useFeatureToggle('user_opportunity_posts');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData: OpportunityFormData) => {
    if (!user) {
      toast.error('You must be logged in to create opportunities');
      return;
    }

    setSubmitting(true);
    try {
      // Create user submission for admin review
      const { error: submissionError } = await supabase
        .from('user_submissions')
        .insert({
          title: formData.title,
          organization: formData.organization,
          description: formData.description,
          category_id: formData.category_id,
          user_id: user.id,
          location: formData.location,
          salary_range: formData.salary_range,
          is_remote: formData.is_remote,
          application_deadline: formData.application_deadline,
          application_url: formData.application_url,
          requirements: formData.requirements,
          benefits: formData.benefits,
          tags: formData.tags,
          submission_notes: `Author: ${formData.author}\nPreview: ${formData.preview_text}\nFeatured Image: ${formData.featured_image_url || 'None'}`,
          status: 'pending'
        });

      if (submissionError) throw submissionError;

      toast.success('Opportunity submitted successfully! It will be reviewed by our team.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting opportunity:', error);
      toast.error('Failed to submit opportunity');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  const handleResultSelect = (result: any) => {
    console.log('Selected search result:', result);
  };

  const handleSignOut = async () => {
    // This will be handled by the auth hook
  };

  if (featureLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#e6f5ec]/5 to-white">
        <DashboardHeader
          user={user}
          isAdmin={false}
          adminCheckComplete={true}
          onResultSelect={handleResultSelect}
          onSignOut={handleSignOut}
        />
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-[#17cfcf] border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  if (!canCreatePosts) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#e6f5ec]/5 to-white">
        <DashboardHeader
          user={user}
          isAdmin={false}
          adminCheckComplete={true}
          onResultSelect={handleResultSelect}
          onSignOut={handleSignOut}
        />
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="max-w-md mx-auto bg-white/80 backdrop-blur-sm border-[#e6f5ec]/30 shadow-xl rounded-3xl">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-[#384040] mb-2">
                  Feature Unavailable
                </CardTitle>
                <p className="text-gray-600 leading-relaxed">
                  Opportunity creation is currently disabled. Please check back later or contact support if you need assistance.
                </p>
              </CardHeader>
              <CardContent className="pt-4">
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-[#008000] hover:bg-[#006400] text-white py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 text-white" />
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#e6f5ec]/5 to-white">
      {/* Dashboard Header */}
      <DashboardHeader
        user={user}
        isAdmin={false}
        adminCheckComplete={true}
        onResultSelect={handleResultSelect}
        onSignOut={handleSignOut}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb & Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="hover:text-[#17cfcf] transition-colors"
            >
              Dashboard
            </button>
            <span>/</span>
            <span className="text-[#384040] font-medium">Create Opportunity</span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-[#384040] mb-2">
                Create New Opportunity
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Submit a new opportunity for review. Once approved by our team, it will be published on the platform.
              </p>
            </div>
            
            <Button
              variant="outline"
              onClick={handleCancel}
              className="border-2 border-[#008000] hover:border-[#006400] bg-[#008000] hover:bg-[#006400] text-white rounded-xl px-6 py-3 font-medium transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2 text-white" />
              Back to Dashboard
            </Button>
          </div>
        </motion.div>

        {/* Process Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-white/60 backdrop-blur-sm border-[#e6f5ec]/30 shadow-lg rounded-3xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#008000] rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-[#384040]">1. Submit</p>
                      <p className="text-sm text-gray-600">Fill out the form</p>
                    </div>
                  </div>
                  
                  <div className="w-12 h-0.5 bg-[#e6f5ec]"></div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#e6f5ec] rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-[#008000]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#384040]">2. Review</p>
                      <p className="text-sm text-gray-600">Admin approval</p>
                    </div>
                  </div>
                  
                  <div className="w-12 h-0.5 bg-[#e6f5ec]"></div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#e6f5ec] rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-[#008000]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#384040]">3. Publish</p>
                      <p className="text-sm text-gray-600">Goes live</p>
                    </div>
                  </div>
                </div>

                <Badge 
                  variant="secondary" 
                  className="bg-[#008000]/20 text-[#008000] border-[#008000] px-4 py-2 rounded-xl"
                >
                  <Lightbulb className="w-4 h-4 mr-2 text-[#008000]" />
                  User Submission
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl border border-[#e6f5ec]/30 shadow-xl p-8 mb-8"
        >
          <OpportunityForm
            mode="create"
            userRole="user"
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={submitting}
          />
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-[#e6f5ec]/20 to-white/40 backdrop-blur-sm border-[#e6f5ec]/30 shadow-lg rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#008000]">
                <Lightbulb className="w-5 h-5 text-[#008000]" />
                Tips for Better Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#008000] rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">Use clear, descriptive titles that accurately represent the opportunity</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#008000] rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">Provide detailed descriptions including key responsibilities and requirements</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#008000] rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">Include accurate application deadlines and contact information</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#008000] rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">Select the most appropriate category for better discoverability</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateOpportunity;
