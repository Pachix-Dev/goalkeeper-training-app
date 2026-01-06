// ================================================
// CREATE CHECKOUT SESSION API
// ================================================
// Crea una sesión de checkout de Stripe para suscribirse

import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/services/stripeService';
import { getUserSubscription, getPlanBySlug } from '@/lib/db/models/subscription';
import { verifyToken } from '@/lib/auth/middleware';
import { z } from 'zod';

const checkoutSchema = z.object({
  planSlug: z.enum(['pro', 'elite']),
  billingCycle: z.enum(['monthly', 'yearly']),
});

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

    const body = await req.json();
    
    // Validar datos
    const validation = checkoutSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { planSlug, billingCycle } = validation.data;
    const userId = parseInt(authResult.user.id);

    // Verificar si ya tiene una suscripción activa
    const existingSubscription = await getUserSubscription(userId);
    if (existingSubscription && existingSubscription.status === 'active') {
      return NextResponse.json(
        { error: 'Ya tienes una suscripción activa. Usa el portal de facturación para cambiar de plan.' },
        { status: 400 }
      );
    }

    // Obtener el plan
    const plan = await getPlanBySlug(planSlug);
    if (!plan) {
      return NextResponse.json(
        { error: 'Plan no encontrado' },
        { status: 404 }
      );
    }

    // Obtener el price ID correcto
    const priceId = billingCycle === 'monthly' 
      ? plan.stripe_price_id_monthly 
      : plan.stripe_price_id_yearly;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Este plan no está configurado para pagos. Contacta al administrador.' },
        { status: 400 }
      );
    }

    // Crear sesión de checkout
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const locale = req.headers.get('x-locale') || 'es';

    const session = await createCheckoutSession({
      userId,
      userEmail: authResult.user.email,
      priceId,
      billingCycle,
      successUrl: `${appUrl}/${locale}/billing`,
      cancelUrl: `${appUrl}/${locale}/pricing`,
      customerId: existingSubscription?.stripe_customer_id,
      trialDays: plan.slug === 'pro' ? 7 : 0, // 7 días de prueba para Pro
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creando checkout session:', error);
    return NextResponse.json(
      { error: 'Error al crear la sesión de pago' },
      { status: 500 }
    );
  }
}
