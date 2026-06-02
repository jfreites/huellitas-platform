'use server';

import { prisma } from '@/lib/db';
import { setSession, destroySession } from '@/lib/auth';
import { sendEmailOtp } from '@/lib/email';
import { sendSmsOtp } from '@/lib/sms';
import { requestOtpSchema, verifyOtpSchema } from '@/lib/schemas';

// Generar código OTP aleatorio de 6 dígitos
function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function requestOtp(rawIdentifier: string) {
  try {
    // Validar identificador
    const validated = requestOtpSchema.parse({ identifier: rawIdentifier });
    const identifier = validated.identifier.trim().toLowerCase();
    
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos de validez

    // Guardar OTP en base de datos (se puede mockear si hay problemas de DB, pero lo hacemos real)
    await prisma.otpCode.create({
      data: {
        identifier,
        code,
        expiresAt,
      },
    });

    if (isEmail) {
      const emailResult = await sendEmailOtp(identifier, code);
      if (!emailResult.success) {
        throw new Error(emailResult.error || 'Fallo al enviar OTP de correo.');
      }
    } else {
      const smsResult = await sendSmsOtp(identifier, code);
      if (!smsResult.success) {
        throw new Error(smsResult.error || 'Fallo al enviar OTP de SMS.');
      }
    }

    return { success: true, isEmail, identifier, message: 'Código enviado exitosamente.' };
  } catch (error: any) {
    console.error('Error en requestOtp:', error);
    return { success: false, error: error.message || 'Error al procesar la solicitud de OTP.' };
  }
}

export async function verifyOtp(data: {
  identifier: string;
  code: string;
  firstName?: string;
  lastName?: string;
  contactPhone?: string;
}) {
  try {
    const identifier = data.identifier.trim().toLowerCase();
    const code = data.code.trim();

    // Buscar código OTP válido en base de datos
    const otp = await prisma.otpCode.findFirst({
      where: {
        identifier,
        code,
        expiresAt: { gt: new Date() },
        verified: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      return { success: false, error: 'Código incorrecto, expirado o ya verificado.' };
    }

    // Marcar OTP como verificado
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { verified: true },
    });

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    // Buscar si el usuario ya existe
    let user = await prisma.user.findFirst({
      where: isEmail ? { email: identifier } : { phone: identifier },
    });

    // Si el usuario no existe y no se enviaron datos de registro, avisar a la UI
    if (!user) {
      if (!data.firstName || !data.lastName || !data.contactPhone) {
        return { success: true, requiresRegistration: true };
      }

      // Crear usuario
      user = await prisma.user.create({
        data: {
          email: isEmail ? identifier : null,
          phone: isEmail ? data.contactPhone : identifier,
          firstName: data.firstName,
          lastName: data.lastName,
        },
      });
    } else {
      // Si el usuario ya existe pero no tiene nombre/teléfono guardado, y nos los envían, actualizarlos
      const updateData: any = {};
      if (data.firstName && !user.firstName) updateData.firstName = data.firstName;
      if (data.lastName && !user.lastName) updateData.lastName = data.lastName;
      if (data.contactPhone && !user.phone && isEmail) updateData.phone = data.contactPhone;

      if (Object.keys(updateData).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });
      }
    }

    // Guardar sesión en cookies y en base de datos
    await setSession(user.id, user.email, user.phone, user.firstName, user.lastName);

    // También creamos un registro de Session en DB
    await prisma.session.create({
      data: {
        userId: user.id,
        token: Math.random().toString(36).substring(2),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { success: true, user };
  } catch (error: any) {
    console.error('Error en verifyOtp:', error);
    return { success: false, error: error.message || 'Error al verificar el código.' };
  }
}

// Iniciar sesión con OAuth Mock (Google/Facebook)
export async function loginWithMockOAuth(provider: 'google' | 'facebook') {
  try {
    const mockEmail = `demo.${provider}@huellitas.org`;
    const mockPhone = provider === 'google' ? '+5215555555555' : '+5219999999999';
    
    let user = await prisma.user.findUnique({
      where: { email: mockEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: mockEmail,
          phone: mockPhone,
          firstName: provider === 'google' ? 'Google' : 'Facebook',
          lastName: 'Mascotas Demo',
        },
      });

      // Crear registro de cuenta
      await prisma.authAccount.create({
        data: {
          userId: user.id,
          provider,
          providerAccountId: `mock-oauth-id-${provider}-${Math.random().toString(36).substring(7)}`,
        },
      });
    }

    // Guardar sesión
    await setSession(user.id, user.email, user.phone, user.firstName, user.lastName);

    return { success: true, user };
  } catch (error: any) {
    console.error('Error en loginWithMockOAuth:', error);
    return { success: false, error: error.message || 'Error al iniciar sesión de demostración.' };
  }
}

export async function logout() {
  await destroySession();
  return { success: true };
}
