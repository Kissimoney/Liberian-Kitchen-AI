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
  userId?: string; // ID of the user who created the recipe
  author?: {
    id?: string;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
    followerCount?: number;
    followingCount?: number;
  };
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

export interface RecipeComment {
  id: string;
  recipeId: string;
  userId: string;
  content: string;
  createdAt: number;
  author?: {
    username: string;
    avatarUrl?: string;
  };
}

export interface Notification {
  id: string;
  userId: string; // The recipient
  actorId: string; // The person who did the action
  recipeId: string | null;
  type: 'like' | 'comment';
  read: boolean;
  createdAt: number;
  actor?: {
    username: string;
    avatarUrl?: string;
  };
  recipe?: {
    title: string;
  };
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  recipeCount?: number;
}