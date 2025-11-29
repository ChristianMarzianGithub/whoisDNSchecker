import http from 'http';
import express from 'express';
import cors from 'cors';
import { lookupDns } from './services/dnsService';
import { lookupWhois } from './services/whoisService';
import { isValidDomain, parseRecordTypes } from './utils/domainValidator';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/whois', async (req, res) => {
  const domain = String(req.query.domain || '').trim();
  if (!isValidDomain(domain)) {
    return res.status(400).json({ success: false, domain, error: 'Invalid domain format' });
  }

  const result = await lookupWhois(domain);
  if (!result.success) {
    return res.status(502).json(result);
  }
  res.json(result);
});

app.get('/dns', async (req, res) => {
  const domain = String(req.query.domain || '').trim();
  const types = typeof req.query.types === 'string' ? (req.query.types as string) : undefined;

  if (!isValidDomain(domain)) {
    return res.status(400).json({ domain, records: {}, error: 'Invalid domain format' });
  }

  const recordTypes = parseRecordTypes(types);
  const result = await lookupDns(domain, recordTypes.join(','));
  res.json(result);
});

const port = process.env.PORT || 4000;
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

export default app;
