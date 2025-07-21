export type Currency = 'USD' | 'EUR';

export interface User {
  username: string;
  password: string; // In a real app, this would be a hash
  email: string;
  phone: string;
  fullName: string;
  isConfirmed: boolean;
  profilePicture: string | null;
  address?: string;
}

export interface Car {
  make: string;
  model: string;
  year: number;
  mileage: number;
  vin: string;
  imageUrl: string | null;
}

export interface ServiceRecord {
  id: string;
  date: string;
  mileage: number;
  category: string;
  type: string;
  cost: number; // Stored as base currency (USD)
  serviceStation: string;
  notes: string;
}

export interface AIAdviceResponse {
  estimatedCost: string;
  nextServiceSuggestion: string;
  additionalTips: string[];
}

export interface AIDiagnosis {
    possibleCause: string;
    estimatedCost: string;
    complexity: string;
}

export interface AIDiagnosisResponse {
    analysis: AIDiagnosis[];
    recommendation: string;
}

export type View = 'dashboard' | 'car_profile' | 'diagnostics';

export type Language = 'en' | 'bg' | 'es' | 'de' | 'fr';

export type Theme = 'light' | 'dark';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}
