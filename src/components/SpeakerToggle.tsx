import { cn } from '@/lib/utils';

export type Speaker = 'ai' | 'user';

interface SpeakerToggleProps {
  value: Speaker;
  onChange: (value: Speaker) => void;
  disabled?: boolean;
}

export function SpeakerToggle({ value, onChange, disabled = false }: SpeakerToggleProps) {
  return (
    <div className={cn("flex rounded-lg p-1 bg-muted", disabled && "opacity-60 pointer-events-none")}>
      <button
        onClick={() => onChange('ai')}
        disabled={disabled}
        className={cn(
          "flex-1 py-3 px-6 rounded-md font-medium text-sm transition-all duration-200",
          value === 'ai'
            ? "bg-accent text-accent-foreground shadow-md"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        AI FIRST
      </button>
      <button
        onClick={() => onChange('user')}
        disabled={disabled}
        className={cn(
          "flex-1 py-3 px-6 rounded-md font-medium text-sm transition-all duration-200",
          value === 'user'
            ? "bg-accent text-accent-foreground shadow-md"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        YOU FIRST
      </button>
    </div>
  );
}
