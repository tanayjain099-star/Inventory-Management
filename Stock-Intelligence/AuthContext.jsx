import { createContext, useContext, useState, useEffect } from 'react';
import { authStore } from '../store/inventoryStore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authStore.getCurrentUser();
    if (currentUser) setUser(currentUser);
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const result = authStore.login(email, password);
    if (result.user) setUser(result.user);
    return result;
  };

  const signup = (userData) => {
    const result = authStore.signup(userData);
    if (result.user) setUser(result.user);
    return result;
  };

  const logout = () => {
    authStore.logout();
    setUser(null);
  };

  const resetPassword = (email, newPassword) => {
    return authStore.resetPassword(email, newPassword);
  };

  const updateProfile = (updates) => {
    const updatedUser = authStore.updateProfile(updates);
    if (updatedUser) setUser(updatedUser);
    return updatedUser;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, resetPassword, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
