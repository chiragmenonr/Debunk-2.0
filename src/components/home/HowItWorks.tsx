import { MessageCircle, Target, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: MessageCircle,
    title: 'Choose your topic',
    description: 'Enter any statement, claim, or question you want to practice debating.',
  },
  {
    icon: Target,
    title: 'Pick your position',
    description: 'Decide whether to argue for or against the topic.',
  },
  {
    icon: TrendingUp,
    title: 'Practice & improve',
    description: 'Get AI-generated arguments and feedback to sharpen your skills.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-center mb-12">
          How It Works
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <div key={step.title} className="text-center">
              {/* Step number with icon */}
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-accent text-accent-foreground text-sm font-bold flex items-center justify-center">
                  {index + 1}
                </span>
              </div>
              
              {/* Content */}
              <h3 className="font-serif text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
