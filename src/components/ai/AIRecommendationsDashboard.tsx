import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, TrendingUp, Target } from 'lucide-react';
import { AIRecommendationCard } from './AIRecommendationCard';
import { useAIRecommendations } from '@/hooks/useAIRecommendations';

export const AIRecommendationsDashboard: React.FC = () => {
  const { 
    recommendations, 
    loading, 
    generateRecommendations, 
    markAsViewed,
    refetch 
  } = useAIRecommendations();

  useEffect(() => {
    refetch();
  }, []);

  const unviewedCount = recommendations.filter(r => !r.is_viewed).length;
  const highMatchCount = recommendations.filter(r => r.match_score >= 0.8).length;
  const averageScore = recommendations.length > 0 
    ? recommendations.reduce((sum, r) => sum + r.match_score, 0) / recommendations.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#008000] flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#008000]" />
            AI Recommendations
          </h2>
          <p className="text-gray-600 mt-1">
            Personalized opportunity matches based on your profile
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={refetch} 
            disabled={loading}
            className="border-[#008000] text-[#008000] hover:bg-[#008000]/10 hover:text-white hover:border-[#006400]"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''} text-[#008000]`} />
            Refresh
          </Button>
          <Button 
            onClick={generateRecommendations} 
            disabled={loading}
            className="bg-[#008000] hover:bg-[#006400] text-white"
          >
            <Sparkles className="w-4 h-4 mr-2 text-white" />
            Generate New
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#008000]/10 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-[#008000]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">New Recommendations</p>
                <p className="text-2xl font-bold">{unviewedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#008000]/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#008000]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">High Matches</p>
                <p className="text-2xl font-bold">{highMatchCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#008000]/10 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#008000]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Match</p>
                <p className="text-2xl font-bold">{Math.round(averageScore * 100)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations List */}
      {loading && recommendations.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your profile and generating AI recommendations...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
        </div>
      ) : recommendations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Opportunities Available</h3>
            <p className="text-gray-600 mb-4">
              There are currently no opportunities in our database. Check back later for new postings.
            </p>
            <Button 
              onClick={generateRecommendations} 
              disabled={loading}
              className="bg-[#008000] hover:bg-[#006400] text-white"
            >
              <Sparkles className="w-4 h-4 mr-2 text-white" />
              Refresh
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {recommendations.map((recommendation) => (
            <AIRecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              onMarkAsViewed={markAsViewed}
            />
          ))}
        </div>
      )}

      {/* Show loading indicator when refreshing */}
      {loading && recommendations.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-[#008000] text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
          <span>Updating recommendations...</span>
        </div>
      )}
    </div>
  );
};
