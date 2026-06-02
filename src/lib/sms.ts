export async function sendSmsOtp(phone: string, code: string): Promise<{ success: boolean; error?: string }> {
  console.log(`\n========================================\n[TELEFONO SMS OTP SIMULATION]`);
  console.log(`Para Celular: ${phone}`);
  console.log(`Código de Verificación: ${code}`);
  console.log(`Texto del SMS: "🐾 Huellitas: Tu codigo de verificacion es ${code}. Valido por 5 minutos."`);
  console.log(`========================================\n`);

  // Aquí se colocaría la integración real con Twilio, Vonage, o AWS SNS en producción.
  // Para el MVP simulamos éxito de inmediato.
  return { success: true };
}
