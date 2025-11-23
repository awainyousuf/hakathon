export interface ImageSample {
  id: string;
  src: string; // Base64 data URL
  timestamp: number;
}

export interface ClassData {
  id: string;
  name: string;
  samples: ImageSample[];
  color: string;
}

export interface Prediction {
  className: string;
  probability: number;
  modelName: string;
}

export type ModelType = 'CNN' | 'GEMINI' | 'SIMPLE';

export interface TrainingState {
  isTraining: boolean;
  progress: number; // 0-100
  accuracy: number | null;
  loss: number | null;
  trainedModels: ModelType[];
}

export interface GeminiConfig {
  thinkingBudget?: number;
}