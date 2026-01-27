import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DebateEntry, Mode, Position, Difficulty, LanguageTone, EvidenceLevel, SpeakingPoint, ChatMessage } from '@/types/debate';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

interface SavedDebateRow {
  id: string;
  user_id: string;
  topic: string;
  mode: string;
  position: string;
  difficulty: string;
  language_tone: string;
  time_limit: number;
  no_time_limit: boolean;
  number_of_points: number;
  evidence_level: string;
  speaking_points: unknown;
  conversation_history: unknown;
  total_score: number | null;
  created_at: string;
  updated_at: string;
}

export function useLibrary() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DebateEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    if (!user) {
      setEntries([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saved_debates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped: DebateEntry[] = (data as SavedDebateRow[]).map((row) => ({
        id: row.id,
        createdAt: new Date(row.created_at),
        settings: {
          topic: row.topic,
          mode: row.mode as Mode,
          position: row.position as Position,
          difficulty: row.difficulty as Difficulty,
          languageTone: row.language_tone as LanguageTone,
          timeLimit: row.time_limit,
          noTimeLimit: row.no_time_limit,
          numberOfPoints: row.number_of_points,
          evidenceLevel: row.evidence_level as EvidenceLevel,
          enableTimer: false,
          enableCounterArguments: false,
        },
        speakingPoints: row.speaking_points as SpeakingPoint[] | undefined,
        conversationHistory: row.conversation_history as ChatMessage[] | undefined,
        totalScore: row.total_score ?? undefined,
      }));

      setEntries(mapped);
    } catch (error) {
      console.error('Error fetching library:', error);
      toast.error('Failed to load library');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const saveEntry = async (entry: DebateEntry): Promise<boolean> => {
    if (!user) {
      toast.error('Please sign in to save debates');
      return false;
    }

    try {
      const { error } = await supabase.from('saved_debates').insert([{
        user_id: user.id,
        topic: entry.settings.topic,
        mode: entry.settings.mode,
        position: entry.settings.position,
        difficulty: entry.settings.difficulty,
        language_tone: entry.settings.languageTone,
        time_limit: entry.settings.timeLimit,
        no_time_limit: entry.settings.noTimeLimit,
        number_of_points: entry.settings.numberOfPoints,
        evidence_level: entry.settings.evidenceLevel,
        speaking_points: JSON.parse(JSON.stringify(entry.speakingPoints || null)),
        conversation_history: JSON.parse(JSON.stringify(entry.conversationHistory || null)),
        total_score: entry.totalScore || null,
      }]);

      if (error) throw error;

      setEntries((prev) => [entry, ...prev]);
      toast.success('Debate saved to library!');
      return true;
    } catch (error) {
      console.error('Error saving debate:', error);
      toast.error('Failed to save debate');
      return false;
    }
  };

  const deleteEntry = async (entryId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('saved_debates')
        .delete()
        .eq('id', entryId)
        .eq('user_id', user.id);

      if (error) throw error;

      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      toast.success('Debate deleted');
      return true;
    } catch (error) {
      console.error('Error deleting debate:', error);
      toast.error('Failed to delete debate');
      return false;
    }
  };

  return {
    entries,
    isLoading,
    saveEntry,
    deleteEntry,
    refetch: fetchEntries,
  };
}
