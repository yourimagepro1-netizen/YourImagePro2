
// FIX: Defined StyleOption interface and removed circular import.
export interface StyleOption {
  id: string;
  name: string;
  thumbnail: string;
  color: string;
  category: 'professional_headshots' | 'branding_marketing' | 'lifestyle_editorial' | 'creative_portraits' | 'model_photoshoots' | 'couples_family_portraits' | 'urban_hip' | 'holiday_events';
  requiredPlan: 'free' | 'pro' | 'extreme';
}

export interface UserState {
  email: string;
  credits: number;
  plan: 'free' | 'creator' | 'professional' | 'agency';
  hasMadePurchase?: boolean;
  password?: string;
  stripeCustomerId?: string;
  justReferred?: boolean;
  adsWatchedToday?: number;
  lastAdWatchDate?: string;
  name?: string;
  picture?: string;
}

export type GenerationRequest = {
    type: 'image';
    files?: File[];
    style?: StyleOption;
    keepLikeness?: boolean;
    aspectRatio?: '1:1' | '16:9';
    prompt?: string;
    negativePrompt?: string;
} | {
    type: 'group';
    files: File[];
    style?: StyleOption;
    prompt?: string;
    keepLikeness: boolean;
    aspectRatio: '1:1' | '16:9';
} | {
    type: 'video';
    videoType: 'animate' | 'scene';
    files: File[]; // For animate: [File], for scene: [File] or []
    prompt: string;
} | {
    type: 'design';
    projectType: 'event_flyer';
    textContent: { [key: string]: string };
    styleDescription: string;
    logoFile?: File;
    aspectRatio: '9:16'; // Standard flyer aspect ratio
} | null;

export interface MediaItem {
  id: number;
  type: 'image' | 'video';
  content: string | Blob; // dataURL for image, Blob for video
  timestamp: number;
}
