export interface User {
  username: string;
  password?: string; // In a real app, this would be a hash. Optional for Google Sign-In
  authProvider: 'manual' | 'google';
  email: string;
  phone: string;
  fullName: string;
  isConfirmed: boolean;
  profilePicture: string | null;
  isPro: boolean;
}

export interface Car {
  make: string;
  model: string;
  year: number;
  mileage: number;
  vin: string;
  imageUrl: string | null;
  engineType: string;
  transmission: 'Automatic' | 'Manual';
  exteriorColor: string;
  tirePressure: {
    fl: number; // front-left
    fr: number; // front-right
    rl: number; // rear-left
    rr: number; // rear-right
  };
  fluidLevels: {
    brake: 'OK' | 'Low' | 'Check';
    coolant: 'OK' | 'Low' | 'Check';
  }
}

export interface ServiceRecord {
  id: string;
  date: string;
  mileage: number;
  category: string;
  type: string;
  cost: number; // Stored as base currency (EUR)
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

export type Currency = 'EUR' | 'USD';

export type Language = 'en' | 'bg' | 'es' | 'de' | 'fr';

export type Theme = 'light' | 'dark';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}