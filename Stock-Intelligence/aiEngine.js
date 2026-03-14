// AI Engine - Smart Analytics, Forecasting, and Recommendations
import { productStore, categoryStore, warehouseStore, moveHistoryStore, receiptStore, deliveryStore, transferStore, adjustmentStore } from './inventoryStore';

// ===== DEMAND FORECASTING =====
export function getDemandForecast() {
  const history = moveHistoryStore.getAll();
  const products = productStore.getAll();
  const deliveries = history.filter(h => h.type === 'delivery');

  return products.map(product => {
    const productDeliveries = deliveries.filter(d => d.productId === product.id);
    const totalDemand = productDeliveries.reduce((sum, d) => sum + Math.abs(d.qty), 0);
    const avgDailyDemand = totalDemand / Math.max(1, 14); // over 2 weeks
    const currentStock = productStore.getTotalStock(product);
    const daysUntilStockout = avgDailyDemand > 0 ? Math.floor(currentStock / avgDailyDemand) : 999;
    const weeklyForecast = Math.round(avgDailyDemand * 7);
    const monthlyForecast = Math.round(avgDailyDemand * 30);
    const suggestedReorder = Math.max(product.reorderQty, monthlyForecast);
    const urgency = daysUntilStockout <= 3 ? 'critical' : daysUntilStockout <= 7 ? 'high' : daysUntilStockout <= 14 ? 'medium' : 'low';

    return {
      product,
      totalDemand,
      avgDailyDemand: Math.round(avgDailyDemand * 10) / 10,
      currentStock,
      daysUntilStockout,
      weeklyForecast,
      monthlyForecast,
      suggestedReorder,
      urgency,
    };
  }).sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);
}

// ===== ANOMALY DETECTION =====
export function detectAnomalies() {
  const products = productStore.getAll();
  const history = moveHistoryStore.getAll();
  const anomalies = [];

  products.forEach(product => {
    const totalStock = productStore.getTotalStock(product);

    // Dead stock detection
    const productMovements = history.filter(h => h.productId === product.id);
    const lastMovement = productMovements[0];
    if (lastMovement) {
      const daysSinceMovement = Math.floor((new Date() - new Date(lastMovement.date)) / 86400000);
      if (daysSinceMovement > 30 && totalStock > 0) {
        anomalies.push({
          type: 'dead_stock',
          severity: 'warning',
          product: product.name,
          message: `No movement in ${daysSinceMovement} days with ${totalStock} units in stock`,
          suggestion: 'Consider running a promotion or redistributing to active locations',
          icon: '💤',
        });
      }
    }

    // Overstock detection
    if (totalStock > product.reorderLevel * 5) {
      anomalies.push({
        type: 'overstock',
        severity: 'info',
        product: product.name,
        message: `Stock level (${totalStock}) is ${Math.round(totalStock / product.reorderLevel)}x above reorder level`,
        suggestion: 'Reduce incoming orders or redistribute to other locations',
        icon: '📈',
      });
    }

    // Critical understock
    if (totalStock === 0) {
      anomalies.push({
        type: 'stockout',
        severity: 'critical',
        product: product.name,
        message: 'Completely out of stock!',
        suggestion: `Create an urgent receipt order for at least ${product.reorderQty} units`,
        icon: '🚨',
      });
    } else if (totalStock <= product.reorderLevel * 0.5) {
      anomalies.push({
        type: 'critical_low',
        severity: 'critical',
        product: product.name,
        message: `Stock (${totalStock}) is critically below reorder level (${product.reorderLevel})`,
        suggestion: `Immediately order ${product.reorderQty} units from supplier`,
        icon: '⚠️',
      });
    }

    // Unbalanced warehouse distribution
    const stockEntries = Object.entries(product.stock || {}).filter(([, q]) => q > 0);
    if (stockEntries.length >= 2) {
      const values = stockEntries.map(([, q]) => q);
      const max = Math.max(...values);
      const min = Math.min(...values);
      if (max > min * 5) {
        anomalies.push({
          type: 'imbalance',
          severity: 'info',
          product: product.name,
          message: `Uneven distribution across warehouses (ratio ${Math.round(max / min)}:1)`,
          suggestion: 'Consider internal transfer to balance stock across locations',
          icon: '⚖️',
        });
      }
    }
  });

  return anomalies.sort((a, b) => {
    const sev = { critical: 0, warning: 1, info: 2 };
    return (sev[a.severity] || 3) - (sev[b.severity] || 3);
  });
}

