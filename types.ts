export type WeightUnit = 'kg' | 'lbs';
export type HeightUnit = 'cm' | 'ft';

export interface BmiResult {
  bmi: number;
  category: BmiCategory;
  color: string;
}

export enum BmiCategory {
  Underweight = 'Underweight',
  Normal = 'Normal Weight',
  Overweight = 'Overweight',
  Obese = 'Obese',
}

export interface HealthTipsResponse {
  tips: string[];
  summary: string;
}

export const BMI_CATEGORIES = [
  { label: BmiCategory.Underweight, max: 18.5, color: '#3b82f6' }, // Blue
  { label: BmiCategory.Normal, max: 24.9, color: '#10b981' },      // Green
  { label: BmiCategory.Overweight, max: 29.9, color: '#f59e0b' },  // Orange
  { label: BmiCategory.Obese, max: 100, color: '#ef4444' },        // Red
];