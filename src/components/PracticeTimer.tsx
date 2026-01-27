import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PracticeTimerProps {
  initialMinutes?: number;
  onComplete?: () => void;
  className?: string;
}

export function PracticeTimer({ 
  initialMinutes = 5, 
  onComplete,
  className 
}: PracticeTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const reset = useCallback(() => {
    setTimeLeft(initialMinutes * 60);
    setIsRunning(false);
    setHasStarted(false);
  }, [initialMinutes]);

  useEffect(() => {
    reset();
  }, [initialMinutes, reset]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete]);

  const toggleTimer = () => {
    if (!hasStarted) setHasStarted(true);
    setIsRunning(!isRunning);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / (initialMinutes * 60)) * 100;
  const isLow = progress < 20;
  const isCritical = progress < 10;

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg border transition-colors",
      isCritical && isRunning && "border-destructive bg-destructive/10 animate-pulse",
      isLow && !isCritical && isRunning && "border-amber-500 bg-amber-500/10",
      !isLow && "border-border bg-card/50",
      className
    )}>
      <Timer className={cn(
        "h-5 w-5",
        isCritical ? "text-destructive" : isLow ? "text-amber-500" : "text-muted-foreground"
      )} />
      
      <span className={cn(
        "font-mono text-xl font-bold min-w-[80px]",
        isCritical ? "text-destructive" : isLow ? "text-amber-500" : "text-foreground"
      )}>
        {formatTime(timeLeft)}
      </span>

      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTimer}
          className="h-8 w-8"
        >
          {isRunning ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={reset}
          className="h-8 w-8"
          disabled={!hasStarted}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Progress bar */}
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full transition-all duration-1000",
            isCritical ? "bg-destructive" : isLow ? "bg-amber-500" : "bg-primary"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
