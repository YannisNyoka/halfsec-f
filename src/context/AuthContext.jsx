import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { warmupBackend } from '../api/warmup';
import AppLoader from '../components/common/AppLoader';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [warming, setWarming] = useState(false);
  const [warmupDone, setWarmupDone] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      // Try auth check directly first (fast if backend is warm)
      const authPromise = api.get('/auth/me');

      // Set a timer — if auth takes more than 2 seconds, show warmup screen
      const warmupTimer = setTimeout(() => {
        setWarming(true);
      }, 2000);

      try {
        const { data } = await authPromise;
        clearTimeout(warmupTimer);
        setUser(data.user);
      } catch (err) {
        clearTimeout(warmupTimer);

        // If it failed due to being slow (not 401), try warmup
        if (!err.response) {
          setWarming(true);
          await warmupBackend();
          setWarming(false);

          // Try auth again after warmup
          try {
            const { data } = await api.get('/auth/me');
            setUser(data.user);
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } finally {
        setWarming(false);
        setWarmupDone(true);
        setLoading(false);
      }
    };

    init();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  // Show loading screen while warming up
  if (loading && warming) {
    return (
      <AppLoader message="Waking up the server, please wait..." />
    );
  }

  if (loading && !warmupDone) {
    return (
      <AppLoader message="Loading Halfsec..." />
    );
  }

  return (
    <AuthContext.Provider value={{
      user, loading, isAdmin, isAuthenticated,
      login, register, logout, checkAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};