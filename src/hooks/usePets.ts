import { useFetch } from './useFetch';
import { getMascotas } from '../services/petService';
import { Mascota } from '../types';

export const usePets = () => {
  return useFetch<Mascota[]>(getMascotas);
};
