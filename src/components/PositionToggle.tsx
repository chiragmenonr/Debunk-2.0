import { Position } from '@/types/debate';
import { cn } from '@/lib/utils';

interface PositionToggleProps {
  value: Position;
  onChange: (value: Position) => void;
  disabled?: boolean;
}

export function PositionToggle({ value, onChange, disabled = false }: PositionToggleProps) {
  return (
    <div className={cn("flex rounded-lg p-1 bg-muted", disabled && "opacity-60 pointer-events-none")}>
      <button
        onClick={() => onChange('for')}
        disabled={disabled}
        className={cn(
          "flex-1 py-3 px-6 rounded-md font-medium text-sm transition-all duration-200",
          value === 'for'
            ? "bg-position-for text-position-for-foreground shadow-md"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        FOR
      </button>
      <button
        onClick={() => onChange('against')}
        disabled={disabled}
        className={cn(
          "flex-1 py-3 px-6 rounded-md font-medium text-sm transition-all duration-200",
          value === 'against'
            ? "bg-position-against text-position-against-foreground shadow-md"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        AGAINST
      </button>
    </div>
  );
}
