// ================================================
// SUBSCRIPTION TYPES - TypeScript Interfaces
// ================================================

export type SubscriptionStatus = 
  | 'active' 
  | 'cancelled' 
  | 'past_due' 
  | 'trialing' 
  | 'incomplete' 
  | 'incomplete_expired' 
  | 'paused' 
  | 'unpaid';

export type BillingCycle = 'monthly' | 'yearly' | 'lifetime';

export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';

// ================================================
// Plan de Suscripción
// ================================================
export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description?: string;
  stripe_product_id?: string;
  stripe_price_id_monthly?: string;
  stripe_price_id_yearly?: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  features?: string[];
  max_teams: number;
  max_goalkeepers: number;
  max_tasks: number;
  max_sessions_per_month: number;
  has_tactical_editor: boolean;
  has_statistics: boolean;
  has_match_analysis: boolean;
  has_penalty_tracking: boolean;
  has_export_pdf: boolean;
  has_priority_support: boolean;
  sort_order: number;
  is_popular: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// ================================================
// Suscripción del Usuario
// ================================================
export interface UserSubscription {
  id: number;
  user_id: number;
  plan_id: number;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  status: SubscriptionStatus;
  billing_cycle: BillingCycle;
  current_period_start?: Date;
  current_period_end?: Date;
  trial_start?: Date;
  trial_end?: Date;
  cancel_at_period_end: boolean;
  cancelled_at?: Date;
  created_at: Date;
  updated_at: Date;
  // Relaciones
  plan?: SubscriptionPlan;
}

// ================================================
// Factura/Invoice
// ================================================
export interface SubscriptionInvoice {
  id: number;
  user_id: number;
  subscription_id?: number;
  stripe_invoice_id: string;
  stripe_payment_intent_id?: string;
  amount: number;
  amount_paid: number;
  currency: string;
  status: InvoiceStatus;
  billing_reason?: string;
  description?: string;
  invoice_url?: string;
  invoice_pdf?: string;
  hosted_invoice_url?: string;
  period_start?: Date;
  period_end?: Date;
  paid_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// ================================================
// Evento de Suscripción (para auditoría)
// ================================================
export interface SubscriptionEvent {
  id: number;
  user_id?: number;
  stripe_event_id: string;
  event_type: string;
  payload?: Record<string, unknown>;
  processed: boolean;
  error_message?: string;
  created_at: Date;
}

// ================================================
// DTOs y Requests
// ================================================
export interface CreateCheckoutRequest {
  priceId: string;
  billingCycle: BillingCycle;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CreateCheckoutResponse {
  sessionId: string;
  url: string;
}

export interface CreatePortalRequest {
  returnUrl?: string;
}

export interface CreatePortalResponse {
  url: string;
}

// ================================================
// Vista de Detalles de Suscripción
// ================================================
export interface UserSubscriptionDetails {
  user_id: number;
  email: string;
  user_name: string;
  plan_name: string;
  plan_slug: string;
  subscription_status: SubscriptionStatus;
  billing_cycle: BillingCycle;
  current_period_start?: Date;
  current_period_end?: Date;
  cancel_at_period_end: boolean;
  max_teams: number;
  max_goalkeepers: number;
  max_tasks: number;
  has_tactical_editor: boolean;
  has_statistics: boolean;
  has_match_analysis: boolean;
  effective_status: 'free' | 'active' | 'trialing' | 'inactive';
}

// ================================================
// Límites de Suscripción
// ================================================
export interface SubscriptionLimits {
  teams: { current: number; max: number; canCreate: boolean };
  goalkeepers: { current: number; max: number; canCreate: boolean };
  tasks: { current: number; max: number; canCreate: boolean };
  sessions: { current: number; max: number; canCreate: boolean };
}

export interface SubscriptionFeatures {
  tactical_editor: boolean;
  statistics: boolean;
  match_analysis: boolean;
  penalty_tracking: boolean;
  export_pdf: boolean;
  priority_support: boolean;
}

// ================================================
// Respuesta completa del usuario con suscripción
// ================================================
export interface UserWithSubscription {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'coach' | 'assistant';
  subscription: {
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    billing_cycle: BillingCycle;
    current_period_end?: Date;
    cancel_at_period_end: boolean;
  } | null;
  limits: SubscriptionLimits;
  features: SubscriptionFeatures;
}

// ================================================
// Pricing Display
// ================================================
export interface PricingPlan {
  id: number;
  name: string;
  slug: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  features: string[];
  isPopular: boolean;
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
}
