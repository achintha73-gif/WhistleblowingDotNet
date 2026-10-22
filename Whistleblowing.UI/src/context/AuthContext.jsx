import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      
      if (parsedUser.roleName) {
        parsedUser.roleName = parsedUser.roleName.toUpperCase();
      }
      setUser(parsedUser);
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const response = await axios.post('/api/Auth/login', { email, password });
    const { token, user } = response.data;
    
    
    if (user.roleName) {
      user.roleName = user.roleName.toUpperCase();
    }

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    setToken(token);
    setUser(user);
    
    return user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};