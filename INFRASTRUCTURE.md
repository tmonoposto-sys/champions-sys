# Infraestructura - Monoposto Championship Manager

## 1. Vision general

Monoposto Championship Manager es una aplicacion web monolitica alojada en un unico repositorio. En produccion se ejecuta como **un solo proceso Node.js** (Express) que:

1. Expone la API REST en `/api/*`.
2. Sirve el frontend compilado (React) como archivos estaticos desde la carpeta `dist/`.

Todo opera en un unico puerto, eliminando problemas de CORS y simplificando el despliegue.

```
            Puerto 3001 (configurable)
                   |
           ┌───────┴───────┐
           |   Express     |
           |   Server      |
           └───────┬───────┘
                   |
           ┌───────┴──────────┐
           |                  |
       /api/*              /*
      Backend           Frontend
       (JSON)           (HTML/JS)
```

---

## 2. Stack tecnologico

| Capa           | Tecnologia                                                                 |
|----------------|----------------------------------------------------------------------------|
| Frontend       | React 18, Vite 5, TypeScript, Tailwind CSS, shadcn/ui (Radix UI)          |
| Routing SPA    | React Router DOM 6                                                         |
| Estado servidor| TanStack React Query                                                       |
| Formularios    | React Hook Form + Zod                                                      |
| Graficos       | Recharts                                                                   |
| Backend        | Node.js 20, Express 4, ES Modules                                         |
| Base de datos  | MongoDB Atlas (driver nativo `mongodb` v6.3, sin ORM)                      |
| Contenedor     | Docker (`node:20-alpine`)                                                  |
| Hosting        | Render                                                                     |
| CI/CD          | GitHub Actions                                                             |

---

## 3. Estructura del repositorio

```
monoposto-champs-web-main/
├── .github/workflows/         # GitHub Actions (keep-alive)
├── backend/                   # Servidor Express
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js    # Conexion a MongoDB Atlas
│   │   ├── controllers/       # Logica de negocio (championships, teams, drivers, races, results)
│   │   ├── routes/
│   │   │   └── index.js       # Definicion de rutas API
│   │   └── index.js           # Punto de entrada del servidor
│   ├── .env                   # Variables de entorno del backend (no versionado)
│   ├── .env.example
│   └── package.json           # Dependencias del backend
├── src/                       # Codigo fuente React (frontend)
│   ├── components/            # Componentes UI (shadcn/ui)
│   ├── contexts/              # AuthContext
│   ├── hooks/                 # Custom hooks
│   ├── pages/                 # Paginas (admin/, public/)
│   ├── services/
│   │   └── api.ts             # Cliente HTTP hacia /api/*
│   ├── types/                 # Tipos TypeScript
│   └── main.tsx               # Punto de entrada React
├── dist/                      # Frontend compilado (auto-generado por Vite)
├── public/                    # Assets estaticos
├── Dockerfile                 # Imagen Docker para despliegue
├── vite.config.ts             # Configuracion de Vite (proxy, alias)
├── package.json               # Dependencias y scripts del frontend
├── start-unified.sh           # Script de inicio todo-en-uno
├── .env.example               # Plantilla de env del frontend
└── index.html                 # HTML raiz de Vite
```

**Nota:** No es un monorepo con workspaces de npm. Los dos `package.json` (raiz y `backend/`) se coordinan mediante scripts definidos en el `package.json` raiz.

---

## 4. Como el backend sirve el frontend

El servidor Express en `backend/src/index.js` sigue este orden:

1. **Middleware global:** CORS, JSON parser, logger.
2. **Rutas API:** `app.use('/api', routes)` — todas las peticiones a `/api/*` son manejadas por los controllers.
3. **Archivos estaticos:** `express.static(path.join(__dirname, '../../dist'))` — sirve el build de Vite.
4. **Fallback SPA:** `app.get('*')` devuelve `dist/index.html` para que React Router maneje la navegacion del lado del cliente.

```
Peticion entrante
       |
       ├─ /api/*  →  Controllers  →  MongoDB  →  JSON response
       |
       ├─ /assets/*  →  express.static(dist/)  →  archivo estatico
       |
       └─ /*  →  dist/index.html  →  React Router toma el control
```

---

## 5. Base de datos

### Motor

MongoDB Atlas (cloud). Sin ORM; se utiliza el driver oficial `mongodb` v6.3 directamente.

### Base de datos

`f1championship`

### Colecciones y esquema

```
championships
├── code: string (uppercase, unico)
├── name: string
├── adminUsername: string
└── createdAt: Date

teams
├── championshipCode: string
├── name: string
├── color: string
└── createdAt: Date

drivers
├── championshipCode: string
├── name: string
├── teamId: ObjectId
├── number: number
├── estado: string
└── createdAt: Date

races
├── championshipCode: string
├── circuitId: string
├── order: number
├── isSprint: boolean
├── isRain: boolean
└── createdAt: Date

results
├── championshipCode: string
├── raceId: ObjectId
├── qualifying: [{driverId, time}]
├── race: [driverId]
├── fastestLap: driverId
└── updatedAt: Date
```

### Conexion

Configurada en `backend/src/config/database.js`. Usa la variable `MONGODB_URI` con connection pooling integrado del driver.

---

## 6. Variables de entorno

### Backend (`backend/.env`)

