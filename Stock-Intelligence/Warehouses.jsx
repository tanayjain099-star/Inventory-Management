import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineLocationMarker } from 'react-icons/hi';
import { warehouseStore, productStore } from '../store/inventoryStore';
import toast from 'react-hot-toast';

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', address: '', locations: '' });

  const reload = () => {
    setWarehouses(warehouseStore.getAll());
    setProducts(productStore.getAll());
  };

  useEffect(() => { reload(); }, []);

  const getStockCount = (whId) => {
    return products.reduce((sum, p) => sum + (p.stock?.[whId] || 0), 0);
  };

  const getProductCount = (whId) => {
    return products.filter(p => (p.stock?.[whId] || 0) > 0).length;
  };

  const handleOpen = (wh = null) => {
    if (wh) {
      setEditing(wh.id);
      setForm({ name: wh.name, code: wh.code, address: wh.address, locations: (wh.locations || []).join(', ') });
    } else {
      setEditing(null);
      setForm({ name: '', code: '', address: '', locations: '' });
    }
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name || !form.code) { toast.error('Name and code are required'); return; }
    const data = { ...form, locations: form.locations.split(',').map(l => l.trim()).filter(Boolean) };
    if (editing) {
      warehouseStore.update(editing, data);
      toast.success('Warehouse updated');
    } else {
      warehouseStore.create(data);
      toast.success('Warehouse created');
    }
    setShowModal(false);
    reload();
  };

  const handleDelete = (id) => {
    const hasStock = getStockCount(id) > 0;
    if (hasStock) { toast.error('Cannot delete: warehouse has stock'); return; }
    if (confirm('Delete this warehouse?')) {
      warehouseStore.delete(id);
      toast.success('Warehouse deleted');
      reload();
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Warehouses</h1>
          <p className="page-subtitle">{warehouses.length} warehouse locations</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpen()} id="add-warehouse-btn">
          <HiOutlinePlus /> Add Warehouse
        </button>
      </div>

      <div className="warehouse-grid">
        {warehouses.map((wh, i) => (
          <motion.div key={wh.id} className="warehouse-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <div className="warehouse-code">{wh.code}</div>
                <div className="warehouse-name">{wh.name}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn-icon" onClick={() => handleOpen(wh)}><HiOutlinePencil /></button>
                <button className="btn-icon" onClick={() => handleDelete(wh.id)} style={{ color: '#ef4444' }}><HiOutlineTrash /></button>
              </div>
            </div>
            <div className="warehouse-address"><HiOutlineLocationMarker style={{ verticalAlign: 'middle', marginRight: 4 }} />{wh.address}</div>

            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ background: 'rgba(99,102,241,0.1)', padding: '8px 14px', borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-secondary)' }}>{getStockCount(wh.id)}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Stock</div>
              </div>
              <div style={{ background: 'rgba(16,185,129,0.1)', padding: '8px 14px', borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#34d399' }}>{getProductCount(wh.id)}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Products</div>
              </div>
            </div>

            {wh.locations && wh.locations.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Locations</div>
                <div className="warehouse-locations">
                  {wh.locations.map((loc, j) => (
                    <span key={j} className="location-tag">{loc}</span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editing ? 'Edit Warehouse' : 'New Warehouse'}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <form onSubmit={handleSave}>
                <div className="form-grid">
                  <div className="form-grid-2">
                    <div className="input-group">
                      <label>Warehouse Name *</label>
                      <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Main Warehouse" id="wh-name" />
                    </div>
                    <div className="input-group">
                      <label>Code *</label>
                      <input className="input-field" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="e.g. WH-MAIN" id="wh-code" />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Address</label>
                    <input className="input-field" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Full address" id="wh-address" />
                  </div>
                  <div className="input-group">
                    <label>Locations (comma separated)</label>
                    <input className="input-field" value={form.locations} onChange={e => setForm({ ...form, locations: e.target.value })} placeholder="Rack A1, Rack A2, Shelf B1" id="wh-locations" />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" id="save-wh-btn">{editing ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
