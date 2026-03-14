import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePlus, HiOutlineSearch, HiOutlinePencil, HiOutlineTrash, HiOutlineExclamation } from 'react-icons/hi';
import { productStore, categoryStore, warehouseStore } from '../store/inventoryStore';
import toast from 'react-hot-toast';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', sku: '', category: '', unit: 'pcs', reorderLevel: 10, reorderQty: 50 });

  const reload = () => {
    setProducts(productStore.getAll());
    setCategories(categoryStore.getAll());
    setWarehouses(warehouseStore.getAll());
  };

  useEffect(() => { reload(); }, []);

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'all' || p.category === catFilter;
    return matchSearch && matchCat;
  });

  const getTotalStock = (p) => Object.values(p.stock || {}).reduce((s, q) => s + q, 0);
  const getStockLevel = (p) => {
    const total = getTotalStock(p);
    if (total === 0) return 'critical';
    if (total <= p.reorderLevel) return 'low';
    return 'ok';
  };

  const handleOpen = (product = null) => {
    if (product) {
      setEditing(product.id);
      setForm({ name: product.name, sku: product.sku, category: product.category, unit: product.unit, reorderLevel: product.reorderLevel, reorderQty: product.reorderQty });
    } else {
      setEditing(null);
      setForm({ name: '', sku: '', category: categories[0]?.id || '', unit: 'pcs', reorderLevel: 10, reorderQty: 50 });
    }
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name || !form.sku) { toast.error('Name and SKU are required'); return; }
    if (editing) {
      productStore.update(editing, form);
      toast.success('Product updated');
    } else {
      productStore.create(form);
      toast.success('Product created');
    }
    setShowModal(false);
    reload();
  };

  const handleDelete = (id) => {
    if (confirm('Delete this product?')) {
      productStore.delete(id);
      toast.success('Product deleted');
      reload();
    }
  };

  const getCatName = (id) => categories.find(c => c.id === id)?.name || '—';
  const getWhName = (id) => warehouses.find(w => w.id === id)?.name || id;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{products.length} products in inventory</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpen()} id="add-product-btn">
          <HiOutlinePlus /> Add Product
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-bar">
          <HiOutlineSearch className="search-icon" />
          <input placeholder="Search by name or SKU..." value={search} onChange={e => setSearch(e.target.value)} id="product-search" />
        </div>
        <span className={`filter-chip ${catFilter === 'all' ? 'active' : ''}`} onClick={() => setCatFilter('all')}>All</span>
        {categories.map(c => (
          <span key={c.id} className={`filter-chip ${catFilter === c.id ? 'active' : ''}`} onClick={() => setCatFilter(c.id)}>
            {c.name}
          </span>
        ))}
      </div>

      <div className="glass-card" style={{ flex: 1, overflow: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Unit</th>
              <th>Total Stock</th>
              <th>Stock by Location</th>
              <th>Reorder Level</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => {
              const total = getTotalStock(p);
              const level = getStockLevel(p);
              const pct = Math.min(100, (total / Math.max(p.reorderLevel * 2, 1)) * 100);
              return (
                <motion.tr key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <td style={{ fontWeight: 600 }}>
                    {p.name}
                    {level !== 'ok' && <HiOutlineExclamation style={{ color: level === 'critical' ? '#ef4444' : '#f59e0b', marginLeft: 6, verticalAlign: 'middle' }} />}
                  </td>
                  <td><code style={{ color: 'var(--accent-secondary)', fontSize: 12 }}>{p.sku}</code></td>
                  <td><span style={{ background: categories.find(c => c.id === p.category)?.color + '20', color: categories.find(c => c.id === p.category)?.color, padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{getCatName(p.category)}</span></td>
                  <td>{p.unit}</td>
                  <td>
                    <div className={`stock-indicator stock-${level}`}>
                      <span style={{ fontWeight: 700, minWidth: 30 }}>{total}</span>
                      <div className="stock-bar">
                        <div className="stock-bar-fill" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {Object.entries(p.stock || {}).filter(([, q]) => q > 0).map(([whId, q]) => (
                        <span key={whId} style={{ fontSize: 11, padding: '2px 8px', background: 'rgba(99,102,241,0.1)', borderRadius: 10, color: 'var(--text-secondary)' }}>
                          {getWhName(whId)}: {q}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{p.reorderLevel}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-icon" onClick={() => handleOpen(p)} title="Edit"><HiOutlinePencil /></button>
                      <button className="btn-icon" onClick={() => handleDelete(p.id)} title="Delete" style={{ color: '#ef4444' }}><HiOutlineTrash /></button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>No products found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editing ? 'Edit Product' : 'New Product'}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <form onSubmit={handleSave}>
                <div className="form-grid">
                  <div className="form-grid-2">
                    <div className="input-group">
                      <label>Product Name *</label>
                      <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Steel Rods" id="product-name" />
                    </div>
                    <div className="input-group">
                      <label>SKU / Code *</label>
                      <input className="input-field" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="e.g. STL-001" id="product-sku" />
                    </div>
                  </div>
                  <div className="form-grid-2">
                    <div className="input-group">
                      <label>Category</label>
                      <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} id="product-category">
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="input-group">
                      <label>Unit of Measure</label>
                      <select className="input-field" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} id="product-unit">
                        {['pcs', 'kg', 'meters', 'liters', 'rolls', 'reams', 'boxes'].map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-grid-2">
                    <div className="input-group">
                      <label>Reorder Level</label>
                      <input type="number" className="input-field" value={form.reorderLevel} onChange={e => setForm({ ...form, reorderLevel: Number(e.target.value) })} id="product-reorder-level" />
                    </div>
                    <div className="input-group">
                      <label>Reorder Quantity</label>
                      <input type="number" className="input-field" value={form.reorderQty} onChange={e => setForm({ ...form, reorderQty: Number(e.target.value) })} id="product-reorder-qty" />
                    </div>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" id="save-product-btn">{editing ? 'Update' : 'Create'} Product</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
