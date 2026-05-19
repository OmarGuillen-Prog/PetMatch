import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  login as loginService,
  register as registerService,
  logout as logoutService,
  getUsuarioGuardado,
  actualizarPerfil as actualizarPerfilService,
} from '../services/authService';
import { Usuario } from '../types';

interface AuthContextType {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (nombre: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  actualizarPerfil: (datos: { nombre?: string; password?: string }) => Promise<void>;
  refrescarUsuario: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  const cargarUsuario = async () => {
    try {
      const saved = await getUsuarioGuardado();
      if (saved) setUsuario(saved);
    } catch (e) {
      console.error('Error restaurando sesión:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarUsuario(); }, []);

  const login = async (email: string, password: string) => {
    const data = await loginService(email, password);
    setUsuario(data);
  };

  const register = async (nombre: string, email: string, password: string) => {
    const data = await registerService(nombre, email, password);
    setUsuario(data);
  };

  const logout = async () => {
    await logoutService();
    setUsuario(null);
  };

  const actualizarPerfil = async (datos: { nombre?: string; password?: string }) => {
    if (!usuario) throw new Error('No hay sesión activa');
    const actualizado = await actualizarPerfilService(usuario.id, datos);
    setUsuario(actualizado);
  };

  const refrescarUsuario = async () => { await cargarUsuario(); };

  return (
    <AuthContext.Provider value={{
      usuario,
      isAuthenticated: !!usuario,
      isAdmin: usuario?.rol === 'ADMIN',
      loading,
      login,
      register,
      logout,
      actualizarPerfil,
      refrescarUsuario,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};

export type { Usuario };