// ===== OPTIMIZATION SUGGESTIONS =====
export function getOptimizationSuggestions() {
  const products = productStore.getAll();
  const warehouses = warehouseStore.getAll();
  const history = moveHistoryStore.getAll();
  const suggestions = [];

  // Warehouse utilization analysis
  warehouses.forEach(wh => {
    const whStock = products.reduce((sum, p) => sum + (p.stock?.[wh.id] || 0), 0);
    const productCount = products.filter(p => (p.stock?.[wh.id] || 0) > 0).length;
    if (productCount === 0 && whStock === 0) {
      suggestions.push({
        type: 'warehouse',
        title: `${wh.name} is empty`,
        detail: 'This warehouse has no stock. Consider decommissioning or redistributing inventory here.',
        impact: 'Cost Saving',
        icon: '🏭',
      });
    }
  });

  // Reorder optimization
  const lowStock = productStore.getLowStockProducts();
  if (lowStock.length > 3) {
    suggestions.push({
      type: 'bulk_reorder',
      title: `Bulk reorder opportunity`,
      detail: `${lowStock.length} products are below reorder level. Consolidating orders from the same suppliers can reduce shipping costs by 15-20%.`,
      impact: 'Cost Saving',
      icon: '📦',
    });
  }

  // Fast-moving items analysis
  const productDemand = products.map(p => {
    const deliveries = history.filter(h => h.productId === p.id && h.type === 'delivery');
    return { product: p, demand: deliveries.reduce((s, d) => s + Math.abs(d.qty), 0) };
  }).sort((a, b) => b.demand - a.demand);

  if (productDemand[0]?.demand > 0) {
    suggestions.push({
      type: 'fast_moving',
      title: `${productDemand[0].product.name} is your fastest-moving product`,
      detail: `With ${productDemand[0].demand} units shipped, consider negotiating bulk pricing with suppliers and keeping safety stock at 1.5x reorder level.`,
      impact: 'Revenue Growth',
      icon: '🚀',
    });
  }

  // ABC Analysis
  const totalValue = products.reduce((sum, p) => sum + productStore.getTotalStock(p), 0);
  const classA = products.filter(p => productStore.getTotalStock(p) > totalValue * 0.1);
  if (classA.length > 0) {
    suggestions.push({
      type: 'abc',
      title: 'ABC Analysis Available',
      detail: `${classA.length} high-value items (Class A) should be cycle-counted weekly. ${products.length - classA.length} other items can be counted monthly.`,
      impact: 'Efficiency',
      icon: '📊',
    });
  }

  // Transfer optimization
  const transfers = transferStore.getAll();
  if (transfers.length > 0) {
    suggestions.push({
      type: 'transfer_opt',
      title: 'Optimize transfer routes',
      detail: 'Batch internal transfers by scheduling. Consolidating transfers can reduce handling time by 30%.',
      impact: 'Efficiency',
      icon: '🔄',
    });
  }

  return suggestions;
}

// ===== AI SCORE =====
export function getInventoryHealthScore() {
  const products = productStore.getAll();
  const totalProducts = products.length;
  if (totalProducts === 0) return { score: 100, grade: 'A+', factors: [] };

  const factors = [];
  let score = 100;

  // Stock availability
  const outOfStock = products.filter(p => productStore.getTotalStock(p) === 0).length;
  const outOfStockPenalty = (outOfStock / totalProducts) * 30;
  score -= outOfStockPenalty;
  factors.push({ label: 'Stock Availability', value: Math.round(100 - outOfStockPenalty * 3.3), status: outOfStock === 0 ? 'good' : 'bad' });

  // Low stock ratio
  const lowStock = productStore.getLowStockProducts().length;
  const lowStockPenalty = (lowStock / totalProducts) * 20;
  score -= lowStockPenalty;
  factors.push({ label: 'Stock Health', value: Math.round(100 - lowStockPenalty * 5), status: lowStock <= 2 ? 'good' : 'warning' });

  // Pending operations
  const pendingReceipts = receiptStore.getAll().filter(r => r.status !== 'done' && r.status !== 'canceled').length;
  const pendingDeliveries = deliveryStore.getAll().filter(d => d.status !== 'done' && d.status !== 'canceled').length;
  const pendingPenalty = Math.min(15, (pendingReceipts + pendingDeliveries) * 3);
  score -= pendingPenalty;
  factors.push({ label: 'Operations Flow', value: Math.round(100 - pendingPenalty * 6.6), status: pendingPenalty <= 5 ? 'good' : 'warning' });

  // Warehouse distribution
  const warehouses = warehouseStore.getAll();
  const activeWarehouses = warehouses.filter(wh => products.some(p => (p.stock?.[wh.id] || 0) > 0)).length;
  const utilizationScore = warehouses.length > 0 ? Math.round((activeWarehouses / warehouses.length) * 100) : 100;
  if (utilizationScore < 70) score -= 10;
  factors.push({ label: 'Warehouse Utilization', value: utilizationScore, status: utilizationScore >= 70 ? 'good' : 'warning' });

  score = Math.max(0, Math.min(100, Math.round(score)));
  const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : score >= 50 ? 'D' : 'F';

  return { score, grade, factors };
}

