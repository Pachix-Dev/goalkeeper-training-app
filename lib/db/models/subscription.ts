// ================================================
// SUBSCRIPTION MODEL
// ================================================
// Funciones de base de datos para suscripciones

import pool from '../connection';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import {
  SubscriptionPlan,
  UserSubscription,
  SubscriptionInvoice,
  UserSubscriptionDetails,
  SubscriptionLimits,
  SubscriptionFeatures,
  SubscriptionStatus,
  BillingCycle,
  InvoiceStatus,
} from '@/lib/types/subscription';

// ================================================
// PLANES DE SUSCRIPCIÓN
// ================================================

/**
 * Obtiene todos los planes activos
 */
export async function getActivePlans(): Promise<SubscriptionPlan[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM subscription_plans 
     WHERE is_active = 1 
     ORDER BY sort_order ASC`
  );

  return rows.map((row: RowDataPacket) => ({
    ...row,
    features: typeof row.features === 'string' ? JSON.parse(row.features) : row.features,
    has_tactical_editor: Boolean(row.has_tactical_editor),
    has_statistics: Boolean(row.has_statistics),
    has_match_analysis: Boolean(row.has_match_analysis),
    has_penalty_tracking: Boolean(row.has_penalty_tracking),
    has_export_pdf: Boolean(row.has_export_pdf),
    has_priority_support: Boolean(row.has_priority_support),
    is_popular: Boolean(row.is_popular),
    is_active: Boolean(row.is_active),
  })) as SubscriptionPlan[];
}

/**
 * Obtiene un plan por ID
 */
export async function getPlanById(id: number): Promise<SubscriptionPlan | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM subscription_plans WHERE id = ?',
    [id]
  );

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    ...row,
    features: typeof row.features === 'string' ? JSON.parse(row.features) : row.features,
    has_tactical_editor: Boolean(row.has_tactical_editor),
    has_statistics: Boolean(row.has_statistics),
    has_match_analysis: Boolean(row.has_match_analysis),
    has_penalty_tracking: Boolean(row.has_penalty_tracking),
    has_export_pdf: Boolean(row.has_export_pdf),
    has_priority_support: Boolean(row.has_priority_support),
    is_popular: Boolean(row.is_popular),
    is_active: Boolean(row.is_active),
  } as SubscriptionPlan;
}

/**
 * Obtiene un plan por slug
 */
export async function getPlanBySlug(slug: string): Promise<SubscriptionPlan | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM subscription_plans WHERE slug = ?',
    [slug]
  );

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    ...row,
    features: typeof row.features === 'string' ? JSON.parse(row.features) : row.features,
    has_tactical_editor: Boolean(row.has_tactical_editor),
    has_statistics: Boolean(row.has_statistics),
    has_match_analysis: Boolean(row.has_match_analysis),
    has_penalty_tracking: Boolean(row.has_penalty_tracking),
    has_export_pdf: Boolean(row.has_export_pdf),
    has_priority_support: Boolean(row.has_priority_support),
    is_popular: Boolean(row.is_popular),
    is_active: Boolean(row.is_active),
  } as SubscriptionPlan;
}

/**
 * Actualiza los Price IDs de Stripe de un plan
 */
export async function updatePlanStripeIds(
  planId: number,
  stripePriceIdMonthly: string,
  stripePriceIdYearly: string,
  stripeProductId?: string
): Promise<void> {
  await pool.execute(
    `UPDATE subscription_plans 
     SET stripe_price_id_monthly = ?, 
         stripe_price_id_yearly = ?,
         stripe_product_id = ?
     WHERE id = ?`,
    [stripePriceIdMonthly, stripePriceIdYearly, stripeProductId || null, planId]
  );
}

// ================================================
// SUSCRIPCIONES DE USUARIO
// ================================================

/**
 * Obtiene la suscripción de un usuario
 */
export async function getUserSubscription(userId: number): Promise<UserSubscription | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT us.*, sp.name as plan_name, sp.slug as plan_slug
     FROM user_subscriptions us
     JOIN subscription_plans sp ON us.plan_id = sp.id
     WHERE us.user_id = ?`,
    [userId]
  );

  if (rows.length === 0) return null;

  return rows[0] as UserSubscription;
}

