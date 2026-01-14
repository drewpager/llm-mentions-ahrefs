import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { MentionsHistory, ShareOfVoiceHistory } from '../types';

interface HistoryChartProps {
  mentionsHistory: Record<string, MentionsHistory[]>;
  sovHistory: ShareOfVoiceHistory[];
  loading?: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function HistoryChart({ mentionsHistory, sovHistory, loading }: HistoryChartProps) {
  if (loading) {
    return (
      <div className="chart-container loading">
        <div className="spinner" />
        <p>Loading historical data...</p>
      </div>
    );
  }

  const brands = Object.keys(mentionsHistory);
  const hasMentionsData = brands.length > 0 && brands.some((b) => mentionsHistory[b]?.length > 0);
  const hasSovData = sovHistory.length > 0;

  if (!hasMentionsData && !hasSovData) {
    return (
      <div className="chart-container empty">
        <p>No historical data available. Select a date range to see trends.</p>
      </div>
    );
  }

  // Prepare mentions history data
  const mentionsChartData: Record<string, number | string>[] = [];
  if (hasMentionsData) {
    const allDates = new Set<string>();
    brands.forEach((brand) => {
      mentionsHistory[brand]?.forEach((item) => allDates.add(item.date));
    });

    Array.from(allDates)
      .sort()
      .forEach((date) => {
        const point: Record<string, number | string> = { date };
        brands.forEach((brand) => {
          const item = mentionsHistory[brand]?.find((m) => m.date === date);
          point[brand] = item?.mentions || 0;
        });
        mentionsChartData.push(point);
      });
  }

  // Prepare SOV history data
  const sovChartData: Record<string, number | string>[] = [];
  if (hasSovData) {
    sovHistory.forEach((item) => {
      const point: Record<string, number | string> = { date: item.date };
      item.share_of_voice.forEach((sov) => {
        point[sov.brand] = (sov.share_of_voice * 100).toFixed(1);
      });
      sovChartData.push(point);
    });
  }

  const sovBrands = hasSovData
    ? [...new Set(sovHistory.flatMap((h) => h.share_of_voice.map((s) => s.brand)))]
    : [];

  return (
    <div className="chart-container">
      <h4>Historical Trends</h4>

      {hasMentionsData && (
        <div className="history-section">
          <h5>Mentions Over Time</h5>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mentionsChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                labelFormatter={(v) => new Date(v).toLocaleDateString()}
              />
              <Legend />
              {brands.map((brand, index) => (
                <Line
                  key={brand}
                  type="monotone"
                  dataKey={brand}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {hasSovData && (
        <div className="history-section">
          <h5>Share of Voice Over Time</h5>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sovChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                labelFormatter={(v) => new Date(v).toLocaleDateString()}
                formatter={(value) => [`${value ?? 0}%`, '']}
              />
              <Legend />
              {sovBrands.map((brand, index) => (
                <Line
                  key={brand}
                  type="monotone"
                  dataKey={brand}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
