import { useState } from 'react';
import { DebateEntry, Position, Difficulty, EvidenceLevel } from '@/types/debate';
import { cn } from '@/lib/utils';
import { BookOpen, ChevronRight, Calendar, Clock, Zap, FileText, Infinity, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface LibrarySidebarProps {
  entries: DebateEntry[];
  selectedId: string | null;
  onSelect: (entry: DebateEntry) => void;
  onDelete: (entryId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

function PositionBadge({ position }: { position: Position }) {
  return (
    <span className={cn(
      "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide",
      position === 'for' 
        ? "bg-position-for/10 text-position-for" 
        : "bg-position-against/10 text-position-against"
    )}>
      {position}
    </span>
  );
}

export function LibrarySidebar({ entries, selectedId, onSelect, onDelete, isOpen, onToggle }: LibrarySidebarProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<DebateEntry | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, entry: DebateEntry) => {
    e.stopPropagation();
    setEntryToDelete(entry);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (entryToDelete) {
      onDelete(entryToDelete.id);
      setEntryToDelete(null);
    }
    setDeleteDialogOpen(false);
  };
  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed bottom-6 left-6 z-50 p-4 rounded-full bg-sidebar text-sidebar-foreground shadow-lg hover:shadow-xl transition-shadow"
      >
        <BookOpen className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 w-80 bg-sidebar text-sidebar-foreground transform transition-transform duration-300 lg:transform-none",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sidebar-primary">
                <BookOpen className="w-5 h-5 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h2 className="font-serif font-semibold text-lg">Library</h2>
                <p className="text-xs text-sidebar-foreground/60">{entries.length} saved debates</p>
              </div>
            </div>
          </div>

          {/* Entries list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {entries.length === 0 ? (
              <div className="text-center py-12 text-sidebar-foreground/40">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No saved debates yet</p>
                <p className="text-xs mt-1">Generate your first topic!</p>
              </div>
            ) : (
              entries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => onSelect(entry)}
                  className={cn(
                    "w-full text-left p-4 rounded-lg transition-all duration-200 group",
                    selectedId === entry.id
                      ? "bg-sidebar-accent"
                      : "hover:bg-sidebar-accent/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm line-clamp-2 flex-1">
                      {entry.settings.topic}
                    </p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => handleDeleteClick(e, entry)}
                        className="p-1 rounded hover:bg-destructive/20 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                        aria-label="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className={cn(
                        "w-4 h-4 mt-0.5 transition-transform",
                        selectedId === entry.id && "rotate-90"
                      )} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <PositionBadge position={entry.settings.position} />
                    <span className="text-[10px] text-sidebar-foreground/50 capitalize">
                      {entry.settings.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-sidebar-foreground/50">
                    <span className="flex items-center gap-1">
                      {entry.settings.noTimeLimit ? (
                        <><Infinity className="w-3 h-3" /> No limit</>
                      ) : (
                        <><Clock className="w-3 h-3" /> {entry.settings.timeLimit}min</>
                      )}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" /> {entry.settings.numberOfPoints} pts
                    </span>
                    <span className="flex items-center gap-1 capitalize">
                      <Zap className="w-3 h-3" /> {entry.settings.evidenceLevel}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-sidebar-foreground/40">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(entry.createdAt), 'MMM d, yyyy')}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={onToggle}
        />
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this debate?</AlertDialogTitle>
            <AlertDialogDescription>
              {entryToDelete && (
                <>
                  Are you sure you want to delete "<span className="font-medium">{entryToDelete.settings.topic}</span>"? 
                  This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
