
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  FileText, 
  Mic, 
  Brain, 
  Sparkles,
  Crown
} from 'lucide-react';
import ProfileHeader from '@/components/profile/ProfileHeader';
import { AIRecommendationsDashboard } from '@/components/ai/AIRecommendationsDashboard';
import { DocumentGeneratorModal } from '@/components/ai/DocumentGeneratorModal';
import { VoiceInterface } from '@/components/ai/VoiceInterface';
import AIChatWidget from '@/components/ai/AIChatWidget';
import FeatureGate from '@/components/subscription/FeatureGate';
import { useUserTier } from '@/hooks/useUserTier';

const AIAssistant = () => {
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const { hasProAccess, tier, loading } = useUserTier();

  const features = [
    {
      icon: MessageSquare,
      title: 'AI Chat Assistant',
      description: 'Get instant help with career questions and guidance',
      available: true,
      component: <AIChatWidget />
    },
    {
      icon: Brain,
      title: 'Smart Recommendations',
      description: 'AI-powered opportunity matching based on your profile',
      available: true,
      component: <AIRecommendationsDashboard />
    },
    {
      icon: FileText,
      title: 'Document Generator',
      description: 'Generate professional CVs, SOPs, and cover letters',
      available: hasProAccess(),
      isPro: true
    },
    {
      icon: Mic,
      title: 'Voice Assistant',
      description: 'Talk to our AI assistant using natural speech',
      available: hasProAccess(),
      isPro: true
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <ProfileHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#008000]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white">
      <ProfileHeader />
      
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#008000] mb-2">
                AI Assistant
              </h1>
              <p className="text-gray-600">
                Supercharge your career journey with AI-powered tools
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={tier === 'pro' ? 'default' : 'secondary'} className={tier === 'pro' ? 'bg-amber-500' : 'bg-[#008000]/20 text-[#008000] border-[#008000]'}>
                {tier === 'pro' ? (
                  <>
                    <Crown className="h-3 w-3 mr-1" />
                    Pro
                  </>
                ) : (
                  'Free'
                )}
              </Badge>
            </div>
          </div>

          <Tabs defaultValue="recommendations" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="recommendations">
                <Brain className="h-4 w-4 mr-2 text-[#008000]" />
                <span className="text-[#008000]">Recommendations</span>
              </TabsTrigger>
              <TabsTrigger value="chat">
                <MessageSquare className="h-4 w-4 mr-2 text-[#008000]" />
                <span className="text-[#008000]">Chat</span>
              </TabsTrigger>
              <TabsTrigger value="documents" disabled={!hasProAccess()}>
                <FileText className="h-4 w-4 mr-2 text-[#008000]" />
                <span className="text-[#008000]">Documents</span>
                {!hasProAccess() && <Crown className="h-3 w-3 ml-1 text-amber-500" />}
              </TabsTrigger>
              <TabsTrigger value="voice" disabled={!hasProAccess()}>
                <Mic className="h-4 w-4 mr-2 text-[#008000]" />
                <span className="text-[#008000]">Voice</span>
                {!hasProAccess() && <Crown className="h-3 w-3 ml-1 text-amber-500" />}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recommendations">
              <AIRecommendationsDashboard />
            </TabsContent>

            <TabsContent value="chat">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-[#008000]" />
                    <span className="text-[#008000]">AI Chat Assistant</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AIChatWidget />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents">
              {hasProAccess() ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-[#008000]" />
                      <span className="text-[#008000]">Document Generator</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-4">
                      <Sparkles className="h-16 w-16 text-[#008000] mx-auto" />
                      <h3 className="text-xl font-semibold">Generate Professional Documents</h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Create tailored CVs, statements of purpose, and cover letters using AI
                      </p>
                      <Button 
                        onClick={() => setIsDocumentModalOpen(true)}
                        className="bg-[#008000] hover:bg-[#006400] text-white"
                      >
                        <FileText className="h-4 w-4 mr-2 text-white" />
                        Start Generating
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <FeatureGate
                  feature="AI Document Generator"
                  description="Generate professional CVs, statements of purpose, and cover letters tailored to your opportunities using advanced AI."
                >
                  <div />
                </FeatureGate>
              )}
            </TabsContent>

            <TabsContent value="voice">
              {hasProAccess() ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mic className="h-5 w-5 mr-2 text-[#008000]" />
                      <span className="text-[#008000]">Voice Assistant</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <VoiceInterface />
                  </CardContent>
                </Card>
              ) : (
                <FeatureGate
                  feature="AI Voice Assistant"
                  description="Talk to our AI assistant using natural speech. Get personalized career advice through voice conversations."
                >
                  <div />
                </FeatureGate>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Document Generator Modal */}
        <DocumentGeneratorModal 
          isOpen={isDocumentModalOpen}
          onClose={() => setIsDocumentModalOpen(false)}
        />
      </main>
    </div>
  );
};

export default AIAssistant;
