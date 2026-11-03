/**
 * Urgent Taxis — Customer PII Masking Utilities
 * SEC-01 Compliance: Mask sensitive customer personal data on public unauthenticated views.
 */

/**
 * Masks a customer's full name.
 * Example: "Aarav Sharma" -> "A***v S***a"
 * Example: "John" -> "J***n"
 */
export function maskCustomerName(name?: string | null): string {
  if (!name || !name.trim()) return 'Customer';
  const parts = name.trim().split(/\s+/);
  return parts
    .map((part) => {
      if (part.length <= 2) return `${part[0]}*`;
      return `${part[0]}***${part[part.length - 1]}`;
    })
    .join(' ');
}

/**
 * Masks a phone number while preserving country code and ending digits for customer recognition.
 * Example: "+91 98765 43210" -> "+91 98*****210"
 * Example: "9876543210" -> "98*****210"
 */
export function maskPhoneNumber(phone?: string | null): string {
  if (!phone || !phone.trim()) return 'Not provided';
  const clean = phone.trim();
  const digits = clean.replace(/\D/g, '');
  if (digits.length < 7) return '••••••••';

  // Check if international prefix exists
  const hasPlus = clean.startsWith('+');
  const last3 = digits.slice(-3);
  const prefix = digits.length > 10 ? digits.slice(0, digits.length - 10) : '';
  const first2OfLocal = digits.length >= 10 ? digits.slice(digits.length - 10, digits.length - 8) : digits.slice(0, 2);

  if (prefix) {
    return `${hasPlus ? '+' : ''}${prefix} ${first2OfLocal}*****${last3}`;
  }
  return `${first2OfLocal}*****${last3}`;
}

/**
 * Masks an email address while preserving domain hint.
 * Example: "aarav.sharma@example.com" -> "aa***a@ex***.com"
 */
export function maskEmailAddress(email?: string | null): string {
  if (!email || !email.includes('@')) return 'Not provided';
  const [local, domain] = email.trim().split('@');
  if (!domain) return '••••@••••';

  const maskedLocal =
    local.length <= 2
      ? `${local[0]}***`
      : `${local.slice(0, 2)}***${local.slice(-1)}`;

  const domainParts = domain.split('.');
  const domainName = domainParts[0] || 'domain';
  const maskedDomainName =
    domainName.length <= 2
      ? `${domainName[0]}***`
      : `${domainName.slice(0, 2)}***`;
  const tld = domainParts.slice(1).join('.') || 'com';

  return `${maskedLocal}@${maskedDomainName}.${tld}`;
}

/**
 * Masks private unit/house numbers from addresses while preserving general pickup hubs and localities.
 * Example: "Flat 402, Tower B, Sector 74, Noida" -> "•••••, •••••, Sector 74, Noida"
 * Example: "Delhi Airport Terminal 3" -> "Delhi Airport Terminal 3"
 */
export function maskAddress(address?: string | null): string {
  if (!address || !address.trim()) return '';
  const trimmed = address.trim();

  // Mask door/house/apartment/flat numbers
  return trimmed.replace(
    /\b(flat|house|h\.no|villa|plot|apt|apartment|tower|block)\s*[\w\d-]+/gi,
    '•••••'
  );
}
