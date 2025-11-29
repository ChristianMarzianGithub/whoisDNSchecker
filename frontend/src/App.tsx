import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import classNames from 'classnames';
import { isValidDomain, toggleRecordType } from './utils';

const recordTypeOptions = ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'TXT', 'SOA'] as const;
const exampleDomains = ['google.com', 'openai.com', 'cloudflare.com'];

interface WhoisResult {
  success: boolean;
  domain: string;
  raw?: string;
  error?: string;
}

interface DnsResult {
  domain: string;
  records: Record<string, any>;
  error?: string;
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
  timeout: 15000,
});

function App() {
  const [domain, setDomain] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['A', 'AAAA']);
  const [whoisResult, setWhoisResult] = useState<WhoisResult | null>(null);
  const [dnsResult, setDnsResult] = useState<DnsResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

  const domainIsValid = useMemo(() => isValidDomain(domain), [domain]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) => toggleRecordType(prev, type));
  };

  const handleWhois = async () => {
    setError(null);
    setLoading(true);
    setWhoisResult(null);
    try {
      const response = await apiClient.get<WhoisResult>('/whois', { params: { domain } });
      setWhoisResult(response.data);
      if (!response.data.success) setError(response.data.error || 'Failed to fetch whois');
    } catch (err: any) {
      setError(err?.message || 'Backend unreachable');
    } finally {
      setLoading(false);
    }
  };

  const handleDns = async () => {
    setError(null);
    setLoading(true);
    setDnsResult(null);
    try {
      const response = await apiClient.get<DnsResult>('/dns', { params: { domain, types: selectedTypes.join(',') } });
      setDnsResult(response.data);
      if (response.data.error) setError(response.data.error);
    } catch (err: any) {
      setError(err?.message || 'Backend unreachable');
    } finally {
      setLoading(false);
    }
  };

  const handleExample = (value: string) => {
    setDomain(value);
    setError(null);
    setWhoisResult(null);
    setDnsResult(null);
  };

  const renderJson = (data: any) => <pre className="bg-gray-100 dark:bg-gray-800 rounded p-3 text-sm overflow-auto">{JSON.stringify(data, null, 2)}</pre>;

  return (
    <div className={classNames('min-h-screen transition-colors', theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900')}>
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Whois + DNS Lookup</h1>
            <p className="text-gray-600 dark:text-gray-300">Query Whois info and DNS records using your backend.</p>
          </div>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="px-4 py-2 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </button>
        </header>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="flex-1 px-4 py-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
            />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleWhois}
                disabled={!domainIsValid || loading}
                className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
              >
                Run Whois
              </button>
              <button
                onClick={handleDns}
                disabled={!domainIsValid || loading}
                className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50"
              >
                DNS Lookup
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <h3 className="font-medium mb-2">DNS record types</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {recordTypeOptions.map((type) => (
                  <label key={type} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 px-3 py-2 rounded cursor-pointer">
                    <input type="checkbox" checked={selectedTypes.includes(type)} onChange={() => toggleType(type)} />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="w-full md:w-64">
              <h3 className="font-medium mb-2">Examples</h3>
              <div className="flex gap-2 flex-wrap">
                {exampleDomains.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleExample(item)}
                    className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {!domainIsValid && domain && <p className="text-red-600">Please enter a valid domain.</p>}
          {error && <p className="text-red-500">{error}</p>}
        </div>

        <section className="space-y-4">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Whois Result</h2>
              {loading && <span className="text-sm text-gray-500">Loading...</span>}
            </div>
            {whoisResult ? (
              whoisResult.success && whoisResult.raw ? (
                <div className="max-h-96 overflow-auto bg-gray-100 dark:bg-gray-900 rounded p-3 font-mono text-sm whitespace-pre-wrap">
                  {whoisResult.raw}
                </div>
              ) : (
                <p className="text-yellow-600">{whoisResult.error || 'Empty whois response'}</p>
              )
            ) : (
              <p className="text-gray-500">Run a Whois lookup to see results.</p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">DNS Results</h2>
              {loading && <span className="text-sm text-gray-500">Loading...</span>}
            </div>
            {dnsResult ? (
              Object.keys(dnsResult.records || {}).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(dnsResult.records).map(([type, value]) => (
                    <div key={type} className="space-y-1">
                      <div className="font-semibold">{type}</div>
                      {renderJson(value)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-yellow-600">No records found.</p>
              )
            ) : (
              <p className="text-gray-500">Run a DNS lookup to see results.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
