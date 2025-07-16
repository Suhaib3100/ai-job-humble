import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2, Globe, Play, Clock, CheckCircle, XCircle, X } from 'lucide-react';

interface Website {
  url: string;
  name: string;
  selectors: {
    title: string;
    description: string;
    organization: string;
    location?: string;
    deadline?: string;
  };
}

interface BulkConfig {
  id: string;
  name: string;
  description: string;
  websites: Website[];
  is_active: boolean;
  created_at: string;
}

interface BulkJob {
  id: string;
  config_id: string;
  status: string;
  total_jobs_found: number;
  total_jobs_published: number;
  errors_count: number;
  started_at: string;
  completed_at?: string;
}

const BulkScrapingManager = () => {
  const [configs, setConfigs] = useState<BulkConfig[]>([]);
  const [jobs, setJobs] = useState<BulkJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newConfig, setNewConfig] = useState({
    name: '',
    description: '',
    websites: [] as Website[]
  });
  const [newWebsite, setNewWebsite] = useState<Website>({
    url: '',
    name: '',
    selectors: {
      title: '',
      description: '',
      organization: '',
      location: '',
      deadline: ''
    }
  });

  useEffect(() => {
    fetchConfigs();
    fetchJobs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('bulk_scraping_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface with proper type casting
      const transformedConfigs = data?.map(config => ({
        ...config,
        websites: Array.isArray(config.websites) ? config.websites as unknown as Website[] : []
      })) || [];
      
      setConfigs(transformedConfigs);
    } catch (error) {
      console.error('Error fetching configs:', error);
      toast.error('Failed to load scraping configurations');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('bulk_scraping_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const addWebsite = () => {
    if (!newWebsite.url || !newWebsite.name) {
      toast.error('Please fill in website URL and name');
      return;
    }

    setNewConfig(prev => ({
      ...prev,
      websites: [...prev.websites, { ...newWebsite }]
    }));

    setNewWebsite({
      url: '',
      name: '',
      selectors: {
        title: '',
        description: '',
        organization: '',
        location: '',
        deadline: ''
      }
    });
  };

  const removeWebsite = (index: number) => {
    setNewConfig(prev => ({
      ...prev,
      websites: prev.websites.filter((_, i) => i !== index)
    }));
  };

  const saveConfig = async () => {
    if (!newConfig.name || newConfig.websites.length === 0) {
      toast.error('Please provide a name and at least one website');
      return;
    }

    try {
      const { error } = await supabase
        .from('bulk_scraping_configs')
        .insert({
          name: newConfig.name,
          description: newConfig.description,
          websites: newConfig.websites as any,
          is_active: true
        });

      if (error) throw error;

      toast.success('Scraping configuration saved successfully');
      setShowCreateForm(false);
      setNewConfig({ name: '', description: '', websites: [] });
      fetchConfigs();
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save configuration');
    }
  };

  const runBulkScraping = async (configId: string) => {
    try {
      const { error } = await supabase.functions.invoke('bulk-job-scraper', {
        body: { config_id: configId }
      });

      if (error) throw error;

      toast.success('Bulk scraping job started successfully');
      fetchJobs();
    } catch (error) {
      console.error('Error starting bulk scraping:', error);
      toast.error('Failed to start bulk scraping job');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'running':
        return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bulk Scraping Manager</CardTitle>
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
    <div className="space-y-6">
      {/* Configuration Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Scraping Configurations
            </CardTitle>
            <Button onClick={() => setShowCreateForm(true)} className="bg-[#008000] hover:bg-[#218c1b] text-white transition-colors duration-200">
              <Plus className="w-4 h-4 mr-2 text-white" />
              Add Configuration
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showCreateForm ? (
            <div className="space-y-6 border rounded-lg p-6 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Create New Configuration</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="config-name">Configuration Name</Label>
                  <Input
                    id="config-name"
                    value={newConfig.name}
                    onChange={(e) => setNewConfig(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Tech Jobs Scraper"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="config-description">Description</Label>
                  <Input
                    id="config-description"
                    value={newConfig.description}
                    onChange={(e) => setNewConfig(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this configuration"
                  />
                </div>
              </div>

              {/* Website Form */}
              <div className="border rounded-lg p-4 bg-white">
                <h4 className="font-medium mb-4">Add Website</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label>Website URL</Label>
                    <Input
                      value={newWebsite.url}
                      onChange={(e) => setNewWebsite(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://example.com/jobs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Website Name</Label>
                    <Input
                      value={newWebsite.name}
                      onChange={(e) => setNewWebsite(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Example Jobs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label>Title Selector</Label>
                    <Input
                      value={newWebsite.selectors.title}
                      onChange={(e) => setNewWebsite(prev => ({
                        ...prev,
                        selectors: { ...prev.selectors, title: e.target.value }
                      }))}
                      placeholder=".job-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description Selector</Label>
                    <Input
                      value={newWebsite.selectors.description}
                      onChange={(e) => setNewWebsite(prev => ({
                        ...prev,
                        selectors: { ...prev.selectors, description: e.target.value }
                      }))}
                      placeholder=".job-description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Organization Selector</Label>
                    <Input
                      value={newWebsite.selectors.organization}
                      onChange={(e) => setNewWebsite(prev => ({
                        ...prev,
                        selectors: { ...prev.selectors, organization: e.target.value }
                      }))}
                      placeholder=".company-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location Selector (Optional)</Label>
                    <Input
                      value={newWebsite.selectors.location || ''}
                      onChange={(e) => setNewWebsite(prev => ({
                        ...prev,
                        selectors: { ...prev.selectors, location: e.target.value }
                      }))}
                      placeholder=".job-location"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Deadline Selector (Optional)</Label>
                    <Input
                      value={newWebsite.selectors.deadline || ''}
                      onChange={(e) => setNewWebsite(prev => ({
                        ...prev,
                        selectors: { ...prev.selectors, deadline: e.target.value }
                      }))}
                      placeholder=".application-deadline"
                    />
                  </div>
                </div>

                <Button onClick={addWebsite} size="sm" className="bg-[#008000] hover:bg-[#218c1b] text-white transition-colors duration-200">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Website
                </Button>
              </div>

              {/* Added Websites List */}
              {newConfig.websites.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Added Websites ({newConfig.websites.length})</h4>
                  {newConfig.websites.map((website, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                      <div>
                        <p className="font-medium">{website.name}</p>
                        <p className="text-sm text-gray-600">{website.url}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeWebsite(index)}
                        className="bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button onClick={saveConfig} className="bg-[#008000] hover:bg-[#218c1b] text-white transition-colors duration-200">
                  Save Configuration
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {configs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No configurations found</p>
              ) : (
                configs.map((config) => (
                  <div key={config.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{config.name}</h3>
                      <p className="text-sm text-gray-600">{config.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant={config.is_active ? 'default' : 'secondary'}>
                          {config.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {config.websites.length} websites
                        </span>
                      </div>
                    </div>
                    <Button onClick={() => runBulkScraping(config.id)} className="bg-white hover:bg-[#008000] text-[#008000] hover:text-white border border-[#008000] transition-colors duration-200">
                      <Play className="w-4 h-4 mr-2" />
                      Run Scraping
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Scraping Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {jobs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No scraping jobs found</p>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <p className="font-medium">Job #{job.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-600">
                        Started: {new Date(job.started_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      Found: {job.total_jobs_found} | Published: {job.total_jobs_published}
                    </p>
                    {job.errors_count > 0 && (
                      <p className="text-sm text-red-600">Errors: {job.errors_count}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkScrapingManager;
