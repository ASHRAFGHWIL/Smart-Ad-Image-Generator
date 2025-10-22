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
  category: string;
}

export type AdSize = '1080x1080' | '1080x1920' | '1200x628' | '2000x2000';

// FIX: Define UploadedImage interface here to be shared across the application.
export interface UploadedImage {
  data: string; // base64 encoded
  mimeType: string;
}

export interface AdText {
  headline: string;
  body: string;
  fontStyle: string;
}

export interface AdTemplate {
  id: string;
  name: string;
  description: string;
  previewImageUrl: string;
  sceneDescription: string;
  fontStyle: string;
  textPromptInstruction: string;
  // FIX: Add category to AdTemplate to provide it when creating a Scene from a template.
  category: string;
}
