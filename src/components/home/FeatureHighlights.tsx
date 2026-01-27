import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, MessageSquare, ArrowRight } from 'lucide-react';

export function FeatureHighlights() {
  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-center mb-12">
          Two Powerful Practice Modes
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Debunk Mode Card */}
          <div className="glass-card rounded-2xl p-8 transition-all duration-300 hover:shadow-hover">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6 text-accent" />
            </div>
            
            <h3 className="font-serif text-xl font-semibold mb-3">Debunk Mode</h3>
            
            <p className="text-muted-foreground mb-6">
              Get structured speaking points instantly. Perfect for preparing speeches, essays, 
              or understanding multiple perspectives on any topic.
            </p>
            
            <Button asChild variant="ghost" className="group p-0 h-auto font-semibold text-primary hover:bg-transparent">
              <Link to="/practice?mode=debunk">
                Try it now
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
          
          {/* Debate Mode Card */}
          <div className="glass-card rounded-2xl p-8 transition-all duration-300 hover:shadow-hover">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            
            <h3 className="font-serif text-xl font-semibold mb-3">Debate Mode</h3>
            
            <p className="text-muted-foreground mb-6">
              Engage in real-time debates with AI. Practice your rebuttals, improve your arguments, 
              and get scored on your performance.
            </p>
            
            <Button asChild variant="ghost" className="group p-0 h-auto font-semibold text-primary hover:bg-transparent">
              <Link to="/practice?mode=debate">
                Try it now
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
