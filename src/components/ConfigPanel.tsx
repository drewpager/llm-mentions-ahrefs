import { Settings, Globe, Calendar, Database } from 'lucide-react';
import type { DataSource } from '../types';

interface ConfigPanelProps {
  dataSource: DataSource;
  onDataSourceChange: (source: DataSource) => void;
  country: string;
  onCountryChange: (country: string) => void;
  dateFrom: string;
  onDateFromChange: (date: string) => void;
  dateTo: string;
  onDateToChange: (date: string) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

const DATA_SOURCES: { value: DataSource; label: string; icon: string }[] = [
  { value: 'chatgpt', label: 'ChatGPT', icon: '🤖' },
  { value: 'gemini', label: 'Gemini', icon: '✨' },
  { value: 'perplexity', label: 'Perplexity', icon: '🔍' },
  { value: 'copilot', label: 'Copilot', icon: '🪟' },
  { value: 'google_ai_overviews', label: 'Google AI Overviews', icon: '🔵' },
  { value: 'google_ai_mode', label: 'Google AI Mode', icon: '🟢' },
];

const COUNTRIES = [
  { code: '', label: 'All Countries' },
  { code: 'US', label: 'United States' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'CA', label: 'Canada' },
  { code: 'AU', label: 'Australia' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
  { code: 'ES', label: 'Spain' },
  { code: 'IT', label: 'Italy' },
  { code: 'BR', label: 'Brazil' },
  { code: 'IN', label: 'India' },
  { code: 'JP', label: 'Japan' },
];

export function ConfigPanel({
  dataSource,
  onDataSourceChange,
  country,
  onCountryChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  apiKey,
  onApiKeyChange,
}: ConfigPanelProps) {
  return (
    <div className="config-panel">
      <h3>
        <Settings size={18} /> Configuration
      </h3>

      <div className="config-section">
        <label>
          <Database size={14} /> Ahrefs API Key
        </label>
        <input
          type="password"
          placeholder="Enter your Ahrefs API key"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
        />
      </div>

      <div className="config-section">
        <label>
          <Database size={14} /> LLM Data Source
        </label>
        <div className="data-source-grid">
          {DATA_SOURCES.map((source) => (
            <button
              key={source.value}
              className={`data-source-btn ${dataSource === source.value ? 'active' : ''}`}
              onClick={() => onDataSourceChange(source.value)}
            >
              <span className="icon">{source.icon}</span>
              <span className="label">{source.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="config-section">
        <label>
          <Globe size={14} /> Country
        </label>
        <select value={country} onChange={(e) => onCountryChange(e.target.value)}>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="config-section">
        <label>
          <Calendar size={14} /> Date Range
        </label>
        <div className="date-range">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
          />
          <span>to</span>
          <input type="date" value={dateTo} onChange={(e) => onDateToChange(e.target.value)} />
        </div>
      </div>
    </div>
  );
}
