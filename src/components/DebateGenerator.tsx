import { useState, useEffect } from 'react';
import { DebateSettings, DebateEntry, SpeakingPoint, Position, Difficulty, EvidenceLevel, LanguageTone, Mode, ChatMessage } from '@/types/debate';
import { ModeToggle } from './ModeToggle';
import { PositionToggle } from './PositionToggle';
import { SpeakerToggle, Speaker } from './SpeakerToggle';
import { DifficultySelector } from './DifficultySelector';
import { LanguageToneSelector } from './LanguageToneSelector';
import { EvidenceSelector } from './EvidenceSelector';
import { SettingsSlider } from './SettingsSlider';
import { SpeakingPointCard } from './SpeakingPointCard';
import { InteractiveDebate } from './InteractiveDebate';
import { PracticeTimer } from './PracticeTimer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Sparkles, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';

interface DebateGeneratorProps {
  onSave: (entry: DebateEntry) => Promise<boolean>;
  viewingEntry: DebateEntry | null;
  onClearView: () => void;
  initialMode?: Mode;
}

export function DebateGenerator({ onSave, viewingEntry, onClearView, initialMode }: DebateGeneratorProps) {
  const { settings: appSettings } = useSettings();
  const { user } = useAuth();
  
  const [mode, setMode] = useState<Mode>(initialMode || 'debunk');
  const [topic, setTopic] = useState('');
  const [position, setPosition] = useState<Position>('for');
  const [speakerFirst, setSpeakerFirst] = useState<Speaker>('ai');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [languageTone, setLanguageTone] = useState<LanguageTone>(appSettings.defaultTone);
  const [timeLimit, setTimeLimit] = useState(5);
  const [noTimeLimit, setNoTimeLimit] = useState(false);
  const [numberOfPoints, setNumberOfPoints] = useState(3);
  const [evidenceLevel, setEvidenceLevel] = useState<EvidenceLevel>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPoints, setGeneratedPoints] = useState<SpeakingPoint[] | null>(null);
  const [currentSettings, setCurrentSettings] = useState<DebateSettings | null>(null);
  const [isDebating, setIsDebating] = useState(false);
  const [debateSettings, setDebateSettings] = useState<DebateSettings | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const [totalScore, setTotalScore] = useState<number>(0);

  // Update language tone when default changes
  useEffect(() => {
    setLanguageTone(appSettings.defaultTone);
  }, [appSettings.defaultTone]);

  const createSettings = (): DebateSettings => ({
    topic,
    mode,
    position,
    difficulty,
    languageTone,
    timeLimit,
    noTimeLimit,
    numberOfPoints,
    evidenceLevel,
    enableTimer: appSettings.enableTimer,
    enableCounterArguments: appSettings.enableCounterArguments,
  });

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    const settings = createSettings();

    if (mode === 'debate') {
      setDebateSettings(settings);
      setIsDebating(true);
      return;
    }

    setIsGenerating(true);
    setGeneratedPoints(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-debate-points', {
        body: settings
      });

      if (error) {
        console.error('Edge function error:', error);
        toast.error(error.message || 'Failed to generate speaking points');
        setIsGenerating(false);
        return;
      }

      if (data.error) {
        toast.error(data.error);
        setIsGenerating(false);
        return;
      }

      setGeneratedPoints(data.speakingPoints);
      setCurrentSettings(settings);
    } catch (err) {
      console.error('Error generating points:', err);
      toast.error('Failed to generate speaking points. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!generatedPoints || !currentSettings) return;

    const entry: DebateEntry = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      settings: currentSettings,
      speakingPoints: generatedPoints,
    };

    const success = await onSave(entry);
    if (success) {
      setTopic('');
      setGeneratedPoints(null);
      setCurrentSettings(null);
    }
  };

  const handleSaveDebate = async (history: ChatMessage[], score: number) => {
    if (!debateSettings) return;

    const entry: DebateEntry = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      settings: debateSettings,
      conversationHistory: history,
      totalScore: score,
    };

    await onSave(entry);
  };

  const handleReset = () => {
    // Don't reset settings - only reset results
    setGeneratedPoints(null);
    setCurrentSettings(null);
    setIsDebating(false);
    setDebateSettings(null);
    setConversationHistory([]);
    setTotalScore(0);
    onClearView();
  };

  const handleFullReset = () => {
    setTopic('');
    setPosition('for');
    setSpeakerFirst('ai');
    setDifficulty('medium');
    setLanguageTone(appSettings.defaultTone);
    setMode('debunk');
    setTimeLimit(5);
    setNoTimeLimit(false);
    setNumberOfPoints(3);
    setEvidenceLevel('medium');
    setGeneratedPoints(null);
    setCurrentSettings(null);
    setIsDebating(false);
    setDebateSettings(null);
    setConversationHistory([]);
    setTotalScore(0);
    onClearView();
  };

  // If viewing a library entry
  if (viewingEntry) {
    const s = viewingEntry.settings;
    const isDebateEntry = s.mode === 'debate' && viewingEntry.conversationHistory;
    
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-2xl md:text-3xl font-bold">
            Saved {s.mode === 'debate' ? 'Debate' : 'Debunk'}
          </h1>
          <Button variant="outline" onClick={handleFullReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            New Topic
          </Button>
        </div>

        {/* Settings Panel - Read Only */}
        <div className="glass-card rounded-2xl p-6 md:p-8 space-y-6 mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span className="px-2 py-1 rounded bg-muted text-xs font-medium">Read Only</span>
            Settings used when this was generated
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Mode</span>
              <p className="font-medium capitalize">{s.mode}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Position</span>
              <p className={cn("font-medium capitalize", s.position === 'for' ? "text-position-for" : "text-position-against")}>
                {s.position}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Difficulty</span>
              <p className="font-medium capitalize">{s.difficulty}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Tone</span>
              <p className="font-medium capitalize">{s.languageTone}</p>
            </div>
          </div>

          <div className="pt-4">
            <span className="text-muted-foreground text-sm">Topic</span>
            <p className="font-medium mt-1">{s.topic}</p>
          </div>

          {viewingEntry.totalScore !== undefined && (
            <div className="pt-4 border-t">
              <span className="text-muted-foreground text-sm">Total Score</span>
              <p className="font-bold text-2xl text-primary">{viewingEntry.totalScore}</p>
            </div>
          )}
        </div>

        {/* Content */}
        {isDebateEntry && viewingEntry.conversationHistory ? (
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-semibold">Conversation History</h2>
            {viewingEntry.conversationHistory.map((message, index) => (
              <div
                key={message.id || index}
                className={cn(
                  "p-4 rounded-lg",
                  message.role === 'ai' ? "bg-muted/50" : "bg-primary/10"
                )}
              >
                <p className="text-xs font-medium mb-2 text-muted-foreground">
                  {message.role === 'ai' ? 'AI' : 'You'}
                </p>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}
          </div>
        ) : viewingEntry.speakingPoints ? (
          <>
            <h2 className="font-serif text-xl font-semibold mb-4">Generated Arguments to Debunk</h2>
            <div className="space-y-6">
              {viewingEntry.speakingPoints.map((point, index) => (
                <SpeakingPointCard
                  key={point.id}
                  point={point}
                  index={index}
                  position={s.position}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    );
  }

  // Interactive debate mode
  if (isDebating && debateSettings) {
    return (
      <InteractiveDebate
        settings={debateSettings}
        speakerFirst={speakerFirst}
        onReset={handleReset}
      />
    );
  }

  // Generated points view (Debunk mode results)
  if (generatedPoints && currentSettings) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={cn(
                "text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide",
                currentSettings.position === 'for' 
                  ? "bg-position-for/10 text-position-for" 
                  : "bg-position-against/10 text-position-against"
              )}>
                {currentSettings.position}
              </span>
              <span className="text-xs text-muted-foreground capitalize">
                {currentSettings.difficulty} • {currentSettings.numberOfPoints} arguments
              </span>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold">
              {currentSettings.topic}
            </h1>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleFullReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              New Topic
            </Button>
            {user && (
              <Button onClick={handleSaveToLibrary} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Save to Library
              </Button>
            )}
          </div>
        </div>

        {/* Practice Timer */}
        {appSettings.enableTimer && (
          <div className="mb-6">
            <PracticeTimer initialMinutes={currentSettings.noTimeLimit ? 15 : currentSettings.timeLimit} />
          </div>
        )}

        <div className="space-y-6">
          {generatedPoints.map((point, index) => (
            <SpeakingPointCard
              key={point.id}
              point={point}
              index={index}
              position={currentSettings.position}
            />
          ))}
        </div>
      </div>
    );
  }

  // Input form view
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3">
          Debate Prep
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Generate structured, persuasive arguments with evidence from credible sources
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6 md:p-8 space-y-8">
        {/* Mode Toggle - At the very top */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
            Mode
          </label>
          <ModeToggle value={mode} onChange={setMode} />
          <p className="text-xs text-muted-foreground">
            {mode === 'debunk' 
              ? 'Generate all speaking points at once' 
              : 'Interactive back-and-forth debate with AI'}
          </p>
        </div>

        {/* Topic Input */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
            Debate Topic
          </label>
          <Textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a statement, claim, or question to be debated..."
            className="min-h-[100px] resize-none text-base"
          />
        </div>

        {/* Position Toggle */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</span>
            Your Position
          </label>
          <PositionToggle value={position} onChange={setPosition} />
        </div>

        {/* Who Speaks First - Only in Debate mode */}
        {mode === 'debate' && (
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">4</span>
              Who Speaks First
            </label>
            <SpeakerToggle value={speakerFirst} onChange={setSpeakerFirst} />
            <p className="text-xs text-muted-foreground">
              {speakerFirst === 'ai' 
                ? 'AI presents arguments, you rebut each one' 
                : 'You present arguments, AI rebuts each one'}
            </p>
          </div>
        )}

        {/* Language & Tone Slider - Only in Debate mode */}
        {mode === 'debate' && (
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                5
              </span>
              Language & Tone
            </label>
            <LanguageToneSelector value={languageTone} onChange={setLanguageTone} />
            {languageTone === 'coach' && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Coach mode provides feedback and strategy tips instead of arguing a position.
              </p>
            )}
          </div>
        )}

        {/* Difficulty - Only in Debunk mode */}
        {mode === 'debunk' && (
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                5
              </span>
              Difficulty Level
            </label>
            <DifficultySelector value={difficulty} onChange={setDifficulty} />
          </div>
        )}

        {/* Time Limit - Only in Debunk mode */}
        {mode === 'debunk' && (
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">6</span>
              Speaking Time
            </label>
            <SettingsSlider
              label=""
              value={timeLimit}
              onChange={setTimeLimit}
              min={1}
              max={15}
              disabled={noTimeLimit}
              displayValue={`${timeLimit} min`}
            />
            <div className="flex items-center gap-2">
              <Checkbox
                id="noTimeLimit"
                checked={noTimeLimit}
                onCheckedChange={(checked) => setNoTimeLimit(checked as boolean)}
              />
              <label htmlFor="noTimeLimit" className="text-sm text-muted-foreground cursor-pointer">
                No time limit (fully expanded points)
              </label>
            </div>
          </div>
        )}

        {/* Number of Points - Only in Debunk mode */}
        {mode === 'debunk' && (
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                7
              </span>
              Number of Arguments to Debunk
            </label>
            <SettingsSlider
              label=""
              value={numberOfPoints}
              onChange={setNumberOfPoints}
              min={1}
              max={7}
              displayValue={`${numberOfPoints} argument${numberOfPoints > 1 ? 's' : ''}`}
            />
          </div>
        )}

        {/* Evidence Level - Only in Debunk mode */}
        {mode === 'debunk' && (
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                8
              </span>
              Evidence Usage
            </label>
            <EvidenceSelector value={evidenceLevel} onChange={setEvidenceLevel} />
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={!topic.trim() || isGenerating}
          className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating Arguments...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              {mode === 'debate' ? 'Start Debate' : 'Generate Arguments'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
