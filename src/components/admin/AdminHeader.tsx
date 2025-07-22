import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
const AdminHeader = () => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin</h1>
        <p className="text-gray-600">Comprehensive platform management and analytics</p>
      </div>
      <div className="flex gap-4">
        <Button className="bg-[#008000] hover:bg-[#218c1b] text-white">
          <Plus className="w-4 h-4 mr-2 text-white" />
          Add Opportunity
        </Button>
        <Button asChild className="bg-[#008000] text-white px-6 py-3 text-lg font-semibold rounded-xl shadow-lg hover:bg-[#008000]/90 transition-all duration-200">
          <Link to="/staff-admin">Staff Admin Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};
export default AdminHeader;