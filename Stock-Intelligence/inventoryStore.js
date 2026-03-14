// Inventory Management System - Central Data Store (localStorage-based)

const KEYS = {
  PRODUCTS: 'ims_products',
  CATEGORIES: 'ims_categories',
  RECEIPTS: 'ims_receipts',
  DELIVERIES: 'ims_deliveries',
  TRANSFERS: 'ims_transfers',
  ADJUSTMENTS: 'ims_adjustments',
  WAREHOUSES: 'ims_warehouses',
  MOVE_HISTORY: 'ims_move_history',
  USERS: 'ims_users',
  CURRENT_USER: 'ims_current_user',
};

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function getItem(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ===== SEED DATA =====
const SEED_CATEGORIES = [
  { id: 'cat1', name: 'Raw Materials', color: '#6366f1' },
  { id: 'cat2', name: 'Finished Goods', color: '#10b981' },
  { id: 'cat3', name: 'Packaging', color: '#f59e0b' },
  { id: 'cat4', name: 'Spare Parts', color: '#ef4444' },
  { id: 'cat5', name: 'Office Supplies', color: '#8b5cf6' },
];

const SEED_WAREHOUSES = [
  { id: 'wh1', name: 'Main Warehouse', code: 'WH-MAIN', address: '123 Industrial Ave, Block A', locations: ['Rack A1', 'Rack A2', 'Rack B1', 'Rack B2', 'Shelf C1'] },
  { id: 'wh2', name: 'Production Floor', code: 'WH-PROD', address: '123 Industrial Ave, Block B', locations: ['Station 1', 'Station 2', 'Station 3'] },
  { id: 'wh3', name: 'Dispatch Center', code: 'WH-DISP', address: '456 Logistics Rd', locations: ['Bay 1', 'Bay 2', 'Bay 3', 'Bay 4'] },
];

const SEED_PRODUCTS = [
  { id: 'p1', name: 'Steel Rods', sku: 'STL-001', category: 'cat1', unit: 'kg', stock: { wh1: 250, wh2: 50 }, reorderLevel: 100, reorderQty: 200, createdAt: '2026-03-01T10:00:00' },
  { id: 'p2', name: 'Aluminum Sheets', sku: 'ALU-002', category: 'cat1', unit: 'pcs', stock: { wh1: 120 }, reorderLevel: 50, reorderQty: 100, createdAt: '2026-03-01T10:00:00' },
  { id: 'p3', name: 'Office Chairs', sku: 'FNG-003', category: 'cat2', unit: 'pcs', stock: { wh1: 45, wh3: 15 }, reorderLevel: 20, reorderQty: 50, createdAt: '2026-03-02T09:00:00' },
  { id: 'p4', name: 'Standing Desks', sku: 'FNG-004', category: 'cat2', unit: 'pcs', stock: { wh1: 30, wh3: 8 }, reorderLevel: 10, reorderQty: 25, createdAt: '2026-03-02T09:00:00' },
  { id: 'p5', name: 'Cardboard Boxes (Large)', sku: 'PKG-005', category: 'cat3', unit: 'pcs', stock: { wh1: 500, wh3: 200 }, reorderLevel: 100, reorderQty: 500, createdAt: '2026-03-03T11:00:00' },
  { id: 'p6', name: 'Bubble Wrap Roll', sku: 'PKG-006', category: 'cat3', unit: 'rolls', stock: { wh3: 30 }, reorderLevel: 10, reorderQty: 50, createdAt: '2026-03-03T11:00:00' },
  { id: 'p7', name: 'Motor Bearings', sku: 'SPR-007', category: 'cat4', unit: 'pcs', stock: { wh1: 8 }, reorderLevel: 15, reorderQty: 30, createdAt: '2026-03-04T08:00:00' },
  { id: 'p8', name: 'Conveyor Belt', sku: 'SPR-008', category: 'cat4', unit: 'meters', stock: { wh2: 25 }, reorderLevel: 10, reorderQty: 50, createdAt: '2026-03-05T14:00:00' },
  { id: 'p9', name: 'Printer Paper A4', sku: 'OFF-009', category: 'cat5', unit: 'reams', stock: { wh1: 3 }, reorderLevel: 10, reorderQty: 50, createdAt: '2026-03-06T10:00:00' },
  { id: 'p10', name: 'Copper Wire', sku: 'STL-010', category: 'cat1', unit: 'meters', stock: { wh1: 500, wh2: 100 }, reorderLevel: 200, reorderQty: 400, createdAt: '2026-03-07T10:00:00' },
];

const SEED_RECEIPTS = [
  { id: 'r1', reference: 'REC-001', supplier: 'MetalWorks Inc.', warehouse: 'wh1', status: 'done', items: [{ productId: 'p1', qty: 100 }], createdAt: '2026-03-10T09:00:00', validatedAt: '2026-03-10T10:30:00' },
  { id: 'r2', reference: 'REC-002', supplier: 'AlumiCorp', warehouse: 'wh1', status: 'done', items: [{ productId: 'p2', qty: 50 }], createdAt: '2026-03-11T08:00:00', validatedAt: '2026-03-11T09:00:00' },
  { id: 'r3', reference: 'REC-003', supplier: 'FurniturePro', warehouse: 'wh1', status: 'waiting', items: [{ productId: 'p3', qty: 20 }, { productId: 'p4', qty: 10 }], createdAt: '2026-03-13T14:00:00', validatedAt: null },
  { id: 'r4', reference: 'REC-004', supplier: 'PackagingWorld', warehouse: 'wh3', status: 'draft', items: [{ productId: 'p5', qty: 300 }], createdAt: '2026-03-14T07:00:00', validatedAt: null },
];

const SEED_DELIVERIES = [
  { id: 'd1', reference: 'DEL-001', customer: 'BuildCo Ltd.', warehouse: 'wh1', status: 'done', items: [{ productId: 'p1', qty: 50 }], createdAt: '2026-03-11T11:00:00', validatedAt: '2026-03-11T14:00:00' },
  { id: 'd2', reference: 'DEL-002', customer: 'OfficeHub', warehouse: 'wh3', status: 'ready', items: [{ productId: 'p3', qty: 10 }], createdAt: '2026-03-13T10:00:00', validatedAt: null },
  { id: 'd3', reference: 'DEL-003', customer: 'TechStart Inc.', warehouse: 'wh1', status: 'waiting', items: [{ productId: 'p4', qty: 5 }, { productId: 'p3', qty: 5 }], createdAt: '2026-03-14T08:00:00', validatedAt: null },
];

const SEED_TRANSFERS = [
  { id: 't1', reference: 'TRF-001', fromWarehouse: 'wh1', toWarehouse: 'wh2', status: 'done', items: [{ productId: 'p1', qty: 50 }], createdAt: '2026-03-10T15:00:00', validatedAt: '2026-03-10T16:00:00' },
  { id: 't2', reference: 'TRF-002', fromWarehouse: 'wh1', toWarehouse: 'wh3', status: 'waiting', items: [{ productId: 'p5', qty: 100 }], createdAt: '2026-03-13T16:00:00', validatedAt: null },
];

const SEED_ADJUSTMENTS = [
  { id: 'a1', reference: 'ADJ-001', warehouse: 'wh1', reason: 'Damaged goods', status: 'done', items: [{ productId: 'p7', qty: -2, counted: 6, recorded: 8 }], createdAt: '2026-03-12T10:00:00' },
];

const SEED_MOVE_HISTORY = [
  { id: 'mh1', type: 'receipt', reference: 'REC-001', productId: 'p1', qty: 100, warehouse: 'wh1', date: '2026-03-10T10:30:00', note: 'Received from MetalWorks Inc.' },
  { id: 'mh2', type: 'transfer', reference: 'TRF-001', productId: 'p1', qty: -50, warehouse: 'wh1', date: '2026-03-10T16:00:00', note: 'Transferred to Production Floor' },
  { id: 'mh3', type: 'transfer', reference: 'TRF-001', productId: 'p1', qty: 50, warehouse: 'wh2', date: '2026-03-10T16:00:00', note: 'Received from Main Warehouse' },
  { id: 'mh4', type: 'receipt', reference: 'REC-002', productId: 'p2', qty: 50, warehouse: 'wh1', date: '2026-03-11T09:00:00', note: 'Received from AlumiCorp' },
  { id: 'mh5', type: 'delivery', reference: 'DEL-001', productId: 'p1', qty: -50, warehouse: 'wh1', date: '2026-03-11T14:00:00', note: 'Delivered to BuildCo Ltd.' },
  { id: 'mh6', type: 'adjustment', reference: 'ADJ-001', productId: 'p7', qty: -2, warehouse: 'wh1', date: '2026-03-12T10:00:00', note: 'Damaged goods - physical count mismatch' },
];

// ===== INITIALIZATION =====
export function initializeStore() {
  if (!getItem(KEYS.CATEGORIES)) setItem(KEYS.CATEGORIES, SEED_CATEGORIES);
  if (!getItem(KEYS.WAREHOUSES)) setItem(KEYS.WAREHOUSES, SEED_WAREHOUSES);
  if (!getItem(KEYS.PRODUCTS)) setItem(KEYS.PRODUCTS, SEED_PRODUCTS);
  if (!getItem(KEYS.RECEIPTS)) setItem(KEYS.RECEIPTS, SEED_RECEIPTS);
  if (!getItem(KEYS.DELIVERIES)) setItem(KEYS.DELIVERIES, SEED_DELIVERIES);
  if (!getItem(KEYS.TRANSFERS)) setItem(KEYS.TRANSFERS, SEED_TRANSFERS);
  if (!getItem(KEYS.ADJUSTMENTS)) setItem(KEYS.ADJUSTMENTS, SEED_ADJUSTMENTS);
  if (!getItem(KEYS.MOVE_HISTORY)) setItem(KEYS.MOVE_HISTORY, SEED_MOVE_HISTORY);
}

// ===== GENERIC CRUD =====
function getAll(key) {
  return getItem(key) || [];
}

function getById(key, id) {
  return getAll(key).find(item => item.id === id);
}

function create(key, item) {
  const items = getAll(key);
  const newItem = { ...item, id: generateId() };
  items.push(newItem);
  setItem(key, items);
  return newItem;
}

function update(key, id, updates) {
  const items = getAll(key);
  const idx = items.findIndex(item => item.id === id);
  if (idx >= 0) {
    items[idx] = { ...items[idx], ...updates };
    setItem(key, items);
    return items[idx];
  }
  return null;
}

function remove(key, id) {
  const items = getAll(key).filter(item => item.id !== id);
  setItem(key, items);
}

// ===== PRODUCTS =====
export const productStore = {
  getAll: () => getAll(KEYS.PRODUCTS),
  getById: (id) => getById(KEYS.PRODUCTS, id),
  create: (product) => create(KEYS.PRODUCTS, { ...product, stock: product.stock || {}, createdAt: new Date().toISOString() }),
  update: (id, updates) => update(KEYS.PRODUCTS, id, updates),
  delete: (id) => remove(KEYS.PRODUCTS, id),
  getTotalStock: (product) => {
    if (!product || !product.stock) return 0;
    return Object.values(product.stock).reduce((sum, qty) => sum + qty, 0);
  },
  getLowStockProducts: () => {
    return getAll(KEYS.PRODUCTS).filter(p => {
      const total = Object.values(p.stock || {}).reduce((s, q) => s + q, 0);
      return total <= p.reorderLevel;
    });
  },
  updateStock: (productId, warehouseId, qtyChange) => {
    const products = getAll(KEYS.PRODUCTS);
    const idx = products.findIndex(p => p.id === productId);
    if (idx >= 0) {
      if (!products[idx].stock) products[idx].stock = {};
      products[idx].stock[warehouseId] = (products[idx].stock[warehouseId] || 0) + qtyChange;
      if (products[idx].stock[warehouseId] < 0) products[idx].stock[warehouseId] = 0;
      setItem(KEYS.PRODUCTS, products);
    }
  },
};

// ===== CATEGORIES =====
export const categoryStore = {
  getAll: () => getAll(KEYS.CATEGORIES),
  getById: (id) => getById(KEYS.CATEGORIES, id),
  create: (cat) => create(KEYS.CATEGORIES, cat),
  update: (id, updates) => update(KEYS.CATEGORIES, id, updates),
  delete: (id) => remove(KEYS.CATEGORIES, id),
};

// ===== WAREHOUSES =====
export const warehouseStore = {
  getAll: () => getAll(KEYS.WAREHOUSES),
  getById: (id) => getById(KEYS.WAREHOUSES, id),
  create: (wh) => create(KEYS.WAREHOUSES, wh),
  update: (id, updates) => update(KEYS.WAREHOUSES, id, updates),
  delete: (id) => remove(KEYS.WAREHOUSES, id),
};

// ===== RECEIPTS =====
export const receiptStore = {
  getAll: () => getAll(KEYS.RECEIPTS),
  getById: (id) => getById(KEYS.RECEIPTS, id),
  create: (receipt) => create(KEYS.RECEIPTS, { ...receipt, status: 'draft', createdAt: new Date().toISOString(), validatedAt: null }),
  update: (id, updates) => update(KEYS.RECEIPTS, id, updates),
  delete: (id) => remove(KEYS.RECEIPTS, id),
  validate: (id) => {
    const receipt = getById(KEYS.RECEIPTS, id);
    if (!receipt) return;
    receipt.items.forEach(item => {
      productStore.updateStock(item.productId, receipt.warehouse, item.qty);
      addMoveHistory({
        type: 'receipt', reference: receipt.reference, productId: item.productId,
        qty: item.qty, warehouse: receipt.warehouse,
        note: `Received from ${receipt.supplier}`,
      });
    });
    update(KEYS.RECEIPTS, id, { status: 'done', validatedAt: new Date().toISOString() });
  },
};

// ===== DELIVERIES =====
export const deliveryStore = {
  getAll: () => getAll(KEYS.DELIVERIES),
  getById: (id) => getById(KEYS.DELIVERIES, id),
  create: (delivery) => create(KEYS.DELIVERIES, { ...delivery, status: 'draft', createdAt: new Date().toISOString(), validatedAt: null }),
  update: (id, updates) => update(KEYS.DELIVERIES, id, updates),
  delete: (id) => remove(KEYS.DELIVERIES, id),
  validate: (id) => {
    const delivery = getById(KEYS.DELIVERIES, id);
    if (!delivery) return;
    delivery.items.forEach(item => {
      productStore.updateStock(item.productId, delivery.warehouse, -item.qty);
      addMoveHistory({
        type: 'delivery', reference: delivery.reference, productId: item.productId,
        qty: -item.qty, warehouse: delivery.warehouse,
        note: `Delivered to ${delivery.customer}`,
      });
    });
    update(KEYS.DELIVERIES, id, { status: 'done', validatedAt: new Date().toISOString() });
  },
};

// ===== TRANSFERS =====
export const transferStore = {
  getAll: () => getAll(KEYS.TRANSFERS),
  getById: (id) => getById(KEYS.TRANSFERS, id),
  create: (transfer) => create(KEYS.TRANSFERS, { ...transfer, status: 'draft', createdAt: new Date().toISOString(), validatedAt: null }),
  update: (id, updates) => update(KEYS.TRANSFERS, id, updates),
  delete: (id) => remove(KEYS.TRANSFERS, id),
  validate: (id) => {
    const transfer = getById(KEYS.TRANSFERS, id);
    if (!transfer) return;
    const fromWh = warehouseStore.getById(transfer.fromWarehouse);
    const toWh = warehouseStore.getById(transfer.toWarehouse);
    transfer.items.forEach(item => {
      productStore.updateStock(item.productId, transfer.fromWarehouse, -item.qty);
      productStore.updateStock(item.productId, transfer.toWarehouse, item.qty);
      addMoveHistory({
        type: 'transfer', reference: transfer.reference, productId: item.productId,
        qty: -item.qty, warehouse: transfer.fromWarehouse,
        note: `Transferred to ${toWh?.name || 'Unknown'}`,
      });
      addMoveHistory({
        type: 'transfer', reference: transfer.reference, productId: item.productId,
        qty: item.qty, warehouse: transfer.toWarehouse,
        note: `Received from ${fromWh?.name || 'Unknown'}`,
      });
    });
    update(KEYS.TRANSFERS, id, { status: 'done', validatedAt: new Date().toISOString() });
  },
};

// ===== ADJUSTMENTS =====
export const adjustmentStore = {
  getAll: () => getAll(KEYS.ADJUSTMENTS),
  getById: (id) => getById(KEYS.ADJUSTMENTS, id),
  create: (adj) => create(KEYS.ADJUSTMENTS, { ...adj, status: 'done', createdAt: new Date().toISOString() }),
  applyAdjustment: (warehouse, productId, counted, reason) => {
    const product = productStore.getById(productId);
    if (!product) return;
    const recorded = product.stock?.[warehouse] || 0;
    const diff = counted - recorded;
    const reference = 'ADJ-' + String(getAll(KEYS.ADJUSTMENTS).length + 1).padStart(3, '0');
    const adj = create(KEYS.ADJUSTMENTS, {
      reference, warehouse, reason, status: 'done',
      items: [{ productId, qty: diff, counted, recorded }],
      createdAt: new Date().toISOString(),
    });
    productStore.updateStock(productId, warehouse, diff);
    addMoveHistory({
      type: 'adjustment', reference, productId, qty: diff, warehouse,
      note: `${reason} - counted: ${counted}, recorded: ${recorded}`,
    });
    return adj;
  },
};

// ===== MOVE HISTORY =====
function addMoveHistory(entry) {
  const history = getAll(KEYS.MOVE_HISTORY);
  history.push({ ...entry, id: generateId(), date: new Date().toISOString() });
  setItem(KEYS.MOVE_HISTORY, history);
}

export const moveHistoryStore = {
  getAll: () => getAll(KEYS.MOVE_HISTORY).sort((a, b) => new Date(b.date) - new Date(a.date)),
};

// ===== AUTH =====
export const authStore = {
  getUsers: () => getAll(KEYS.USERS),
  getCurrentUser: () => getItem(KEYS.CURRENT_USER),
  signup: (user) => {
    const users = getAll(KEYS.USERS);
    if (users.find(u => u.email === user.email)) return { error: 'Email already exists' };
    const newUser = { ...user, id: generateId(), createdAt: new Date().toISOString() };
    users.push(newUser);
    setItem(KEYS.USERS, users);
    setItem(KEYS.CURRENT_USER, newUser);
    return { user: newUser };
  },
  login: (email, password) => {
    const users = getAll(KEYS.USERS);
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return { error: 'Invalid email or password' };
    setItem(KEYS.CURRENT_USER, user);
    return { user };
  },
  logout: () => {
    localStorage.removeItem(KEYS.CURRENT_USER);
  },
  resetPassword: (email, newPassword) => {
    const users = getAll(KEYS.USERS);
    const idx = users.findIndex(u => u.email === email);
    if (idx < 0) return { error: 'Email not found' };
    users[idx].password = newPassword;
    setItem(KEYS.USERS, users);
    return { success: true };
  },
  updateProfile: (updates) => {
    const user = getItem(KEYS.CURRENT_USER);
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setItem(KEYS.CURRENT_USER, updatedUser);
    const users = getAll(KEYS.USERS);
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      users[idx] = updatedUser;
      setItem(KEYS.USERS, users);
    }
    return updatedUser;
  },
};

