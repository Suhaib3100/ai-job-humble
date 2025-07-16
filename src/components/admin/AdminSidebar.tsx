import React from 'react';
import { motion } from 'framer-motion';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  Target, 
  Clock, 
  Search,
  Code,
  Mail,
  Crown,
  Shield
} from 'lucide-react';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const AdminSidebar = ({ activeSection, onSectionChange }: AdminSidebarProps) => {
  const menuItems = [
    { id: 'listings-submissions', label: 'Listings & Submissions', icon: FileText },
    { id: 'scraping', label: 'Web Scraping', icon: Search },
    { id: 'bulk-scraping', label: 'Bulk Scraping', icon: Clock },
    { id: 'opportunities', label: 'Opportunities', icon: Target },
    { id: 'discover', label: 'Published Opportunities', icon: Mail },
    { id: 'submissions', label: 'User Submissions', icon: FileText },
    { id: 'users', label: 'All Users', icon: Users },
    { id: 'user-roles', label: 'User Roles', icon: Shield },
    { id: 'subscriptions', label: 'User Subscriptions', icon: Crown },
    { id: 'features', label: 'Feature Toggles', icon: Code },
    { id: 'settings', label: 'Platform Settings', icon: Settings },
  ];

  const containerVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <Sidebar className="border-r border-[#e6f5ec]/30 bg-white/90 backdrop-blur-md">
      <SidebarHeader className="p-6 border-b border-[#e6f5ec]/30">
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-10 h-10 bg-[#008000] rounded-xl flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#384040]">Admin Panel</h2>
            <p className="text-sm text-gray-500">PrimeChances</p>
          </div>
        </motion.div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <motion.div key={item.id} variants={itemVariants}>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => onSectionChange(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-[#e6f5ec] group ${
                        activeSection === item.id
                          ? 'bg-gradient-to-r from-[#17cfcf]/10 to-[#384040]/10 border-l-4 border-[#17cfcf] text-[#384040] font-semibold'
                          : 'text-gray-600 hover:text-[#384040]'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 text-[#008000] group-hover:text-[#218c1b] transition-colors duration-200`} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </motion.div>
              ))}
            </SidebarMenu>
          </motion.div>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-[#e6f5ec]/30">
        <motion.div 
          className="text-center text-xs text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          PrimeChances Admin v1.0
        </motion.div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
