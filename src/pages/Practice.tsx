import { useState, useEffect } from 'react';
import { DebateEntry } from '@/types/debate';
import { DebateGenerator } from '@/components/DebateGenerator';
import { LibrarySidebar } from '@/components/LibrarySidebar';
import { SettingsMenu } from '@/components/SettingsMenu';
import { UserMenu } from '@/components/UserMenu';
import { useLibrary } from '@/hooks/useLibrary';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Mode } from '@/types/debate';

const Practice = () => {
  const { user } = useAuth();
  const { entries, saveEntry, deleteEntry } = useLibrary();
  const [selectedEntry, setSelectedEntry] = useState<DebateEntry | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchParams] = useSearchParams();
  
  // Get initial mode from URL query parameter
  const initialMode = (searchParams.get('mode') as Mode) || undefined;

  const handleSelectEntry = (entry: DebateEntry) => {
    setSelectedEntry(entry);
    setSidebarOpen(false);
  };

  const handleDeleteEntry = async (entryId: string) => {
    await deleteEntry(entryId);
    if (selectedEntry?.id === entryId) {
      setSelectedEntry(null);
    }
  };

  const handleClearView = () => {
    setSelectedEntry(null);
  };

  return (
    <div className="min-h-screen flex">
      <SettingsMenu />
      <UserMenu />
      
      {user && (
        <LibrarySidebar
          entries={entries}
          selectedId={selectedEntry?.id ?? null}
          onSelect={handleSelectEntry}
          onDelete={handleDeleteEntry}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
      )}

      <main className={`flex-1 min-h-screen overflow-y-auto ${user ? '' : 'w-full'}`}>
        <div className="p-6 md:p-10 lg:p-16">
          {/* Back to home link */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          
          <DebateGenerator
            onSave={saveEntry}
            viewingEntry={selectedEntry}
            onClearView={handleClearView}
            initialMode={initialMode}
          />
        </div>
      </main>
    </div>
  );
};

export default Practice;
