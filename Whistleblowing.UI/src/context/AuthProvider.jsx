import { useState } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

const getStoredAuth = () => {
  const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
  const token = storage.getItem('token');
  if (!token) return { token: null, user: null };
  try {
    return { token, user: JSON.parse(storage.getItem('user')) };
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    return { token: null, user: null };
  }
};

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(getStoredAuth);

  const login = async (email, password, rememberMe = false) => {
    const response = await axios.post('/api/Auth/login', { email, password });
    const nextAuth = { token: response.data.token, user: response.data.user };
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('token', nextAuth.token);
    storage.setItem('user', JSON.stringify(nextAuth.user));
    setAuth(nextAuth);
    return nextAuth.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setAuth({ token: null, user: null });
  };

  const updateUser = user => {
    const nextAuth = { ...auth, user };
    const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(user));
    setAuth(nextAuth);
  };

  return <AuthContext.Provider value={{ ...auth, login, logout, updateUser }}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
