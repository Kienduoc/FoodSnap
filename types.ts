
export enum AppState {
  PROFILE = 'PROFILE',
  UPLOAD = 'UPLOAD',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT'
}

export enum Sex {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}

export enum ActivityLevel {
  SEDENTARY = 'sedentary',
  LIGHT = 'light',
  MODERATE = 'moderate',
  ACTIVE = 'active',
  VERY_ACTIVE = 'very_active'
}

export enum Goal {
  MAINTAIN = 'maintain',
  LOSE = 'lose',
  GAIN = 'gain'
}

export enum SuitabilityStatus {
    SUITABLE = 'suitable',
    SLIGHTLY_HIGH = 'slightly_high',
    HIGH = 'high',
    VERY_HIGH = 'very_high',
    LOW = 'low'
}

export interface UserProfile {
  user_id: string;
  sex: Sex;
  age: number;
  height_cm: number;
  weight_kg: number;
  activity_level: ActivityLevel;
  goal: Goal;
}

export interface ImageMeta {
  width: number;
  height: number;
  device: string;
  use_reference_card: boolean;
}

export interface TopPrediction {
  label: string;
  display: string;
  confidence: number;
}

export interface Detection {
  id: string;
  bbox: [number, number, number, number];
  mask_rle: string | null;
  label: string;
  label_display: string;
  confidence: number;
  top5: TopPrediction[];
  segmentation_area_px: number;
  estimated_grams: number;
  grams_confidence: number;
  kcal_per_100g: number;
  estimated_kcal: number;
}

export interface Suitability {
  status: SuitabilityStatus;
  score: number;
  message: string;
}

export interface AnalysisResult {
  timestamp: string;
  request_id: string;
  user_id: string;
  image_id: string;
  image_meta: ImageMeta;
  detections: Detection[];
  meal_total_kcal: number;
  user_profile_snapshot: UserProfile;
  user_tdee: number;
  meal_target_kcal: number;
  suitability: Suitability;
  corrections_allowed: boolean;
}
