import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthUser {
  id: string;
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
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    
    return { success: true, user: decoded };
  } catch (error) {
    return { success: false, error: 'Token inválido' };
  }
}

export async function authenticateRequest(request: NextRequest): Promise<AuthUser | null> {
  const result = await verifyToken(request);
  return result.success ? result.user! : null;
}

export function requireAuth<T = any>(
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

export function requireRole<T = any>(
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