| Variable          | Requerida | Descripcion                                      | Ejemplo                                         |
|-------------------|-----------|--------------------------------------------------|--------------------------------------------------|
| `MONGODB_URI`     | Si        | Connection string de MongoDB Atlas               | `mongodb+srv://user:pass@cluster.mongodb.net/`   |
| `SUPER_ADMIN_KEY` | Si        | Clave secreta para crear campeonatos             | `mi_clave_secreta_123`                           |
| `PORT`            | No        | Puerto del servidor (default: `3001`)            | `3001`                                           |
| `FRONTEND_URL`    | No        | Origen permitido para CORS                       | `http://localhost:3001`                          |
| `NODE_ENV`        | No        | Entorno de ejecucion                             | `production` / `development`                     |

### Frontend (`.env` en raiz)

| Variable       | Requerida | Descripcion                                         | Ejemplo  |
|----------------|-----------|-----------------------------------------------------|----------|
| `VITE_API_URL` | No        | URL base de la API (default: `/api` — ruta relativa) | `/api`   |

En produccion no se necesita `.env` en la raiz porque el frontend usa `/api` como ruta relativa (mismo origen).

---

## 7. Docker

El proyecto incluye un `Dockerfile` en la raiz:

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build          # Compila el frontend -> dist/

WORKDIR /app/backend
RUN npm install

ENV NODE_ENV=production
EXPOSE 10000

CMD ["node", "src/index.js"]
```

### Flujo de la imagen

1. Instala dependencias del frontend y compila con Vite (`npm run build` genera `dist/`).
2. Cambia al directorio `backend/` e instala sus dependencias.
3. Inicia el servidor Express que sirve API + frontend.
4. Expone el puerto `10000` (usado por Render).

### Construir y ejecutar localmente

```bash
docker build -t monoposto-champs .
docker run -p 3001:10000 \
  -e MONGODB_URI="mongodb+srv://..." \
  -e SUPER_ADMIN_KEY="clave" \
  -e PORT=10000 \
  monoposto-champs
```

---

## 8. Despliegue (Render)

| Aspecto            | Detalle                                       |
|--------------------|-----------------------------------------------|
| Plataforma         | Render (Web Service)                          |
| URL de produccion  | `https://champions-sys.onrender.com`          |
| Puerto interno     | `10000` (variable `PORT` de Render)           |
| Health check       | `GET /api/health`                             |
| Build              | Docker (usa el `Dockerfile` de la raiz)       |

### Keep-alive (GitHub Actions)

Render suspende los servicios gratuitos tras inactividad. Para mantenerlo activo se usa un workflow en `.github/workflows/keep-alive.yml`:

```yaml
name: Keep Render Awake
on:
  schedule:
    - cron: "*/10 * * * *"   # Cada 10 minutos
  workflow_dispatch:
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Render backend
        run: |
          curl -s https://champions-sys.onrender.com/api/health > /dev/null
```

---

## 9. Scripts disponibles

### Raiz (`package.json`)

| Script          | Comando                                  | Descripcion                                      |
|-----------------|------------------------------------------|--------------------------------------------------|
| `dev`           | `vite`                                   | Servidor de desarrollo frontend (puerto 8080)    |
| `dev:backend`   | `cd backend && npm run dev`              | Servidor de desarrollo backend con watch          |
| `build`         | `vite build`                             | Compila frontend a `dist/`                       |
| `start`         | `npm run build && cd backend && npm start` | Build completo + inicio del servidor            |
| `install:all`   | `npm install && cd backend && npm install` | Instala dependencias de ambos packages          |
| `lint`          | `eslint .`                               | Ejecuta ESLint                                   |
| `preview`       | `vite preview`                           | Vista previa del build de produccion             |

### Backend (`backend/package.json`)

| Script  | Comando                   | Descripcion                              |
|---------|---------------------------|------------------------------------------|
| `dev`   | `node --watch src/index.js` | Servidor con reinicio automatico        |
| `start` | `node src/index.js`        | Servidor en modo produccion             |

---

## 10. Flujo de desarrollo vs produccion

### Desarrollo

```
Terminal 1: npm run dev:backend     →  Express en :3001
Terminal 2: npm run dev             →  Vite en :8080 (con proxy /api → :3001)
```

- Vite ofrece Hot Module Replacement (HMR) para el frontend.
- El proxy en `vite.config.ts` redirige `/api` al backend local.
- Los cambios en el backend se recargan automaticamente (`node --watch`).

### Produccion

```
npm run build      →  Genera dist/ con HTML/JS/CSS optimizados
cd backend
npm start          →  Express sirve API + dist/ en un solo puerto
```

O en un solo comando desde la raiz:

```
npm start          →  Ejecuta build + inicia backend
```

```
┌──────────────────────────────────────────┐
│         Express (puerto unico)           │
│                                          │
│   /api/*  →  Controllers → MongoDB       │
│   /*      →  dist/index.html (React SPA) │
└──────────────────────────────────────────┘
```

---

## 11. Autenticacion

El sistema usa un modelo de autenticacion simple sin JWT ni OAuth:

### Login de administrador

- **Endpoint:** `POST /api/championships/login`
- **Credenciales:** `username` (nombre del admin) + `code` (codigo del campeonato)
- **Almacenamiento de sesion:** `localStorage` bajo la clave `f1_admin_session`
- **Contexto React:** `src/contexts/AuthContext.tsx` gestiona el estado de autenticacion en el frontend

### Super admin

- **Endpoint:** `POST /api/championships/create`
- **Proteccion:** Requiere enviar `adminKey` en el body, que se valida contra la variable de entorno `SUPER_ADMIN_KEY`
- Usado exclusivamente para crear nuevos campeonatos

### Notas

- No hay tokens de sesion del lado del servidor; la validacion se realiza comparando credenciales directamente con la base de datos en cada operacion administrativa.
- Sin expiración de sesion; el usuario permanece autenticado hasta que cierre sesion o limpie `localStorage`.
