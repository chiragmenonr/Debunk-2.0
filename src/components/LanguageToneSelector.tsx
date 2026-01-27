import { LanguageTone } from '@/types/debate';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { MessageCircle, GraduationCap, BookOpen, Briefcase, ScrollText, Lightbulb } from 'lucide-react';

interface LanguageToneSelectorProps {
  value: LanguageTone;
  onChange: (value: LanguageTone) => void;
  disabled?: boolean;
}

const tones: { value: LanguageTone; label: string; description: string; icon: React.ReactNode }[] = [
  { 
    value: 'slang', 
    label: 'Slang', 
    description: 'Informal, street-style, modern expressions',
    icon: <MessageCircle className="w-4 h-4" />
  },
  { 
    value: 'highschool', 
    label: 'High School', 
    description: 'Simple vocabulary, short sentences',
    icon: <GraduationCap className="w-4 h-4" />
  },
  { 
    value: 'college', 
    label: 'College', 
    description: 'Articulate, structured, analytical',
    icon: <BookOpen className="w-4 h-4" />
  },
  { 
    value: 'adult', 
    label: 'Adult', 
    description: 'Professional, practical reasoning',
    icon: <Briefcase className="w-4 h-4" />
  },
  { 
    value: 'scholar', 
    label: 'Scholar', 
    description: 'Formal academic language',
    icon: <ScrollText className="w-4 h-4" />
  },
  { 
    value: 'coach', 
    label: 'Coach', 
    description: 'Supportive mentor, no arguing',
    icon: <Lightbulb className="w-4 h-4" />
  },
];

const toneToIndex: Record<LanguageTone, number> = {
  slang: 0,
  highschool: 1,
  college: 2,
  adult: 3,
  scholar: 4,
  coach: 5,
};

const indexToTone: LanguageTone[] = ['slang', 'highschool', 'college', 'adult', 'scholar', 'coach'];

export function LanguageToneSelector({ value, onChange, disabled = false }: LanguageToneSelectorProps) {
  const currentIndex = toneToIndex[value];
  const currentTone = tones[currentIndex];

  const handleSliderChange = (values: number[]) => {
    const newIndex = values[0];
    onChange(indexToTone[newIndex]);
  };

  return (
    <div className={cn("space-y-4", disabled && "opacity-60 pointer-events-none")}>
      {/* Current selection display */}
      <div className={cn(
        "flex items-center gap-3 p-4 rounded-lg border",
        value === 'coach' 
          ? "bg-amber-500/10 border-amber-500/30" 
          : "bg-accent/10 border-accent/20"
      )}>
        <div className={cn(
          "p-2 rounded-full",
          value === 'coach' 
            ? "bg-amber-500 text-white" 
            : "bg-accent text-accent-foreground"
        )}>
          {currentTone.icon}
        </div>
        <div>
          <span className="font-semibold text-sm">{currentTone.label}</span>
          <p className="text-xs text-muted-foreground">{currentTone.description}</p>
        </div>
      </div>

      {/* Slider */}
      <div className="px-2">
        <Slider
          value={[currentIndex]}
          onValueChange={handleSliderChange}
          min={0}
          max={5}
          step={1}
          disabled={disabled}
          className="w-full"
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        {tones.map((tone, index) => (
          <span 
            key={tone.value}
            className={cn(
              "text-center transition-colors",
              currentIndex === index && (tone.value === 'coach' ? "text-amber-500 font-medium" : "text-accent font-medium")
            )}
          >
            {tone.label.split(' ')[0]}
          </span>
        ))}
      </div>
    </div>
  );
}
