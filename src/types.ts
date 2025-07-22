export type Currency = 'USD' | 'EUR';

export type SubscriptionTier = 'basic' | 'pro' | 'premium';

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  price: number;
  currency: Currency;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface Subscription {
  id: string;
  planId: SubscriptionTier;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface User {
  username: string;
  password: string; // In a real app, this would be a hash
  email: string;
  phone: string;
  fullName: string;
  isConfirmed: boolean;
  profilePicture: string | null;
  address?: string;
  subscriptionTier?: SubscriptionTier;
  subscription?: Subscription;
  paymentMethods?: PaymentMethod[];
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
