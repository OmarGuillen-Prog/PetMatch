import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (nombre: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // TODO: Conectar con backend real
      // Simulación de login exitoso
      setUsuario({
        id: 1,
        nombre: 'Usuario Demo',
        email: email,
      });
      return true;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    }
  };

  const register = async (nombre: string, email: string, password: string): Promise<boolean> => {
    try {
      // TODO: Conectar con backend real
      setUsuario({
        id: Date.now(),
        nombre: nombre,
        email: email,
      });
      return true;
    } catch (error) {
      console.error('Error en registro:', error);
      return false;
    }
  };

  const logout = () => {
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        isAuthenticated: !!usuario,
        login,
        register,
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
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
