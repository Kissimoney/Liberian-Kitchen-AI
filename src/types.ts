export interface NutrientData {
  name: string;
  value: number;
  unit: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  cookTime: string;
  servings: number;
  temperature?: string;
  averageRating?: number;
  ratingCount?: number;
  tags: string[];
  nutrients: NutrientData[];
  imageUrl?: string;
  generatedAt: number;
  source?: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  GENERATING_TEXT = 'GENERATING_TEXT',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface GenerationRequest {
  query: string;
  cuisine?: string;
  isVegetarian?: boolean;
  spicinessLevel?: 'Mild' | 'Medium' | 'Hot' | 'Liberian Hot';
}