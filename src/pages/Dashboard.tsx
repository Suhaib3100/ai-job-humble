import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useNavigate } from 'react-router-dom';
import { useUserTier } from '@/hooks/useUserTier';
import { useFeatureToggle } from '@/hooks/useFeatureToggle';
import {
  Briefcase,
  GraduationCap,
  Users,
  Lightbulb,
  UserPlus,
  DollarSign,
  Trophy,
  Calendar,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import StatsCards from '@/components/dashboard/StatsCards';
import CategoriesSidebar from '@/components/dashboard/CategoriesSidebar';
import MainContent from '@/components/dashboard/MainContent';
import SearchBar from '@/components/SearchBar';
import AddOpportunityButton from '@/components/profile/AddOpportunityButton';
import AIChatWidget from '@/components/ai/AIChatWidget';
import UpgradePrompt from '@/components/subscription/UpgradePrompt';
import { AIRecommendationsDashboard } from '@/components/ai/AIRecommendationsDashboard';
import { DocumentGeneratorModal } from '@/components/ai/DocumentGeneratorModal';

const Dashboard = () => {
  const [showDocumentGenerator, setShowDocumentGenerator] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin, adminCheckComplete } = useAdminRole();
  const navigate = useNavigate();
  const { tier } = useUserTier();
  const { isEnabled: categoryRestrictionEnabled } = useFeatureToggle('restrict_free_user_categories');

  const [userStats, setUserStats] = useState({
    savedOpportunities: 0,
    applications: 0,
    successRate: 85
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);

  useEffect(() => {
    fetchUserStats();
    fetchCategories();
  }, [user]);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      // Fetch bookmarks count
      const { count: bookmarksCount } = await supabase
        .from('user_bookmarks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch applications count
      const { count: applicationsCount } = await supabase
        .from('user_applications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setUserStats({
        savedOpportunities: bookmarksCount || 0,
        applications: applicationsCount || 0,
        successRate: 85 // Mock data for now
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          opportunities(count)
        `)
        .eq('is_active', true);

      if (error) throw error;

      const categoriesWithIcons = data?.map(category => ({
        ...category,
        icon: getCategoryIcon(category.name),
        count: category.opportunities?.length || 0
      })) || [];

      setCategories(categoriesWithIcons);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    const iconMap: { [key: string]: any } = {
      'Jobs': Briefcase,
      'Scholarships': GraduationCap,
      'Fellowships': Users,
      'Career Tips': Lightbulb,
      'Internships': UserPlus,
      'Grants': DollarSign
    };
    return iconMap[categoryName] || Briefcase;
  };

  const handleSearchResult = (result: any) => {
    console.log('Selected search result:', result);
    navigate(`/opportunity/${result.id}`);
  };

  const handleCategoryClick = (category: any) => {
    // Check if category restriction is enabled and user is free tier
    if (categoryRestrictionEnabled && tier === 'free' && category) {
      const allowedCategories = ['Jobs', 'Internships']; // First two categories for free users
      if (!allowedCategories.includes(category.name)) {
        setShowUpgradePrompt(true);
        return;
      }
    }

    if (category) {
      setSelectedCategory(category);
    } else {
      setSelectedCategory(null);
    }
  };

  if (showAIRecommendations) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#e6f5ec]/20">
        <DashboardHeader
          user={user}
          isAdmin={isAdmin}
          adminCheckComplete={adminCheckComplete}
          onResultSelect={handleSearchResult}
          onSignOut={signOut}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => setShowAIRecommendations(false)}
              className="mb-4"
            >
              ← Back to Dashboard
            </Button>
          </div>
          <AIRecommendationsDashboard />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#e6f5ec]/20">
      <DashboardHeader
        user={user}
        isAdmin={isAdmin}
        adminCheckComplete={adminCheckComplete}
        onResultSelect={handleSearchResult}
        onSignOut={signOut}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6 sm:mb-8"
        >
          <WelcomeSection user={user} />
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* ATS CV Maker button for subscribed users, else redirect to subscription */}
            <Button
              className="bg-[#008000] hover:bg-[#218c1b] text-white shadow-lg w-full sm:w-auto"
              onClick={() => {
                if (["pro", "premium"].includes(tier)) {
                  setShowDocumentGenerator(true);
                } else {
                  window.location.href = '/subscription';
                }
              }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span>ATS CV Maker</span>
            </Button>
          </div>
          {showDocumentGenerator && ["pro", "premium"].includes(tier) && (
            <DocumentGeneratorModal
              isOpen={showDocumentGenerator}
              onClose={() => setShowDocumentGenerator(false)}
              opportunityId={user?.id || ""}
              opportunityTitle={user?.user_metadata?.full_name || "ATS CV"}
            />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6 sm:mb-8"
        >
          <StatsCards userStats={userStats} />
        </motion.div>

        {/* Enhanced Search Bar Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8 sm:mb-12"
        >
          <div className="flex justify-center">
            <div className="relative w-full max-w-2xl">
              <div className="absolute inset-0 bg-[#008000]/20 rounded-2xl blur-xl"></div>
              <div className="relative bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-[#e6f5ec]/50 shadow-lg">
                <SearchBar onResultSelect={handleSearchResult} />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="lg:col-span-1 order-2 lg:order-1"
          >
            <CategoriesSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryClick={handleCategoryClick}
              userTier={tier}
              categoryRestrictionEnabled={categoryRestrictionEnabled}
            />
          </motion.div>

          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="lg:col-span-3 order-1 lg:order-2"
          >
            <MainContent
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
              viewMode="grid"
              handleViewMode={() => { }}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* AI Chat Widget */}
      <AIChatWidget />

      {/* Upgrade Prompt */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
      />
    </div>
  );
};

export default Dashboard;
