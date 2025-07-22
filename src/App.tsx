import CookieSettings from '@/pages/CookieSettings';
import About from '@/pages/About';
import TermsOfService from '@/pages/TermsOfService';
import PrivacyPolicy from '@/pages/PrivacyPolicy';

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import Opportunity from '@/pages/Opportunity';
import OpportunityApplication from '@/pages/OpportunityApplication';
import Category from '@/pages/Category';
import CreateOpportunity from '@/pages/CreateOpportunity';
import Subscription from '@/pages/Subscription';
import AIAssistant from '@/pages/AIAssistant';
import Onboarding from '@/pages/Onboarding';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminRoute from '@/components/AdminRoute';
import AdminSetup from '@/pages/AdminSetup';
import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster } from 'sonner';
import StaffAdminDashboard from '@/pages/StaffAdminDashboard';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <Toaster />
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/opportunity/:id" element={
              // <ProtectedRoute></ProtectedRoute>
              <Opportunity />
            } />
            <Route path="/opportunity/:id/apply" element={
              <ProtectedRoute>
                <OpportunityApplication />
              </ProtectedRoute>
            } />
            <Route path="/category/:id" element={
              <ProtectedRoute>
                <Category />
              </ProtectedRoute>
            } />
            <Route path="/create-opportunity" element={
              <ProtectedRoute>
                <CreateOpportunity />
              </ProtectedRoute>
            } />
            <Route path="/subscription" element={
              <ProtectedRoute>
                <Subscription />
              </ProtectedRoute>
            } />
            <Route path="/ai-assistant" element={
              <ProtectedRoute>
                <AIAssistant />
              </ProtectedRoute>
            } />
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } />
            <Route path="/cookie-settings" element={<CookieSettings />} />
            <Route path="/about" element={<About />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/administrator" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="/staff-admin" element={
              <AdminRoute>
                <StaffAdminDashboard />
              </AdminRoute>
            } />
            <Route path="/admin-setup" element={<AdminSetup />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </div>
    </QueryClientProvider>
  );
}

export default App;
