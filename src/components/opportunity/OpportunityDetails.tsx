
import React from 'react';
import { useState } from 'react';
import { DocumentGeneratorModal } from '@/components/ai/DocumentGeneratorModal';
import { useAuth } from '@/hooks/useAuth';
import { useUserTier } from '@/hooks/useUserTier';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MapPin, Calendar, Building, Globe, DollarSign, Clock, CheckCircle, FileText, ExternalLink } from 'lucide-react';

interface OpportunityDetailsProps {
  opportunity: {
    id: string;
    title: string;
    description: string;
    organization: string;
    location?: string;
    is_remote?: boolean;
    salary_range?: string;
    application_deadline?: string;
    application_url?: string;
    source_url?: string;
    requirements?: string[];
    benefits?: string[];
    tags?: string[];
    created_at: string;
    category: {
      name: string;
      color?: string;
    };
  };
}

const OpportunityDetails = ({ opportunity }: OpportunityDetailsProps) => {
  const [showDocumentGenerator, setShowDocumentGenerator] = useState(false);
  const { user } = useAuth();
  const { tier } = useUserTier();
  // Adjust tier check to match actual possible values from useUserTier
  const isSubscribed = ["pro", "premium"].includes(tier);
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format description to handle line breaks and structure
  const formatDescription = (description: string) => {
    if (!description) return 'No detailed description available for this opportunity.';
    
    // Split by common delimiters and clean up
    const paragraphs = description
      .split(/\n\n|\r\n\r\n/)
      .filter(p => p.trim().length > 0)
      .map(p => p.trim());
    
    if (paragraphs.length <= 1) {
      // If no clear paragraph breaks, try to split by sentences for better readability
      const sentences = description.split(/(?<=[.!?])\s+/)
        .filter(s => s.trim().length > 20); // Only include substantial sentences
      
      if (sentences.length > 3) {
        return sentences.reduce((acc, sentence, index) => {
          if (index > 0 && index % 3 === 0) {
            acc += '\n\n' + sentence;
          } else {
            acc += (index > 0 ? ' ' : '') + sentence;
          }
          return acc;
        }, '');
      }
    }
    
    return paragraphs.join('\n\n');
  };

  return (
    <div className="space-y-8">
      {/* Header Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="pb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <CardTitle className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
                {opportunity.title}
              </CardTitle>
              <div className="flex items-center gap-2 mb-4">
                <Badge 
                  variant="outline"
                  className="border-[#17cfcf] text-[#17cfcf] bg-[#17cfcf]/10 text-sm px-3 py-1"
                >
                  {opportunity.category.name}
                </Badge>
                {opportunity.is_remote && (
                  <Badge className="bg-green-100 text-green-800 text-sm px-3 py-1">
                    Remote Available
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
              <Building className="w-5 h-5" style={{ color: '#008000' }} />
              <div>
                <p className="text-sm font-medium text-blue-950">Organization</p>
                <p className="font-semibold text-blue-950">{opportunity.organization}</p>
              </div>
            </div>

            {opportunity.location && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                <MapPin className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">Location</p>
                  <p className="font-semibold text-green-800">{opportunity.location}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
              <Calendar className="w-5 h-5" style={{ color: '#008000' }} />
              <div>
                <p className="text-sm font-medium text-blue-950">Posted</p>
                <p className="font-semibold text-blue-950">{formatDate(opportunity.created_at)}</p>
              </div>
            </div>
          </div>

          {opportunity.application_deadline && (
            <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-orange-900">Application Deadline</p>
                  <p className="font-bold text-orange-800 text-lg">
                    {formatDate(opportunity.application_deadline)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Description Card */}
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6" style={{ color: '#008000' }} />
            About This Opportunity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-gray max-w-none">
            {formatDescription(opportunity.description).split('\n\n').map((paragraph, index) => (
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-gray-700 leading-relaxed mb-4 text-lg"
              >
                {paragraph}
              </motion.p>
            ))}
            
            {(!opportunity.description || opportunity.description.trim().length < 50) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-yellow-800 font-medium">
                  Limited details available for this opportunity. 
                  Please click "Apply Now" to visit the official page for complete information.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Requirements Card */}
      {opportunity.requirements && opportunity.requirements.length > 0 && (
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {opportunity.requirements.map((requirement, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-2 h-2 bg-[#022e06] rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{requirement}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Benefits Card */}
      {opportunity.benefits && opportunity.benefits.length > 0 && (
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-blue-600" />
              Benefits & Perks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {opportunity.benefits.map((benefit, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
                >
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* External Application Link */}
      {(opportunity.source_url || opportunity.application_url) && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ExternalLink className="w-6 h-6" style={{ color: '#008000' }} />
              Apply for This Opportunity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-xl p-6 border border-green-200">
              <div className="text-center space-y-4">
                <p className="text-gray-700 text-lg">
                  This opportunity requires you to apply through the official website.
                </p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                  <Button
                    onClick={() => window.open(opportunity.source_url || opportunity.application_url, '_blank', 'noopener,noreferrer')}
                    className="bg-[#008000] hover:bg-[#008000]/90 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" style={{ color: '#fff' }} />
                    Apply on Official Website
                  </Button>
                  <Button
                    variant="outline"
                    className="px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-[#008000] text-[#008000]"
                    onClick={() => {
                      if (!isSubscribed) {
                        window.location.href = '/subscription';
                      } else {
                        setShowDocumentGenerator(true);
                      }
                    }}
                  >
                    <FileText className="w-5 h-5 mr-2" style={{ color: '#008000' }} />
                    Use AI
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  You'll be redirected to the official application page in a new tab. No sign-in required.
                </p>
              </div>
              {/* Only render modal if subscribed */}
              {isSubscribed && (
                <DocumentGeneratorModal
                  isOpen={showDocumentGenerator}
                  onClose={() => setShowDocumentGenerator(false)}
                  opportunityId={opportunity.id}
                  opportunityTitle={opportunity.title}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User-Submitted Opportunity Application */}
      {!opportunity.source_url && !opportunity.application_url && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-orange-600" />
              Apply for This Opportunity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-xl p-6 border border-orange-200">
              <div className="text-center space-y-4">
                <p className="text-gray-700 text-lg">
                  This is a user-submitted opportunity. You need to sign in to apply.
                </p>
                <Button
                  onClick={() => window.location.href = '/auth'}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Sign In to Apply
                </Button>
                <p className="text-sm text-gray-500">
                  Create an account or sign in to submit your application.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {opportunity.tags && opportunity.tags.length > 0 && (
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {opportunity.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OpportunityDetails;
