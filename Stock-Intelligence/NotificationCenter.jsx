import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineBell, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';
import { notificationStore, reminderStore } from '../store/reminderStore';
import { productStore } from '../store/inventoryStore';

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const reload = () => {
    // Generate smart alerts
    const products = productStore.getAll();
    notificationStore.generateSmartAlerts(products, productStore);
    setNotifications(notificationStore.getAll());
    setUnreadCount(notificationStore.getUnreadCount());
  };

  useEffect(() => {
    reload();
    const interval = setInterval(reload, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    notificationStore.markAllRead();
    reload();
  };

  const handleMarkRead = (id) => {
    notificationStore.markRead(id);
    reload();
  };

  const typeColors = { critical: '#ef4444', warning: '#f59e0b', info: '#3b82f6', success: '#10b981' };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        onClick={() => { setOpen(!open); if (!open) reload(); }}
        style={{
          position: 'relative', width: 40, height: 40, borderRadius: 10,
          background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)',
          color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, transition: 'all 0.2s',
        }}
        id="notification-bell"
      >
        <HiOutlineBell />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%',
              background: '#ef4444', color: 'white', fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--bg-secondary)',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            style={{
              position: 'absolute', top: 50, right: 0, width: 380, maxHeight: 480,
              background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)',
              borderRadius: 16, boxShadow: '0 16px 48px rgba(0,0,0,0.5)', zIndex: 1000,
              overflow: 'hidden', display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '14px 16px', borderBottom: '1px solid var(--border-glass)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Notifications</div>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} style={{
                  background: 'none', border: 'none', color: 'var(--accent-secondary)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                }}>
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto', maxHeight: 400 }}>
              {notifications.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
                  <div style={{ fontSize: 13 }}>No notifications</div>
                </div>
              ) : (
                notifications.slice(0, 20).map((n, i) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => handleMarkRead(n.id)}
                    style={{
                      padding: '12px 16px', display: 'flex', gap: 12, cursor: 'pointer',
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                      background: n.read ? 'transparent' : 'rgba(99,102,241,0.05)',
                      transition: 'background 0.2s',
                    }}
                  >
                    <div style={{ fontSize: 20, flexShrink: 0 }}>{n.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{n.title}</span>
                        {!n.read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)' }} />}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.message}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{formatTime(n.createdAt)}</div>
                    </div>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: typeColors[n.type] || '#64748b', flexShrink: 0, marginTop: 6 }} />
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
