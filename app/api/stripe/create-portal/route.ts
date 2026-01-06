// ================================================
// CREATE CUSTOMER PORTAL SESSION API
// ================================================
// Crea una sesión del portal de facturación de Stripe

import { NextRequest, NextResponse } from 'next/server';
import { createCustomerPortalSession } from '@/lib/services/stripeService';
import { getUserSubscription } from '@/lib/db/models/subscription';
import { verifyToken } from '@/lib/auth/middleware';

export async function POST(req: NextRequest) {
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

    // Obtener la suscripción del usuario
    const subscription = await getUserSubscription(userId);
    
    if (!subscription || !subscription.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No tienes una suscripción activa. Suscríbete primero.' },
        { status: 400 }
      );
    }

    // Crear sesión del portal
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const locale = req.headers.get('x-locale') || 'es';

    const session = await createCustomerPortalSession({
      customerId: subscription.stripe_customer_id,
      returnUrl: `${appUrl}/${locale}/billing`,
    });

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error('Error creando portal session:', error);
    return NextResponse.json(
      { error: 'Error al acceder al portal de facturación' },
      { status: 500 }
    );
  }
}