/**
 * Obtiene suscripción por Stripe Customer ID
 */
export async function getSubscriptionByStripeCustomerId(
  stripeCustomerId: string
): Promise<UserSubscription | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM user_subscriptions WHERE stripe_customer_id = ?',
    [stripeCustomerId]
  );

  if (rows.length === 0) return null;
  return rows[0] as UserSubscription;
}

/**
 * Obtiene suscripción por Stripe Subscription ID
 */
export async function getSubscriptionByStripeSubscriptionId(
  stripeSubscriptionId: string
): Promise<UserSubscription | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM user_subscriptions WHERE stripe_subscription_id = ?',
    [stripeSubscriptionId]
  );

  if (rows.length === 0) return null;
  return rows[0] as UserSubscription;
}

/**
 * Crea o actualiza una suscripción de usuario
 */
export async function upsertUserSubscription(
  userId: number,
  data: {
    planId: number;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    status: SubscriptionStatus;
    billingCycle: BillingCycle;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    trialStart?: Date;
    trialEnd?: Date;
    cancelAtPeriodEnd?: boolean;
  }
): Promise<number> {
  const existingSubscription = await getUserSubscription(userId);

  if (existingSubscription) {
    await pool.execute(
      `UPDATE user_subscriptions SET
        plan_id = ?,
        stripe_customer_id = COALESCE(?, stripe_customer_id),
        stripe_subscription_id = COALESCE(?, stripe_subscription_id),
        status = ?,
        billing_cycle = ?,
        current_period_start = ?,
        current_period_end = ?,
        trial_start = ?,
        trial_end = ?,
        cancel_at_period_end = ?,
        updated_at = NOW()
       WHERE user_id = ?`,
      [
        data.planId,
        data.stripeCustomerId || null,
        data.stripeSubscriptionId || null,
        data.status,
        data.billingCycle,
        data.currentPeriodStart || null,
        data.currentPeriodEnd || null,
        data.trialStart || null,
        data.trialEnd || null,
        data.cancelAtPeriodEnd ? 1 : 0,
        userId,
      ]
    );
    return existingSubscription.id;
  } else {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO user_subscriptions (
        user_id, plan_id, stripe_customer_id, stripe_subscription_id,
        status, billing_cycle, current_period_start, current_period_end,
        trial_start, trial_end, cancel_at_period_end
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        data.planId,
        data.stripeCustomerId || null,
        data.stripeSubscriptionId || null,
        data.status,
        data.billingCycle,
        data.currentPeriodStart || null,
        data.currentPeriodEnd || null,
        data.trialStart || null,
        data.trialEnd || null,
        data.cancelAtPeriodEnd ? 1 : 0,
      ]
    );
    return result.insertId;
  }
}

/**
 * Actualiza el estado de una suscripción
 */
export async function updateSubscriptionStatus(
  userId: number,
  status: SubscriptionStatus,
  cancelAtPeriodEnd?: boolean,
  cancelledAt?: Date
): Promise<void> {
  await pool.execute(
    `UPDATE user_subscriptions SET
      status = ?,
      cancel_at_period_end = COALESCE(?, cancel_at_period_end),
      cancelled_at = COALESCE(?, cancelled_at),
      updated_at = NOW()
     WHERE user_id = ?`,
    [status, cancelAtPeriodEnd !== undefined ? (cancelAtPeriodEnd ? 1 : 0) : null, cancelledAt || null, userId]
  );
}

/**
 * Actualiza el período de suscripción
 */
export async function updateSubscriptionPeriod(
  stripeSubscriptionId: string,
  currentPeriodStart: Date,
  currentPeriodEnd: Date
): Promise<void> {
  await pool.execute(
    `UPDATE user_subscriptions SET
      current_period_start = ?,
      current_period_end = ?,
      updated_at = NOW()
     WHERE stripe_subscription_id = ?`,
    [currentPeriodStart, currentPeriodEnd, stripeSubscriptionId]
  );
}

