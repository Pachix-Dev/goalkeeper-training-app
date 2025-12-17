'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, LoginCredentials } from '@/lib/types/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Función para cargar datos de autenticación
  const loadAuthData = () => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
        return true;
      } catch (e) {
        console.warn('Error parseando usuario almacenado', e);
        return false;
      }
    }
    return false;
  };

  // Cargar datos al montar
  useEffect(() => {
    loadAuthData();
    setIsLoading(false);
  }, []);

  // Sincronizar autenticación entre pestañas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Si el token cambió en otra pestaña
      if (e.key === 'token' || e.key === 'user') {
        if (e.newValue === null) {
          // Se eliminó el token (logout en otra pestaña)
          setUser(null);
          setToken(null);
        } else {
          // Se actualizó el token (login en otra pestaña)
          loadAuthData();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Limpiar localStorage al cerrar si no se marcó "recordarme"
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Solo limpiar si existe sessionStorage pero no hay flag de "remember"
      const hasSessionData = sessionStorage.getItem('token');
      const hasLocalData = localStorage.getItem('token');
      
      if (hasSessionData && hasLocalData) {
        // Verificar si es la última pestaña
        // Si hay datos en sessionStorage, significa que NO marcó "recordarme"
        // Al cerrar la última pestaña, sessionStorage se limpia automáticamente
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al iniciar sesión');
      }

      const data = await response.json();
      
      setUser(data.user);
      setToken(data.token);
      
      // SIEMPRE guardar en localStorage para compartir entre pestañas
      // El "remember" solo afecta la persistencia tras cerrar el navegador
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      
      if (!credentials.remember) {
        // Si no marcó "recordarme", también guardar en sessionStorage
        // y limpiar localStorage al cerrar todas las pestañas
        sessionStorage.setItem('user', JSON.stringify(data.user));
        sessionStorage.setItem('token', data.token);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
