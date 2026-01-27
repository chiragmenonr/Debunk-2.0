import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface SettingsSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  displayValue?: string;
  marks?: { value: number; label: string }[];
}

export function SettingsSlider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled = false,
  displayValue,
  marks,
}: SettingsSliderProps) {
  return (
    <div className={cn("space-y-3", disabled && "opacity-50")}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <span className="text-sm font-semibold text-accent">
          {displayValue ?? value}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="w-full"
      />
      {marks && (
        <div className="flex justify-between text-xs text-muted-foreground px-1">
          {marks.map((mark) => (
            <span key={mark.value}>{mark.label}</span>
          ))}
        </div>
      )}
    </div>
  );
}
