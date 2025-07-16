import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
const AdminHeader = () => {
  return <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin</h1>
        <p className="text-gray-600">Comprehensive platform management and analytics</p>
      </div>
      <Button className="bg-[#008000] hover:bg-[#218c1b] text-white">
        <Plus className="w-4 h-4 mr-2 text-white" />
        Add Opportunity
      </Button>
    </div>;
};
export default AdminHeader;