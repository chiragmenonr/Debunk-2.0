import { Navbar } from '@/components/home/Navbar';
import { HeroSection } from '@/components/home/HeroSection';
import { FeatureHighlights } from '@/components/home/FeatureHighlights';
import { HowItWorks } from '@/components/home/HowItWorks';
import { SettingsMenu } from '@/components/SettingsMenu';

const Index = () => {
  return (
    <div className="min-h-screen">
      <SettingsMenu />
      <Navbar />
      
      <main className="pt-16">
        <HeroSection />
        <FeatureHighlights />
        <HowItWorks />
      </main>
      
      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>Practice debating with AI-powered feedback</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
