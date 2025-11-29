import { isValidDomain, parseRecordTypes } from '../src/utils/domainValidator';

describe('isValidDomain', () => {
  it('accepts common domains', () => {
    expect(isValidDomain('example.com')).toBe(true);
    expect(isValidDomain('sub.domain.co.uk')).toBe(true);
  });

  it('rejects invalid domains', () => {
    expect(isValidDomain('')).toBe(false);
    expect(isValidDomain('http://example.com')).toBe(false);
    expect(isValidDomain('-bad.com')).toBe(false);
  });
});

describe('parseRecordTypes', () => {
  it('returns defaults when empty', () => {
    expect(parseRecordTypes(undefined)).toEqual(['A', 'AAAA']);
  });

  it('normalizes and filters types', () => {
    expect(parseRecordTypes('a, mx,TXT')).toEqual(['A', 'MX', 'TXT']);
  });

  it('falls back to defaults for invalid types', () => {
    expect(parseRecordTypes('INVALID')).toEqual(['A', 'AAAA']);
  });
});
