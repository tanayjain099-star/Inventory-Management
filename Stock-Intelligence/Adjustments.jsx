import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePlus } from 'react-icons/hi';
import { adjustmentStore, productStore, warehouseStore } from '../store/inventoryStore';
import toast from 'react-hot-toast';

export default function Adjustments() {
  const [adjustments, setAdjustments] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ warehouse: '', productId: '', counted: 0, reason: '' });

  const reload = () => {
    setAdjustments(adjustmentStore.getAll());
    setProducts(productStore.getAll());
    setWarehouses(warehouseStore.getAll());
  };

  useEffect(() => { reload(); }, []);

  const getProductName = (id) => products.find(p => p.id === id)?.name || 'Unknown';
  const getWhName = (id) => warehouses.find(w => w.id === id)?.name || id;

  const handleOpen = () => {
    setForm({ warehouse: warehouses[0]?.id || '', productId: products[0]?.id || '', counted: 0, reason: '' });
    setShowModal(true);
  };

  const selectedProduct = products.find(p => p.id === form.productId);
  const currentStock = selectedProduct?.stock?.[form.warehouse] || 0;
  const difference = form.counted - currentStock;

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.warehouse || !form.productId) { toast.error('Select warehouse and product'); return; }
    if (!form.reason) { toast.error('Please provide a reason'); return; }
    adjustmentStore.applyAdjustment(form.warehouse, form.productId, form.counted, form.reason);
    toast.success('Stock adjustment applied');
    setShowModal(false);
    reload();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Stock Adjustments</h1>
          <p className="page-subtitle">Fix mismatches between recorded and physical stock</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpen} id="add-adjustment-btn">
          <HiOutlinePlus /> New Adjustment
        </button>
      </div>

      <div className="glass-card" style={{ flex: 1, overflow: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Warehouse</th>
              <th>Product</th>
              <th>Recorded</th>
              <th>Counted</th>
              <th>Difference</th>
              <th>Reason</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {adjustments.map((a, i) => (
              <motion.tr key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <td><strong>{a.reference}</strong></td>
                <td>{getWhName(a.warehouse)}</td>
                <td>
                  {a.items.map((item, j) => (
                    <span key={j}>{getProductName(item.productId)}</span>
                  ))}
                </td>
                <td>{a.items[0]?.recorded}</td>
                <td>{a.items[0]?.counted}</td>
                <td>
                  <span style={{
                    color: a.items[0]?.qty > 0 ? '#10b981' : a.items[0]?.qty < 0 ? '#ef4444' : 'var(--text-muted)',
                    fontWeight: 700,
                  }}>
                    {a.items[0]?.qty > 0 ? '+' : ''}{a.items[0]?.qty}
                  </span>
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{a.reason}</td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(a.createdAt).toLocaleDateString()}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {adjustments.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No adjustments found</h3>
            <p>Create a stock adjustment when physical count differs from records</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>New Stock Adjustment</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <form onSubmit={handleSave}>
                <div className="form-grid">
                  <div className="form-grid-2">
                    <div className="input-group">
                      <label>Warehouse *</label>
                      <select className="input-field" value={form.warehouse} onChange={e => setForm({ ...form, warehouse: e.target.value })} id="adj-warehouse">
                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </select>
                    </div>
                    <div className="input-group">
                      <label>Product *</label>
                      <select className="input-field" value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })} id="adj-product">
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Stock info card */}
                  <div style={{
                    background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: 12, padding: 16, display: 'flex', justifyContent: 'space-around', textAlign: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>RECORDED</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{currentStock}</div>
                    </div>
                    <div style={{ width: 1, background: 'rgba(99,102,241,0.2)' }}></div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>COUNTED</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-secondary)' }}>{form.counted}</div>
                    </div>
                    <div style={{ width: 1, background: 'rgba(99,102,241,0.2)' }}></div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>DIFFERENCE</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: difference > 0 ? '#10b981' : difference < 0 ? '#ef4444' : 'var(--text-muted)' }}>
                        {difference > 0 ? '+' : ''}{difference}
                      </div>
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Physical Count *</label>
                    <input type="number" className="input-field" value={form.counted} onChange={e => setForm({ ...form, counted: Number(e.target.value) })} min="0" id="adj-counted" />
                  </div>
                  <div className="input-group">
                    <label>Reason *</label>
                    <input className="input-field" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="e.g. Damaged goods, miscounted" id="adj-reason" />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" id="save-adj-btn">Apply Adjustment</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
