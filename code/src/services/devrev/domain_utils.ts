// List of common generic email domains
const GENERIC_DOMAINS = new Set([
    'gmail.com',
    'outlook.com',
    'hotmail.com',
    'yahoo.com',
    'aol.com',
    'icloud.com',
    'protonmail.com',
    'mail.com',
    'zoho.com',
    'yandex.com',
    'live.com',
    'msn.com'
]);

export function extractDomainFromEmail(email: string): string {
    return email.split('@')[1].toLowerCase();
}

export function isGenericDomain(domain: string): boolean {
    return GENERIC_DOMAINS.has(domain.toLowerCase());
}

export function isValidBusinessDomain(email: string): boolean {
    const domain = extractDomainFromEmail(email);
    return !isGenericDomain(domain);
}

export function normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
}

export function generateAccountDisplayName(domain: string): string {
    // Convert domain to a readable company name
    // e.g., "company-name.com" -> "Company Name"
    return domain
        .split('.')[0]
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
