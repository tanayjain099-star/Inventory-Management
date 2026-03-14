import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePlus, HiOutlineCheck, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { receiptStore, productStore, warehouseStore } from '../store/inventoryStore';
import toast from 'react-hot-toast';

export default function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ reference: '', supplier: '', warehouse: '', items: [{ productId: '', qty: 0 }] });

  const reload = () => {
    setReceipts(receiptStore.getAll());
    setProducts(productStore.getAll());
    setWarehouses(warehouseStore.getAll());
  };

  useEffect(() => { reload(); }, []);

  const filtered = receipts.filter(r => statusFilter === 'all' || r.status === statusFilter);
  const getProductName = (id) => products.find(p => p.id === id)?.name || 'Unknown';
  const getWhName = (id) => warehouses.find(w => w.id === id)?.name || id;

  const handleOpen = () => {
    const ref = 'REC-' + String(receipts.length + 1).padStart(3, '0');
    setForm({ reference: ref, supplier: '', warehouse: warehouses[0]?.id || '', items: [{ productId: products[0]?.id || '', qty: 1 }] });
    setShowModal(true);
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { productId: products[0]?.id || '', qty: 1 }] });
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  const updateItem = (i, field, val) => {
    const items = [...form.items];
    items[i] = { ...items[i], [field]: field === 'qty' ? Number(val) : val };
    setForm({ ...form, items });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.supplier || !form.warehouse) { toast.error('Supplier and warehouse required'); return; }
    if (form.items.some(i => !i.productId || i.qty <= 0)) { toast.error('All items need product and quantity'); return; }
    receiptStore.create(form);
    toast.success('Receipt created');
    setShowModal(false);
    reload();
  };

  const handleValidate = (id) => {
    if (confirm('Validate this receipt? Stock will increase accordingly.')) {
      receiptStore.validate(id);
      toast.success('Receipt validated — stock updated!');
      reload();
    }
  };

  const handleUpdateStatus = (id, status) => {
    receiptStore.update(id, { status });
    toast.success(`Status updated to ${status}`);
    reload();
  };

  const handleDelete = (id) => {
    if (confirm('Delete this receipt?')) {
      receiptStore.delete(id);
      toast.success('Receipt deleted');
      reload();
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Receipts</h1>
          <p className="page-subtitle">Incoming goods from suppliers</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpen} id="add-receipt-btn">
          <HiOutlinePlus /> New Receipt
        </button>
      </div>

      <div className="filters-bar">
        {['all', 'draft', 'waiting', 'ready', 'done'].map(s => (
          <span key={s} className={`filter-chip ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </span>
        ))}
      </div>

      <div className="glass-card" style={{ flex: 1, overflow: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Supplier</th>
              <th>Warehouse</th>
              <th>Items</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <motion.tr key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <td><strong>{r.reference}</strong></td>
                <td>{r.supplier}</td>
                <td>{getWhName(r.warehouse)}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {r.items.map((item, j) => (
                      <span key={j} style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {getProductName(item.productId)} × {item.qty}
                      </span>
                    ))}
                  </div>
                </td>
                <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {r.status === 'draft' && (
                      <button className="btn btn-sm btn-secondary" onClick={() => handleUpdateStatus(r.id, 'waiting')}>
                        Mark Waiting
                      </button>
                    )}
                    {r.status === 'waiting' && (
                      <button className="btn btn-sm btn-secondary" onClick={() => handleUpdateStatus(r.id, 'ready')}>
                        Mark Ready
                      </button>
                    )}
                    {(r.status === 'ready' || r.status === 'waiting') && (
                      <button className="btn btn-sm btn-success" onClick={() => handleValidate(r.id)} title="Validate">
                        <HiOutlineCheck /> Validate
                      </button>
                    )}
                    {r.status !== 'done' && (
                      <button className="btn-icon" onClick={() => handleDelete(r.id)} style={{ color: '#ef4444' }}><HiOutlineTrash /></button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📥</div>
            <h3>No receipts found</h3>
            <p>Create a new receipt to track incoming goods</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>New Receipt</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <form onSubmit={handleSave}>
                <div className="form-grid">
                  <div className="form-grid-2">
                    <div className="input-group">
                      <label>Reference</label>
                      <input className="input-field" value={form.reference} readOnly style={{ opacity: 0.7 }} />
                    </div>
                    <div className="input-group">
                      <label>Supplier *</label>
                      <input className="input-field" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} placeholder="Supplier name" id="receipt-supplier" />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Destination Warehouse *</label>
                    <select className="input-field" value={form.warehouse} onChange={e => setForm({ ...form, warehouse: e.target.value })} id="receipt-warehouse">
                      {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>Items</label>
                    {form.items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'end' }}>
                        <div className="input-group" style={{ flex: 2 }}>
                          <select className="input-field" value={item.productId} onChange={e => updateItem(i, 'productId', e.target.value)}>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                          </select>
                        </div>
                        <div className="input-group" style={{ flex: 1 }}>
                          <input type="number" className="input-field" value={item.qty} onChange={e => updateItem(i, 'qty', e.target.value)} min="1" placeholder="Qty" />
                        </div>
                        {form.items.length > 1 && (
                          <button type="button" className="btn-icon" onClick={() => removeItem(i)} style={{ color: '#ef4444', marginBottom: 1 }}>
                            <HiOutlineTrash />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" className="btn btn-sm btn-secondary" onClick={addItem}>
                      <HiOutlinePlus /> Add Item
                    </button>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" id="save-receipt-btn">Create Receipt</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
