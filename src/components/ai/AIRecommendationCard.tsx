import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, DollarSign, Eye, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface AIRecommendationCardProps {
  recommendation: {
    id: string;
    opportunity_id: string;
    match_score: number;
    reasons: string[];
    created_at: string;
    is_viewed: boolean;
    opportunities: {
      id: string;
      title: string;
      organization: string;
      description: string;
      location?: string;
      application_deadline?: string;
      salary_range?: string;
      is_remote?: boolean;
    };
  };
  onMarkAsViewed: (id: string) => void;
}

export const AIRecommendationCard: React.FC<AIRecommendationCardProps> = ({
  recommendation,
  onMarkAsViewed
}) => {
  const navigate = useNavigate();
  const { opportunities: opp } = recommendation;

  const handleViewOpportunity = () => {
    if (!recommendation.is_viewed) {
      onMarkAsViewed(recommendation.id);
    }
    navigate(`/opportunity/${opp.id}`);
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-blue-500';
    if (score >= 0.4) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getMatchScoreText = (score: number) => {
    if (score >= 0.8) return 'Excellent Match';
    if (score >= 0.6) return 'Strong Match';
    if (score >= 0.4) return 'Good Match';
    return 'Fair Match';
  };

  const formatDescription = (description: string) => {
    if (!description) return 'No description available';
    return description.length > 150 ? `${description.substring(0, 150)}...` : description;
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${!recommendation.is_viewed ? 'ring-2 ring-blue-200' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
              {opp.title}
            </CardTitle>
            <p className="text-sm text-gray-600 mb-2">{opp.organization}</p>
          </div>
          <div className="flex items-center gap-2">
            {!recommendation.is_viewed && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                New
              </Badge>
            )}
            <Badge 
              className={`bg-[#008000] text-white transition-colors duration-200 hover:bg-[#006400] cursor-pointer`}
            >
              {Math.round(recommendation.match_score * 100)}% {getMatchScoreText(recommendation.match_score)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-gray-700 mb-4 line-clamp-2">
          {formatDescription(opp.description)}
        </p>

        {/* Match Reasons */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Why this matches you:</h4>
          <ul className="space-y-1">
            {recommendation.reasons.slice(0, 3).map((reason, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                {reason}
              </li>
            ))}
          </ul>
        </div>

        {/* Opportunity Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-sm text-gray-600">
          {opp.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span className="truncate">
                {opp.is_remote ? 'Remote' : opp.location}
              </span>
            </div>
          )}
          
          {opp.application_deadline && (
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Due {format(new Date(opp.application_deadline), 'MMM dd')}</span>
            </div>
          )}
          
          {opp.salary_range && (
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span className="truncate">{opp.salary_range}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleViewOpportunity}
            className="flex-1 bg-[#008000] hover:bg-[#006400] text-white"
            size="sm"
          >
            <Eye className="w-4 h-4 mr-2 text-white" />
            View Details
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleViewOpportunity}
            className="border-[#008000] text-[#008000] hover:bg-[#008000]/10 hover:text-white hover:border-[#006400]"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          Recommended {format(new Date(recommendation.created_at), 'MMM dd, yyyy')}
        </div>
      </CardContent>
    </Card>
  );
};
