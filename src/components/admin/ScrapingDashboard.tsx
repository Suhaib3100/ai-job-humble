import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Globe, 
  Calendar, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface ScrapingSource {
  id: string;
  name: string;
  url: string;
  is_active: boolean;
  last_scraped_at: string | null;
  success_rate: number;
  scraping_frequency: number;
}

interface ScrapingJob {
  id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  opportunities_found: number;
  opportunities_published: number;
  error_message: string | null;
  scraping_sources: { name: string };
}

interface ScrapingAnalytics {
  date: string;
  source_name: string;
  opportunities_scraped: number;
  opportunities_published: number;
  duplicates_detected: number;
  errors_count: number;
  avg_processing_time_ms: number;
}

const ScrapingDashboard = () => {
  const [sources, setSources] = useState<ScrapingSource[]>([]);
  const [jobs, setJobs] = useState<ScrapingJob[]>([]);
  const [analytics, setAnalytics] = useState<ScrapingAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sourcesResponse, jobsResponse, analyticsResponse] = await Promise.all([
        supabase.from('scraping_sources').select('*').order('name'),
        supabase
          .from('scraping_jobs')
          .select(`
            *,
            scraping_sources (name)
          `)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('scraping_analytics')
          .select('*')
          .order('date', { ascending: false })
          .limit(30)
      ]);

      if (sourcesResponse.error) throw sourcesResponse.error;
      if (jobsResponse.error) throw jobsResponse.error;
      if (analyticsResponse.error) throw analyticsResponse.error;

      setSources(sourcesResponse.data || []);
      setJobs(jobsResponse.data || []);
      setAnalytics(analyticsResponse.data || []);
    } catch (error) {
      console.error('Error fetching scraping data:', error);
      toast.error('Failed to load scraping data');
    } finally {
      setLoading(false);
    }
  };

  const triggerScraping = async (sourceId?: string) => {
    setScraping(true);
    try {
      const { error } = await supabase.functions.invoke('web-scraper', {
        body: { source_id: sourceId, manual_trigger: true }
      });

      if (error) throw error;

      toast.success('Scraping job started successfully');
      setTimeout(fetchData, 2000); // Refresh data after 2 seconds
    } catch (error) {
      console.error('Error triggering scraping:', error);
      toast.error('Failed to start scraping job');
    } finally {
      setScraping(false);
    }
  };

  const toggleSource = async (sourceId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('scraping_sources')
        .update({ is_active: !isActive })
        .eq('id', sourceId);

      if (error) throw error;

      toast.success(`Source ${!isActive ? 'activated' : 'deactivated'}`);
      fetchData();
    } catch (error) {
      console.error('Error toggling source:', error);
      toast.error('Failed to update source');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'running':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalOpportunitiesScraped = analytics.reduce((sum, a) => sum + a.opportunities_scraped, 0);
  const totalOpportunitiesPublished = analytics.reduce((sum, a) => sum + a.opportunities_published, 0);
  const totalDuplicates = analytics.reduce((sum, a) => sum + a.duplicates_detected, 0);
  const totalErrors = analytics.reduce((sum, a) => sum + a.errors_count, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Web Scraping Dashboard</h2>
          <p className="text-gray-600">Monitor and manage automated opportunity scraping</p>
        </div>
        <Button
          onClick={() => triggerScraping()}
          disabled={scraping}
          className="bg-[#008000] hover:bg-[#218c1b] text-white transition-colors duration-200"
        >
          {scraping ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin text-[#008000]" />
          ) : (
            <Play className="w-4 h-4 mr-2 text-[#008000]" />
          )}
          {scraping ? 'Scraping...' : 'Run All Scrapers'}
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scraped</CardTitle>
            <Globe className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOpportunitiesScraped}</div>
            <p className="text-xs text-muted-foreground">Opportunities found</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOpportunitiesPublished}</div>
            <p className="text-xs text-muted-foreground">Live on platform</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duplicates</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDuplicates}</div>
            <p className="text-xs text-muted-foreground">Filtered out</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalErrors}</div>
            <p className="text-xs text-muted-foreground">Failed attempts</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sources" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="jobs">Recent Jobs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle>Scraping Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sources.map((source) => (
                  <div key={source.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{source.name}</h3>
                        <Badge variant={source.is_active ? "default" : "secondary"}>
                          {source.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">
                          {source.success_rate}% success
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{source.url}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Frequency: {source.scraping_frequency}h</span>
                        <span>
                          Last scraped: {source.last_scraped_at 
                            ? new Date(source.last_scraped_at).toLocaleDateString()
                            : 'Never'
                          }
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => triggerScraping(source.id)}
                        disabled={scraping}
                        className="bg-white hover:bg-[#008000] text-[#008000] border border-[#008000] transition-colors duration-200"
                      >
                        <Play className="w-4 h-4 text-[#008000]" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleSource(source.id, source.is_active)}
                        className={`
                          bg-white text-[#008000] border border-[#008000] hover:bg-[#008000] hover:text-white transition-colors duration-200
                        `}
                      >
                        {source.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Recent Scraping Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(job.status)}
                      <div>
                        <h3 className="font-medium">{job.scraping_sources?.name}</h3>
                        <p className="text-sm text-gray-600">
                          Started: {new Date(job.started_at).toLocaleString()}
                        </p>
                        {job.error_message && (
                          <p className="text-sm text-red-600 mt-1">{job.error_message}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                      <div className="text-sm text-gray-600 mt-1">
                        Found: {job.opportunities_found} | Published: {job.opportunities_published}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Scraping Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{stat.source_name}</h3>
                      <p className="text-sm text-gray-600">{new Date(stat.date).toLocaleDateString()}</p>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium">{stat.opportunities_scraped}</div>
                        <div className="text-gray-500">Scraped</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{stat.opportunities_published}</div>
                        <div className="text-gray-500">Published</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{stat.duplicates_detected}</div>
                        <div className="text-gray-500">Duplicates</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">
                          {stat.avg_processing_time_ms ? `${Math.round(stat.avg_processing_time_ms / 1000)}s` : '-'}
                        </div>
                        <div className="text-gray-500">Avg Time</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScrapingDashboard;
