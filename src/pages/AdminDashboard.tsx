
import Admin from './Admin';
import { Button } from '@/components/ui/button';

const AdminDashboard = () => {
  return (
    <>
      <Admin />
      <div className="mt-8 flex justify-center">
        <Button asChild className="bg-[#008000] text-white px-6 py-3 text-lg font-semibold rounded-xl shadow-lg hover:bg-[#008000]/90 transition-all duration-200">
          <a href="/staff-admin">Staff Admin Dashboard</a>
        </Button>
      </div>
    </>
  );
};

export default AdminDashboard;
