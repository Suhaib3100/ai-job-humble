
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LogOut, Bell, Search, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import EnhancedStatsCards from './EnhancedStatsCards';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const AdminLayout = ({ children, activeSection, onSectionChange }: AdminLayoutProps) => {
  const { signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-[#e6f5ec]/5 to-white">
        <AdminSidebar 
          activeSection={activeSection} 
          onSectionChange={onSectionChange} 
        />
        
        <SidebarInset className="flex-1 min-w-0">
          {/* Enhanced Top Header - Mobile Responsive */}
          <motion.header 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex h-16 md:h-20 shrink-0 items-center justify-between border-b border-[#e6f5ec]/30 bg-white/80 backdrop-blur-md px-4 md:px-8 sticky top-0 z-50"
          >
            <div className="flex items-center gap-2 md:gap-4">
              <SidebarTrigger className="p-2 rounded-xl hover:bg-[#e6f5ec]/30 transition-all duration-200 md:hidden" />
              <motion.div 
                className="text-lg md:text-2xl font-bold text-black"
                whileHover={{ scale: 1.05 }}
              >
                <span className="hidden md:inline">Admin Dashboard</span>
                <span className="md:hidden">Admin</span>
              </motion.div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              {/* Search - Hidden on mobile */}
              <motion.div 
                className="relative hidden lg:block"
                whileHover={{ scale: 1.02 }}
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 bg-[#e6f5ec]/20 border border-[#e6f5ec]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008000]/50 focus:border-[#008000] transition-all duration-200 w-48"
                />
              </motion.div>

              {/* Notifications */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="relative rounded-xl hover:bg-[#e6f5ec]/30 transition-all duration-200 w-8 h-8 md:w-10 md:h-10"
                >
                  <Bell className="h-4 w-4 md:h-5 md:w-5 text-[#008000]" />
                  <span className="absolute -top-1 -right-1 h-2 w-2 md:h-3 md:w-3 bg-[#008000] rounded-full"></span>
                </Button>
              </motion.div>

              {/* Sign Out */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="border-2 border-[#e6f5ec] hover:border-[#008000] hover:bg-[#008000] hover:text-white rounded-xl px-3 md:px-6 py-1 md:py-2 transition-all duration-300 text-sm md:text-base"
                >
                  <LogOut className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  <span className="hidden md:inline">Sign Out</span>
                </Button>
              </motion.div>
            </div>
          </motion.header>

          {/* Main Content - Mobile Responsive */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 space-y-4 md:space-y-8 p-4 md:p-8 overflow-x-hidden"
          >
            <AdminHeader />
            <div className="hidden md:block">
              <EnhancedStatsCards />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl border border-[#e6f5ec]/30 shadow-lg p-4 md:p-8 overflow-x-auto"
            >
              {children}
            </motion.div>
          </motion.div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
