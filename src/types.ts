export type AnalysisType = 'macro' | 'micro' | 'field';

export interface AnalysisMetadata {
  rockType?: string;
  location?: string;
  hardness?: string;
  notes?: string;
  timestamp: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface AnalysisResult {
  id: string;
  image: string; // base64
  type: AnalysisType;
  metadata: AnalysisMetadata;
  response: string;
  timestamp: number;
}
