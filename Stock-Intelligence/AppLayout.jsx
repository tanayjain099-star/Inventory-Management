import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import NotificationCenter from '../NotificationCenter';
import AIChatbot from '../AIChatbot';

export default function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Loading StockFlow...</div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main className="main-content">
        <header className="main-header">
          <div style={{ flex: 1 }}></div>
          <NotificationCenter />
        </header>
        <div className="content-area">
          <Outlet />
        </div>
        <AIChatbot />
      </main>
    </div>
  );
}