// ===== DASHBOARD STATS =====
export function getDashboardStats() {
  const products = productStore.getAll();
  const receipts = receiptStore.getAll();
  const deliveries = deliveryStore.getAll();
  const transfers = transferStore.getAll();

  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + productStore.getTotalStock(p), 0);
  const lowStockItems = productStore.getLowStockProducts();
  const outOfStock = products.filter(p => productStore.getTotalStock(p) === 0);
  const pendingReceipts = receipts.filter(r => r.status !== 'done' && r.status !== 'canceled');
  const pendingDeliveries = deliveries.filter(d => d.status !== 'done' && d.status !== 'canceled');
  const scheduledTransfers = transfers.filter(t => t.status !== 'done' && t.status !== 'canceled');

  // Category distribution
  const categories = categoryStore.getAll();
  const categoryDistribution = categories.map(cat => ({
    name: cat.name,
    value: products.filter(p => p.category === cat.id).length,
    color: cat.color,
  }));

  // Stock by warehouse
  const warehouses = warehouseStore.getAll();
  const stockByWarehouse = warehouses.map(wh => ({
    name: wh.name,
    stock: products.reduce((sum, p) => sum + (p.stock?.[wh.id] || 0), 0),
  }));

  return {
    totalProducts,
    totalStock,
    lowStockItems,
    outOfStock,
    pendingReceipts,
    pendingDeliveries,
    scheduledTransfers,
    categoryDistribution,
    stockByWarehouse,
  };
}
