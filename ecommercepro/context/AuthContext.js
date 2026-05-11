'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { setAuthUser, setToken } from '@/redux/authSlice';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth');
      const data = await res.json();

      if (data.success && data.userId) {
        // We have a session, let's restore user data
        const userObj = { _id: data.userId, role: data.role };
        
        // Try to get fuller user info from localStorage if it matches
        const stored = localStorage.getItem('auth_user');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed && parsed._id === data.userId) {
              Object.assign(userObj, parsed);
            }
          } catch (e) {
            console.error("Local storage parse error:", e);
          }
        }
        
        setUser(userObj);
        setIsAuthenticated(true);
        dispatch(setAuthUser(userObj));
      } else {
        setUser(null);
        setIsAuthenticated(false);
        dispatch(setAuthUser(null));
      }
    } catch (error) {
      console.error('CheckAuth Error:', error);
      setUser(null);
      setIsAuthenticated(false);
      dispatch(setAuthUser(null));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        dispatch(setAuthUser(data.user));
        dispatch(setToken(data.accessToken));
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        
        toast.success('Login successful!');
        router.replace(`/home/${data.id || data.user._id}`);
        return { success: true };
      } else {
        toast.error(data.message || 'Login failed');
        return { success: false, message: data.message, forgot: data.forgot };
      }
    } catch (error) {
      console.error('Login Error:', error);
      toast.error('An error occurred during login');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Registration successful! Please verify your email.');
        return { success: true, email: data.email };
      } else {
        toast.error(data.message || 'Registration failed');
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Register Error:', error);
      toast.error('An error occurred during registration');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Call the centralized logout API
      await fetch('/api/auth/logout', { method: 'POST' });
      
      setUser(null);
      setIsAuthenticated(false);
      dispatch(setAuthUser(null));
      dispatch(setToken(null));
      localStorage.removeItem('auth_user');
      
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      console.error('Logout Error:', error);
      toast.error('Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
