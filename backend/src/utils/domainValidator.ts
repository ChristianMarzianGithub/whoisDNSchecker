const DOMAIN_REGEX = /^(?!-)(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,}$/;

export const isValidDomain = (domain: string): boolean => {
  if (!domain) return false;
  return DOMAIN_REGEX.test(domain.trim());
};

export const parseRecordTypes = (types: string | undefined, defaults: string[] = ['A', 'AAAA']): string[] => {
  if (!types) return defaults;
  const items = types
    .split(',')
    .map((item) => item.trim().toUpperCase())
    .filter((item) => item.length > 0);

  const allowed = new Set(['A', 'AAAA', 'CNAME', 'MX', 'NS', 'TXT', 'SOA']);
  const filtered = items.filter((item) => allowed.has(item));
  return filtered.length > 0 ? Array.from(new Set(filtered)) : defaults;
};
