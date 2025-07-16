
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OpportunityDetails from '@/components/opportunity/OpportunityDetails';
import OpportunitySidebar from '@/components/opportunity/OpportunitySidebar';

const OpportunityApplication = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [opportunity, setOpportunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOpportunity();
      checkApplicationStatus();
      incrementViewCount();
    }
  }, [id, user]);

  const fetchOpportunity = async () => {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          category:categories(name, color)
        `)
        .eq('id', id)
        .eq('is_published', true)
        .single();

      if (error) throw error;
      setOpportunity(data);
    } catch (error) {
      console.error('Error fetching opportunity:', error);
      toast.error('Failed to load opportunity');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    if (!user || !id) return;

    try {
      const { data } = await supabase
        .from('user_applications')
        .select('id')
        .eq('user_id', user.id)
        .eq('opportunity_id', id)
        .single();

      setHasApplied(!!data);
    } catch (error) {
      // User hasn't applied yet
    }
  };

  const incrementViewCount = async () => {
    if (!id) return;

    try {
      // Update view count by incrementing it
      const { error } = await supabase
        .from('opportunities')
        .update({ 
          view_count: opportunity?.view_count ? opportunity.view_count + 1 : 1
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleApply = async () => {
    if (!user) {
      toast.error('Please log in to apply');
      navigate('/auth');
      return;
    }

    if (opportunity?.application_url) {
      window.open(opportunity.application_url, '_blank');
    }

    if (!hasApplied) {
      setActionLoading(true);
      try {
        const { error } = await supabase
          .from('user_applications')
          .insert({
            user_id: user.id,
            opportunity_id: id,
            application_status: 'applied'
          });

        if (error) throw error;

        // Increment application count by getting current count and adding 1
        const { data: currentData } = await supabase
          .from('opportunities')
          .select('application_count')
          .eq('id', id)
          .single();

        const newCount = (currentData?.application_count || 0) + 1;

        const { error: updateError } = await supabase
          .from('opportunities')
          .update({ 
            application_count: newCount
          })
          .eq('id', id);

        if (updateError) throw updateError;

        setHasApplied(true);
        toast.success('Application recorded successfully!');
      } catch (error) {
        console.error('Error recording application:', error);
        toast.error('Failed to record application');
      } finally {
        setActionLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#e6f5ec]/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#008000]"></div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#e6f5ec]/20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#008000] mb-4">Opportunity not found</h2>
          <Button onClick={() => navigate('/dashboard')} className="bg-[#008000] hover:bg-[#006400] text-white">
            <ArrowLeft className="w-4 h-4 mr-2 text-white" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#e6f5ec]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-6 text-[#008000] hover:text-[#006400]"
          >
            <ArrowLeft className="w-4 h-4 mr-2 text-[#008000]" />
            Back to Dashboard
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <OpportunityDetails opportunity={opportunity} />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <OpportunitySidebar
                opportunity={opportunity}
                user={user}
                hasApplied={hasApplied}
                actionLoading={actionLoading}
                onApply={handleApply}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OpportunityApplication;