// ================================================
// DETALLES Y LÍMITES
// ================================================

/**
 * Obtiene los detalles completos de la suscripción del usuario
 */
export async function getUserSubscriptionDetails(userId: number): Promise<UserSubscriptionDetails | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM vw_user_subscription_details WHERE user_id = ?',
    [userId]
  );

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    ...row,
    has_tactical_editor: Boolean(row.has_tactical_editor),
    has_statistics: Boolean(row.has_statistics),
    has_match_analysis: Boolean(row.has_match_analysis),
    cancel_at_period_end: Boolean(row.cancel_at_period_end),
  } as UserSubscriptionDetails;
}

/**
 * Obtiene los límites de la suscripción del usuario
 */
export async function getUserSubscriptionLimits(userId: number): Promise<SubscriptionLimits> {
  // Obtener el plan del usuario (o plan free por defecto)
  const [planRows] = await pool.execute<RowDataPacket[]>(
    `SELECT sp.* FROM subscription_plans sp
     LEFT JOIN user_subscriptions us ON sp.id = us.plan_id AND us.user_id = ? AND us.status IN ('active', 'trialing')
     WHERE sp.id = COALESCE(us.plan_id, 1)
     LIMIT 1`,
    [userId]
  );

  const plan = planRows[0] || { max_teams: 1, max_goalkeepers: 3, max_tasks: 5, max_sessions_per_month: 10 };

  // Contar recursos actuales
  const [teamsCount] = await pool.execute<RowDataPacket[]>(
    'SELECT COUNT(*) as count FROM teams WHERE user_id = ? AND is_active = 1',
    [userId]
  );

  const [goalkeepersCount] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) as count FROM goalkeepers g
     JOIN teams t ON g.team_id = t.id
     WHERE t.user_id = ? AND g.is_active = 1`,
    [userId]
  );

  const [tasksCount] = await pool.execute<RowDataPacket[]>(
    'SELECT COUNT(*) as count FROM tasks WHERE user_id = ?',
    [userId]
  );

  const [sessionsCount] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) as count FROM training_sessions 
     WHERE user_id = ? AND MONTH(session_date) = MONTH(CURRENT_DATE()) AND YEAR(session_date) = YEAR(CURRENT_DATE())`,
    [userId]
  );

  const teams = teamsCount[0]?.count || 0;
  const goalkeepers = goalkeepersCount[0]?.count || 0;
  const tasks = tasksCount[0]?.count || 0;
  const sessions = sessionsCount[0]?.count || 0;

  return {
    teams: {
      current: teams,
      max: plan.max_teams,
      canCreate: teams < plan.max_teams,
    },
    goalkeepers: {
      current: goalkeepers,
      max: plan.max_goalkeepers,
      canCreate: goalkeepers < plan.max_goalkeepers,
    },
    tasks: {
      current: tasks,
      max: plan.max_tasks,
      canCreate: tasks < plan.max_tasks,
    },
    sessions: {
      current: sessions,
      max: plan.max_sessions_per_month,
      canCreate: sessions < plan.max_sessions_per_month,
    },
  };
}

/**
 * Obtiene las características disponibles para el usuario
 */
