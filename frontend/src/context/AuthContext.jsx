import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

/**
 * Custom Hook pentru accesarea Auth Context
 * 
 * @returns {Object} { user, token, loading, login, register, logout, isAuthenticated }
 * @throws {Error} Dacă este folosit în afara AuthProvider
 * @example
 * const { user, login, logout, isAuthenticated } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

/**
 * Auth Provider Component
 * Gestionează starea de autentificare la nivel global
 * Sincronizează token-ul și user-ul cu localStorage
 * 
 * @param {Object} children - Componente copil
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  /**
   * Autentifică utilizatorul
   * 
   * @param {string} email - Email-ul utilizatorului
   * @param {string} password - Parola utilizatorului
   * @returns {Object} { success: boolean, error?: string }
   */
  const login = async (email, password) => {
    try {
      const data = await authAPI.login({ email, password });
      
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      return { success: false, error: message };
    }
  };

  /**
   * Înregistrează utilizator nou și autentifică automat
   * 
   * @param {string} username - Username-ul utilizatorului
   * @param {string} email - Email-ul utilizatorului
   * @param {string} password - Parola utilizatorului
   * @returns {Object} { success: boolean, error?: string }
   */
  const register = async (username, email, password) => {
    try {
      const data = await authAPI.register({ username, email, password });
      
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      return { success: false, error: message };
    }
  };

  /**
   * Deautentifică utilizatorul și curăță localStorage
   */
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  /**
   * Verifică dacă utilizatorul este autentificat
   * 
   * @returns {boolean} True dacă există token și user
   */
  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    updateUser,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};