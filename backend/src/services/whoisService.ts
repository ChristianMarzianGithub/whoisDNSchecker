import whois from 'whois-json';
import { isValidDomain } from '../utils/domainValidator';

export interface WhoisResponse {
  success: boolean;
  domain: string;
  raw?: string;
  error?: string;
}

export const lookupWhois = async (domain: string, timeoutMs = 15000): Promise<WhoisResponse> => {
  if (!isValidDomain(domain)) {
    return { success: false, domain, error: 'Invalid domain format' };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const result = await whois(domain, { follow: 2, verbose: false, timeout: timeoutMs, signal: controller.signal as any });
    clearTimeout(timer);
    const raw = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    return { success: true, domain, raw };
  } catch (error: any) {
    const message = error?.message?.includes('aborted') ? 'Lookup timed out' : 'Failed to fetch whois data';
    return { success: false, domain, error: message };
  }
};
