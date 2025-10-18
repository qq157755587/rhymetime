// RhymeTime AI TypeScript Interfaces and Data Models

// English nursery rhyme data interface
export interface RhymeData {
  id: string;
  title: string;
  content: string;
  elements: string[];
  audioUrl?: string;
  wordTimings?: WordTiming[];
  createdAt: string;
  language: 'en';
  llmProvider?: 'openai' | 'gemini' | 'claude' | 'mock';
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  vocabularyWords?: string[];
}

// Word timing interface (compatible with multiple STT services)
export interface WordTiming {
  word: string;
  startTime: number; // seconds
  endTime: number;   // seconds
  index: number;
  confidence?: number; // Google Cloud STT confidence
  speaker?: string;    // Speaker identification (optional)
}

// Element interface for drag-and-drop items
export interface Element {
  id: string;
  name: string;
  category: 'animal' | 'weather' | 'nature' | 'colors' | 'daily';
  imageUrl: string;
  description: string;
}

// Theme category interface
export interface ThemeCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  suggestedKeywords: string[];
}

// Drag item interface for React DnD
export interface DragItem {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
}

// API Request/Response Interfaces

// Generate rhyme request
export interface GenerateRhymeRequest {
  elements: string[];
  llmProvider?: 'openai' | 'gemini' | 'claude';
  language?: 'en';
}

// Generate rhyme response
export interface GenerateRhymeResponse {
  success: boolean;
  data?: RhymeData;
  error?: string;
}

// English audio generation request
export interface GenerateAudioRequest {
  text: string;
  provider?: 'gemini' | 'google' | 'openai' | 'web';
  ttsProvider?: 'gemini' | 'google' | 'openai' | 'web';
  voice?: 'child' | 'female' | 'male' | 'child-friendly';
  language?: 'en' | 'en-US' | 'en-GB'; // Force English
  speed?: number;    // 0.5-2.0 (suitable for children learning)
  pitch?: number;    // -20.0-20.0 (Google Cloud)
  childFriendly?: boolean; // Child-friendly mode
}

// Audio generation response
export interface GenerateAudioResponse {
  success: boolean;
  data?: {
    audioUrl: string;
    wordTimings: WordTiming[];
    provider: string;
    duration: number;
  };
  error?: string;
}

// English STT analysis request
export interface AnalyzeSpeechRequest {
  audioBlob: Blob;
  originalText: string; // English nursery rhyme text
  sttProvider?: 'google-cloud' | 'web-speech';
  language?: string;
}

// STT analysis response
export interface AnalyzeSpeechResponse {
  success: boolean;
  data?: {
    transcript: string;
    wordTimings: WordTiming[];
    confidence: number;
    provider: string;
    originalText: string;
  };
  error?: string;
}

// Audio player state interface
export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  currentWordIndex?: number;
}

// Local storage interfaces
export interface FavoriteRhyme extends RhymeData {
  favoritedAt: string;
}

export interface RhymeHistory extends RhymeData {
  viewedAt: string;
}

// App configuration interface
export interface AppConfig {
  llmProvider: 'openai' | 'gemini' | 'claude';
  ttsProvider: 'gemini' | 'google' | 'openai' | 'web';
  sttProvider: 'google-cloud' | 'web-speech';
  language: 'en';
  childFriendlyMode: boolean;
  autoPlay: boolean;
  showWordTimings: boolean;
}

// Error handling interface
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Service provider status interface
export interface ServiceStatus {
  provider: string;
  available: boolean;
  lastChecked: string;
  error?: string;
}