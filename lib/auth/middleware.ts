import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'coach' | 'assistant';
}

interface VerifyTokenResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

/**
 * Verifica el token JWT de una request
 */
export async function verifyToken(request: NextRequest): Promise<VerifyTokenResult> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'Token no proporcionado' };
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as unknown;

    if (!decoded || typeof decoded !== 'object') {
      return { success: false, error: 'Token inválido' };
    }

    const payload = decoded as Record<string, unknown>;
    const rawId = payload.id;
    const userId = typeof rawId === 'string' ? Number(rawId) : (rawId as number);

    if (!Number.isFinite(userId)) {
      return { success: false, error: 'Token inválido' };
    }

    const user: AuthUser = {
      id: userId,
      email: String(payload.email ?? ''),
      name: String(payload.name ?? ''),
      role: payload.role as AuthUser['role'],
    };

    if (!user.email || !user.name || !user.role) {
      return { success: false, error: 'Token inválido' };
    }

    return { success: true, user };
  } catch (error) {
    console.error('Error verificando token:', error);
    return { success: false, error: 'Token inválido' };
  }
}

export async function authenticateRequest(request: NextRequest): Promise<AuthUser | null> {
  const result = await verifyToken(request);
  return result.success ? result.user! : null;
}

export function requireAuth<T = unknown>(
  handler: (request: NextRequest, user: AuthUser, context?: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: T) => {
    const user = await authenticateRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    return handler(request, user, context);
  };
}

export function requireRole<T = unknown>(
  roles: string[], 
  handler: (request: NextRequest, user: AuthUser, context?: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: T) => {
    const user = await authenticateRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    if (!roles.includes(user.role)) {
      return NextResponse.json(
        { error: 'No tienes permisos para realizar esta acción' },
        { status: 403 }
      );
    }

    return handler(request, user, context);
  };
}
