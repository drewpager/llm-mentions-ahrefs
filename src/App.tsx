import { useState, useCallback } from 'react';
import { RefreshCw, BarChart3 } from 'lucide-react';
import {
  BrandManager,
  ConfigPanel,
  MentionsChart,
  ShareOfVoiceChart,
  HistoryChart,
  SEOComparisonChart,
} from './components';
import { ahrefsService } from './services/ahrefs';
import type {
  Brand,
  DataSource,
  MentionsOverview,
  MentionsHistory,
  ShareOfVoice,
  ShareOfVoiceHistory,
  SEOMetrics,
} from './types';
import './App.css';

function App() {
  // Configuration state
  const [brands, setBrands] = useState<Brand[]>([]);
  const [dataSource, setDataSource] = useState<DataSource>('chatgpt');
  const [country, setCountry] = useState('');
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [apiKey, setApiKey] = useState('');

  // Data state
  const [mentionsData, setMentionsData] = useState<MentionsOverview[]>([]);
  const [sovData, setSovData] = useState<ShareOfVoice[]>([]);
  const [mentionsHistory, setMentionsHistory] = useState<Record<string, MentionsHistory[]>>({});
  const [sovHistory, setSovHistory] = useState<ShareOfVoiceHistory[]>([]);
  const [seoData, setSeoData] = useState<Record<string, SEOMetrics>>({});

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    ahrefsService.setApiKey(key);
  };

  const fetchData = useCallback(async () => {
    if (!apiKey) {
      setError('Please enter your Ahrefs API key');
      return;
    }

    if (brands.length === 0) {
      setError('Please add at least one brand');
      return;
    }

    setLoading(true);
    setError(null);

    const targetBrands = brands.filter((b) => !b.isCompetitor);
    const competitors = brands.filter((b) => b.isCompetitor);

    const brandNames = targetBrands.map((b) => b.name).join(',');
    const competitorNames = competitors.map((b) => b.name).join(',');

    try {
      // Fetch mentions overview
      const mentionsResult = await ahrefsService.getMentionsOverview({
        dataSource,
        brand: brandNames,
        competitors: competitorNames,
        country,
      });
      setMentionsData(mentionsResult.mentions || []);

      // Fetch share of voice
      const sovResult = await ahrefsService.getShareOfVoiceOverview({
        dataSource,
        brand: brandNames,
        competitors: competitorNames,
        country,
      });
      setSovData(sovResult.share_of_voice || []);

      // Fetch mentions history for each brand
      const historyPromises = brands.map(async (brand) => {
        try {
          const result = await ahrefsService.getMentionsHistory({
            dataSource,
            brand: brand.name,
            dateFrom,
            dateTo,
            country,
          });
          return { brand: brand.name, data: result.mentions || [] };
        } catch {
          return { brand: brand.name, data: [] };
        }
      });
      const historyResults = await Promise.all(historyPromises);
      const historyMap: Record<string, MentionsHistory[]> = {};
      historyResults.forEach((r) => {
        historyMap[r.brand] = r.data;
      });
      setMentionsHistory(historyMap);

      // Fetch SOV history
      try {
        const sovHistResult = await ahrefsService.getShareOfVoiceHistory({
          dataSource,
          brand: brandNames,
          competitors: competitorNames,
          dateFrom,
          dateTo,
          country,
        });
        setSovHistory(sovHistResult.share_of_voice || []);
      } catch {
        setSovHistory([]);
      }

      // Fetch SEO data for brands with domains
      const brandsWithDomains = brands.filter((b) => b.domain);
      const seoPromises = brandsWithDomains.map(async (brand) => {
        try {
          const result = await ahrefsService.getSEOMetrics({
            target: brand.domain!,
            date: dateTo,
            country: country || undefined,
          });
          return { brand: brand.name, data: result.metrics };
        } catch {
          return { brand: brand.name, data: null };
        }
      });
      const seoResults = await Promise.all(seoPromises);
      const seoMap: Record<string, SEOMetrics> = {};
      seoResults.forEach((r) => {
        if (r.data) seoMap[r.brand] = r.data;
      });
      setSeoData(seoMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [apiKey, brands, dataSource, country, dateFrom, dateTo]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <BarChart3 size={32} />
            <div>
              <h1>LLM vs SEO Performance Dashboard</h1>
              <p>Compare brand visibility across LLMs and traditional search</p>
            </div>
          </div>
          <button
            className="btn btn-primary fetch-btn"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
            {loading ? 'Fetching...' : 'Fetch Data'}
          </button>
        </div>
      </header>

      <main className="app-main">
        <aside className="sidebar">
          <ConfigPanel
            dataSource={dataSource}
            onDataSourceChange={setDataSource}
            country={country}
            onCountryChange={setCountry}
            dateFrom={dateFrom}
            onDateFromChange={setDateFrom}
            dateTo={dateTo}
            onDateToChange={setDateTo}
            apiKey={apiKey}
            onApiKeyChange={handleApiKeyChange}
          />
          <BrandManager brands={brands} onBrandsChange={setBrands} />
        </aside>

        <div className="dashboard">
          {error && (
            <div className="error-banner">
              <p>{error}</p>
              <button onClick={() => setError(null)}>Dismiss</button>
            </div>
          )}

          <div className="dashboard-grid">
            <div className="dashboard-row">
              <MentionsChart data={mentionsData} loading={loading} />
            </div>
            <div className="dashboard-row two-col">
              <ShareOfVoiceChart data={sovData} loading={loading} />
              <SEOComparisonChart
                seoData={seoData}
                llmData={mentionsData}
                loading={loading}
              />
            </div>
            <div className="dashboard-row">
              <HistoryChart
                mentionsHistory={mentionsHistory}
                sovHistory={sovHistory}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
