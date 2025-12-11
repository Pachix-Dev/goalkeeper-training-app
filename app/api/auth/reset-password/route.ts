import { NextRequest, NextResponse } from 'next/server';
import { VerificationTokenModel } from '@/lib/db/models/VerificationTokenModel';
import { UserModel } from '@/lib/db/models/UserModel';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Validar longitud de contraseña
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }

    // Verificar el token
    const tokenData = await VerificationTokenModel.verifyAndUse(token, 'password_reset');

    if (!tokenData) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 400 }
      );
    }

    // Obtener el usuario
    const user = await UserModel.findById(tokenData);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar la contraseña (el modelo se encarga del hash)
    await UserModel.update(user.id, { password });

    // Invalidar todos los tokens del usuario por seguridad
    await VerificationTokenModel.invalidateUserTokens(user.id);

    return NextResponse.json({
      message: 'Contraseña actualizada exitosamente'
    }, { status: 200 });

  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: 'Error al restablecer la contraseña' },
      { status: 500 }
    );
  }
}
