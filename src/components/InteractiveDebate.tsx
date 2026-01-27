import { useState, useRef, useEffect } from 'react';
import { DebateSettings, RoundScore } from '@/types/debate';
import { Speaker } from './SpeakerToggle';
import { ScoreCard } from './ScoreCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, RotateCcw, MessageSquare, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  content: string;
  score?: RoundScore | null;
}

interface InteractiveDebateProps {
  settings: DebateSettings;
  speakerFirst: Speaker;
  onReset: () => void;
}

const languageToneLabels: Record<string, string> = {
  highschool: 'High School',
  college: 'College',
  adult: 'Adult',
  scholar: 'Scholar',
  slang: 'Slang'
};

export function InteractiveDebate({ settings, speakerFirst, onReset }: InteractiveDebateProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [roundNumber, setRoundNumber] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendToAI = async (conversationHistory: ChatMessage[], isFirstMessage = false, scoreUserResponse = false) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('debate-chat', {
        body: {
          topic: settings.topic,
          position: settings.position,
          languageTone: settings.languageTone,
          conversationHistory: conversationHistory.map(m => ({ role: m.role, content: m.content })),
          isFirstMessage,
          speakerFirst,
          scoreUserResponse
        }
      });

      if (error) {
        toast.error(error.message || 'Failed to get AI response');
        return null;
      }

      if (data.error) {
        toast.error(data.error);
        return null;
      }

      return { message: data.message as string, score: data.score as RoundScore | null };
    } catch (err) {
      console.error('Error getting AI response:', err);
      toast.error('Failed to get AI response');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const startDebate = async () => {
    setIsStarted(true);
    
    if (speakerFirst === 'ai') {
      const result = await sendToAI([], true, false);
      if (result) {
        setMessages([{
          id: crypto.randomUUID(),
          role: 'ai',
          content: result.message
        }]);
        setRoundNumber(1);
      }
    } else {
      setRoundNumber(1);
    }
  };

  const handleUserSubmit = async () => {
    if (!userInput.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userInput.trim()
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setUserInput('');

    // Get AI response and score the user's response
    const result = await sendToAI(newMessages, false, true);
    if (result) {
      // Add score to the user's message
      setMessages(prev => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (updated[lastIndex].role === 'user') {
          updated[lastIndex] = { ...updated[lastIndex], score: result.score };
        }
        return [...updated, {
          id: crypto.randomUUID(),
          role: 'ai',
          content: result.message
        }];
      });
      setRoundNumber(prev => prev + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUserSubmit();
    }
  };

  const aiPosition = speakerFirst === 'ai' ? settings.position : (settings.position === 'for' ? 'against' : 'for');
  const userPosition = speakerFirst === 'ai' ? (settings.position === 'for' ? 'against' : 'for') : settings.position;

  if (!isStarted) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="glass-card rounded-2xl p-8 space-y-6">
          <div className="space-y-3">
            <h2 className="font-serif text-2xl font-bold">Ready to Debate</h2>
            <p className="text-muted-foreground">
              Topic: <span className="font-medium text-foreground">{settings.topic}</span>
            </p>
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-primary" />
                <span>AI argues <span className={cn(
                  "font-semibold",
                  aiPosition === 'for' ? "text-position-for" : "text-position-against"
                )}>{aiPosition.toUpperCase()}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-accent" />
                <span>You argue <span className={cn(
                  "font-semibold",
                  userPosition === 'for' ? "text-position-for" : "text-position-against"
                )}>{userPosition.toUpperCase()}</span></span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Language: <span className="font-medium">{languageToneLabels[settings.languageTone]}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              {speakerFirst === 'ai' 
                ? 'The AI will open the debate. Respond naturally!' 
                : 'You start! Make your opening argument.'}
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={onReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button onClick={startDebate} className="bg-primary hover:bg-primary/90">
              <MessageSquare className="w-4 h-4 mr-2" />
              Start Debate
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xs text-muted-foreground capitalize">
              Debate Mode • {languageToneLabels[settings.languageTone]} • Round {roundNumber}
            </span>
          </div>
          <h1 className="font-serif text-xl md:text-2xl font-bold">
            {settings.topic}
          </h1>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span>AI: <span className={cn(
              "font-medium",
              aiPosition === 'for' ? "text-position-for" : "text-position-against"
            )}>{aiPosition}</span></span>
            <span>You: <span className={cn(
              "font-medium",
              userPosition === 'for' ? "text-position-for" : "text-position-against"
            )}>{userPosition}</span></span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          New Topic
        </Button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto glass-card rounded-2xl p-4 mb-4 space-y-4">
        {messages.length === 0 && speakerFirst === 'user' && !isGenerating && (
          <div className="text-center text-muted-foreground py-8">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>Make your opening argument to start the debate!</p>
          </div>
        )}
        
        {messages.map((message, index) => {
          const userMessageIndex = messages.filter((m, i) => i <= index && m.role === 'user').length;
          
          return (
            <div key={message.id} className="space-y-2">
              <div
                className={cn(
                  "flex gap-3 animate-fade-in",
                  message.role === 'user' && "flex-row-reverse"
                )}
              >
                <div className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                  message.role === 'ai' ? "bg-primary/10" : "bg-accent/10"
                )}>
                  {message.role === 'ai' ? (
                    <Bot className="w-4 h-4 text-primary" />
                  ) : (
                    <User className="w-4 h-4 text-accent" />
                  )}
                </div>
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3",
                  message.role === 'ai' 
                    ? "bg-muted/50 rounded-tl-sm" 
                    : "bg-primary text-primary-foreground rounded-tr-sm"
                )}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
              
              {/* Score card after user message */}
              {message.role === 'user' && message.score && (
                <div className="flex justify-end animate-fade-in">
                  <div className="max-w-[80%] mr-11">
                    <ScoreCard score={message.score} roundNumber={userMessageIndex} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {isGenerating && (
          <div className="flex gap-3 animate-fade-in">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-muted/50 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 glass-card rounded-2xl p-4">
        <div className="flex gap-3">
          <Textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your argument..."
            className="min-h-[44px] max-h-[120px] resize-none"
            disabled={isGenerating}
          />
          <Button
            onClick={handleUserSubmit}
            disabled={!userInput.trim() || isGenerating}
            size="icon"
            className="h-[44px] w-[44px] flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}