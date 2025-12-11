import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/lib/db/models/UserModel';
import { VerificationTokenModel } from '@/lib/db/models/VerificationTokenModel';
import { sendWelcomeEmail } from '@/lib/services/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;

    // Validar campos requeridos
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, contraseña y nombre son requeridos' },
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

    // Validar longitud de contraseña
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 409 }
      );
    }

    // Crear usuario
    const user = await UserModel.create({
      email,
      password,
      name,
      role: role || 'coach'
    });

    // Generar token de verificación
    const verificationToken = await VerificationTokenModel.create(
      user.id,
      'email_verification',
      24 // 24 horas para verificar
    );

    // Enviar email de bienvenida
    try {
      await sendWelcomeEmail(user.email, user.name, verificationToken);
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // No fallar el registro si falla el email
    }

    // Devolver usuario sin password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      message: 'Usuario registrado exitosamente. Por favor revisa tu email para verificar tu cuenta.'
    }, { status: 201 });

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
