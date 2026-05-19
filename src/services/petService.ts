import api from './api';
import { Mascota, Imagen, Adopcion, ApiResponse } from '../types';

// ─── Helper: extrae object del wrapper ───────────────────────────────────────
function unwrap<T>(data: ApiResponse<T> | T): T {
  if (data && typeof data === 'object' && 'object' in (data as any)) {
    const obj = (data as ApiResponse<T>).object;
    if (obj === null || obj === undefined) {
      throw new Error((data as ApiResponse<T>).mensaje || 'Sin datos');
    }
    return obj;
  }
  return data as T;
}

// ─── Helper: normaliza mascota de entidad a DTO ───────────────────────────────
// GET /mascotas devuelve entidades con usuario anidado { id, nombre, email }
// GET /mascota/{id} devuelve DTO con usuarioId plano
// Normalizamos ambos al mismo shape
function normalizarMascota(m: any): Mascota {
  return {
    id: m.id,
    nombre: m.nombre,
    tipo: m.tipo,
    edad: m.edad,
    descripcion: m.descripcion ?? '',
    estado: m.estado ?? '',
    // Soportar tanto usuarioId plano como usuario anidado
    usuarioId: m.usuarioId ?? m.usuario?.id ?? 0,
    created_at: m.created_at,
    imagenes: m.imagenes,
  };
}

// ─── Mascotas ─────────────────────────────────────────────────────────────────

export const getMascotas = async (): Promise<Mascota[]> => {
  const res = await api.get('/api/v1/mascotas');
  // Puede venir como array directo (entidades con usuario anidado) o envuelto
  const lista: any[] = Array.isArray(res.data)
    ? res.data
    : Array.isArray(res.data?.object) ? res.data.object : [];
  return lista.map(normalizarMascota);
};

export const getMascotaById = async (id: number): Promise<Mascota> => {
  const res = await api.get<ApiResponse<any>>(`/api/v1/mascota/${id}`);
  return normalizarMascota(unwrap(res.data));
};

export const crearMascota = async (
  data: Omit<Mascota, 'id' | 'created_at' | 'imagenes'>
): Promise<Mascota> => {
  // El backend espera: nombre, tipo, edad, descripcion, estado, usuarioId
  const res = await api.post<ApiResponse<Mascota>>('/api/v1/mascota', {
    nombre: data.nombre,
    tipo: data.tipo,
    edad: data.edad,
    descripcion: data.descripcion,
    estado: data.estado,
    usuarioId: data.usuarioId,
  });
  return unwrap(res.data);
};

export const actualizarMascota = async (
  id: number,
  data: Partial<Mascota>
): Promise<Mascota> => {
  const res = await api.put<ApiResponse<Mascota>>(`/api/v1/mascota/${id}`, data);
  return unwrap(res.data);
};

export const eliminarMascota = async (id: number): Promise<void> => {
  await api.delete(`/api/v1/mascota/${id}`);
};

// ─── Imágenes ─────────────────────────────────────────────────────────────────

export const getImagenes = async (): Promise<Imagen[]> => {
  const res = await api.get('/api/v1/imagenes');
  if (Array.isArray(res.data)) return res.data;
  const obj = res.data?.object;
  return Array.isArray(obj) ? obj : [];
};

export const getImagenesByMascota = async (mascotaId: number): Promise<Imagen[]> => {
  const todas = await getImagenes();
  return todas.filter((img) => img.mascotaId === mascotaId);
};

export const crearImagen = async (mascotaId: number, url: string): Promise<Imagen> => {
  // POST /api/v1/imagen con body { url, mascotaId }
  const res = await api.post<ApiResponse<Imagen>>('/api/v1/imagen', { url, mascotaId });
  return unwrap(res.data);
};

export const subirImagenArchivo = async (
  mascotaId: number,
  uri: string,
  fileName = 'foto.jpg'
): Promise<Imagen> => {
  // POST /api/v1/imagen/upload — multipart/form-data
  // params: file (File), mascotaId (Text)
  const formData = new FormData();
  formData.append('file', { uri, name: fileName, type: 'image/jpeg' } as any);
  formData.append('mascotaId', String(mascotaId));

  const res = await api.post<ApiResponse<Imagen>>('/api/v1/imagen/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrap(res.data);
};

export const eliminarImagen = async (id: number): Promise<void> => {
  await api.delete(`/api/v1/imagen/${id}`);
};

// ─── Adopciones ───────────────────────────────────────────────────────────────

export const getAdopciones = async (): Promise<Adopcion[]> => {
  const res = await api.get('/api/v1/adopciones');
  if (Array.isArray(res.data)) return res.data;
  const obj = res.data?.object;
  return Array.isArray(obj) ? obj : [];
};

export const getAdopcionById = async (id: number): Promise<Adopcion> => {
  const res = await api.get<ApiResponse<Adopcion>>(`/api/v1/adopcion/${id}`);
  return unwrap(res.data);
};

export const crearAdopcion = async (
  usuarioId: number,
  mascotaId: number
): Promise<Adopcion> => {
  // El backend espera: usuarioId, mascotaId, estado
  const res = await api.post<ApiResponse<Adopcion>>('/api/v1/adopcion', {
    usuarioId,
    mascotaId,
    estado: 'PENDIENTE',
  });
  return unwrap(res.data);
};

export const actualizarAdopcion = async (
  id: number,
  estado: string
): Promise<Adopcion> => {
  const res = await api.put<ApiResponse<Adopcion>>(`/api/v1/adopcion/${id}`, { estado });
  return unwrap(res.data);
};

export const eliminarAdopcion = async (id: number): Promise<void> => {
  await api.delete(`/api/v1/adopcion/${id}`);
};

export const getMisAdopciones = async (usuarioId: number): Promise<Adopcion[]> => {
  const todas = await getAdopciones();
  return todas.filter((a) => a.usuarioId === usuarioId);
};

// ─── Helper: normaliza estado a mayúsculas para comparaciones UI ──────────────
export const estadoNormalizado = (estado: string): string =>
  (estado ?? '').toUpperCase();
