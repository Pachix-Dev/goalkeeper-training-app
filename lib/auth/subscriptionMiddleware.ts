// ================================================
// SUBSCRIPTION MIDDLEWARE
// ================================================
// Funciones para verificar límites y características de suscripción

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/middleware';
import { 
  canAccessFeature, 
  canCreateResource, 
  getUserSubscriptionLimits,
  getUserFeatures 
} from '@/lib/db/models/subscription';
import { SubscriptionFeatures } from '@/lib/types/subscription';

type ResourceType = 'teams' | 'goalkeepers' | 'tasks' | 'sessions';
type FeatureType = keyof SubscriptionFeatures;

/**
 * Middleware para verificar si el usuario puede crear un recurso
 */
export async function checkResourceLimit(
  req: NextRequest,
  resourceType: ResourceType
): Promise<{ allowed: boolean; response?: NextResponse }> {
  const authResult = await verifyToken(req);
  
  if (!authResult.success || !authResult.user) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      ),
    };
  }

  const userId = parseInt(authResult.user.id);
  const canCreate = await canCreateResource(userId, resourceType);

  if (!canCreate) {
    const limits = await getUserSubscriptionLimits(userId);
    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: 'Límite de plan alcanzado',
          code: 'SUBSCRIPTION_LIMIT_REACHED',
          resourceType,
          current: limits[resourceType].current,
          max: limits[resourceType].max,
          message: `Has alcanzado el límite de ${resourceType} de tu plan. Actualiza a un plan superior para continuar.`,
        },
        { status: 403 }
      ),
    };
  }

  return { allowed: true };
}

/**
 * Middleware para verificar si el usuario tiene acceso a una característica
 */
export async function checkFeatureAccess(
  req: NextRequest,
  feature: FeatureType
): Promise<{ allowed: boolean; response?: NextResponse }> {
  const authResult = await verifyToken(req);
  
  if (!authResult.success || !authResult.user) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      ),
    };
  }

  const userId = parseInt(authResult.user.id);
  const hasAccess = await canAccessFeature(userId, feature);

  if (!hasAccess) {
    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: 'Característica no disponible',
          code: 'FEATURE_NOT_AVAILABLE',
          feature,
          message: `Esta característica requiere un plan superior. Actualiza tu plan para acceder.`,
        },
        { status: 403 }
      ),
    };
  }

  return { allowed: true };
}

/**
 * HOF para crear handlers protegidos por límites de recursos
 */
export function withResourceLimit(resourceType: ResourceType) {
  return function<T extends (...args: [NextRequest, ...unknown[]]) => Promise<NextResponse>>(
    handler: T
  ): T {
    return (async (req: NextRequest, ...args: unknown[]) => {
      const check = await checkResourceLimit(req, resourceType);
      
      if (!check.allowed) {
        return check.response!;
      }

      return handler(req, ...args);
    }) as T;
  };
}

/**
 * HOF para crear handlers protegidos por características
 */
export function withFeatureAccess(feature: FeatureType) {
  return function<T extends (...args: [NextRequest, ...unknown[]]) => Promise<NextResponse>>(
    handler: T
  ): T {
    return (async (req: NextRequest, ...args: unknown[]) => {
      const check = await checkFeatureAccess(req, feature);
      
      if (!check.allowed) {
        return check.response!;
      }

      return handler(req, ...args);
    }) as T;
  };
}

/**
 * Obtiene el contexto de suscripción para incluir en respuestas
 */
export async function getSubscriptionContext(userId: number) {
  const [limits, features] = await Promise.all([
    getUserSubscriptionLimits(userId),
    getUserFeatures(userId),
  ]);

  return {
    limits,
    features,
    warnings: generateWarnings(limits),
  };
}

/**
 * Genera advertencias cuando el usuario está cerca de los límites
 */
function generateWarnings(limits: Awaited<ReturnType<typeof getUserSubscriptionLimits>>) {
  const warnings: string[] = [];
  const threshold = 0.8; // 80%

  for (const [resource, data] of Object.entries(limits)) {
    if (data.max < 999) { // No es ilimitado
      const usage = data.current / data.max;
      if (usage >= threshold && usage < 1) {
        warnings.push(`Estás cerca del límite de ${resource} (${data.current}/${data.max})`);
      } else if (usage >= 1) {
        warnings.push(`Has alcanzado el límite de ${resource}`);
      }
    }
  }

  return warnings;
}

/**
 * Tipo para respuestas con contexto de suscripción
 */
export interface SubscriptionAwareResponse<T> {
  data: T;
  subscription?: {
    limits: Awaited<ReturnType<typeof getUserSubscriptionLimits>>;
    features: SubscriptionFeatures;
    warnings: string[];
  };
}
