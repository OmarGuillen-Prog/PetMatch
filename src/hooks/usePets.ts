import { useFetch } from './useFetch';
import { getMascotas, Mascota } from '../services/petService';

export const usePets = () => {
  return useFetch<Mascota[]>(getMascotas);
};
</xai:function_call.




<xai:function_call name="create_file">
<parameter name="absolute_path">c:/Users/sebas/Documents/GitHub/PetMatch/src/hooks/index.ts
