import { SpeakingPoint, Position } from '@/types/debate';
import { cn } from '@/lib/utils';
import { Quote, BarChart } from 'lucide-react';

interface SpeakingPointCardProps {
  point: SpeakingPoint;
  index: number;
  position: Position;
  compact?: boolean;
}

export function SpeakingPointCard({ point, index, position, compact = false }: SpeakingPointCardProps) {
  return (
    <div 
      className={cn(
        "speaking-point animate-slide-up bg-card rounded-xl shadow-card hover:shadow-hover transition-shadow duration-300",
        compact ? "p-4" : "p-6",
        position === 'for' ? 'speaking-point-for' : 'speaking-point-against'
      )}
      style={{ animationDelay: compact ? '0ms' : `${index * 100}ms` }}
    >
      <div className="flex items-start gap-4">
        {!compact && (
          <div className={cn(
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold text-lg",
            position === 'for' 
              ? "bg-position-for/10 text-position-for" 
              : "bg-position-against/10 text-position-against"
          )}>
            {index + 1}
          </div>
        )}
        <div className="flex-1 space-y-3">
          {point.title && (
            <h3 className="font-serif font-semibold text-lg">{point.title}</h3>
          )}
          <p className="font-medium text-foreground">{point.claim}</p>
          <p className="text-muted-foreground leading-relaxed">{point.explanation}</p>
          
          {point.evidence && point.evidence.length > 0 && (
            <div className="mt-4 space-y-3">
              {point.evidence.map((ev, i) => (
                <div 
                  key={i}
                  className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <div className={cn(
                    "flex-shrink-0 p-1.5 rounded",
                    position === 'for' ? "bg-position-for/10 text-position-for" : "bg-position-against/10 text-position-against"
                  )}>
                    {ev.type === 'quote' ? <Quote className="w-4 h-4" /> : <BarChart className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      "text-sm",
                      ev.type === 'quote' && "italic"
                    )}>
                      {ev.type === 'quote' ? `"${ev.content}"` : ev.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">— {ev.source}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
