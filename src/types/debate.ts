export type Position = 'for' | 'against';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type LanguageTone = 'slang' | 'highschool' | 'college' | 'adult' | 'scholar' | 'coach';
export type EvidenceLevel = 'low' | 'medium' | 'high';
export type Mode = 'debunk' | 'debate';
export type Speaker = 'ai' | 'user';

export interface SpeakingPoint {
  id: string;
  title: string;
  claim: string;
  explanation: string;
  evidence?: {
    type: 'statistic' | 'quote';
    content: string;
    source: string;
  }[];
}

export interface RoundScore {
  clarity: number;
  logicalReasoning: number;
  relevance: number;
  persuasiveness: number;
  total: number;
  strengths: string[];
  areasToImprove: string[];
}

export interface DebateSettings {
  topic: string;
  mode: Mode;
  position: Position;
  difficulty: Difficulty;
  languageTone: LanguageTone;
  timeLimit: number;
  noTimeLimit: boolean;
  numberOfPoints: number;
  evidenceLevel: EvidenceLevel;
  enableTimer: boolean;
  enableCounterArguments: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  content: string;
  score?: RoundScore | null;
  isCounterArgument?: boolean;
}

export interface DebateEntry {
  id: string;
  createdAt: Date;
  settings: DebateSettings;
  speakingPoints?: SpeakingPoint[];
  conversationHistory?: ChatMessage[];
  totalScore?: number;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
