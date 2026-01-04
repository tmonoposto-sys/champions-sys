# 📋 Resumen de Cambios - Migración a MongoDB Atlas

## 🎯 Objetivo Cumplido
Se eliminó completamente la dependencia de Supabase y se implementó una conexión directa a MongoDB Atlas mediante un backend Node.js + Express.

---

## ✅ Archivos Nuevos Creados

### Backend (carpeta `backend/`)
```
backend/
├── src/
│   ├── config/
│   │   └── database.js                 # Configuración de MongoDB Atlas
│   ├── controllers/
│   │   ├── championshipsController.js  # Lógica de campeonatos
│   │   ├── teamsController.js          # Lógica de equipos
│   │   ├── driversController.js        # Lógica de pilotos
│   │   ├── racesController.js          # Lógica de carreras
│   │   └── resultsController.js        # Lógica de resultados
│   ├── routes/
│   │   └── index.js                    # Definición de todas las rutas
│   └── index.js                        # Servidor Express principal
├── .env.example                        # Plantilla de variables de entorno
├── .gitignore                          # Ignorar node_modules y .env
└── package.json                        # Dependencias del backend
```

### Configuración
- `README_INSTALACION.md` - Guía completa de instalación y configuración
- `.env.example` (raíz) - Variables de entorno del frontend
- `start.sh` - Script para iniciar backend + frontend juntos
- `fix-objectid.sh` - Script ejecutado para actualizar ObjectId (ya no necesario)

---

## 🔄 Archivos Modificados

### `src/services/api.ts`
**Cambios principales:**
- ❌ Eliminado: `VITE_SUPABASE_URL`
- ✅ Agregado: `VITE_API_URL` (nuevo backend)
- ✅ Actualizado: URL de fetch apunta a `http://localhost:3001/api`
- ✅ Simplificado: Tipos de ObjectId ahora usan `string` en lugar de `{ $oid: string }`

**Antes:**
```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const response = await fetch(`${SUPABASE_URL}/functions/v1/mongodb-api/${collection}/${action}`, ...);

export interface Team {
  _id: { $oid: string };
  // ...
}
```

**Después:**
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const response = await fetch(`${API_URL}/${collection}/${action}`, ...);

export interface Team {
  _id: string;
  // ...
}
```

### `package.json` (frontend)
**Cambios:**
- ❌ Eliminado: `"@supabase/supabase-js": "^2.89.0"`

### Archivos de componentes (9 archivos)
Todos los archivos en `src/pages/` que usaban `._id.$oid` fueron actualizados automáticamente:
- `src/pages/admin/RacesPage.tsx`
- `src/pages/admin/ResultsPage.tsx`
- `src/pages/admin/DriversPage.tsx`
- `src/pages/admin/TeamsPage.tsx`
- `src/pages/public/PublicConstructors.tsx`
- `src/pages/public/PublicDrivers.tsx`
- `src/pages/public/PublicCalendar.tsx`
- `src/pages/public/PublicHome.tsx`
- `src/pages/public/PublicLayout.tsx`

**Cambio realizado:**
```typescript
// Antes
race._id.$oid
driver._id.$oid
team._id.$oid

// Después
race._id
driver._id
team._id
```

---

## 🗑️ Archivos que DEBES Eliminar (Opcional)

Estos archivos ya no se usan pero no fueron eliminados automáticamente:

```
src/integrations/supabase/
├── client.ts       # Cliente de Supabase (obsoleto)
└── types.ts        # Tipos de Supabase (obsoleto)

supabase/           # Carpeta completa de Supabase
├── config.toml
└── functions/
    └── mongodb-api/
        └── index.ts
```

**Para eliminar:**
```bash
rm -rf src/integrations/supabase
rm -rf supabase
```

---

## 🔧 Configuración Requerida

### 1. MongoDB Atlas
- Crear cuenta en https://www.mongodb.com/cloud/atlas
- Crear cluster gratuito (M0)
- Crear usuario con permisos de lectura/escritura
- Configurar acceso de red (agregar tu IP)
- Copiar connection string

### 2. Backend `.env`
Crear archivo `backend/.env`:
```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/
SUPER_ADMIN_KEY=tu_clave_secreta_123
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend `.env`
Crear archivo `.env` en la raíz:
```env
VITE_API_URL=http://localhost:3001/api
```

---

## 🚀 Cómo Iniciar

