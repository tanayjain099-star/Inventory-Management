import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { HiOutlineCube, HiOutlineExclamation, HiOutlineDocumentDownload, HiOutlineTruck, HiOutlineSwitchHorizontal } from 'react-icons/hi';
import { getDashboardStats, moveHistoryStore, productStore, categoryStore, warehouseStore, receiptStore, deliveryStore, transferStore } from '../store/inventoryStore';

const statusColors = { draft: '#64748b', waiting: '#f59e0b', ready: '#3b82f6', done: '#10b981', canceled: '#ef4444' };
const typeLabels = { receipt: 'Receipt', delivery: 'Delivery', transfer: 'Transfer', adjustment: 'Adjustment' };

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.max(1, Math.ceil(value / 30));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 25);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}</>;
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [docFilter, setDocFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');

  useEffect(() => {
    setStats(getDashboardStats());
    setActivity(moveHistoryStore.getAll().slice(0, 10));
  }, []);

  if (!stats) return null;

  const warehouses = warehouseStore.getAll();
  const categories = categoryStore.getAll();
  const products = productStore.getAll();

  // Filtered documents
  const allDocs = [
    ...receiptStore.getAll().map(d => ({ ...d, docType: 'receipt' })),
    ...deliveryStore.getAll().map(d => ({ ...d, docType: 'delivery' })),
    ...transferStore.getAll().map(d => ({ ...d, docType: 'transfer' })),
  ];

  const filteredDocs = allDocs.filter(d => {
    if (docFilter !== 'all' && d.docType !== docFilter) return false;
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (warehouseFilter !== 'all' && d.warehouse !== warehouseFilter && d.fromWarehouse !== warehouseFilter && d.toWarehouse !== warehouseFilter) return false;
    return true;
  });

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: 8, padding: '10px 14px', boxShadow: 'var(--shadow-md)' }}>
          <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 13 }}>{label}</p>
          <p style={{ color: 'var(--accent-secondary)', fontSize: 12 }}>{payload[0].value} units</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Real-time inventory overview</p>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div className="dashboard-grid" variants={container} initial="hidden" animate="show">
        <motion.div className="kpi-card" variants={item}>
          <div className="kpi-icon"><HiOutlineCube /></div>
          <div className="kpi-value"><AnimatedNumber value={stats.totalProducts} /></div>
          <div className="kpi-label">Total Products</div>
        </motion.div>
        <motion.div className="kpi-card" variants={item}>
          <div className="kpi-icon"><HiOutlineExclamation /></div>
          <div className="kpi-value"><AnimatedNumber value={stats.lowStockItems.length} /></div>
          <div className="kpi-label">Low / Out of Stock</div>
        </motion.div>
        <motion.div className="kpi-card" variants={item}>
          <div className="kpi-icon"><HiOutlineDocumentDownload /></div>
          <div className="kpi-value"><AnimatedNumber value={stats.pendingReceipts.length} /></div>
          <div className="kpi-label">Pending Receipts</div>
        </motion.div>
        <motion.div className="kpi-card" variants={item}>
          <div className="kpi-icon"><HiOutlineTruck /></div>
          <div className="kpi-value"><AnimatedNumber value={stats.pendingDeliveries.length} /></div>
          <div className="kpi-label">Pending Deliveries</div>
        </motion.div>
        <motion.div className="kpi-card" variants={item}>
          <div className="kpi-icon"><HiOutlineSwitchHorizontal /></div>
          <div className="kpi-value"><AnimatedNumber value={stats.scheduledTransfers.length} /></div>
          <div className="kpi-label">Scheduled Transfers</div>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <div className="filters-bar">
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Filter:</span>
        {['all', 'receipt', 'delivery', 'transfer'].map(t => (
          <span key={t} className={`filter-chip ${docFilter === t ? 'active' : ''}`} onClick={() => setDocFilter(t)}>
            {t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1) + 's'}
          </span>
        ))}
        <span style={{ width: 1, height: 20, background: 'var(--border-color)' }}></span>
        {['all', 'draft', 'waiting', 'ready', 'done'].map(s => (
          <span key={s} className={`filter-chip ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
            {s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
          </span>
        ))}
        <span style={{ width: 1, height: 20, background: 'var(--border-color)' }}></span>
        <select className="input-field" style={{ padding: '6px 30px 6px 10px', fontSize: 12, borderRadius: 20 }} value={warehouseFilter} onChange={e => setWarehouseFilter(e.target.value)}>
          <option value="all">All Warehouses</option>
          {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </div>

      {/* Filtered Documents Count */}
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
        Showing <strong style={{ color: 'var(--accent-secondary)' }}>{filteredDocs.length}</strong> documents
      </div>

      {/* Charts */}
      <motion.div className="dashboard-charts" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
        <div className="chart-card">
          <div className="chart-title">Stock by Warehouse</div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.stockByWarehouse}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="stock" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.6} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title">Products by Category</div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={stats.categoryDistribution.filter(c => c.value > 0)} cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                {stats.categoryDistribution.filter(c => c.value > 0).map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <div className="chart-title">Recent Activity</div>
        <div className="activity-list">
          {activity.map((a, i) => (
            <motion.div key={a.id} className="activity-item" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05 }}>
              <div className={`activity-dot ${a.type}`}></div>
              <div className="activity-text">
                <strong style={{ color: 'var(--text-primary)' }}>{a.reference}</strong> — {a.note}
                <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>({a.qty > 0 ? '+' : ''}{a.qty})</span>
              </div>
              <div className="activity-time">{formatTime(a.date)}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
