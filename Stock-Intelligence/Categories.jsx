import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { categoryStore, productStore } from '../store/inventoryStore';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#f97316', '#3b82f6'];

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', color: '#6366f1' });

  const reload = () => {
    setCategories(categoryStore.getAll());
    setProducts(productStore.getAll());
  };

  useEffect(() => { reload(); }, []);

  const handleOpen = (cat = null) => {
    if (cat) {
      setEditing(cat.id);
      setForm({ name: cat.name, color: cat.color });
    } else {
      setEditing(null);
      setForm({ name: '', color: COLORS[categories.length % COLORS.length] });
    }
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name) { toast.error('Category name required'); return; }
    if (editing) {
      categoryStore.update(editing, form);
      toast.success('Category updated');
    } else {
      categoryStore.create(form);
      toast.success('Category created');
    }
    setShowModal(false);
    reload();
  };

  const handleDelete = (id) => {
    const hasProducts = products.some(p => p.category === id);
    if (hasProducts) { toast.error('Cannot delete: category has products'); return; }
    if (confirm('Delete this category?')) {
      categoryStore.delete(id);
      toast.success('Category deleted');
      reload();
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Organize your products</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpen()} id="add-category-btn">
          <HiOutlinePlus /> Add Category
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {categories.map((cat, i) => {
          const count = products.filter(p => p.category === cat.id).length;
          return (
            <motion.div key={cat.id} className="glass-card glass-card-hover" style={{ padding: 24, position: 'relative', overflow: 'hidden' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: cat.color }}></div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: cat.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, background: cat.color }}></div>
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>{cat.name}</h3>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{count} product{count !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn-icon" onClick={() => handleOpen(cat)}><HiOutlinePencil /></button>
                  <button className="btn-icon" onClick={() => handleDelete(cat.id)} style={{ color: '#ef4444' }}><HiOutlineTrash /></button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editing ? 'Edit Category' : 'New Category'}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <form onSubmit={handleSave}>
                <div className="form-grid">
                  <div className="input-group">
                    <label>Category Name *</label>
                    <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Electronics" id="cat-name" />
                  </div>
                  <div className="input-group">
                    <label>Color</label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {COLORS.map(c => (
                        <div key={c} onClick={() => setForm({ ...form, color: c })} style={{
                          width: 32, height: 32, borderRadius: 8, background: c, cursor: 'pointer',
                          border: form.color === c ? '3px solid white' : '3px solid transparent',
                          boxShadow: form.color === c ? `0 0 12px ${c}60` : 'none', transition: 'all 0.2s',
                        }}></div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" id="save-cat-btn">{editing ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
