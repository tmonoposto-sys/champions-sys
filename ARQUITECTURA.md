# 🏗️ Arquitectura del Sistema - Guía Visual

## 📊 Diagrama de Arquitectura Unificada

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO (Navegador)                      │
│                  http://localhost:3001                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Todas las peticiones
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  EXPRESS SERVER (Puerto 3001)               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   MIDDLEWARE                         │  │
│  │  - CORS                                              │  │
│  │  - JSON Parser                                       │  │
│  │  - Logger                                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────────┐   │
│  │   Rutas /api/*       │  │   Rutas /*               │   │
│  │                      │  │                          │   │
│  │  /api/championships  │  │   /                      │   │
│  │  /api/teams          │  │   /admin                 │   │
│  │  /api/drivers        │  │   /public                │   │
│  │  /api/races          │  │   (Cualquier otra ruta)  │   │
│  │  /api/results        │  │                          │   │
│  │                      │  │                          │   │
│  │  → Responde JSON     │  │   → Sirve index.html     │   │
│  └──────────┬───────────┘  └──────────┬───────────────┘   │
│             │                          │                    │
│             │                          │                    │
│  ┌──────────▼───────────┐  ┌──────────▼───────────────┐   │
│  │   CONTROLLERS        │  │   ARCHIVOS ESTÁTICOS      │   │
│  │                      │  │   (carpeta dist/)          │   │
│  │  - championships     │  │                           │   │
│  │  - teams             │  │   index.html              │   │
│  │  - drivers           │  │   assets/                 │   │
│  │  - races             │  │   ├── index.js            │   │
│  │  - results           │  │   ├── style.css           │   │
│  │                      │  │   └── images/             │   │
│  └──────────┬───────────┘  └───────────────────────────┘   │
│             │                                                │
└─────────────┼────────────────────────────────────────────────┘
              │
              │
┌─────────────▼────────────────────────────────────────────────┐
│                    MONGODB ATLAS (Cloud)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Base de datos: f1championship              │   │
│  │                                                       │   │
│  │  📁 championships  📁 teams      📁 drivers          │   │
│  │  📁 races          📁 results                        │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de una Petición

### Escenario 1: Usuario accede a la página principal

```
1. Usuario → http://localhost:3001/
                    ↓
2. Express recibe GET /
                    ↓
3. No coincide con /api/*
                    ↓
4. Express sirve: dist/index.html
                    ↓
5. Navegador carga React App
                    ↓
6. React se ejecuta en el navegador
```

### Escenario 2: React necesita datos del API

```
1. React llama: fetch('/api/teams/list')
                    ↓
2. Express recibe POST /api/teams/list
                    ↓
3. Router dirige a: teamsController.listTeams()
                    ↓
4. Controller consulta MongoDB Atlas
                    ↓
5. MongoDB devuelve datos
                    ↓
6. Controller devuelve JSON
                    ↓
7. React recibe y muestra los datos
```

## 📁 Estructura de Archivos y su Propósito

```
proyecto/
│
├── backend/                        ← SERVIDOR EXPRESS
│   ├── src/
│   │   ├── index.js               ← 🚀 PUNTO DE ENTRADA
│   │   │                             - Inicia Express
│   │   │                             - Conecta MongoDB
│   │   │                             - Configura rutas
│   │   │                             - Sirve archivos estáticos
│   │   │
│   │   ├── config/
│   │   │   └── database.js        ← Configuración MongoDB
│   │   │
│   │   ├── controllers/           ← Lógica de Negocio
│   │   │   ├── championshipsController.js
│   │   │   ├── teamsController.js
│   │   │   ├── driversController.js
│   │   │   ├── racesController.js
│   │   │   └── resultsController.js
│   │   │
│   │   └── routes/
│   │       └── index.js           ← Definición de Rutas API
│   │
│   └── .env                       ← 🔐 CONFIGURACIÓN SECRETA
│       - MONGODB_URI
│       - SUPER_ADMIN_KEY
│       - PORT
│
├── src/                           ← CÓDIGO FUENTE REACT
│   ├── services/
│   │   └── api.ts                ← Cliente API (llama a /api/*)
│   ├── pages/                    ← Páginas React
│   ├── components/               ← Componentes React
│   └── ...
│
├── dist/                         ← 📦 FRONTEND COMPILADO
│   │                                (Generado con npm run build)
│   ├── index.html                ← Servido por Express
│   └── assets/                   ← JS, CSS compilados
│
└── package.json                  ← Scripts de compilación
```

## 🔨 Proceso de Compilación

### Paso 1: Desarrollo del Frontend
```
src/ (TypeScript + React)
  ↓
npm run dev (Vite)
  ↓
http://localhost:8080 (Con hot-reload)
```

### Paso 2: Compilación para Producción
```
src/ (TypeScript + React)
  ↓
npm run build (Vite)
  ↓
dist/ (HTML + JS + CSS optimizados)
```

### Paso 3: Servidor en Producción
```
Express Server
  ↓
Sirve archivos de dist/
  ↓
http://localhost:3001
```

## 🚀 Comandos y qué hacen

### `npm run dev`
```
Inicia Vite en puerto 8080
Frontend con hot-reload
Proxy: /api → localhost:3001
(Solo para desarrollo del frontend)
```

### `npm run build`
```
Compila React + TypeScript
Optimiza y minifica
Genera carpeta dist/
(Necesario antes de producción)
```

### `cd backend && npm start`
```
Inicia Express en puerto 3001
Conecta a MongoDB Atlas
Sirve API en /api/*
Sirve frontend desde dist/
(Servidor de producción)
```

### `./start-unified.sh`
```
1. Verifica dependencias
2. Compila frontend (npm run build)
3. Inicia servidor (cd backend && npm start)
(Todo en uno)
```

## 🔐 Variables de Entorno

### backend/.env
```env
# Obligatorias
MONGODB_URI=mongodb+srv://...    ← Conexión a MongoDB Atlas
SUPER_ADMIN_KEY=clave123         ← Para crear campeonatos

# Opcionales
PORT=3001                        ← Puerto del servidor
NODE_ENV=production              ← Modo de ejecución
```

### .env (raíz) - NO NECESARIO
Ya no necesitas configurar `VITE_API_URL` porque el frontend usa rutas relativas `/api`

## 📡 Comunicación Frontend ↔️ Backend

### En Desarrollo (npm run dev)
```
React (puerto 8080)
        ↓
    fetch('/api/teams/list')
        ↓
    Vite Proxy
        ↓
    localhost:3001/api/teams/list
        ↓
    Express Backend
```

### En Producción (npm start)
```
Navegador
        ↓
    http://localhost:3001
        ↓
    Express sirve index.html
        ↓
    React se carga en navegador
        ↓
    fetch('/api/teams/list')
        ↓
    Misma URL (3001)
        ↓
    Express Backend
```

## 💡 Ventajas de esta Arquitectura

✅ **Un solo puerto** - Todo en localhost:3001
✅ **Sin CORS** - Mismo origen
✅ **Fácil desplegar** - Solo desplegar el backend
✅ **Simple** - Menos configuración
✅ **Rápido** - Sin latencia entre servidores

## 🎓 Resumen para Entender Todo

1. **Backend (Express)** es el servidor principal
2. **Frontend (React)** se compila a archivos estáticos en `dist/`
3. **Express sirve** tanto la API como el frontend
4. Rutas `/api/*` → van a los controllers
5. Rutas `/*` → sirven el index.html de React
6. React Router maneja la navegación en el navegador
7. MongoDB Atlas guarda todos los datos

**Todo funciona en un solo servidor en el puerto 3001** 🎉
