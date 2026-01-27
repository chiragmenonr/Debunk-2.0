import { Difficulty } from '@/types/debate';
import { cn } from '@/lib/utils';
import { Sparkles, GraduationCap, Trophy } from 'lucide-react';

interface DifficultySelectorProps {
  value: Difficulty;
  onChange: (value: Difficulty) => void;
  disabled?: boolean;
}

const difficulties: { value: Difficulty; label: string; description: string; icon: React.ReactNode }[] = [
  { 
    value: 'easy', 
    label: 'Easy', 
    description: 'Simple vocabulary, beginner-friendly',
    icon: <Sparkles className="w-4 h-4" />
  },
  { 
    value: 'medium', 
    label: 'Medium', 
    description: 'Clear logic, high-school level',
    icon: <GraduationCap className="w-4 h-4" />
  },
  { 
    value: 'hard', 
    label: 'Hard', 
    description: 'Complex arguments, competitive level',
    icon: <Trophy className="w-4 h-4" />
  },
];

export function DifficultySelector({ value, onChange, disabled = false }: DifficultySelectorProps) {
  return (
    <div className={cn("grid grid-cols-3 gap-3", disabled && "opacity-60 pointer-events-none")}>
      {difficulties.map((difficulty) => (
        <button
          key={difficulty.value}
          onClick={() => onChange(difficulty.value)}
          disabled={disabled}
          className={cn(
            "flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-200",
            value === difficulty.value
              ? "border-accent bg-accent/10 shadow-md"
              : "border-border hover:border-accent/50 bg-card"
          )}
        >
          <div className={cn(
            "mb-2 p-2 rounded-full",
            value === difficulty.value ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
          )}>
            {difficulty.icon}
          </div>
          <span className="font-medium text-sm">{difficulty.label}</span>
          <span className="text-xs text-muted-foreground text-center mt-1 hidden sm:block">
            {difficulty.description}
          </span>
        </button>
      ))}
    </div>
  );
}
