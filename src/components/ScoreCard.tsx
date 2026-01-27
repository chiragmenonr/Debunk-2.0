import { RoundScore } from '@/types/debate';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';

interface ScoreCardProps {
  score: RoundScore;
  roundNumber: number;
}

export function ScoreCard({ score, roundNumber }: ScoreCardProps) {
  const getScoreColor = (value: number) => {
    if (value >= 4) return 'text-green-500';
    if (value >= 3) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProgressColor = (value: number) => {
    if (value >= 4) return 'bg-green-500';
    if (value >= 3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const categories = [
    { label: 'Clarity', value: score.clarity },
    { label: 'Logic', value: score.logicalReasoning },
    { label: 'Relevance', value: score.relevance },
    { label: 'Persuasiveness', value: score.persuasiveness },
  ];

  return (
    <div className="bg-muted/30 rounded-xl p-4 border border-border/50 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Round {roundNumber} Score</span>
        </div>
        <span className={cn(
          "text-lg font-bold",
          score.total >= 16 ? "text-green-500" : score.total >= 12 ? "text-yellow-500" : "text-red-500"
        )}>
          {score.total}/20
        </span>
      </div>

      {/* Score bars */}
      <div className="grid grid-cols-2 gap-2">
        {categories.map((cat) => (
          <div key={cat.label} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{cat.label}</span>
              <span className={getScoreColor(cat.value)}>{cat.value}/5</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full transition-all", getProgressColor(cat.value))}
                style={{ width: `${(cat.value / 5) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Feedback */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
        {score.strengths.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs font-medium text-green-500">
              <TrendingUp className="w-3 h-3" />
              <span>Strengths</span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              {score.strengths.map((s, i) => (
                <li key={i}>• {s}</li>
              ))}
            </ul>
          </div>
        )}
        {score.areasToImprove.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs font-medium text-orange-500">
              <TrendingDown className="w-3 h-3" />
              <span>Improve</span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              {score.areasToImprove.map((a, i) => (
                <li key={i}>• {a}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}