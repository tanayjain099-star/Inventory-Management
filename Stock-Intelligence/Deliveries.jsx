import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePlus, HiOutlineCheck, HiOutlineTrash } from 'react-icons/hi';
import { deliveryStore, productStore, warehouseStore } from '../store/inventoryStore';
import toast from 'react-hot-toast';

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ reference: '', customer: '', warehouse: '', items: [{ productId: '', qty: 0 }] });

  const reload = () => {
    setDeliveries(deliveryStore.getAll());
    setProducts(productStore.getAll());
    setWarehouses(warehouseStore.getAll());
  };

  useEffect(() => { reload(); }, []);

  const filtered = deliveries.filter(d => statusFilter === 'all' || d.status === statusFilter);
  const getProductName = (id) => products.find(p => p.id === id)?.name || 'Unknown';
  const getWhName = (id) => warehouses.find(w => w.id === id)?.name || id;

  const handleOpen = () => {
    const ref = 'DEL-' + String(deliveries.length + 1).padStart(3, '0');
    setForm({ reference: ref, customer: '', warehouse: warehouses[0]?.id || '', items: [{ productId: products[0]?.id || '', qty: 1 }] });
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
    if (!form.customer || !form.warehouse) { toast.error('Customer and warehouse required'); return; }
    if (form.items.some(i => !i.productId || i.qty <= 0)) { toast.error('All items need product and quantity'); return; }
    deliveryStore.create(form);
    toast.success('Delivery order created');
    setShowModal(false);
    reload();
  };

  const handleValidate = (id) => {
    if (confirm('Validate this delivery? Stock will decrease accordingly.')) {
      deliveryStore.validate(id);
      toast.success('Delivery validated — stock updated!');
      reload();
    }
  };

  const handleUpdateStatus = (id, status) => {
    deliveryStore.update(id, { status });
    toast.success(`Status updated to ${status}`);
    reload();
  };

  const handleDelete = (id) => {
    if (confirm('Delete this delivery?')) {
      deliveryStore.delete(id);
      toast.success('Delivery deleted');
      reload();
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Deliveries</h1>
          <p className="page-subtitle">Outgoing goods to customers</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpen} id="add-delivery-btn">
          <HiOutlinePlus /> New Delivery
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
              <th>Customer</th>
              <th>Warehouse</th>
              <th>Items</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => (
              <motion.tr key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <td><strong>{d.reference}</strong></td>
                <td>{d.customer}</td>
                <td>{getWhName(d.warehouse)}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {d.items.map((item, j) => (
                      <span key={j} style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {getProductName(item.productId)} × {item.qty}
                      </span>
                    ))}
                  </div>
                </td>
                <td><span className={`badge badge-${d.status}`}>{d.status}</span></td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(d.createdAt).toLocaleDateString()}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {d.status === 'draft' && (
                      <button className="btn btn-sm btn-secondary" onClick={() => handleUpdateStatus(d.id, 'waiting')}>Pick</button>
                    )}
                    {d.status === 'waiting' && (
                      <button className="btn btn-sm btn-secondary" onClick={() => handleUpdateStatus(d.id, 'ready')}>Pack</button>
                    )}
                    {(d.status === 'ready' || d.status === 'waiting') && (
                      <button className="btn btn-sm btn-success" onClick={() => handleValidate(d.id)}>
                        <HiOutlineCheck /> Validate
                      </button>
                    )}
                    {d.status !== 'done' && (
                      <button className="btn-icon" onClick={() => handleDelete(d.id)} style={{ color: '#ef4444' }}><HiOutlineTrash /></button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🚚</div>
            <h3>No deliveries found</h3>
            <p>Create a new delivery order</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>New Delivery Order</h2>
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
                      <label>Customer *</label>
                      <input className="input-field" value={form.customer} onChange={e => setForm({ ...form, customer: e.target.value })} placeholder="Customer name" id="delivery-customer" />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Source Warehouse *</label>
                    <select className="input-field" value={form.warehouse} onChange={e => setForm({ ...form, warehouse: e.target.value })} id="delivery-warehouse">
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
                  <button type="submit" className="btn btn-primary" id="save-delivery-btn">Create Delivery</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
