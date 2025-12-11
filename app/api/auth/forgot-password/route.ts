import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/lib/db/models/UserModel';
import { VerificationTokenModel } from '@/lib/db/models/VerificationTokenModel';
import { sendPasswordResetEmail } from '@/lib/services/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Buscar usuario por email
    const user = await UserModel.findByEmail(email);

    // Si el usuario existe, generar token y enviar email
    if (user) {
      // Invalidar tokens anteriores de reset
      await VerificationTokenModel.invalidateUserTokens(user.id, 'password_reset');

      // Generar nuevo token (expira en 1 hora)
      const resetToken = await VerificationTokenModel.create(
        user.id,
        'password_reset',
        1
      );

      // Enviar email de reset
      try {
        await sendPasswordResetEmail(user.email, user.name, resetToken);
      } catch (emailError) {
        console.error('Error sending password reset email:', emailError);
        return NextResponse.json(
          { error: 'Error al enviar el email de recuperación' },
          { status: 500 }
        );
      }
    }

    // Siempre devolver el mismo mensaje para no revelar si el email existe
    return NextResponse.json({
      message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña'
    }, { status: 200 });

  } catch (error) {
    console.error('Error in forgot-password:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
