
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ExternalLink, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock,
  FileText,
  TrendingUp,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { useApplicationAnalyzer } from '@/hooks/useApplicationAnalyzer';
import { ApplicationSteps } from '@/components/ai/ApplicationSteps';
import { ApplicationChanceAnalysis } from '@/components/ai/ApplicationChanceAnalysis';
import ApplicationModal from './ApplicationModal';

interface OpportunitySidebarProps {
  opportunity: {
    id: string;
    title: string;
    organization: string;
    location?: string;
    is_remote?: boolean;
    salary_range?: string;
    application_deadline?: string;
    application_url?: string;
    source_url?: string;
    created_at: string;
  };
  user: any;
  hasApplied: boolean;
  actionLoading: boolean;
  onApply: () => void;
}

const OpportunitySidebar = ({ 
  opportunity, 
  user, 
  hasApplied, 
  actionLoading, 
  onApply 
}: OpportunitySidebarProps) => {
  const [activeAnalysis, setActiveAnalysis] = useState<'steps' | 'chance' | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  
  const { 
    loading, 
    steps, 
    chanceAnalysis, 
    generateApplicationSteps, 
    analyzeApplicationChance,
    clearAnalysis 
  } = useApplicationAnalyzer();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleStepComplete = (stepNumber: number) => {
    setCompletedSteps(prev => 
      prev.includes(stepNumber) 
        ? prev.filter(s => s !== stepNumber)
        : [...prev, stepNumber]
    );
  };

  const handleAnalysisToggle = (type: 'steps' | 'chance') => {
    if (activeAnalysis === type) {
      setActiveAnalysis(null);
      clearAnalysis();
    } else {
      setActiveAnalysis(type);
      if (type === 'steps') {
        generateApplicationSteps(opportunity.id);
      } else {
        analyzeApplicationChance(opportunity.id);
      }
    }
  };

  const handleApplicationSubmit = async (applicationData: any) => {
    // Call the original onApply function to record the application
    onApply();
  };

  const handleApplyClick = () => {
    // Determine which URL to use for application
    const applyUrl = opportunity.source_url || opportunity.application_url;
    
    if (applyUrl) {
      // For external URLs (scraped opportunities), apply directly without requiring sign-in
      window.open(applyUrl, '_blank', 'noopener,noreferrer');
      // Record the application in our system if user is signed in
      if (user) {
        onApply();
      }
    } else {
      // For user-submitted opportunities without external URLs, require sign-in
      if (!user) {
        // Redirect to auth page for user-submitted opportunities
        window.location.href = '/auth';
        return;
      }
      // If user is signed in, show the application modal
      setShowApplicationModal(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Quick Actions Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-[#008000] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#008000]" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleApplyClick}
            disabled={actionLoading}
            className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg ${
              hasApplied
                ? 'bg-[#008000] hover:bg-[#006400] text-white'
                : 'bg-[#008000] hover:bg-[#006400] text-white'
            }`}
          >
            <ExternalLink className="w-5 h-5 mr-2 text-white" />
            {hasApplied 
              ? 'Applied Successfully ✓' 
              : (opportunity.source_url || opportunity.application_url 
                  ? 'Apply on External Site' 
                  : (!user ? 'Sign In to Apply' : 'Apply Now')
                )
            }
          </Button>

          <div className="grid grid-cols-1 gap-3">
            <Button
              variant="outline"
              onClick={() => handleAnalysisToggle('steps')}
              disabled={loading}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all duration-300 border-2 ${
                activeAnalysis === 'steps' 
                  ? 'bg-[#008000]/10 border-[#008000] text-[#008000] shadow-md' 
                  : 'hover:bg-[#008000]/10 hover:border-[#008000] border-gray-200 text-[#008000]'
              }`}
            >
              <FileText className="w-4 h-4 text-[#008000]" />
              {activeAnalysis === 'steps' ? 'Hide Application Guide' : 'Get Application Guide'}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleAnalysisToggle('chance')}
              disabled={loading}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all duration-300 border-2 ${
                activeAnalysis === 'chance' 
                  ? 'bg-[#008000]/10 border-[#008000] text-[#008000] shadow-md' 
                  : 'hover:bg-[#008000]/10 hover:border-[#008000] border-gray-200 text-[#008000]'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-[#008000]" />
              {activeAnalysis === 'chance' ? 'Hide Success Analysis' : 'Analyze Success Rate'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Loading State */}
      {loading && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full"
              />
              <div className="text-center">
                <p className="font-semibold text-blue-900">
                  {activeAnalysis === 'steps' ? 'Generating Application Guide' : 'Analyzing Success Probability'}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  AI is processing your profile...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {activeAnalysis === 'steps' && steps && (
        <ApplicationSteps
          steps={steps.steps}
          timeline={steps.timeline}
          checklist={steps.checklist}
          onStepComplete={handleStepComplete}
          completedSteps={completedSteps}
        />
      )}

      {activeAnalysis === 'chance' && chanceAnalysis && (
        <ApplicationChanceAnalysis
          score={chanceAnalysis.score}
          percentage={chanceAnalysis.percentage}
          strengths={chanceAnalysis.strengths}
          weaknesses={chanceAnalysis.weaknesses}
          improvements={chanceAnalysis.improvements}
          recommendations={chanceAnalysis.recommendations}
          similarOpportunities={[]} // Remove similar opportunities as requested
        />
      )}

      {/* Enhanced Opportunity Details Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-gray-900">Opportunity Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {opportunity.location && (
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Location</p>
                <p className="font-semibold text-blue-800">{opportunity.location}</p>
              </div>
            </div>
          )}

          {opportunity.is_remote && (
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-900">Work Type</p>
                <Badge className="bg-green-100 text-green-800 font-medium">Remote Available</Badge>
              </div>
            </div>
          )}

          {opportunity.salary_range && (
            <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-900">Salary Range</p>
                <p className="font-semibold text-emerald-800">{opportunity.salary_range}</p>
              </div>
            </div>
          )}

          {opportunity.application_deadline && (
            <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-900">Application Deadline</p>
                <p className="font-semibold text-orange-800">{formatDate(opportunity.application_deadline)}</p>
              </div>
            </div>
          )}

          <Separator className="my-4" />

          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 font-medium">
              Posted on {formatDate(opportunity.created_at)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Application Modal */}
      <ApplicationModal
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        opportunity={opportunity}
        onSubmit={handleApplicationSubmit}
      />
    </div>
  );
};

export default OpportunitySidebar;
