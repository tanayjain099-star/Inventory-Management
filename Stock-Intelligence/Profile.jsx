import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineBriefcase } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'Inventory Manager',
  });

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile(form);
    toast.success('Profile updated');
  };

  const initial = user?.name?.charAt(0).toUpperCase() || '?';

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account settings</p>
        </div>
      </div>

      <motion.div className="profile-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="profile-header">
          <div className="profile-avatar-large">{initial}</div>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>{user?.name}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{user?.role}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
              Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="glass-card" style={{ padding: 32 }}>
          <form onSubmit={handleSave}>
            <div className="form-grid">
              <div className="input-group">
                <label><HiOutlineUser style={{ verticalAlign: 'middle', marginRight: 6 }} />Full Name</label>
                <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} id="profile-name" />
              </div>
              <div className="input-group">
                <label><HiOutlineMail style={{ verticalAlign: 'middle', marginRight: 6 }} />Email</label>
                <input className="input-field" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} id="profile-email" />
              </div>
              <div className="input-group">
                <label><HiOutlinePhone style={{ verticalAlign: 'middle', marginRight: 6 }} />Phone</label>
                <input className="input-field" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} id="profile-phone" />
              </div>
              <div className="input-group">
                <label><HiOutlineBriefcase style={{ verticalAlign: 'middle', marginRight: 6 }} />Role</label>
                <select className="input-field" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} id="profile-role">
                  <option>Inventory Manager</option>
                  <option>Warehouse Staff</option>
                </select>
              </div>
            </div>
            <div className="form-actions" style={{ marginTop: 28 }}>
              <button type="submit" className="btn btn-primary" id="save-profile-btn">Save Changes</button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
