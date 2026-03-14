import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { HiOutlineLightningBolt, HiOutlineExclamation, HiOutlineSparkles, HiOutlineChartBar, HiOutlineTrendingUp } from 'react-icons/hi';
import { getDemandForecast, detectAnomalies, getOptimizationSuggestions, getInventoryHealthScore } from '../store/aiEngine';

const severityColors = { critical: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
const urgencyColors = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#10b981' };

export default function AIInsights() {
  const [health, setHealth] = useState(null);
  const [forecasts, setForecasts] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    setHealth(getInventoryHealthScore());
    setForecasts(getDemandForecast());
    setAnomalies(detectAnomalies());
    setSuggestions(getOptimizationSuggestions());
  }, []);

  if (!health) return null;

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  const radarData = health.factors.map(f => ({ subject: f.label, score: f.value, fullMark: 100 }));

  const scoreColor = health.score >= 80 ? '#10b981' : health.score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">🤖 AI Insights</h1>
          <p className="page-subtitle">Smart analytics, forecasting & recommendations</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.1)', padding: '8px 16px', borderRadius: 20, border: '1px solid rgba(99,102,241,0.2)' }}>
          <HiOutlineSparkles style={{ color: 'var(--accent-secondary)' }} />
          <span style={{ fontSize: 12, color: 'var(--accent-secondary)', fontWeight: 600 }}>Powered by StockFlow AI</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="filters-bar" style={{ marginBottom: 24 }}>
        {[
          { key: 'overview', label: 'Health Score', icon: <HiOutlineChartBar /> },
          { key: 'forecast', label: 'Demand Forecast', icon: <HiOutlineTrendingUp /> },
          { key: 'anomalies', label: `Anomalies (${anomalies.length})`, icon: <HiOutlineExclamation /> },
          { key: 'suggestions', label: 'Optimization', icon: <HiOutlineLightningBolt /> },
        ].map(tab => (
          <span key={tab.key} className={`filter-chip ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {tab.icon} {tab.label}
          </span>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <motion.div variants={container} initial="hidden" animate="show">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            {/* Health Score Circle */}
            <motion.div variants={item} className="glass-card" style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'relative', width: 180, height: 180, marginBottom: 20 }}>
                <svg viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="90" cy="90" r="78" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                  <motion.circle cx="90" cy="90" r="78" fill="none" stroke={scoreColor} strokeWidth="12" strokeLinecap="round"
                    strokeDasharray={`${health.score * 4.9} 490`}
                    initial={{ strokeDasharray: '0 490' }}
                    animate={{ strokeDasharray: `${health.score * 4.9} 490` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    style={{ filter: `drop-shadow(0 0 8px ${scoreColor}60)` }}
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <motion.div style={{ fontSize: 48, fontWeight: 900, color: scoreColor }}
                    initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 0.5 }}>
                    {health.score}
                  </motion.div>
                  <div style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>out of 100</div>
                </div>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Grade: <span style={{ color: scoreColor }}>{health.grade}</span></div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Inventory Health Score</div>
            </motion.div>

            {/* Radar Chart */}
            <motion.div variants={item} className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Health Breakdown</h3>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <PolarRadiusAxis tick={false} domain={[0, 100]} axisLine={false} />
                  <Radar name="Score" dataKey="score" stroke="#818cf8" fill="#818cf8" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                {health.factors.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{f.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 80, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                        <motion.div style={{ height: '100%', borderRadius: 3, background: f.status === 'good' ? '#10b981' : f.status === 'warning' ? '#f59e0b' : '#ef4444' }}
                          initial={{ width: 0 }} animate={{ width: `${f.value}%` }} transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', minWidth: 30 }}>{f.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* FORECAST TAB */}
      {activeTab === 'forecast' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Weekly Demand Forecast</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={forecasts.filter(f => f.weeklyForecast > 0).slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="product.name" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8 }} />
                <Bar dataKey="weeklyForecast" name="Weekly Forecast" fill="#818cf8" radius={[6, 6, 0, 0]} />
                <Bar dataKey="currentStock" name="Current Stock" fill="#34d399" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card" style={{ overflow: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Current Stock</th>
                  <th>Daily Demand</th>
                  <th>Weekly Forecast</th>
                  <th>Monthly Forecast</th>
                  <th>Days Until Stockout</th>
                  <th>Suggested Reorder</th>
                  <th>Urgency</th>
                </tr>
              </thead>
              <tbody>
                {forecasts.map((f, i) => (
                  <motion.tr key={f.product.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                    <td style={{ fontWeight: 600 }}>{f.product.name}</td>
                    <td>{f.currentStock}</td>
                    <td>{f.avgDailyDemand}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-secondary)' }}>{f.weeklyForecast}</td>
                    <td>{f.monthlyForecast}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: f.daysUntilStockout <= 7 ? '#ef4444' : f.daysUntilStockout <= 14 ? '#f59e0b' : '#10b981' }}>
                        {f.daysUntilStockout === 999 ? '∞' : `${f.daysUntilStockout}d`}
                      </span>
                    </td>
                    <td>{f.suggestedReorder}</td>
                    <td>
                      <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, background: urgencyColors[f.urgency] + '18', color: urgencyColors[f.urgency] }}>
                        {f.urgency.toUpperCase()}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ANOMALIES TAB */}
      {activeTab === 'anomalies' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {anomalies.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">✅</div>
              <h3>No anomalies detected</h3>
              <p>Your inventory looks healthy!</p>
            </div>
          )}
          {anomalies.map((a, i) => (
            <motion.div key={i} className="glass-card glass-card-hover" style={{ padding: 20, borderLeft: `4px solid ${severityColors[a.severity]}` }}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: 16 }}>
                <div style={{ fontSize: 28 }}>{a.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{a.product}</span>
                    <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: severityColors[a.severity] + '18', color: severityColors[a.severity], textTransform: 'uppercase' }}>
                      {a.severity}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{a.message}</div>
                  <div style={{ fontSize: 12, color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <HiOutlineLightningBolt /> {a.suggestion}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* SUGGESTIONS TAB */}
      {activeTab === 'suggestions' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
          {suggestions.map((s, i) => (
            <motion.div key={i} className="glass-card glass-card-hover" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div style={{ position: 'absolute', top: 0, right: 0, padding: '6px 14px', background: 'rgba(99,102,241,0.15)', borderRadius: '0 0 0 12px', fontSize: 10, fontWeight: 700, color: 'var(--accent-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {s.impact}
              </div>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{s.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.detail}</p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
