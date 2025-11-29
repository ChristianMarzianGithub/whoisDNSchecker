import { describe, expect, it } from 'vitest';
import { isValidDomain, toggleRecordType } from './utils';

describe('isValidDomain', () => {
  it('validates domains correctly', () => {
    expect(isValidDomain('example.com')).toBe(true);
    expect(isValidDomain('bad_domain')).toBe(false);
  });
});

describe('toggleRecordType', () => {
  it('adds types when missing', () => {
    expect(toggleRecordType(['A'], 'MX')).toEqual(['A', 'MX']);
  });

  it('removes types but keeps defaults', () => {
    expect(toggleRecordType(['A', 'AAAA'], 'A')).toEqual(['AAAA']);
    expect(toggleRecordType(['A'], 'A')).toEqual(['A', 'AAAA']);
  });
});
