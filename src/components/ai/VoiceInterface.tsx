
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceInterfaceProps {
  onTranscription?: (text: string) => void;
  onVoiceResponse?: (text: string) => void;
  className?: string;
}

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  onTranscription,
  onVoiceResponse,
  className = ""
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          const fullTranscript = finalTranscript || interimTranscript;
          setTranscript(fullTranscript);
          
          if (finalTranscript && onTranscription) {
            onTranscription(finalTranscript);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          toast({
            title: "Speech Recognition Error",
            description: "Could not process speech. Please try again.",
            variant: "destructive",
          });
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [onTranscription]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast({
          title: "Listening...",
          description: "Speak now, I'm listening to your voice.",
        });
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        toast({
          title: "Error",
          description: "Could not start voice recognition.",
          variant: "destructive",
        });
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakText = (text: string) => {
    if (synthRef.current && isVoiceEnabled && text.trim()) {
      // Cancel any ongoing speech
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      // Try to use a more natural voice
      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Alex') || 
        voice.name.includes('Samantha')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        console.log('Started speaking:', text);
      };

      utterance.onend = () => {
        console.log('Finished speaking');
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
      };

      synthRef.current.speak(utterance);
    }
  };

  const toggleVoiceEnabled = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    if (!isVoiceEnabled) {
      synthRef.current?.cancel();
    }
    toast({
      title: isVoiceEnabled ? "Voice Disabled" : "Voice Enabled",
      description: isVoiceEnabled 
        ? "AI responses will no longer be spoken aloud" 
        : "AI responses will now be spoken aloud",
    });
  };

  const toggleConnection = () => {
    setIsConnected(!isConnected);
    if (isConnected) {
      stopListening();
      synthRef.current?.cancel();
    }
    toast({
      title: isConnected ? "Voice Assistant Disconnected" : "Voice Assistant Connected",
      description: isConnected 
        ? "Voice features have been disabled" 
        : "Voice features are now active",
    });
  };

  // Expose the speakText function to parent components
  useEffect(() => {
    if (onVoiceResponse) {
      // This could be used to register the speak function with parent
      // For now, we'll handle it through props
    }
  }, [onVoiceResponse]);

  return (
    <Card className={`bg-white/80 backdrop-blur-sm border-[#e6f5ec]/30 shadow-lg ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#384040]">Voice Assistant</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleVoiceEnabled}
              className={`${isVoiceEnabled ? 'text-[#008000]' : 'text-gray-400'}`}
            >
              {isVoiceEnabled ? <Volume2 className="w-4 h-4" style={{ color: '#008000' }} /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleConnection}
              className={`${isConnected ? 'text-[#008000]' : 'text-gray-400'}`}
            >
              {isConnected ? <Phone className="w-4 h-4" style={{ color: '#008000' }} /> : <PhoneOff className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={isListening ? stopListening : startListening}
            disabled={!isConnected}
            className={`flex-1 ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-[#008000] hover:bg-[#008000]/90 text-white'
            }`}
          >
            <motion.div
              animate={isListening ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={{ repeat: isListening ? Infinity : 0, duration: 1 }}
            >
              {isListening 
                ? <MicOff className="w-4 h-4 mr-2" style={{ color: '#008000' }} /> 
                : <Mic className="w-4 h-4 mr-2" style={{ color: '#008000' }} />}
            </motion.div>
            {isListening ? 'Stop Listening' : 'Start Listening'}
          </Button>
        </div>

        <AnimatePresence>
          {transcript && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-3 bg-[#e6f5ec]/30 rounded-lg"
            >
              <p className="text-sm text-[#384040]">
                <strong>Transcript:</strong> {transcript}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-3 text-xs text-gray-500">
          <p>
            {isConnected 
              ? `Voice ${isVoiceEnabled ? 'ON' : 'OFF'} • Microphone ${isListening ? 'ACTIVE' : 'IDLE'}`
              : 'Voice Assistant OFFLINE'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Utility function to speak text (can be used by other components)
export const speakText = (text: string, options?: { rate?: number; pitch?: number; volume?: number }) => {
  if ('speechSynthesis' in window && text.trim()) {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options?.rate || 0.9;
    utterance.pitch = options?.pitch || 1;
    utterance.volume = options?.volume || 0.8;
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Alex') || 
      voice.name.includes('Samantha')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  }
};