export async function getUserFeatures(userId: number): Promise<SubscriptionFeatures> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT sp.* FROM subscription_plans sp
     LEFT JOIN user_subscriptions us ON sp.id = us.plan_id AND us.user_id = ? AND us.status IN ('active', 'trialing')
     WHERE sp.id = COALESCE(us.plan_id, 1)
     LIMIT 1`,
    [userId]
  );

  const plan = rows[0];

  if (!plan) {
    // Plan free por defecto
    return {
      tactical_editor: false,
      statistics: false,
      match_analysis: false,
      penalty_tracking: false,
      export_pdf: false,
      priority_support: false,
    };
  }

  return {
    tactical_editor: Boolean(plan.has_tactical_editor),
    statistics: Boolean(plan.has_statistics),
    match_analysis: Boolean(plan.has_match_analysis),
    penalty_tracking: Boolean(plan.has_penalty_tracking),
    export_pdf: Boolean(plan.has_export_pdf),
    priority_support: Boolean(plan.has_priority_support),
  };
}

/**
 * Verifica si el usuario puede acceder a una característica
 */
export async function canAccessFeature(userId: number, feature: keyof SubscriptionFeatures): Promise<boolean> {
  const features = await getUserFeatures(userId);
  return features[feature];
}

/**
 * Verifica si el usuario puede crear un recurso
 */
export async function canCreateResource(
  userId: number,
  resourceType: 'teams' | 'goalkeepers' | 'tasks' | 'sessions'
): Promise<boolean> {
  const limits = await getUserSubscriptionLimits(userId);
  return limits[resourceType].canCreate;
}

// ================================================
// FACTURAS
// ================================================

/**
 * Crea una factura en la base de datos
 */
export async function createInvoice(data: {
  userId: number;
  subscriptionId?: number;
  stripeInvoiceId: string;
  stripePaymentIntentId?: string;
  amount: number;
  amountPaid?: number;
  currency?: string;
  status: InvoiceStatus;
  billingReason?: string;
  description?: string;
  invoiceUrl?: string;
  invoicePdf?: string;
  hostedInvoiceUrl?: string;
  periodStart?: Date;
  periodEnd?: Date;
  paidAt?: Date;
}): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO subscription_invoices (
      user_id, subscription_id, stripe_invoice_id, stripe_payment_intent_id,
      amount, amount_paid, currency, status, billing_reason, description,
      invoice_url, invoice_pdf, hosted_invoice_url, period_start, period_end, paid_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      amount_paid = VALUES(amount_paid),
      status = VALUES(status),
      invoice_url = VALUES(invoice_url),
      invoice_pdf = VALUES(invoice_pdf),
      hosted_invoice_url = VALUES(hosted_invoice_url),
      paid_at = VALUES(paid_at),
      updated_at = NOW()`,
    [
      data.userId,
      data.subscriptionId || null,
      data.stripeInvoiceId,
      data.stripePaymentIntentId || null,
      data.amount,
      data.amountPaid || 0,
      data.currency || 'USD',
      data.status,
      data.billingReason || null,
      data.description || null,
      data.invoiceUrl || null,
      data.invoicePdf || null,
      data.hostedInvoiceUrl || null,
      data.periodStart || null,
      data.periodEnd || null,
      data.paidAt || null,
    ]
  );

  return result.insertId;
}

/**
 * Obtiene las facturas de un usuario
 */
export async function getUserInvoices(userId: number, limit: number = 10): Promise<SubscriptionInvoice[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM subscription_invoices 
     WHERE user_id = ? 
     ORDER BY created_at DESC 
     LIMIT ?`,
    [userId, limit]
  );

  return rows as SubscriptionInvoice[];
}

// ================================================
// EVENTOS
// ================================================

/**
 * Registra un evento de Stripe
 */
export async function logSubscriptionEvent(data: {
  userId?: number;
  stripeEventId: string;
  eventType: string;
  payload?: Record<string, unknown>;
  processed?: boolean;
  errorMessage?: string;
}): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO subscription_events (
      user_id, stripe_event_id, event_type, payload, processed, error_message
    ) VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      processed = VALUES(processed),
      error_message = VALUES(error_message)`,
    [
      data.userId || null,
      data.stripeEventId,
      data.eventType,
      data.payload ? JSON.stringify(data.payload) : null,
      data.processed ? 1 : 0,
      data.errorMessage || null,
    ]
  );

  return result.insertId;
}

/**
 * Verifica si un evento ya fue procesado
 */
export async function isEventProcessed(stripeEventId: string): Promise<boolean> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT processed FROM subscription_events WHERE stripe_event_id = ? AND processed = 1',
    [stripeEventId]
  );

  return rows.length > 0;
}

/**
 * Obtiene el userId por stripe_customer_id
 */
export async function getUserIdByStripeCustomerId(stripeCustomerId: string): Promise<number | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT user_id FROM user_subscriptions WHERE stripe_customer_id = ?',
    [stripeCustomerId]
  );

  if (rows.length === 0) return null;
  return rows[0].user_id;
}
