import request from 'supertest';
import app from '../src/server';
import * as dnsService from '../src/services/dnsService';
import * as whoisService from '../src/services/whoisService';

describe('API endpoints', () => {
  it('returns 400 for invalid whois domain', async () => {
    const res = await request(app).get('/whois?domain=bad');
    expect(res.status).toBe(400);
  });

  it('returns whois payload for valid domain', async () => {
    jest.spyOn(whoisService, 'lookupWhois').mockResolvedValue({ success: true, domain: 'example.com', raw: 'data' });
    const res = await request(app).get('/whois?domain=example.com');
    expect(res.body.success).toBe(true);
    expect(res.body.domain).toBe('example.com');
  });

  it('returns dns payload for valid domain', async () => {
    jest.spyOn(dnsService, 'lookupDns').mockResolvedValue({ domain: 'example.com', records: { A: ['1.1.1.1'] } });
    const res = await request(app).get('/dns?domain=example.com&types=A');
    expect(res.status).toBe(200);
    expect(res.body.records.A).toEqual(['1.1.1.1']);
  });
});
