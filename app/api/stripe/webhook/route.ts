// ================================================
// STRIPE WEBHOOK HANDLER
// ================================================
// Procesa eventos de Stripe (pagos, suscripciones, etc.)

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { constructWebhookEvent, stripeTimestampToDate, mapStripeStatus } from '@/lib/services/stripeService';
import {
  upsertUserSubscription,
  updateSubscriptionStatus,
  updateSubscriptionPeriod,
  createInvoice,
  logSubscriptionEvent,
  isEventProcessed,
  getSubscriptionByStripeSubscriptionId,
  getUserIdByStripeCustomerId,
  getPlanBySlug,
} from '@/lib/db/models/subscription';
import { SubscriptionStatus, InvoiceStatus, BillingCycle } from '@/lib/types/subscription';

export const dynamic = 'force-dynamic';

// Desactivar el body parser de Next.js para webhooks
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET no está configurado');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Error verificando webhook:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Verificar si el evento ya fue procesado (idempotencia)
  const alreadyProcessed = await isEventProcessed(event.id);
  if (alreadyProcessed) {
    return NextResponse.json({ received: true, message: 'Event already processed' });
  }

  try {
    // Procesar el evento según su tipo
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'customer.created':
        await handleCustomerCreated(event.data.object as Stripe.Customer);
        break;

      default:
        console.log(`Evento no manejado: ${event.type}`);
    }

    // Registrar el evento como procesado
    await logSubscriptionEvent({
      stripeEventId: event.id,
      eventType: event.type,
      payload: event.data.object as unknown as Record<string, unknown>,
      processed: true,
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Error procesando evento ${event.type}:`, error);

    // Registrar el error
    await logSubscriptionEvent({
      stripeEventId: event.id,
      eventType: event.type,
      payload: event.data.object as unknown as Record<string, unknown>,
      processed: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    );
  }
}

// ================================================
// HANDLERS DE EVENTOS
// ================================================

/**
 * Maneja cuando se completa un checkout
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const billingCycle = (session.metadata?.billingCycle || 'monthly') as BillingCycle;

  if (!userId) {
    console.error('Checkout session sin userId en metadata');
    return;
  }

  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  // Obtener detalles de la suscripción
  if (subscriptionId) {
    // La suscripción se procesará en el evento customer.subscription.created
    console.log(`Checkout completado para usuario ${userId}, suscripción: ${subscriptionId}`);
  }

  // Actualizar el stripe_customer_id si es un checkout nuevo
  if (customerId) {
    // Determinar el plan basado en el billing cycle y precio
    const plan = await getPlanBySlug('pro'); // Por ahora asumimos Pro
    
    if (plan) {
      await upsertUserSubscription(parseInt(userId), {
        planId: plan.id,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        status: 'active',
        billingCycle,
      });
    }
  }
}

/**
 * Maneja cuando se crea una suscripción
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  const billingCycle = (subscription.metadata?.billingCycle || 'monthly') as BillingCycle;

  if (!userId) {
    // Intentar obtener userId por customer_id
    const customerId = subscription.customer as string;
    const existingUserId = await getUserIdByStripeCustomerId(customerId);
    
    if (!existingUserId) {
      console.error('Suscripción creada sin userId');
      return;
    }
  }

  const userIdNumber = userId ? parseInt(userId) : await getUserIdByStripeCustomerId(subscription.customer as string);
  if (!userIdNumber) return;

  // Determinar el plan basado en el precio
  // const priceId = subscription.items.data[0]?.price.id;
  const plan = await getPlanBySlug('pro'); // TODO: mapear priceId a plan

  if (!plan) {
    console.error('No se encontró el plan para la suscripción');
    return;
  }

  // Acceder a las propiedades de período mediante any para compatibilidad
  const subscriptionData = subscription as unknown as Record<string, unknown>;
  const currentPeriodStart = subscriptionData.current_period_start as number;
  const currentPeriodEnd = subscriptionData.current_period_end as number;

  await upsertUserSubscription(userIdNumber, {
    planId: plan.id,
    stripeCustomerId: subscription.customer as string,
    stripeSubscriptionId: subscription.id,
    status: mapStripeStatus(subscription.status) as SubscriptionStatus,
    billingCycle,
    currentPeriodStart: currentPeriodStart ? stripeTimestampToDate(currentPeriodStart) : undefined,
    currentPeriodEnd: currentPeriodEnd ? stripeTimestampToDate(currentPeriodEnd) : undefined,
    trialStart: subscription.trial_start ? stripeTimestampToDate(subscription.trial_start) : undefined,
    trialEnd: subscription.trial_end ? stripeTimestampToDate(subscription.trial_end) : undefined,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });

  console.log(`Suscripción creada para usuario ${userIdNumber}`);
}

/**
 * Maneja cuando se actualiza una suscripción
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const existingSubscription = await getSubscriptionByStripeSubscriptionId(subscription.id);

  if (!existingSubscription) {
    console.log('Suscripción no encontrada en BD, puede ser nueva');
    return handleSubscriptionCreated(subscription);
  }

  // Acceder a las propiedades de período mediante casting para compatibilidad
  const subscriptionData = subscription as unknown as Record<string, unknown>;
  const currentPeriodStart = subscriptionData.current_period_start as number;
  const currentPeriodEnd = subscriptionData.current_period_end as number;

  // Actualizar período
  await updateSubscriptionPeriod(
    subscription.id,
    stripeTimestampToDate(currentPeriodStart),
    stripeTimestampToDate(currentPeriodEnd)
  );

  // Actualizar estado
  const status = mapStripeStatus(subscription.status) as SubscriptionStatus;
  await updateSubscriptionStatus(
    existingSubscription.user_id,
    status,
    subscription.cancel_at_period_end,
    subscription.canceled_at ? stripeTimestampToDate(subscription.canceled_at) : undefined
  );

  console.log(`Suscripción actualizada: ${subscription.id}, status: ${status}`);
}

/**
 * Maneja cuando se elimina/cancela una suscripción
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const existingSubscription = await getSubscriptionByStripeSubscriptionId(subscription.id);

  if (!existingSubscription) {
    console.log('Suscripción a eliminar no encontrada');
    return;
  }

  await updateSubscriptionStatus(
    existingSubscription.user_id,
    'cancelled',
    true,
    new Date()
  );

  console.log(`Suscripción cancelada: ${subscription.id}`);
}

/**
 * Maneja cuando se paga una factura
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const userId = await getUserIdByStripeCustomerId(customerId);

  if (!userId) {
    console.log('Usuario no encontrado para factura pagada');
    return;
  }

  // Casting para compatibilidad con diferentes versiones de la API
  const invoiceData = invoice as unknown as Record<string, unknown>;

  await createInvoice({
    userId,
    stripeInvoiceId: invoice.id,
    stripePaymentIntentId: (invoiceData.payment_intent as string) || undefined,
    amount: invoice.amount_due / 100,
    amountPaid: invoice.amount_paid / 100,
    currency: invoice.currency.toUpperCase(),
    status: 'paid' as InvoiceStatus,
    billingReason: invoice.billing_reason || undefined,
    description: invoice.description || undefined,
    invoiceUrl: invoice.hosted_invoice_url || undefined,
    invoicePdf: invoice.invoice_pdf || undefined,
    hostedInvoiceUrl: invoice.hosted_invoice_url || undefined,
    periodStart: invoice.period_start ? stripeTimestampToDate(invoice.period_start) : undefined,
    periodEnd: invoice.period_end ? stripeTimestampToDate(invoice.period_end) : undefined,
    paidAt: new Date(),
  });

  console.log(`Factura pagada: ${invoice.id}`);
}

/**
 * Maneja cuando falla el pago de una factura
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const userId = await getUserIdByStripeCustomerId(customerId);

  if (!userId) {
    console.log('Usuario no encontrado para factura fallida');
    return;
  }

  // Actualizar estado de suscripción
  await updateSubscriptionStatus(userId, 'past_due');

  await createInvoice({
    userId,
    stripeInvoiceId: invoice.id,
    amount: invoice.amount_due / 100,
    amountPaid: 0,
    currency: invoice.currency.toUpperCase(),
    status: 'open' as InvoiceStatus,
    billingReason: invoice.billing_reason || undefined,
    hostedInvoiceUrl: invoice.hosted_invoice_url || undefined,
  });

  console.log(`Pago fallido para factura: ${invoice.id}`);

  // TODO: Enviar email de notificación al usuario
}

/**
 * Maneja cuando se crea un cliente
 */
async function handleCustomerCreated(customer: Stripe.Customer) {
  console.log(`Cliente creado en Stripe: ${customer.id}, email: ${customer.email}`);
  // Normalmente no necesitamos hacer nada aquí ya que el customer se asocia en el checkout
}
