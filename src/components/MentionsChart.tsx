import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { MentionsOverview } from '../types';

interface MentionsChartProps {
  data: MentionsOverview[];
  loading?: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function MentionsChart({ data, loading }: MentionsChartProps) {
  if (loading) {
    return (
      <div className="chart-container loading">
        <div className="spinner" />
        <p>Loading mentions data...</p>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="chart-container empty">
        <p>No mentions data available. Add brands and fetch data to see results.</p>
      </div>
    );
  }

  const barData = data.map((item) => ({
    name: item.brand,
    'Total Mentions': item.total,
    'Only This Brand': item.only_target_brand,
    'With Competitors': item.target_and_competitors_brands,
  }));

  const pieData = data.map((item, index) => ({
    name: item.brand,
    value: item.total,
    color: COLORS[index % COLORS.length],
  }));

  const totalMentions = data.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="chart-container">
      <h4>Brand Mentions in LLM Responses</h4>

      <div className="chart-grid">
        <div className="chart-section">
          <h5>Mentions by Brand</h5>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Bar dataKey="Total Mentions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Only This Brand" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="With Competitors" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-section">
          <h5>Mentions Distribution</h5>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="chart-stat">
            <span className="stat-value">{totalMentions.toLocaleString()}</span>
            <span className="stat-label">Total Mentions</span>
          </div>
        </div>
      </div>
    </div>
  );
}
