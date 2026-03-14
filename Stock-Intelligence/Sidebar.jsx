import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiOutlineViewGrid, HiOutlineCube, HiOutlineTag,
  HiOutlineDocumentDownload, HiOutlineTruck, HiOutlineSwitchHorizontal,
  HiOutlineAdjustments, HiOutlineClock, HiOutlineOfficeBuilding,
  HiOutlineUser, HiOutlineLogout, HiOutlineSparkles, HiOutlineBell,
} from 'react-icons/hi';
import { productStore } from '../../store/inventoryStore';
import { reminderStore } from '../../store/reminderStore';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const lowStock = productStore.getLowStockProducts().length;
  const overdueReminders = reminderStore.getOverdue().length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">📦</div>
          <div>
            <h2>StockFlow</h2>
            <span>Inventory System</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <div className="sidebar-section-title">Overview</div>
          <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <HiOutlineViewGrid /> Dashboard
          </NavLink>
          <NavLink to="/ai-insights" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <HiOutlineSparkles style={{ color: 'var(--accent-secondary)' }} /> AI Insights
          </NavLink>
          <NavLink to="/reminders" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <HiOutlineBell /> Reminders
            {overdueReminders > 0 && <span className="sidebar-badge" style={{ background: '#ef4444' }}>{overdueReminders}</span>}
          </NavLink>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">Inventory</div>
          <NavLink to="/products" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <HiOutlineCube /> Products
            {lowStock > 0 && <span className="sidebar-badge">{lowStock}</span>}
          </NavLink>
          <NavLink to="/categories" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <HiOutlineTag /> Categories
          </NavLink>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">Operations</div>
          <NavLink to="/receipts" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <HiOutlineDocumentDownload /> Receipts
          </NavLink>
          <NavLink to="/deliveries" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <HiOutlineTruck /> Deliveries
          </NavLink>
          <NavLink to="/transfers" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <HiOutlineSwitchHorizontal /> Transfers
          </NavLink>
          <NavLink to="/adjustments" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <HiOutlineAdjustments /> Adjustments
          </NavLink>
          <NavLink to="/move-history" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <HiOutlineClock /> Move History
          </NavLink>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">Settings</div>
          <NavLink to="/warehouses" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <HiOutlineOfficeBuilding /> Warehouses
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <HiOutlineUser /> My Profile
          </NavLink>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={() => navigate('/profile')}>
          <div className="sidebar-avatar">{initial}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || 'User'}</div>
            <div className="sidebar-user-email">{user?.email || ''}</div>
          </div>
        </div>
        <button className="sidebar-link" onClick={handleLogout} style={{ marginTop: 4, color: '#ef4444' }}>
          <HiOutlineLogout /> Logout
        </button>
      </div>
    </aside>
  );
}
