# PetMatch Reusable Hooks & Auth Context TODO - COMPLETADO ✅

## Hooks creados:
- `src/hooks/useAuth.ts`: Context + login/register/logout + token persistence
- `src/hooks/useFetch.ts`: Generic fetcher
- `src/hooks/usePets.ts`: Pets data
- `src/hooks/index.ts`: Exports

## Context:
- `src/context/AuthContext.tsx`: Re-export de useAuth para compatibilidad

**Estado:**
- App.tsx: `<AuthProvider>` activo
- tsconfig.json: JSX configurado
- AsyncStorage instalado

**Uso:**
```tsx
import { useAuth } from '../hooks/useAuth'; // o '../context/AuthContext'
const { login, user } = useAuth();
```

¡Todo listo para screens de auth!