// ===== CHATBOT RESPONSES =====
export function getChatbotResponse(query) {
  const q = query.toLowerCase().trim();
  const products = productStore.getAll();
  const warehouses = warehouseStore.getAll();
  const categories = categoryStore.getAll();
  const history = moveHistoryStore.getAll();

  // Stock queries
  if (q.includes('how many') && q.includes('product')) {
    return `📦 You currently have **${products.length} products** across ${warehouses.length} warehouses.`;
  }

  if (q.includes('total stock') || q.includes('total inventory')) {
    const total = products.reduce((s, p) => s + productStore.getTotalStock(p), 0);
    return `📊 Total inventory across all warehouses: **${total} units** across ${products.length} products.`;
  }

  if (q.includes('low stock') || q.includes('running low')) {
    const low = productStore.getLowStockProducts();
    if (low.length === 0) return '✅ All products are above their reorder levels. No low stock items!';
    return `⚠️ **${low.length} products** are below reorder level:\n${low.map(p => `• **${p.name}** (${p.sku}): ${productStore.getTotalStock(p)} units (reorder at ${p.reorderLevel})`).join('\n')}`;
  }

  if (q.includes('out of stock')) {
    const oos = products.filter(p => productStore.getTotalStock(p) === 0);
    if (oos.length === 0) return '✅ No products are out of stock!';
    return `🚨 **${oos.length} products** are out of stock:\n${oos.map(p => `• **${p.name}** (${p.sku})`).join('\n')}`;
  }

  // Product search  
  const productMatch = products.find(p => q.includes(p.name.toLowerCase()) || q.includes(p.sku.toLowerCase()));
  if (productMatch) {
    const total = productStore.getTotalStock(productMatch);
    const stockByWh = Object.entries(productMatch.stock || {}).filter(([, v]) => v > 0)
      .map(([whId, qty]) => `${warehouses.find(w => w.id === whId)?.name || whId}: ${qty}`).join(', ');
    return `📦 **${productMatch.name}** (${productMatch.sku})\n• Total stock: **${total} ${productMatch.unit}**\n• Locations: ${stockByWh || 'No stock'}\n• Reorder level: ${productMatch.reorderLevel}\n• Category: ${categories.find(c => c.id === productMatch.category)?.name || 'N/A'}`;
  }

  // Warehouse queries
  if (q.includes('warehouse')) {
    const whInfo = warehouses.map(wh => {
      const stock = products.reduce((s, p) => s + (p.stock?.[wh.id] || 0), 0);
      const count = products.filter(p => (p.stock?.[wh.id] || 0) > 0).length;
      return `• **${wh.name}** (${wh.code}): ${stock} units, ${count} products`;
    }).join('\n');
    return `🏭 **Warehouse Overview:**\n${whInfo}`;
  }

  // Recent activity
  if (q.includes('recent') || q.includes('activity') || q.includes('latest')) {
    const recent = history.slice(0, 5);
    if (recent.length === 0) return '📋 No recent activity recorded.';
    return `📋 **Recent Activity:**\n${recent.map(h => `• ${h.reference}: ${h.note} (${h.qty > 0 ? '+' : ''}${h.qty})`).join('\n')}`;
  }

  // Health score
  if (q.includes('health') || q.includes('score') || q.includes('status')) {
    const health = getInventoryHealthScore();
    return `🏥 **Inventory Health Score: ${health.score}/100 (${health.grade})**\n${health.factors.map(f => `• ${f.label}: ${f.value}% ${f.status === 'good' ? '✅' : f.status === 'warning' ? '⚠️' : '❌'}`).join('\n')}`;
  }

  // Forecast
  if (q.includes('forecast') || q.includes('predict') || q.includes('demand')) {
    const forecast = getDemandForecast().slice(0, 5);
    return `📈 **Demand Forecast (Top 5):**\n${forecast.map(f => `• **${f.product.name}**: ~${f.weeklyForecast}/week, ${f.daysUntilStockout === 999 ? 'no recent demand' : f.daysUntilStockout + ' days until stockout'}`).join('\n')}`;
  }

  // Suggestions
  if (q.includes('suggest') || q.includes('recommend') || q.includes('optimize')) {
    const suggestions = getOptimizationSuggestions().slice(0, 3);
    if (suggestions.length === 0) return '✅ Everything is optimized! No suggestions at this time.';
    return `💡 **AI Suggestions:**\n${suggestions.map(s => `• ${s.icon} **${s.title}**: ${s.detail}`).join('\n')}`;
  }

  // Help
  if (q.includes('help') || q.includes('what can you')) {
    return `🤖 I can help you with:\n• **"How many products?"** — Product count\n• **"Total stock"** — Overall inventory\n• **"Low stock"** — Items below reorder level\n• **"Out of stock"** — Zero-stock items\n• **"[Product name/SKU]"** — Product details\n• **"Warehouse"** — Warehouse overview\n• **"Recent activity"** — Latest movements\n• **"Health score"** — Inventory health\n• **"Forecast"** — Demand predictions\n• **"Suggestions"** — AI optimization tips`;
  }

  return `🤔 I'm not sure about that. Try asking about:\n• Stock levels, low stock, or out of stock\n• Product names or SKU codes\n• Warehouse overview\n• Health score or forecast\n• Type **"help"** for all commands`;
}
