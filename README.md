PetMatch 🐾
Aplicación móvil para la adopción de mascotas, desarrollada con React Native y Expo. Permite a los usuarios publicar mascotas en adopción, 
buscar mascotas disponibles, chatear con otros usuarios y gestionar solicitudes de adopción. Incluye un panel administrativo 
para la gestión completa de la plataforma.

Características
Para Usuarios
Autenticación: Registro y login con JWT
Exploración: Lista de mascotas disponibles con búsqueda y filtros
Publicación: Publicar mascotas en adopción con imágenes
Detalles: Ver información detallada de cada mascota
Chat: Sistema de mensajería en tiempo real entre usuarios
Perfil: Gestión del perfil de usuario
Adopciones: Solicitar y gestionar adopciones de mascotas
Para Administradores
Dashboard: Vista general de la plataforma
Gestión de Usuarios: Administrar cuentas de usuarios
Gestión de Mascotas: Moderar publicaciones de mascotas
Gestión de Adopciones: Aprobar/rechazar solicitudes de adopción

==================================================================================

Tecnologías
React Native: 0.83.4
Expo: 55.0.14
React: 19.2.0
TypeScript: 5.9.2
React Navigation:
@react-navigation/native: ^7.2.2
@react-navigation/native-stack: ^7.14.12
@react-navigation/bottom-tabs: ^7.15.9
Axios: ^1.16.0
AsyncStorage: @react-native-async-storage/async-storage: 2.2.0
Safe Area Context: react-native-safe-area-context: ~5.6.2
Vector Icons: @expo/vector-icons: ^15.0.2

==================================================================================

Requisitos Previos
Node.js (v18 o superior)
npm o yarn
Expo CLI
Android Studio (para desarrollo Android) o Xcode (para desarrollo iOS)
Expo Go app (para probar en dispositivo móvil)

==================================================================================

Instalación
Clonar el repositorio
bash
git clone https://github.com/OmarGuillen-Prog/PetMatch.git
cd PetMatch
Instalar dependencias
bash
npm install
Iniciar el servidor de desarrollo
bash
npm start

==================================================================================

Ejecución
En Expo Go (Dispositivo móvil)
bash
npm start
Escanea el código QR con la app Expo Go.

En Android
bash
npm run android
En iOS
bash
npm run ios
En Web
bash
npm run web

==================================================================================

📁 Estructura del Proyecto
PetMatch/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   └── PetCard.tsx
│   ├── hooks/               # Custom hooks
│   │   ├── useAuth.tsx      # Hook de autenticación
│   │   ├── useFetch.ts      # Hook genérico de fetch
│   │   └── usePets.ts       # Hook de datos de mascotas
│   ├── navigation/         # Configuración de navegación
│   │   ├── AppNavigator.tsx # Navegador principal
│   │   ├── user/            # Navegación de usuario
│   │   └── admin/           # Navegación de admin
│   ├── screens/             # Pantallas de la aplicación
│   │   ├── auth/            # Login y registro
│   │   ├── user/            # Pantallas de usuario
│   │   └── admin/           # Pantallas de admin
│   ├── services/            # Servicios API
│   │   ├── api.ts           # Configuración de Axios
│   │   ├── authService.ts   # Servicios de autenticación
│   │   ├── petService.ts    # Servicios de mascotas
│   │   ├── usuarioService.ts # Servicios de usuarios
│   │   └── mensajeService.ts # Servicios de mensajes
│   ├── styles/              # Estilos
│   │   ├── shared/          # Estilos compartidos
│   │   └── user/            # Estilos de usuario
│   └── types/               # Definiciones de TypeScript
│       └── index.ts
├── assets/                  # Imágenes y recursos
├── App.tsx                  # Componente principal
├── app.json                 # Configuración de Expo
├── package.json             # Dependencias
└── tsconfig.json            # Configuración de TypeScript

==================================================================================

Configuración
API Backend
La aplicación se conecta a la API REST en:

https://petmatch1-production.up.railway.app
Para cambiar la URL del backend, modifica src/services/api.ts:

typescript
export const BASE_URL = 'https://tu-api-url.com';

==================================================================================

🎨 Scripts Disponibles
bash
npm start          # Inicia el servidor de desarrollo de Expo
npm run android    # Ejecuta en Android
npm run ios        # Ejecuta en iOS
npm run web        # Ejecuta en navegador web

==================================================================================

Contribución
Fork el repositorio
Crea una rama para tu feature (git checkout -b feature/NuevaCaracteristica)
Commit tus cambios (git commit -m 'Agrega nueva característica')
Push a la rama (git push origin feature/NuevaCaracteristica)
Abre un Pull Request
