// -----------------------------------------------------------------------------
// BACKUP / MANUAL TRANSPORT ONLY
//
// The OTP and magic-link auth flow is handled entirely by Supabase Auth
// (see src/actions/auth.ts and src/app/login/page.tsx). This file is kept
// as a utility for any *additional* transactional emails the product team
// may want to send in the future (e.g. "we received a sighting of your pet",
// "your report has been marked REUNITED", weekly digests, etc.).
//
// Do NOT call this function from the auth code path. Supabase Auth manages
// the OTP code generation, expiration and delivery for us.
// -----------------------------------------------------------------------------

type EmailResult = { success: boolean; error?: string };

export interface TransactionalEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown email error';
}

export async function sendTransactionalEmail({
  to,
  subject,
  html,
  text,
}: TransactionalEmailInput): Promise<EmailResult> {
  const recipients = Array.isArray(to) ? to : [to];

  if (!process.env.RESEND_API_KEY) {
    console.log('\n========================================');
    console.log('[TRANSACTIONAL EMAIL MOCK]');
    console.log(`To: ${recipients.join(', ')}`);
    console.log(`Subject: ${subject}`);
    if (text) console.log(`Text: ${text}`);
    console.log(`HTML: ${html}`);
    console.log('========================================\n');
    return { success: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: process.env.SENDER_EMAIL || 'Huellitas <noreply@huellitas.org>',
        to: recipients,
        subject,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `Resend API failed: ${errText}` };
    }

    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function sendEmailOtp(email: string, code: string): Promise<EmailResult> {
  console.log(`\n========================================\n[EMAIL OTP SIMULATION]`);
  console.log(`Para: ${email}`);
  console.log(`Código de Verificación: ${code}`);
  console.log(`Válido por: 5 minutos`);
  console.log(`========================================\n`);

  if (!process.env.RESEND_API_KEY) {
    return { success: true };
  }

  return sendTransactionalEmail({
    to: email,
    subject: `${code} es tu código de verificación de Huellitas`,
    html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="font-size: 24px; font-weight: bold; color: #ff4f4f;">🐾 Huellitas</span>
            </div>
            <h2 style="font-size: 20px; color: #0f172a; text-align: center; margin-bottom: 8px;">Código de Verificación</h2>
            <p style="font-size: 14px; color: #475569; text-align: center; margin-bottom: 24px;">Ingresa el siguiente código de 6 dígitos para iniciar sesión y publicar tu reporte de mascota.</p>
            <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0f172a; margin-bottom: 24px;">
              ${code}
            </div>
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">Este código expirará en 5 minutos. Si no solicitaste este código, puedes ignorar este correo.</p>
          </div>
        `,
  });
}
