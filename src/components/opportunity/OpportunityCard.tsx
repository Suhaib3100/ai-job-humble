import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, DollarSign, Bookmark, BookmarkCheck, FileText, Share, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DocumentGeneratorModal } from '@/components/ai/DocumentGeneratorModal';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface OpportunityCardProps {
  opportunity: {
    id: string;
    title: string;
    organization: string;
    description: string;
    location?: string;
    application_deadline?: string;
    salary_range?: string;
    is_remote?: boolean;
    tags?: string[];
    application_url?: string;
  };
  isBookmarked?: boolean;
  onBookmarkToggle?: (opportunityId: string) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  isBookmarked = false,
  onBookmarkToggle
}) => {
  const navigate = useNavigate();
  const [showDocumentGenerator, setShowDocumentGenerator] = useState(false);

  const handleViewDetails = () => {
    navigate(`/opportunity/${opportunity.id}`);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmarkToggle?.(opportunity.id);
  };

  const handleGenerateDocument = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDocumentGenerator(true);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/opportunity/${opportunity.id}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: opportunity.title,
          text: `Check out this opportunity: ${opportunity.title} at ${opportunity.organization}`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied!",
          description: "Opportunity link copied to clipboard.",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied!",
          description: "Opportunity link copied to clipboard.",
        });
      } catch (clipboardError) {
        toast({
          title: "Share failed",
          description: "Could not share or copy link.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCopyDetails = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const detailsText = `
**${opportunity.title}**
Organization: ${opportunity.organization}
${opportunity.location ? `Location: ${opportunity.location}` : ''}
${opportunity.is_remote ? 'Work Type: Remote' : ''}
${opportunity.salary_range ? `Salary: ${opportunity.salary_range}` : ''}
${opportunity.application_deadline ? `Deadline: ${format(new Date(opportunity.application_deadline), 'MMM dd, yyyy')}` : ''}

Description:
${opportunity.description}

${opportunity.application_url ? `Apply at: ${opportunity.application_url}` : ''}
    `.trim();

    try {
      await navigator.clipboard.writeText(detailsText);
      toast({
        title: "Details copied!",
        description: "Opportunity details copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy opportunity details.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleViewDetails}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                {opportunity.title}
              </CardTitle>
              <p className="text-sm text-gray-600 mb-2">{opportunity.organization}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-[#008000] hover:text-[#008000]/80"
                title="Share opportunity"
              >
                <Share className="w-4 h-4" style={{ color: '#008000' }} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyDetails}
                className="text-[#008000] hover:text-[#008000]/80"
                title="Copy details"
              >
                <Copy className="w-4 h-4" style={{ color: '#008000' }} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className="text-[#008000] hover:text-[#008000]/80"
                title={isBookmarked ? "Unsave" : "Save"}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-4 h-4" style={{ color: '#008000' }} />
                ) : (
                  <Bookmark className="w-4 h-4" style={{ color: '#008000' }} />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-gray-700 mb-4 line-clamp-2">
            {opportunity.description}
          </p>

          {/* Opportunity Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-sm text-gray-600">
            {opportunity.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" style={{ color: '#008000' }} />
                <span className="truncate">
                  {opportunity.is_remote ? 'Remote' : opportunity.location}
                </span>
              </div>
            )}
            {opportunity.application_deadline && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" style={{ color: '#008000' }} />
                <span>Due {format(new Date(opportunity.application_deadline), 'MMM dd')}</span>
              </div>
            )}
            {opportunity.salary_range && (
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" style={{ color: '#008000' }} />
                <span className="truncate">{opportunity.salary_range}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {opportunity.tags && opportunity.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {opportunity.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {opportunity.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{opportunity.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleViewDetails} className="flex-1 bg-[#008000] text-white hover:bg-[#008000]/90" size="sm">
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* DocumentGeneratorModal removed for published opportunities */}
    </>
  );
};
