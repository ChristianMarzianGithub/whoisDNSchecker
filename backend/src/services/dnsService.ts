import dns from 'dns/promises';
import { isValidDomain, parseRecordTypes } from '../utils/domainValidator';

const resolvers: Record<string, (domain: string) => Promise<any>> = {
  A: (domain) => dns.resolve4(domain),
  AAAA: (domain) => dns.resolve6(domain),
  CNAME: (domain) => dns.resolveCname(domain),
  MX: (domain) => dns.resolveMx(domain),
  NS: (domain) => dns.resolveNs(domain),
  TXT: (domain) => dns.resolveTxt(domain),
  SOA: (domain) => dns.resolveSoa(domain),
};

export interface DNSResponse {
  domain: string;
  records: Record<string, any>;
  error?: string;
}

export const lookupDns = async (domain: string, recordTypesRaw?: string): Promise<DNSResponse> => {
  if (!isValidDomain(domain)) {
    return { domain, records: {}, error: 'Invalid domain format' };
  }

  const recordTypes = parseRecordTypes(recordTypesRaw);
  const records: Record<string, any> = {};

  for (const type of recordTypes) {
    const resolver = resolvers[type];
    if (!resolver) continue;
    try {
      const result = await resolver(domain);
      records[type] = result;
    } catch (error: any) {
      records[type] = { error: error?.message || 'Lookup failed' };
    }
  }

  return { domain, records };
};
