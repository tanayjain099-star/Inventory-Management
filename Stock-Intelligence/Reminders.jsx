import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePlus, HiOutlineCheck, HiOutlineTrash, HiOutlineClock, HiOutlineExclamation, HiOutlineCalendar } from 'react-icons/hi';
import { reminderStore } from '../store/reminderStore';
import toast from 'react-hot-toast';

const priorityColors = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#10b981' };
const typeIcons = { stock_count: '📋', reorder: '📦', stock_check: '🔍', meeting: '🤝', maintenance: '🔧', other: '📌' };

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [filter, setFilter] = useState('active');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'stock_count', priority: 'medium', dueDate: '' });

  const reload = () => setReminders(reminderStore.getAll());
  useEffect(() => { reload(); }, []);

  const now = new Date();
  const filtered = reminders.filter(r => {
    if (filter === 'active') return r.status === 'active';
    if (filter === 'overdue') return r.status === 'active' && new Date(r.dueDate) < now;
    if (filter === 'upcoming') return r.status === 'active' && new Date(r.dueDate) >= now;
    if (filter === 'completed') return r.status === 'completed';
    return true;
  });

  const overdueCount = reminders.filter(r => r.status === 'active' && new Date(r.dueDate) < now).length;
  const activeCount = reminders.filter(r => r.status === 'active').length;

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.title || !form.dueDate) { toast.error('Title and due date required'); return; }
    reminderStore.create(form);
    toast.success('Reminder created');
    setShowModal(false);
    reload();
  };

  const handleComplete = (id) => {
    reminderStore.complete(id);
    toast.success('Marked as complete');
    reload();
  };

  const handleDelete = (id) => {
    reminderStore.delete(id);
    toast.success('Reminder deleted');
    reload();
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const diff = d - now;
    const days = Math.ceil(diff / 86400000);
    if (days < 0) return `${Math.abs(days)} day${Math.abs(days) > 1 ? 's' : ''} overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `In ${days} days`;
  };

  const isOverdue = (dateStr) => new Date(dateStr) < now;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">⏰ Reminders</h1>
          <p className="page-subtitle">{activeCount} active, {overdueCount} overdue</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({ title: '', description: '', type: 'stock_count', priority: 'medium', dueDate: '' }); setShowModal(true); }} id="add-reminder-btn">
          <HiOutlinePlus /> New Reminder
        </button>
      </div>

      <div className="filters-bar">
        {[
          { key: 'active', label: `Active (${activeCount})` },
          { key: 'overdue', label: `Overdue (${overdueCount})` },
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'completed', label: 'Completed' },
          { key: 'all', label: 'All' },
        ].map(f => (
          <span key={f.key} className={`filter-chip ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
            {f.key === 'overdue' && overdueCount > 0 ? '🔴 ' : ''}{f.label}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflow: 'auto' }}>
        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">⏰</div>
            <h3>No reminders found</h3>
            <p>Create a reminder to stay on track</p>
          </div>
        )}
        {filtered.map((r, i) => (
          <motion.div
            key={r.id}
            className="glass-card"
            style={{
              padding: 20, display: 'flex', alignItems: 'center', gap: 16,
              borderLeft: `4px solid ${priorityColors[r.priority]}`,
              opacity: r.status === 'completed' ? 0.6 : 1,
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: r.status === 'completed' ? 0.6 : 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            {/* Icon */}
            <div style={{ fontSize: 28, flexShrink: 0 }}>{typeIcons[r.type] || '📌'}</div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 15, textDecoration: r.status === 'completed' ? 'line-through' : 'none' }}>{r.title}</span>
                <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: priorityColors[r.priority] + '18', color: priorityColors[r.priority], textTransform: 'uppercase' }}>
                  {r.priority}
                </span>
              </div>
              {r.description && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{r.description}</div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: r.status === 'active' && isOverdue(r.dueDate) ? '#ef4444' : 'var(--text-muted)' }}>
                  <HiOutlineClock /> {formatDate(r.dueDate)}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  <HiOutlineCalendar style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  {new Date(r.dueDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            {r.status === 'active' && (
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button className="btn btn-sm btn-success" onClick={() => handleComplete(r.id)} title="Complete">
                  <HiOutlineCheck />
                </button>
                <button className="btn-icon" onClick={() => handleDelete(r.id)} style={{ color: '#ef4444' }}>
                  <HiOutlineTrash />
                </button>
              </div>
            )}
            {r.status === 'completed' && (
              <div style={{ color: '#10b981', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <HiOutlineCheck /> Done
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>New Reminder</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <form onSubmit={handleSave}>
                <div className="form-grid">
                  <div className="input-group">
                    <label>Title *</label>
                    <input className="input-field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Reorder Steel Rods" id="reminder-title" />
                  </div>
                  <div className="input-group">
                    <label>Description</label>
                    <input className="input-field" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional details" id="reminder-desc" />
                  </div>
                  <div className="form-grid-2">
                    <div className="input-group">
                      <label>Type</label>
                      <select className="input-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} id="reminder-type">
                        <option value="stock_count">Stock Count</option>
                        <option value="reorder">Reorder</option>
                        <option value="stock_check">Stock Check</option>
                        <option value="meeting">Meeting</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label>Priority</label>
                      <select className="input-field" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} id="reminder-priority">
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Due Date *</label>
                    <input type="datetime-local" className="input-field" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} id="reminder-date" />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" id="save-reminder-btn">Create Reminder</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
