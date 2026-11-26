import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

// Context = مكان مشترك لبيانات المستخدم، بدل ما نمرّرها يدوياً بين كل component
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // عند فتح الموقع: إذا في token محفوظ، بنسأل السيرفر مين صاحبه
  useEffect(() => {
    const clear = () => setUser(null);
    window.addEventListener('auth-expired', clear);
    if (localStorage.getItem('token')) {
      api('/auth/me').then((d) => setUser(d.user)).catch(clear).finally(() => setLoading(false));
    } else setLoading(false);
    return () => window.removeEventListener('auth-expired', clear);
  }, []);

  async function authenticate(path, body) {
    const d = await api(path, { method: 'POST', body });
    localStorage.setItem('token', d.token);
    setUser(d.user);
  }

  const value = {
    user,
    loading,
    login: (email, password) => authenticate('/auth/login', { email, password }),
    register: (name, email, password) => authenticate('/auth/register', { name, email, password }),
    logout: () => {
      localStorage.removeItem('token');
      setUser(null);
    },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
