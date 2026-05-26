// ─── Respuesta genérica del backend ──────────────────────────────────────────
// Todas las respuestas vienen envueltas en { mensaje, object }
export interface ApiResponse<T> {
  mensaje: string;
  object: T | null;
}

// ─── Usuarios ────────────────────────────────────────────────────────────────
export interface Usuario {
  id: number;           // Integer en backend
  nombre: string;
  email: string;
  password?: string;
  rol: 'ADMIN' | 'USER';
  created_at?: string;
}

// ─── Mascotas ─────────────────────────────────────────────────────────────────
export interface Mascota {
  id: number;           // Long en backend
  nombre: string;
  tipo: string;
  edad: number;
  descripcion: string;
  estado: string;
  usuarioId: number;    // Long en backend
  created_at?: string;
  imagenes?: Imagen[];  // enriquecido en frontend
}

// ─── Imágenes ─────────────────────────────────────────────────────────────────
export interface Imagen {
  id: number;           // Long en backend
  url: string;
  mascotaId: number;    // Long en backend
}

// ─── Mensajes REST ────────────────────────────────────────────────────────────
export interface Mensaje {
  id: number;           // Long en backend
  emisorId: number;
  receptorId: number;
  contenido: string;
  fecha: string;        // Timestamp serializado
}

// ─── Chat WebSocket (STOMP) ───────────────────────────────────────────────────
export interface ChatMessage {
  sender: string;       // nombre del emisor (max 50)
  receiver: string;     // nombre del receptor (max 50)
  content: string;      // contenido (max 1000)
  timestamp?: string;   // ISO 8601: yyyy-MM-dd'T'HH:mm:ss
}

// ─── Adopciones ───────────────────────────────────────────────────────────────
export interface Adopcion {
  id: number;           // Long en backend
  usuarioId: number;    // Long en backend
  mascotaId: number;    // Long en backend
  estado: string;
  fecha: string;        // Timestamp serializado
}

// ─── Navegación ───────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  UserMain: undefined;
  AdminMain: undefined;
  Detail: { mascota: Mascota };
  Chat: { otroUsuarioId: number; otroUsuarioNombre: string };
};

export type UserTabParamList = {
  Home: undefined;
  Publicar: undefined;
  Chat: undefined;
  Profile: undefined;
};

export type AdminTabParamList = {
  Dashboard: undefined;
  Usuarios: undefined;
  Mascotas: undefined;
  Adopciones: undefined;
};
