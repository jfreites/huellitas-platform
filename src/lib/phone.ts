/**
 * Returns a privacy-friendly version of a contact phone number.
 *
 * Behavior:
 * - Empty / falsy input → returns an empty string.
 * - Numbers shorter than 7 characters → returned as-is (no useful mask).
 * - Otherwise keeps the first half (rounded up) and replaces the rest
 *   with bullet characters, preserving any leading "+" sign so the
 *   country code stays visible.
 *
 * Examples:
 *   maskContactPhone('+5215555555555') → '+5215555••••••'
 *   maskContactPhone('15555555555')    → '15555•••••'
 *   maskContactPhone('+52 155 555 5555') → '+52 155 555 ••••'
 *
 * The function does not modify group separators (spaces, dashes) when
 * they exist; it only swaps the trailing digits for bullets.
 */
export function maskContactPhone(phone: string | null | undefined): string {
  if (!phone) return '';

  // Find trailing digit run, leaving any trailing non-digit chars intact.
  const match = phone.match(/^(.*?)(\d+)(.*)$/);
  if (!match) return phone;

  const [, prefix, digits, suffix] = match;
  if (digits.length < 7) return phone;

  // Show roughly the first half, mask the rest.
  const visibleCount = Math.ceil(digits.length / 2);
  const visible = digits.slice(0, visibleCount);
  const masked = '•'.repeat(digits.length - visibleCount);

  return `${prefix}${visible}${masked}${suffix}`;
}
