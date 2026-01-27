import { EvidenceLevel } from '@/types/debate';
import { cn } from '@/lib/utils';
import { FileText, BarChart3, BookOpen } from 'lucide-react';

interface EvidenceSelectorProps {
  value: EvidenceLevel;
  onChange: (value: EvidenceLevel) => void;
  disabled?: boolean;
}

const levels: { value: EvidenceLevel; label: string; description: string; icon: React.ReactNode }[] = [
  { 
    value: 'low', 
    label: 'Low', 
    description: 'Minimal evidence, logical reasoning',
    icon: <FileText className="w-4 h-4" />
  },
  { 
    value: 'medium', 
    label: 'Medium', 
    description: 'One stat or quote per point',
    icon: <BarChart3 className="w-4 h-4" />
  },
  { 
    value: 'high', 
    label: 'High', 
    description: 'Multiple sources per point',
    icon: <BookOpen className="w-4 h-4" />
  },
];

export function EvidenceSelector({ value, onChange, disabled = false }: EvidenceSelectorProps) {
  return (
    <div className={cn("grid grid-cols-3 gap-3", disabled && "opacity-60 pointer-events-none")}>
      {levels.map((level) => (
        <button
          key={level.value}
          onClick={() => onChange(level.value)}
          disabled={disabled}
          className={cn(
            "flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-200",
            value === level.value
              ? "border-accent bg-accent/10 shadow-md"
              : "border-border hover:border-accent/50 bg-card"
          )}
        >
          <div className={cn(
            "mb-2 p-2 rounded-full",
            value === level.value ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
          )}>
            {level.icon}
          </div>
          <span className="font-medium text-sm">{level.label}</span>
          <span className="text-xs text-muted-foreground text-center mt-1 hidden sm:block">
            {level.description}
          </span>
        </button>
      ))}
    </div>
  );
}
