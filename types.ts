
export type MoodType = 'calm' | 'anxious' | 'tired' | 'creative' | 'stressed' | 'angry';

export interface BreathingStep {
  label: string;
  duration: number; // milliseconds
  scale: number; // target scale
  opacity: number;
}

export interface BreathingMode {
  name: string;
  description: string;
  steps: BreathingStep[];
}

export interface MoodConfig {
  id: MoodType;
  label: string;
  icon: string;
  color: string;
  gradient: string;
  tipTextClass: string;
  breathingMode: BreathingMode;
}

export interface InsightData {
  haiku: string;
  quote: string;
  author: string;
  tip: string;
}

export enum AppState {
  IDLE,
  SELECT_DURATION,
  BREATHING,
  GENERATING,
  SHOWING_INSIGHT
}
