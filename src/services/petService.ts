import api from './api';

export interface Mascota {
  id: number;
  nombre: string;
  especie: string;
  raza: string;
  edad: number;
  imagen: string;
  estado: string;
}

export const getMascotas = async (): Promise<Mascota[]> => {
  try {
    const response = await api.get<Mascota[]>('/mascotas');
    return response.data;
  } catch (error) {
    console.error('Error al obtener mascotas:', error);
    throw error;
  }
};
