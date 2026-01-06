// ================================================
// STRIPE SERVICE
// ================================================
// Servicio centralizado para todas las operaciones con Stripe

import Stripe from 'stripe';

// Inicializar cliente de Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn('⚠️ STRIPE_SECRET_KEY no está configurada. Las funciones de pago no funcionarán.');
}

export const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  : null;

// ================================================
// Tipos de Stripe
// ================================================
export interface CheckoutSessionParams {
  userId: number;
  userEmail: string;
  priceId: string;
  billingCycle: 'monthly' | 'yearly';
  successUrl: string;
  cancelUrl: string;
  trialDays?: number;
  customerId?: string;
}

export interface PortalSessionParams {
  customerId: string;
  returnUrl: string;
}

// ================================================
// Funciones de Checkout
// ================================================

/**
 * Crea una sesión de checkout de Stripe para suscripciones
 */
export async function createCheckoutSession(params: CheckoutSessionParams): Promise<Stripe.Checkout.Session> {
  if (!stripe) {
    throw new Error('Stripe no está configurado');
  }

  const {
    userId,
    userEmail,
    priceId,
    billingCycle,
    successUrl,
    cancelUrl,
    trialDays,
    customerId,
  } = params;

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    metadata: {
      userId: userId.toString(),
      billingCycle,
    },
    subscription_data: {
      metadata: {
        userId: userId.toString(),
        billingCycle,
      },
    },
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    tax_id_collection: {
      enabled: true,
    },
  };

  // Si ya tiene customer ID, usarlo
  if (customerId) {
    sessionParams.customer = customerId;
  } else {
    sessionParams.customer_email = userEmail;
  }

  // Agregar trial si está configurado
  if (trialDays && trialDays > 0) {
    sessionParams.subscription_data!.trial_period_days = trialDays;
  }

  const session = await stripe.checkout.sessions.create(sessionParams);
  return session;
}

/**
 * Obtiene una sesión de checkout por ID
 */
export async function getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  if (!stripe) {
    throw new Error('Stripe no está configurado');
  }

  return await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['subscription', 'customer'],
  });
}

// ================================================
// Funciones del Portal de Clientes
// ================================================

/**
 * Crea una sesión del portal de billing de Stripe
 */
export async function createCustomerPortalSession(params: PortalSessionParams): Promise<Stripe.BillingPortal.Session> {
  if (!stripe) {
    throw new Error('Stripe no está configurado');
  }

  const { customerId, returnUrl } = params;

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

// ================================================
// Funciones de Clientes
// ================================================

/**
 * Crea un cliente en Stripe
 */
export async function createCustomer(
  email: string,
  name: string,
  metadata?: Record<string, string>
): Promise<Stripe.Customer> {
  if (!stripe) {
    throw new Error('Stripe no está configurado');
  }

  return await stripe.customers.create({
    email,
    name,
    metadata: metadata || {},
  });
}

/**
 * Obtiene un cliente por ID
 */
export async function getCustomer(customerId: string): Promise<Stripe.Customer | Stripe.DeletedCustomer> {
  if (!stripe) {
    throw new Error('Stripe no está configurado');
  }

  return await stripe.customers.retrieve(customerId);
}

/**
 * Actualiza un cliente
 */
export async function updateCustomer(
  customerId: string,
  params: Stripe.CustomerUpdateParams
): Promise<Stripe.Customer> {
  if (!stripe) {
    throw new Error('Stripe no está configurado');
  }

  return await stripe.customers.update(customerId, params);
}

// ================================================
// Funciones de Suscripciones
// ================================================

/**
 * Obtiene una suscripción por ID
 */
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  if (!stripe) {
    throw new Error('Stripe no está configurado');
  }

  return await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['default_payment_method', 'latest_invoice'],
  });
}

/**
 * Cancela una suscripción al final del período
 */
export async function cancelSubscriptionAtPeriodEnd(subscriptionId: string): Promise<Stripe.Subscription> {
  if (!stripe) {
    throw new Error('Stripe no está configurado');
  }

  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * Reactiva una suscripción cancelada
 */
export async function reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  if (!stripe) {
    throw new Error('Stripe no está configurado');
  }

  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

/**
 * Cancela una suscripción inmediatamente
 */
export async function cancelSubscriptionImmediately(subscriptionId: string): Promise<Stripe.Subscription> {
  if (!stripe) {
    throw new Error('Stripe no está configurado');
  }

  return await stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Cambia el plan de una suscripción
 */
export async function updateSubscriptionPlan(
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription> {
  if (!stripe) {
    throw new Error('Stripe no está configurado');
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'create_prorations',
  });
}

// ================================================
// Funciones de Facturas
// ================================================

/**
 * Obtiene las facturas de un cliente
 */
export async function getCustomerInvoices(
  customerId: string,
  limit: number = 10
): Promise<Stripe.Invoice[]> {
  if (!stripe) {
    throw new Error('Stripe no está configurado');
  }

  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit,
  });

  return invoices.data;
}

/**
 * Obtiene una factura por ID
 */
export async function getInvoice(invoiceId: string): Promise<Stripe.Invoice> {
  if (!stripe) {
    throw new Error('Stripe no está configurado');
  }

  return await stripe.invoices.retrieve(invoiceId);
}

// ================================================
// Funciones de Precios
// ================================================

/**
 * Obtiene un precio por ID
 */
export async function getPrice(priceId: string): Promise<Stripe.Price> {
  if (!stripe) {
    throw new Error('Stripe no está configurado');
  }

  return await stripe.prices.retrieve(priceId, {
    expand: ['product'],
  });
}

/**
 * Lista todos los precios activos
 */
export async function listActivePrices(): Promise<Stripe.Price[]> {
  if (!stripe) {
    throw new Error('Stripe no está configurado');
  }

  const prices = await stripe.prices.list({
    active: true,
    type: 'recurring',
    expand: ['data.product'],
  });

  return prices.data;
}

// ================================================
// Funciones de Webhooks
// ================================================

/**
 * Construye y verifica un evento de webhook
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  if (!stripe) {
    throw new Error('Stripe no está configurado');
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

// ================================================
// Utilidades
// ================================================

/**
 * Formatea un precio en centavos a formato de moneda
 */
export function formatPrice(amountInCents: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountInCents / 100);
}

/**
 * Convierte un timestamp de Stripe a Date
 */
export function stripeTimestampToDate(timestamp: number): Date {
  return new Date(timestamp * 1000);
}

/**
 * Mapea el status de Stripe a nuestro enum
 */
export function mapStripeStatus(status: Stripe.Subscription.Status): string {
  const statusMap: Record<Stripe.Subscription.Status, string> = {
    active: 'active',
    canceled: 'cancelled',
    incomplete: 'incomplete',
    incomplete_expired: 'incomplete_expired',
    past_due: 'past_due',
    paused: 'paused',
    trialing: 'trialing',
    unpaid: 'unpaid',
  };

  return statusMap[status] || 'inactive';
}
