import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePlus, HiOutlineCheck, HiOutlineTrash, HiOutlineArrowRight } from 'react-icons/hi';
import { transferStore, productStore, warehouseStore } from '../store/inventoryStore';
import toast from 'react-hot-toast';

export default function Transfers() {
  const [transfers, setTransfers] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ reference: '', fromWarehouse: '', toWarehouse: '', items: [{ productId: '', qty: 0 }] });

  const reload = () => {
    setTransfers(transferStore.getAll());
    setProducts(productStore.getAll());
    setWarehouses(warehouseStore.getAll());
  };

  useEffect(() => { reload(); }, []);

  const filtered = transfers.filter(t => statusFilter === 'all' || t.status === statusFilter);
  const getProductName = (id) => products.find(p => p.id === id)?.name || 'Unknown';
  const getWhName = (id) => warehouses.find(w => w.id === id)?.name || id;

  const handleOpen = () => {
    const ref = 'TRF-' + String(transfers.length + 1).padStart(3, '0');
    setForm({ reference: ref, fromWarehouse: warehouses[0]?.id || '', toWarehouse: warehouses[1]?.id || warehouses[0]?.id || '', items: [{ productId: products[0]?.id || '', qty: 1 }] });
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
    if (!form.fromWarehouse || !form.toWarehouse) { toast.error('Select both warehouses'); return; }
    if (form.fromWarehouse === form.toWarehouse) { toast.error('Source and destination must differ'); return; }
    if (form.items.some(i => !i.productId || i.qty <= 0)) { toast.error('All items need product and quantity'); return; }
    transferStore.create(form);
    toast.success('Transfer created');
    setShowModal(false);
    reload();
  };

  const handleValidate = (id) => {
    if (confirm('Validate this transfer? Stock will be moved between warehouses.')) {
      transferStore.validate(id);
      toast.success('Transfer validated — stock moved!');
      reload();
    }
  };

  const handleDelete = (id) => {
    if (confirm('Delete this transfer?')) {
      transferStore.delete(id);
      toast.success('Transfer deleted');
      reload();
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Internal Transfers</h1>
          <p className="page-subtitle">Move stock between warehouses</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpen} id="add-transfer-btn">
          <HiOutlinePlus /> New Transfer
        </button>
      </div>

      <div className="filters-bar">
        {['all', 'draft', 'waiting', 'done'].map(s => (
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
              <th>From</th>
              <th></th>
              <th>To</th>
              <th>Items</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => (
              <motion.tr key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <td><strong>{t.reference}</strong></td>
                <td>{getWhName(t.fromWarehouse)}</td>
                <td style={{ color: 'var(--accent-primary)' }}><HiOutlineArrowRight /></td>
                <td>{getWhName(t.toWarehouse)}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {t.items.map((item, j) => (
                      <span key={j} style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {getProductName(item.productId)} × {item.qty}
                      </span>
                    ))}
                  </div>
                </td>
                <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {t.status !== 'done' && (
                      <>
                        <button className="btn btn-sm btn-success" onClick={() => handleValidate(t.id)}>
                          <HiOutlineCheck /> Validate
                        </button>
                        <button className="btn-icon" onClick={() => handleDelete(t.id)} style={{ color: '#ef4444' }}><HiOutlineTrash /></button>
                      </>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🔄</div>
            <h3>No transfers found</h3>
            <p>Create a new internal transfer</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>New Internal Transfer</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <form onSubmit={handleSave}>
                <div className="form-grid">
                  <div className="input-group">
                    <label>Reference</label>
                    <input className="input-field" value={form.reference} readOnly style={{ opacity: 0.7 }} />
                  </div>
                  <div className="form-grid-2">
                    <div className="input-group">
                      <label>From Warehouse *</label>
                      <select className="input-field" value={form.fromWarehouse} onChange={e => setForm({ ...form, fromWarehouse: e.target.value })} id="transfer-from">
                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </select>
                    </div>
                    <div className="input-group">
                      <label>To Warehouse *</label>
                      <select className="input-field" value={form.toWarehouse} onChange={e => setForm({ ...form, toWarehouse: e.target.value })} id="transfer-to">
                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </select>
                    </div>
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
                          <button type="button" className="btn-icon" onClick={() => removeItem(i)} style={{ color: '#ef4444' }}><HiOutlineTrash /></button>
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
                  <button type="submit" className="btn btn-primary" id="save-transfer-btn">Create Transfer</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
