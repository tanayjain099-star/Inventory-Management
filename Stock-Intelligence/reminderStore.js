// Reminder & Notification System
const KEYS = {
  REMINDERS: 'ims_reminders',
  NOTIFICATIONS: 'ims_notifications',
};

function getItem(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// ===== REMINDERS =====
export const reminderStore = {
  getAll: () => (getItem(KEYS.REMINDERS) || []).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)),
  
  create: (reminder) => {
    const reminders = getItem(KEYS.REMINDERS) || [];
    const newReminder = {
      ...reminder,
      id: generateId(),
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    reminders.push(newReminder);
    setItem(KEYS.REMINDERS, reminders);
    return newReminder;
  },

  update: (id, updates) => {
    const reminders = getItem(KEYS.REMINDERS) || [];
    const idx = reminders.findIndex(r => r.id === id);
    if (idx >= 0) {
      reminders[idx] = { ...reminders[idx], ...updates };
      setItem(KEYS.REMINDERS, reminders);
      return reminders[idx];
    }
    return null;
  },

  complete: (id) => {
    return reminderStore.update(id, { status: 'completed', completedAt: new Date().toISOString() });
  },

  dismiss: (id) => {
    return reminderStore.update(id, { status: 'dismissed' });
  },

  delete: (id) => {
    const reminders = (getItem(KEYS.REMINDERS) || []).filter(r => r.id !== id);
    setItem(KEYS.REMINDERS, reminders);
  },

  getActive: () => {
    return (getItem(KEYS.REMINDERS) || []).filter(r => r.status === 'active');
  },

  getOverdue: () => {
    const now = new Date();
    return (getItem(KEYS.REMINDERS) || [])
      .filter(r => r.status === 'active' && new Date(r.dueDate) < now);
  },

  getUpcoming: () => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 86400000);
    return (getItem(KEYS.REMINDERS) || [])
      .filter(r => r.status === 'active' && new Date(r.dueDate) >= now && new Date(r.dueDate) <= tomorrow);
  },
};

// ===== NOTIFICATIONS =====
export const notificationStore = {
  getAll: () => (getItem(KEYS.NOTIFICATIONS) || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),

  add: (notification) => {
    const notifications = getItem(KEYS.NOTIFICATIONS) || [];
    const newNotification = {
      ...notification,
      id: generateId(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    notifications.unshift(newNotification);
    // Keep only last 50
    if (notifications.length > 50) notifications.length = 50;
    setItem(KEYS.NOTIFICATIONS, notifications);
    return newNotification;
  },

  markRead: (id) => {
    const notifications = getItem(KEYS.NOTIFICATIONS) || [];
    const idx = notifications.findIndex(n => n.id === id);
    if (idx >= 0) {
      notifications[idx].read = true;
      setItem(KEYS.NOTIFICATIONS, notifications);
    }
  },

  markAllRead: () => {
    const notifications = (getItem(KEYS.NOTIFICATIONS) || []).map(n => ({ ...n, read: true }));
    setItem(KEYS.NOTIFICATIONS, notifications);
  },

  getUnreadCount: () => {
    return (getItem(KEYS.NOTIFICATIONS) || []).filter(n => !n.read).length;
  },

  clear: () => {
    setItem(KEYS.NOTIFICATIONS, []);
  },

  // Generate smart notifications from inventory state
  generateSmartAlerts: (products, productStore) => {
    const notifications = getItem(KEYS.NOTIFICATIONS) || [];
    const existingTypes = new Set(notifications.slice(0, 10).map(n => n.key));
    const newNotifications = [];

    products.forEach(product => {
      const total = productStore.getTotalStock(product);

      // Low stock alert
      if (total > 0 && total <= product.reorderLevel) {
        const key = `low_stock_${product.id}`;
        if (!existingTypes.has(key)) {
          newNotifications.push({
            type: 'warning',
            icon: '⚠️',
            title: 'Low Stock Alert',
            message: `${product.name} is below reorder level (${total}/${product.reorderLevel})`,
            key,
          });
        }
      }

      // Out of stock alert
      if (total === 0) {
        const key = `out_of_stock_${product.id}`;
        if (!existingTypes.has(key)) {
          newNotifications.push({
            type: 'critical',
            icon: '🚨',
            title: 'Out of Stock!',
            message: `${product.name} (${product.sku}) has zero stock`,
            key,
          });
        }
      }
    });

    // Overdue reminders
    const overdue = reminderStore.getOverdue();
    overdue.forEach(r => {
      const key = `overdue_reminder_${r.id}`;
      if (!existingTypes.has(key)) {
        newNotifications.push({
          type: 'info',
          icon: '⏰',
          title: 'Overdue Reminder',
          message: r.title,
          key,
        });
      }
    });

    newNotifications.forEach(n => notificationStore.add(n));
    return newNotifications;
  },
};

// Initialize with some sample reminders
export function initializeReminders() {
  if ((getItem(KEYS.REMINDERS) || []).length === 0) {
    const now = new Date();
    reminderStore.create({
      title: 'Monthly stock count - Warehouse A',
      description: 'Perform physical inventory count for Main Warehouse',
      type: 'stock_count',
      priority: 'high',
      dueDate: new Date(now.getTime() + 2 * 86400000).toISOString(),
    });
    reminderStore.create({
      title: 'Reorder Motor Bearings',
      description: 'Stock critically low - contact supplier ASAP',
      type: 'reorder',
      priority: 'critical',
      dueDate: new Date(now.getTime() + 1 * 86400000).toISOString(),
    });
    reminderStore.create({
      title: 'Check packaging supplies',
      description: 'Verify Bubble Wrap and Cardboard Box stock levels',
      type: 'stock_check',
      priority: 'medium',
      dueDate: new Date(now.getTime() + 5 * 86400000).toISOString(),
    });
    reminderStore.create({
      title: 'Supplier meeting - MetalWorks Inc.',
      description: 'Discuss bulk pricing for Steel Rods and Copper Wire',
      type: 'meeting',
      priority: 'medium',
      dueDate: new Date(now.getTime() + 7 * 86400000).toISOString(),
    });
  }

  // Generate smart notifications on load
  if ((getItem(KEYS.NOTIFICATIONS) || []).length === 0) {
    notificationStore.add({ type: 'info', icon: '👋', title: 'Welcome to StockFlow!', message: 'Your AI-powered inventory system is ready.', key: 'welcome' });
    notificationStore.add({ type: 'info', icon: '🤖', title: 'AI Insights Available', message: 'Check the AI Insights page for smart analytics and forecasting.', key: 'ai_intro' });
  }
}
