// ================================================
// SUBSCRIPTION API
// ================================================
// Endpoints para gestionar la suscripción del usuario

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/middleware';
import {
  getUserSubscription,
  getUserSubscriptionLimits,
  getUserFeatures,
  getUserInvoices,
  getActivePlans,
} from '@/lib/db/models/subscription';
import {
  cancelSubscriptionAtPeriodEnd,
  reactivateSubscription,
} from '@/lib/services/stripeService';

/**
 * GET - Obtener información de suscripción del usuario
 */
export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = await verifyToken(req);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const userId = parseInt(authResult.user.id);
    const { searchParams } = new URL(req.url);
    const include = searchParams.get('include')?.split(',') || [];

    // Obtener suscripción base
    const subscription = await getUserSubscription(userId);
    
    const response: Record<string, unknown> = {
      subscription: subscription || null,
      plan: subscription ? {
        name: (subscription as unknown as Record<string, unknown>).plan_name,
        slug: (subscription as unknown as Record<string, unknown>).plan_slug,
      } : { name: 'Free', slug: 'free' },
    };

    // Incluir límites si se solicitan
    if (include.includes('limits')) {
      response.limits = await getUserSubscriptionLimits(userId);
    }

    // Incluir features si se solicitan
    if (include.includes('features')) {
      response.features = await getUserFeatures(userId);
    }

    // Incluir facturas si se solicitan
    if (include.includes('invoices')) {
      response.invoices = await getUserInvoices(userId, 10);
    }

    // Incluir planes disponibles si se solicitan
    if (include.includes('plans')) {
      response.availablePlans = await getActivePlans();
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error obteniendo suscripción:', error);
    return NextResponse.json(
      { error: 'Error al obtener información de suscripción' },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Actualizar suscripción (cancelar/reactivar)
 */
export async function PATCH(req: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = await verifyToken(req);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const userId = parseInt(authResult.user.id);
    const body = await req.json();
    const { action } = body;

    // Obtener suscripción
    const subscription = await getUserSubscription(userId);
    
    if (!subscription || !subscription.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No tienes una suscripción activa' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'cancel':
        // Cancelar al final del período
        await cancelSubscriptionAtPeriodEnd(subscription.stripe_subscription_id);
        return NextResponse.json({
          success: true,
          message: 'Tu suscripción se cancelará al final del período actual',
        });

      case 'reactivate':
        // Reactivar suscripción cancelada
        if (!subscription.cancel_at_period_end) {
          return NextResponse.json(
            { error: 'La suscripción no está programada para cancelarse' },
            { status: 400 }
          );
        }
        await reactivateSubscription(subscription.stripe_subscription_id);
        return NextResponse.json({
          success: true,
          message: 'Tu suscripción ha sido reactivada',
        });

      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error actualizando suscripción:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la suscripción' },
      { status: 500 }
    );
  }
}
