
import { Button } from '@/components/ui/button';
import { Send, Save, Eye } from 'lucide-react';

interface OpportunityFormActionsProps {
  userRole: 'user' | 'admin' | 'staff_admin';
  loading: boolean;
  onCancel: () => void;
  onSubmit: (isDraft?: boolean) => void;
}

const OpportunityFormActions = ({ userRole, loading, onCancel, onSubmit }: OpportunityFormActionsProps) => {
  const isAdmin = userRole === 'admin' || userRole === 'staff_admin';

  return (
    <div className="flex items-center justify-between pt-6 border-t">
      <Button type="button" variant="outline" onClick={onCancel} className="border-[#008000] text-[#008000] hover:bg-[#008000]/10 hover:text-white hover:border-[#006400]">
        Cancel
      </Button>
      
      <div className="flex gap-2">
        {!isAdmin && (
          <Button 
            type="button" 
            onClick={() => onSubmit()}
            disabled={loading}
            className="bg-[#008000] hover:bg-[#006400] text-white"
          >
            <Send className="w-4 h-4 mr-2 text-white" />
            {loading ? 'Submitting...' : 'Send for Review'}
          </Button>
        )}
        
        {isAdmin && (
          <>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onSubmit(true)}
              disabled={loading}
              className="border-[#008000] text-[#008000] hover:bg-[#008000]/10 hover:text-white hover:border-[#006400]"
            >
              <Save className="w-4 h-4 mr-2 text-[#008000] group-hover:text-white" />
              {loading ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button 
              type="button" 
              onClick={() => onSubmit(false)}
              disabled={loading}
              className="bg-[#008000] hover:bg-[#006400] text-white"
            >
              <Eye className="w-4 h-4 mr-2 text-white" />
              {loading ? 'Publishing...' : 'Create & Publish'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default OpportunityFormActions;
