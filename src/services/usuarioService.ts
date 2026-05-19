import api from './api';
import { Usuario, ApiResponse } from '../types';

function unwrapList(data: any): Usuario[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.object)) return data.object;
  return [];
}

export const getUsuarios = async (): Promise<Usuario[]> => {
  const res = await api.get('/api/v1/usuarios');
  return unwrapList(res.data);
};

export const getUsuarioById = async (id: number): Promise<Usuario> => {
  const res = await api.get<ApiResponse<Usuario>>(`/api/v1/usuario/${id}`);
  const obj = res.data?.object ?? (res.data as any);
  if (!obj) throw new Error('Usuario no encontrado');
  return obj;
};

export const actualizarUsuario = async (
  id: number,
  data: Partial<Usuario>
): Promise<Usuario> => {
  const res = await api.put<ApiResponse<Usuario>>(`/api/v1/usuario/${id}`, data);
  const obj = res.data?.object ?? (res.data as any);
  if (!obj) throw new Error(res.data?.mensaje || 'Error al actualizar');
  return obj;
};

export const eliminarUsuario = async (id: number): Promise<void> => {
  await api.delete(`/api/v1/usuario/${id}`);
};
