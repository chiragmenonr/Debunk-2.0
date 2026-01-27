import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-serif text-xl font-bold">
          Debate<span className="text-accent">Prep</span>
        </Link>
        
        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <a 
            href="#how-it-works" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
          >
            How it Works
          </a>
          
          {user ? (
            <Button asChild size="sm" variant="outline">
              <Link to="/practice">Go to Practice</Link>
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