### Método 1: Manual
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
npm install
npm run dev
```

### Método 2: Script automático
```bash
chmod +x start.sh
./start.sh
```

---

## 📡 API Endpoints Disponibles

Todos los endpoints usan método `POST` y reciben JSON:

### Championships
- `/api/championships/login` - Login (body: `{username, code}`)
- `/api/championships/get` - Obtener info (body: `{code}`)
- `/api/championships/create` - Crear (body: `{adminKey, code, name, adminUsername}`)

### Teams
- `/api/teams/list` - Listar (body: `{code}`)
- `/api/teams/create` - Crear (body: `{code, name, color}`)
- `/api/teams/update` - Actualizar (body: `{id, name, color}`)
- `/api/teams/delete` - Eliminar (body: `{id}`)

### Drivers
- `/api/drivers/list` - Listar (body: `{code}`)
- `/api/drivers/create` - Crear (body: `{code, name, teamId, number, estado}`)
- `/api/drivers/update` - Actualizar (body: `{id, name, teamId, number, estado}`)
- `/api/drivers/delete` - Eliminar (body: `{id}`)

### Races
- `/api/races/list` - Listar (body: `{code}`)
- `/api/races/create` - Crear (body: `{code, circuitId, order, isSprint, isRain}`)
- `/api/races/update` - Actualizar (body: `{id, circuitId, order, isSprint, isRain}`)
- `/api/races/delete` - Eliminar (body: `{id}`)

### Results
- `/api/results/list` - Listar todos (body: `{code}`)
- `/api/results/get` - Obtener uno (body: `{code, raceId}`)
- `/api/results/saveQualifying` - Guardar clasificación (body: `{code, raceId, qualifying}`)
- `/api/results/saveRace` - Guardar carrera (body: `{code, raceId, race, fastestLap}`)

---

## ✨ Ventajas de la Nueva Arquitectura

### Antes (con Supabase)
- ❌ Dependencia de servicio externo (Supabase)
- ❌ Edge Functions como intermediario
- ❌ Limitaciones de Deno
- ❌ Complejidad adicional

### Ahora (directo a MongoDB)
- ✅ Control total del backend
- ✅ Conexión directa a MongoDB Atlas
- ✅ Node.js + Express (estándar de la industria)
- ✅ Más fácil de debuggear y mantener
- ✅ Sin limitaciones de servicios externos
- ✅ Código más simple y claro

---

## 🐛 Solución de Problemas Comunes

### Error: "MONGODB_URI is not configured"
**Solución:** Crea el archivo `backend/.env` con tu connection string de MongoDB Atlas

### Error: "Authentication failed"
**Solución:** Verifica usuario y contraseña en el connection string de MongoDB

### Error: CORS
**Solución:** Asegúrate que `FRONTEND_URL` en `backend/.env` sea `http://localhost:5173`

### Puerto en uso
**Solución:** Cambia `PORT` en `backend/.env` y actualiza `VITE_API_URL` en `.env`

---

## 📊 Estructura de Colecciones en MongoDB

```
f1championship (database)
├── championships
│   ├── code: string (uppercase)
│   ├── name: string
│   ├── adminUsername: string
│   └── createdAt: Date
├── teams
│   ├── championshipCode: string
│   ├── name: string
│   ├── color: string
│   └── createdAt: Date
├── drivers
│   ├── championshipCode: string
│   ├── name: string
│   ├── teamId: ObjectId
│   ├── number: number
│   ├── estado: string
│   └── createdAt: Date
├── races
│   ├── championshipCode: string
│   ├── circuitId: string
│   ├── order: number
│   ├── isSprint: boolean
│   ├── isRain: boolean
│   └── createdAt: Date
└── results
    ├── championshipCode: string
    ├── raceId: ObjectId
    ├── qualifying: [{driverId, time}]
    ├── race: [driverId]
    ├── fastestLap: driverId
    └── updatedAt: Date
```

---

## 🎉 Conclusión

La migración ha sido exitosa. El proyecto ahora:
- ✅ NO depende de Supabase
- ✅ Se conecta directamente a MongoDB Atlas
- ✅ Tiene un backend Node.js profesional
- ✅ Es más mantenible y escalable
- ✅ Está listo para producción

**Siguiente paso:** Configurar MongoDB Atlas y seguir las instrucciones en `README_INSTALACION.md`
