import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { ShareOfVoice } from '../types';

interface ShareOfVoiceChartProps {
  data: ShareOfVoice[];
  loading?: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function ShareOfVoiceChart({ data, loading }: ShareOfVoiceChartProps) {
  if (loading) {
    return (
      <div className="chart-container loading">
        <div className="spinner" />
        <p>Loading share of voice data...</p>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="chart-container empty">
        <p>No share of voice data available.</p>
      </div>
    );
  }

  const chartData = data
    .map((item, index) => ({
      name: item.brand,
      'Share of Voice': (item.share_of_voice * 100).toFixed(1),
      rawValue: item.share_of_voice,
      color: COLORS[index % COLORS.length],
    }))
    .sort((a, b) => b.rawValue - a.rawValue);

  return (
    <div className="chart-container">
      <h4>Share of Voice by Brand</h4>
      <p className="chart-description">
        Share of voice represents how often each brand is mentioned relative to all tracked brands
        in LLM responses.
      </p>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={90} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value) => [`${value ?? 0}%`, 'Share of Voice']}
          />
          <Bar dataKey="Share of Voice" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="sov-cards">
        {chartData.slice(0, 3).map((item, index) => (
          <div key={item.name} className="sov-card" style={{ borderLeftColor: item.color }}>
            <span className="rank">#{index + 1}</span>
            <span className="brand">{item.name}</span>
            <span className="value">{item['Share of Voice']}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
