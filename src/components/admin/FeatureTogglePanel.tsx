import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Settings, Save, RotateCcw, Users, FileText } from 'lucide-react';

interface FeatureToggle {
  id: string;
  feature_key: string;
  is_enabled: boolean;
  description: string;
}

const FeatureTogglePanel = () => {
  const { user } = useAuth();
  const [features, setFeatures] = useState<FeatureToggle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('feature_toggles')
        .select('*')
        .order('feature_key');

      if (error) throw error;
      setFeatures(data || []);
    } catch (error) {
      console.error('Error fetching features:', error);
      toast.error('Failed to load feature toggles');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChange = (featureKey: string, enabled: boolean) => {
    setChanges(prev => ({
      ...prev,
      [featureKey]: enabled
    }));
  };

  const saveChanges = async () => {
    if (Object.keys(changes).length === 0) {
      toast.info('No changes to save');
      return;
    }

    setSaving(true);
    try {
      for (const [featureKey, enabled] of Object.entries(changes)) {
        const { error } = await supabase
          .from('feature_toggles')
          .update({ 
            is_enabled: enabled,
            updated_by: user?.id,
            updated_at: new Date().toISOString()
          })
          .eq('feature_key', featureKey);

        if (error) throw error;

        // Log admin activity
        await supabase
          .from('admin_activity_logs')
          .insert({
            admin_id: user?.id,
            action: enabled ? 'FEATURE_ENABLED' : 'FEATURE_DISABLED',
            target_type: 'feature_toggle',
            details: { feature_key: featureKey, enabled }
          });
      }

      toast.success('Feature settings saved successfully');
      setChanges({});
      fetchFeatures();
    } catch (error) {
      console.error('Error saving features:', error);
      toast.error('Failed to save feature settings');
    } finally {
      setSaving(false);
    }
  };

  const resetChanges = () => {
    setChanges({});
    toast.info('Changes reset');
  };

  const getFeatureValue = (feature: FeatureToggle) => {
    return changes.hasOwnProperty(feature.feature_key) 
      ? changes[feature.feature_key] 
      : feature.is_enabled;
  };

  const getFeatureIcon = (featureKey: string) => {
    switch (featureKey) {
      case 'user_opportunity_posts':
        return <FileText className="w-4 h-4 text-[#008000]" />;
      case 'user_registration':
        return <Users className="w-4 h-4 text-[#008000]" />;
      default:
        return <Settings className="w-4 h-4 text-[#008000]" />;
    }
  };

  const getFeatureName = (featureKey: string) => {
    return featureKey
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const hasChanges = Object.keys(changes).length > 0;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
          <Settings className="w-5 h-5 text-[#008000]" />
            Feature Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
              </div>
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
          <Settings className="w-5 h-5" />
            <Settings className="w-5 h-5 text-[#008000]" />
          Feature Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {features.map((feature) => (
            <div key={feature.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  {getFeatureIcon(feature.feature_key)}
                  <Label className="text-sm font-medium">
                    {getFeatureName(feature.feature_key)}
                  </Label>
                </div>
                <p className="text-sm text-gray-600">{feature.description}</p>
                {feature.feature_key === 'user_opportunity_posts' && (
                  <p className="text-xs text-blue-600 font-medium">
                    Controls whether users can create and submit opportunity posts
                  </p>
                )}
              </div>
              <Switch
                checked={getFeatureValue(feature)}
                onCheckedChange={(checked) => handleToggleChange(feature.feature_key, checked)}
                className={getFeatureValue(feature) ? 'data-[state=checked]:bg-[#008000] data-[state=checked]:border-[#008000]' : ''}
              />
            </div>
          ))}
        </div>

        {hasChanges && (
          <div className="flex items-center gap-2 pt-4 border-t">
            <Button
              className="bg-[#008000] hover:bg-[#218c1b] text-white transition-colors duration-200"
              onClick={saveChanges} disabled={saving}
            >
              <Save className="w-4 h-4 mr-2 text-white" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="outline"
              className="text-[#008000] border-[#008000] hover:bg-[#e6f5ec] transition-colors duration-200"
              onClick={resetChanges}
            >
              <RotateCcw className="w-4 h-4 mr-2 text-[#008000]" />
              Reset
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeatureTogglePanel;
