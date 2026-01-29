import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, MessageSquare } from 'lucide-react';
export function HeroSection() {
  return <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
      </div>
      
      <div className="relative max-w-4xl mx-auto text-center px-6">
        {/* App Name */}
        <p className="text-sm uppercase tracking-widest text-accent font-semibold mb-4 animate-fade-in">
          Debunk
        </p>
        
        {/* Headline */}
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-fade-in">
          Think Sharper.
          <span className="block text-accent mt-2">Debate Better.</span>
        </h1>
        
        {/* Tagline */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up">
          Practice debate skills with AI-generated arguments and real-time feedback. 
          Build confidence and sharpen your critical thinking.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{
        animationDelay: '0.1s'
      }}>
          <Button asChild size="lg" className="h-14 px-8 text-base font-semibold bg-primary hover:bg-primary/90 shadow-elegant">
            <Link to="/practice?mode=debunk">
              <Sparkles className="w-5 h-5 mr-2" />
              Start Debunking
            </Link>
          </Button>
          
          <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base font-semibold border-2 hover:bg-secondary">
            <Link to="/practice?mode=debate">
              <MessageSquare className="w-5 h-5 mr-2" />
              Start Debating
            </Link>
          </Button>
        </div>
      </div>
    </section>;
}