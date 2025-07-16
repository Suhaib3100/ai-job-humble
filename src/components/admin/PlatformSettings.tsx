import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

const PlatformSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Platform Name</label>
            <Input defaultValue="PrimeChances" />
          </div>
          <div>
            <label className="text-sm font-medium">Max Free Applications</label>
            <Input type="number" defaultValue="10" />
          </div>
          <div>
            <label className="text-sm font-medium">Pro Subscription Price (NGN)</label>
            <Input type="number" defaultValue="2500" />
          </div>
          <Button className="bg-[#008000] hover:bg-[#218c1b] text-white transition-colors duration-200">
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlatformSettings;
