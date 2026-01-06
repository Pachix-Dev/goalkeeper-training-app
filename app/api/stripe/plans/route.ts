// ================================================
// PLANS API
// ================================================
// Endpoint público para obtener planes disponibles

import { NextResponse } from 'next/server';
import { getActivePlans } from '@/lib/db/models/subscription';

/**
 * GET - Obtener todos los planes activos
 */
export async function GET() {
  try {
    const plans = await getActivePlans();

    // Transformar para el frontend
    const formattedPlans = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      slug: plan.slug,
      description: plan.description,
      priceMonthly: plan.price_monthly,
      priceYearly: plan.price_yearly,
      currency: plan.currency,
      features: plan.features || [],
      isPopular: plan.is_popular,
      limits: {
        teams: plan.max_teams,
        goalkeepers: plan.max_goalkeepers,
        tasks: plan.max_tasks,
        sessionsPerMonth: plan.max_sessions_per_month,
      },
      capabilities: {
        tacticalEditor: plan.has_tactical_editor,
        statistics: plan.has_statistics,
        matchAnalysis: plan.has_match_analysis,
        penaltyTracking: plan.has_penalty_tracking,
        exportPdf: plan.has_export_pdf,
        prioritySupport: plan.has_priority_support,
      },
    }));

    return NextResponse.json({
      plans: formattedPlans,
    });
  } catch (error) {
    console.error('Error obteniendo planes:', error);
    return NextResponse.json(
      { error: 'Error al obtener planes' },
      { status: 500 }
    );
  }
}
