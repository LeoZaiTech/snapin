export const GENERIC_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com'
];

export const extractDomainFromEmail = (email: string): string => {
  return email.split('@')[1].toLowerCase();
};

export const excludeGenericDomain = (domain: string): boolean => {
  return GENERIC_DOMAINS.includes(domain.toLowerCase());
};
