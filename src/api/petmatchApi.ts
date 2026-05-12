// Configuración base de la API
const BASE_URL = 'https://api.petmatch.com/v1'; // Cambiar por tu URL real

// Interfaces
export interface Mascota {
  id: number;
  nombre: string;
  tipo: string;
  raza: string;
  edad: number;
  descripcion: string;
  estado: 'Disponible' | 'No disponible' | 'Adoptado';
  usuario_id: number;
  vacunas: string[];
  imagen?: string;
  imagenes?: { id?: number; url: string }[];
  creado_en?: string;
  encargado?: {
    id?: number;
    nombre: string;
    email?: string;
  };
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  avatar?: string;
}

// Helper para manejar respuestas
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error de conexión' }));
    throw new Error(error.message || `Error ${response.status}`);
  }
  return response.json();
}

// API de Mascotas
export const MascotasAPI = {
  // Obtener todas las mascotas
  async getAll(): Promise<Mascota[]> {
    try {
      const response = await fetch(`${BASE_URL}/mascotas`);
      return handleResponse<Mascota[]>(response);
    } catch (error) {
      console.error('Error obteniendo mascotas:', error);
      // Retornar datos de prueba si no hay backend
      return [
        {
          id: 1,
          nombre: 'Luna',
          tipo: 'Perro',
          raza: 'Labrador',
          edad: 2,
          descripcion: 'Muy juguetona y cariñosa',
          estado: 'Disponible',
          usuario_id: 1,
          vacunas: ['Rabia', 'Parvovirus'],
          imagen: 'https://placekitten.com/400/400',
        },
        {
          id: 2,
          nombre: 'Michi',
          tipo: 'Gato',
          raza: 'Persa',
          edad: 1,
          descripcion: 'Tranquilo y adorable',
          estado: 'Disponible',
          usuario_id: 2,
          vacunas: ['Rabia'],
          imagen: 'https://placekitten.com/401/401',
        },
      ];
    }
  },

  // Obtener mascota por ID
  async getById(id: number): Promise<Mascota> {
    const response = await fetch(`${BASE_URL}/mascotas/${id}`);
    return handleResponse<Mascota>(response);
  },

  // Crear nueva mascota
  async create(data: Omit<Mascota, 'id' | 'creado_en'>): Promise<Mascota> {
    try {
      const response = await fetch(`${BASE_URL}/mascotas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return handleResponse<Mascota>(response);
    } catch (error) {
      console.error('Error creando mascota:', error);
      // Simular respuesta exitosa si no hay backend
      return {
        id: Date.now(),
        ...data,
        creado_en: new Date().toISOString(),
      } as Mascota;
    }
  },

  // Actualizar mascota
  async update(id: number, data: Partial<Mascota>): Promise<Mascota> {
    const response = await fetch(`${BASE_URL}/mascotas/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Mascota>(response);
  },

  // Eliminar mascota
  async delete(id: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/mascotas/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Error al eliminar mascota');
    }
  },

  // Subir imagen de mascota
  async uploadImage(mascotaId: number, formData: FormData): Promise<{ imagen: string }> {
    try {
      const response = await fetch(`${BASE_URL}/mascotas/${mascotaId}/imagen`, {
        method: 'POST',
        body: formData,
      });
      return handleResponse<{ imagen: string }>(response);
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      // Simular respuesta exitosa si no hay backend
      return { imagen: 'https://placekitten.com/400/400' };
    }
  },

  // Buscar mascotas con filtros
  async search(filters: {
    tipo?: string;
    raza?: string;
    edad?: number;
    estado?: string;
  }): Promise<Mascota[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value));
    });
    
    const response = await fetch(`${BASE_URL}/mascotas/buscar?${params}`);
    return handleResponse<Mascota[]>(response);
  },
};

// API de Usuarios
export const UsuariosAPI = {
  // Login
  async login(email: string, password: string): Promise<{ usuario: Usuario; token: string }> {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<{ usuario: Usuario; token: string }>(response);
  },

  // Registro
  async register(nombre: string, email: string, password: string): Promise<{ usuario: Usuario; token: string }> {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nombre, email, password }),
    });
    return handleResponse<{ usuario: Usuario; token: string }>(response);
  },

  // Obtener perfil
  async getProfile(id: number): Promise<Usuario> {
    const response = await fetch(`${BASE_URL}/usuarios/${id}`);
    return handleResponse<Usuario>(response);
  },

  // Actualizar perfil
  async updateProfile(id: number, data: Partial<Usuario>): Promise<Usuario> {
    const response = await fetch(`${BASE_URL}/usuarios/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Usuario>(response);
  },
};

// API de Adopciones
export const AdopcionesAPI = {
  // Solicitar adopción
  async solicitar(mascotaId: number, usuarioId: number, mensaje?: string): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/adopciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mascota_id: mascotaId, usuario_id: usuarioId, mensaje }),
      });
      if (!response.ok) {
        throw new Error('Error al solicitar adopción');
      }
    } catch (error) {
      console.error('Error solicitando adopción:', error);
    }
  },

  // Obtener solicitudes de un usuario
  async getMisSolicitudes(usuarioId: number): Promise<any[]> {
    const response = await fetch(`${BASE_URL}/adopciones/usuario/${usuarioId}`);
    return handleResponse<any[]>(response);
  },
};

// API de Favoritos
export const FavoritosAPI = {
  // Verificar si una mascota es favorita
  async isFavorito(mascotaId: number): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/favoritos/check/${mascotaId}`);
      const data = await handleResponse<{ esFavorito: boolean }>(response);
      return data.esFavorito;
    } catch (error) {
      console.error('Error verificando favorito:', error);
      return false;
    }
  },

  // Agregar/quitar favorito
  async toggle(mascota: Mascota): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/favoritos/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mascota_id: mascota.id }),
      });
      if (!response.ok) {
        throw new Error('Error al actualizar favorito');
      }
    } catch (error) {
      console.error('Error toggling favorito:', error);
    }
  },

  // Obtener todos los favoritos del usuario
  async getFavoritos(): Promise<Mascota[]> {
    try {
      const response = await fetch(`${BASE_URL}/favoritos`);
      return handleResponse<Mascota[]>(response);
    } catch (error) {
      console.error('Error obteniendo favoritos:', error);
      return [];
    }
  },
};

// API de Mensajes
export const MensajesAPI = {
  // Enviar mensaje
  async enviar(
    emisorId: number,
    receptorId: number,
    contenido: string
  ): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/mensajes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emisor_id: emisorId,
          receptor_id: receptorId,
          contenido,
        }),
      });
      if (!response.ok) {
        throw new Error('Error al enviar mensaje');
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    }
  },

  // Obtener conversación
  async getConversacion(otroUsuarioId: number): Promise<any[]> {
    try {
      const response = await fetch(`${BASE_URL}/mensajes/conversacion/${otroUsuarioId}`);
      return handleResponse<any[]>(response);
    } catch (error) {
      console.error('Error obteniendo conversación:', error);
      return [];
    }
  },

  // Obtener todas las conversaciones
  async getConversaciones(): Promise<any[]> {
    try {
      const response = await fetch(`${BASE_URL}/mensajes/conversaciones`);
      return handleResponse<any[]>(response);
    } catch (error) {
      console.error('Error obteniendo conversaciones:', error);
      return [];
    }
  },
};
