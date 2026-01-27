import { cn } from '@/lib/utils';

export type Mode = 'debunk' | 'debate';

interface ModeToggleProps {
  value: Mode;
  onChange: (value: Mode) => void;
  disabled?: boolean;
}

export function ModeToggle({ value, onChange, disabled = false }: ModeToggleProps) {
  return (
    <div className={cn("flex rounded-lg p-1 bg-muted", disabled && "opacity-60 pointer-events-none")}>
      <button
        onClick={() => onChange('debunk')}
        disabled={disabled}
        className={cn(
          "flex-1 py-3 px-6 rounded-md font-medium text-sm transition-all duration-200",
          value === 'debunk'
            ? "bg-primary text-primary-foreground shadow-md"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        DEBUNK
      </button>
      <button
        onClick={() => onChange('debate')}
        disabled={disabled}
        className={cn(
          "flex-1 py-3 px-6 rounded-md font-medium text-sm transition-all duration-200",
          value === 'debate'
            ? "bg-primary text-primary-foreground shadow-md"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        DEBATE
      </button>
    </div>
  );
}
