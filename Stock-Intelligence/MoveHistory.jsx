import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineSearch } from 'react-icons/hi';
import { moveHistoryStore, productStore, warehouseStore } from '../store/inventoryStore';

const typeColors = { receipt: '#3b82f6', delivery: '#10b981', transfer: '#8b5cf6', adjustment: '#f59e0b' };
const typeIcons = { receipt: '📥', delivery: '🚚', transfer: '🔄', adjustment: '📋' };

export default function MoveHistory() {
  const [history, setHistory] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    setHistory(moveHistoryStore.getAll());
    setProducts(productStore.getAll());
    setWarehouses(warehouseStore.getAll());
  }, []);

  const getProductName = (id) => products.find(p => p.id === id)?.name || 'Unknown';
  const getWhName = (id) => warehouses.find(w => w.id === id)?.name || id;

  const filtered = history.filter(h => {
    const matchType = typeFilter === 'all' || h.type === typeFilter;
    const matchSearch = search === '' ||
      h.reference.toLowerCase().includes(search.toLowerCase()) ||
      getProductName(h.productId).toLowerCase().includes(search.toLowerCase()) ||
      h.note.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Stock Ledger</h1>
          <p className="page-subtitle">Complete history of all stock movements</p>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-bar">
          <HiOutlineSearch className="search-icon" />
          <input placeholder="Search reference, product, or note..." value={search} onChange={e => setSearch(e.target.value)} id="history-search" />
        </div>
        {['all', 'receipt', 'delivery', 'transfer', 'adjustment'].map(t => (
          <span key={t} className={`filter-chip ${typeFilter === t ? 'active' : ''}`} onClick={() => setTypeFilter(t)}>
            {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1) + 's'}
          </span>
        ))}
      </div>

      <div className="glass-card" style={{ flex: 1, overflow: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Reference</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Warehouse</th>
              <th>Note</th>
              <th>Date & Time</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((h, i) => (
              <motion.tr key={h.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: typeColors[h.type] + '18', color: typeColors[h.type] }}>
                    {typeIcons[h.type]} {h.type.charAt(0).toUpperCase() + h.type.slice(1)}
                  </span>
                </td>
                <td><code style={{ color: 'var(--accent-secondary)', fontSize: 12 }}>{h.reference}</code></td>
                <td style={{ fontWeight: 500 }}>{getProductName(h.productId)}</td>
                <td>
                  <span style={{ fontWeight: 700, fontSize: 15, color: h.qty > 0 ? '#10b981' : '#ef4444' }}>
                    {h.qty > 0 ? '+' : ''}{h.qty}
                  </span>
                </td>
                <td>{getWhName(h.warehouse)}</td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 13, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.note}</td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {new Date(h.date).toLocaleDateString()} {new Date(h.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <h3>No movements found</h3>
            <p>Stock movements will appear here as operations are performed</p>
          </div>
        )}
      </div>
    </div>
  );
}
