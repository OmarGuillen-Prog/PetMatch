import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { Usuario, ApiResponse } from '../types';

// ─── Login ────────────────────────────────────────────────────────────────────
// El backend no tiene endpoint /auth/login.
// Buscamos en GET /api/v1/usuarios y comparamos email + password.
export const login = async (email: string, password: string): Promise<Usuario> => {
  // El backend devuelve la lista directamente (sin wrapper en este endpoint)
  const res = await api.get<ApiResponse<Usuario[]> | Usuario[]>('/api/v1/usuarios');

  // Manejar ambos formatos: con wrapper { object: [...] } o array directo
  const lista: Usuario[] = Array.isArray(res.data)
    ? res.data
    : (res.data as ApiResponse<Usuario[]>).object ?? [];

  const usuario = lista.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );

  if (!usuario) throw new Error('No existe una cuenta con ese correo.');

  // El backend devuelve el password en el DTO (proyecto académico sin JWT)
  if (usuario.password && usuario.password !== password) {
    throw new Error('Contraseña incorrecta.');
  }

  await _persistir(usuario);
  return usuario;
};

// ─── Register ─────────────────────────────────────────────────────────────────
export const register = async (
  nombre: string,
  email: string,
  password: string
): Promise<Usuario> => {
  const res = await api.post<ApiResponse<Usuario>>('/api/v1/usuario', {
    nombre,
    email,
    password,
    rol: 'USER',
  });

  const usuario = res.data.object;
  if (!usuario) throw new Error(res.data.mensaje || 'Error al registrar usuario');

  await _persistir(usuario);
  return usuario;
};

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logout = async (): Promise<void> => {
  await AsyncStorage.multiRemove(['token', 'usuario']);
};

// ─── Restaurar sesión ─────────────────────────────────────────────────────────
export const getUsuarioGuardado = async (): Promise<Usuario | null> => {
  try {
    const raw = await AsyncStorage.getItem('usuario');
    if (!raw) return null;
    const guardado = JSON.parse(raw) as Usuario;

    // Refrescar desde backend
    try {
      const res = await api.get<ApiResponse<Usuario>>(`/api/v1/usuario/${guardado.id}`);
      const actualizado = res.data.object;
      if (actualizado) {
        await AsyncStorage.setItem('usuario', JSON.stringify(actualizado));
        return actualizado;
      }
    } catch { /* si falla el refresh, usamos el guardado */ }

    return guardado;
  } catch {
    return null;
  }
};

// ─── Actualizar perfil ────────────────────────────────────────────────────────
export const actualizarPerfil = async (
  id: number,
  datos: { nombre?: string; password?: string }
): Promise<Usuario> => {
  const res = await api.put<ApiResponse<Usuario>>(`/api/v1/usuario/${id}`, datos);
  const actualizado = res.data.object;
  if (!actualizado) throw new Error(res.data.mensaje || 'Error al actualizar perfil');
  await AsyncStorage.setItem('usuario', JSON.stringify(actualizado));
  return actualizado;
};

// ─── Helper ───────────────────────────────────────────────────────────────────
async function _persistir(usuario: Usuario, token?: string): Promise<void> {
  const tok = token ?? `${usuario.id}:${usuario.rol}`;
  await AsyncStorage.multiSet([
    ['token', tok],
    ['usuario', JSON.stringify(usuario)],
  ]);
}
