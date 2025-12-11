import { NextRequest, NextResponse } from 'next/server';
import { VerificationTokenModel } from '@/lib/db/models/VerificationTokenModel';
import { UserModel } from '@/lib/db/models/UserModel';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token es requerido' },
        { status: 400 }
      );
    }

    // Verificar y usar el token
    const tokenData = await VerificationTokenModel.verifyAndUse(token, 'email_verification');

    if (!tokenData) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 400 }
      );
    }

    // Actualizar el usuario para marcar el email como verificado
    const user = await UserModel.findById(tokenData);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar email_verified
    await UserModel.update(user.id, { email_verified: true });

    return NextResponse.json({
      message: 'Email verificado exitosamente'
    }, { status: 200 });

  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json(
      { error: 'Error al verificar el email' },
      { status: 500 }
    );
  }
}
