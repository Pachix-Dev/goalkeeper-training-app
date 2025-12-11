# Módulo de Registro y Recuperación de Contraseña

## ✅ Archivos Creados

### Backend (API Endpoints)

- `app/api/auth/register/route.ts` - Registro con envío de email de verificación
- `app/api/auth/verify-email/route.ts` - Verificación de email con token
- `app/api/auth/forgot-password/route.ts` - Solicitud de recuperación de contraseña
- `app/api/auth/reset-password/route.ts` - Establecer nueva contraseña

### Frontend (Páginas UI)

- `app/[locale]/register/page.tsx` - Formulario de registro
- `app/[locale]/verify-email/page.tsx` - Página de verificación con animaciones
- `app/[locale]/forgot-password/page.tsx` - Formulario de recuperación
- `app/[locale]/reset-password/page.tsx` - Formulario de nueva contraseña

### Sistema de Emails

- `lib/emails/WelcomeEmail.tsx` - Template de bienvenida con React Email
- `lib/emails/ResetPasswordEmail.tsx` - Template de reset de contraseña
- `lib/services/emailService.ts` - Servicio centralizado con Resend

### Base de Datos

- `lib/db/models/VerificationTokenModel.ts` - Modelo para gestión de tokens
- `lib/db/migrations/001_add_verification_tokens.sql` - SQL para crear tabla

### Traducciones

- `messages/es.json` - Actualizado con 30+ nuevas claves
- `messages/en.json` - Actualizado con 30+ nuevas claves

### Tipos TypeScript

- `lib/types/database.ts` - Agregado `email_verified` y `password` en UpdateUserDTO
- `lib/db/models/UserModel.ts` - Actualizado para soportar cambios de password y email_verified

---

## 📋 Pasos para Completar la Configuración

### 1. Ejecutar Migración de Base de Datos

**Opción A - MySQL Workbench/phpMyAdmin (RECOMENDADO):**
Abre y ejecuta el archivo: `lib/db/migrations/001_fix_verification_tokens.sql`

**Opción B - Desde línea de comandos (si tienes mysql CLI instalado):**

```bash
mysql -u root -p goalkeeper_training < lib/db/migrations/001_fix_verification_tokens.sql
```

Esto creará:

- Tabla `verification_tokens` con campos: id, user_id, token, type, expires_at, used_at
- Índices para optimizar búsquedas (user_id, token, type, expires_at)
- Foreign key con la tabla users (ON DELETE CASCADE)
- **Nota:** La limpieza de tokens expirados se ejecuta automáticamente desde la aplicación al crear nuevos tokens

### 2. Verificar Configuración de Resend

Asegúrate de que tu `.env.local` tiene:

```env
RESEND_API_KEY=re_tu_clave_aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Importante:**

- Obtén tu API key desde: https://resend.com/api-keys
- En desarrollo usa el dominio sandbox de Resend
- En producción configura tu dominio verificado

### 3. Probar el Flujo Completo

#### 3.1 Registro

1. Ve a `http://localhost:3000/es/register`
2. Completa el formulario con un email válido
3. Deberías recibir un email con el enlace de verificación
4. Click en "Verificar Email" en el email

#### 3.2 Verificación

- El link te redirige a `/verify-email?token=...`
- Si el token es válido, se marca `email_verified = true`
- Redirige automáticamente al login después de 3 segundos

#### 3.3 Recuperación de Contraseña

1. Ve a `http://localhost:3000/es/login`
2. Click en "¿Olvidaste tu contraseña?"
3. Ingresa tu email
4. Recibirás un email con enlace de reset (expira en 1 hora)
5. Click en "Restablecer Contraseña"
6. Ingresa tu nueva contraseña
7. Redirige al login

---

## 🔐 Características de Seguridad

### Tokens

- Generados con `crypto.randomBytes(32)` (64 caracteres hex)
- Únicos en la base de datos
- Expiración configurable (24h email, 1h password)
- Marcados como "usados" después de una verificación
- Limpieza automática de tokens expirados

### Password Reset

- No revela si el email existe (seguridad OWASP)
- Invalida todos los tokens anteriores del usuario
- Requiere token válido y no expirado
- Hash bcrypt con 10 rounds

### Email Verification

- Usuario puede ver su dashboard sin verificar email
- Puedes bloquear funciones críticas hasta que verifique
- Token único por usuario

---

## 🎨 Personalización

### Cambiar Templates de Email

Edita los archivos en `lib/emails/`:

- `WelcomeEmail.tsx` - Personalizar colores, logo, textos
- `ResetPasswordEmail.tsx` - Ajustar diseño y mensajes

Previsualiza con React Email:

```bash
npm run email:dev
```

### Ajustar Tiempos de Expiración

En los archivos de API:

- `register/route.ts` línea 57: `24` horas para verificación
- `forgot-password/route.ts` línea 42: `1` hora para reset

### Personalizar URLs

En `lib/services/emailService.ts`:

```typescript
const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`
const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
```

---

## 🧪 Testing Checklist

- [ ] Registro con email válido
- [ ] Verificación de email con token válido
- [ ] Verificación con token inválido/expirado
- [ ] Solicitud de recuperación con email existente
- [ ] Solicitud con email no existente (debe dar mismo mensaje)
- [ ] Reset con token válido
- [ ] Reset con token inválido/expirado
- [ ] Reset con contraseña débil (< 8 caracteres)
- [ ] Passwords no coinciden en formularios
- [ ] Login después de cambiar contraseña
- [ ] Traducciones en español e inglés

---

## 🚀 Próximos Pasos Opcionales

1. **Resend Verification Email**
   - Botón para reenviar email de verificación
   - Límite de envíos por hora

2. **Email Templates Avanzados**
   - Logo personalizado
   - Footer con redes sociales
   - Versión HTML y texto plano

3. **Two-Factor Authentication**
   - SMS/TOTP para login
   - Backup codes

4. **Social Auth**
   - Google OAuth
   - Microsoft Azure AD

5. **Dashboard de Admin**
   - Ver usuarios registrados
   - Estado de verificación de emails
   - Resend manual de emails

---

## 🐛 Troubleshooting

### Email no llega

- Verifica que `RESEND_API_KEY` sea válida
- En desarrollo, usa un email verificado en Resend
- Revisa los logs del servidor para errores

### Token inválido

- Verifica que la URL tenga el parámetro `?token=...`
- Tokens expiran (24h verificación, 1h reset)
- Un token solo se puede usar una vez

### Error de base de datos

- Ejecuta la migración: `001_add_verification_tokens.sql`
- Verifica que la tabla `users` tenga el campo `email_verified`
- Revisa la conexión en `.env.local`

### TypeScript errors

- Ejecuta: `npm run build` para ver todos los errores
- Verifica que `UpdateUserDTO` tenga `email_verified` y `password`

---

## 📚 Recursos

- **Resend Docs**: https://resend.com/docs
- **React Email**: https://react.email
- **Next.js Auth**: https://nextjs.org/docs/authentication
- **OWASP Auth**: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html

---

**¡Sistema de autenticación completo!** 🎉
