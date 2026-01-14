import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, DollarSign, Search } from 'lucide-react';
import type { SEOMetrics, MentionsOverview } from '../types';

interface SEOComparisonChartProps {
  seoData: Record<string, SEOMetrics>;
  llmData: MentionsOverview[];
  loading?: boolean;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const formatCurrency = (cents: number): string => {
  const dollars = cents / 100;
  if (dollars >= 1000000) return `$${(dollars / 1000000).toFixed(1)}M`;
  if (dollars >= 1000) return `$${(dollars / 1000).toFixed(1)}K`;
  return `$${dollars.toFixed(0)}`;
};

export function SEOComparisonChart({ seoData, llmData, loading }: SEOComparisonChartProps) {
  if (loading) {
    return (
      <div className="chart-container loading">
        <div className="spinner" />
        <p>Loading SEO comparison data...</p>
      </div>
    );
  }

  const brands = Object.keys(seoData);
  if (!brands.length && !llmData.length) {
    return (
      <div className="chart-container empty">
        <p>Add brands with domains to see SEO vs LLM comparison.</p>
      </div>
    );
  }

  // Prepare comparison data
  const comparisonData = brands.map((brand) => {
    const seo = seoData[brand];
    const llm = llmData.find((l) => l.brand.toLowerCase() === brand.toLowerCase());

    return {
      name: brand,
      'Organic Traffic': seo?.org_traffic || 0,
      'Traffic Value ($)': seo?.org_cost ? seo.org_cost / 100 : 0,
      'LLM Mentions': llm?.total || 0,
      'Organic Keywords': seo?.org_keywords || 0,
    };
  });

  // Calculate totals for cards
  const totalTraffic = comparisonData.reduce((sum, d) => sum + d['Organic Traffic'], 0);
  const totalValue = comparisonData.reduce((sum, d) => sum + d['Traffic Value ($)'], 0);
  const totalMentions = comparisonData.reduce((sum, d) => sum + d['LLM Mentions'], 0);

  return (
    <div className="chart-container">
      <h4>SEO vs LLM Performance Comparison</h4>
      <p className="chart-description">
        Compare traditional SEO metrics (organic traffic, traffic value) with LLM visibility
        (mentions).
      </p>

      <div className="comparison-cards">
        <div className="comparison-card">
          <TrendingUp className="card-icon" />
          <div className="card-content">
            <span className="card-value">{formatNumber(totalTraffic)}</span>
            <span className="card-label">Total Organic Traffic</span>
          </div>
        </div>
        <div className="comparison-card">
          <DollarSign className="card-icon" />
          <div className="card-content">
            <span className="card-value">{formatCurrency(totalValue * 100)}</span>
            <span className="card-label">Total Traffic Value</span>
          </div>
        </div>
        <div className="comparison-card">
          <Search className="card-icon" />
          <div className="card-content">
            <span className="card-value">{formatNumber(totalMentions)}</span>
            <span className="card-label">Total LLM Mentions</span>
          </div>
        </div>
      </div>

      {comparisonData.length > 0 && (
        <>
          <div className="chart-section">
            <h5>Organic Traffic vs LLM Mentions</h5>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={comparisonData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickFormatter={formatNumber} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatNumber}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value, name) => {
                    const numValue = typeof value === 'number' ? value : 0;
                    return [
                      name === 'Traffic Value ($)' ? formatCurrency(numValue * 100) : formatNumber(numValue),
                      name,
                    ];
                  }}
                />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="Organic Traffic"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="LLM Mentions"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="comparison-table">
            <h5>Detailed Comparison</h5>
            <table>
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Organic Traffic</th>
                  <th>Traffic Value</th>
                  <th>LLM Mentions</th>
                  <th>Keywords</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row) => (
                  <tr key={row.name}>
                    <td>{row.name}</td>
                    <td>{formatNumber(row['Organic Traffic'])}</td>
                    <td>{formatCurrency(row['Traffic Value ($)'] * 100)}</td>
                    <td>{formatNumber(row['LLM Mentions'])}</td>
                    <td>{formatNumber(row['Organic Keywords'])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
