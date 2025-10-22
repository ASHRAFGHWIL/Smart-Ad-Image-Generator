export interface AnalysisResult {
  colors: string[];
  analysis: {
    materials: string;
    lighting: string;
    shadows: string;
  };
}

export interface Scene {
  description: string;
  imageUrl: string;
}

export type AdSize = '1080x1080' | '1080x1920' | '1200x628' | '2000x2000';
