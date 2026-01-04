# Monoposto Championship Manager 🏎️

Sistema de gestión de campeonatos de F1 con conexión directa a MongoDB Atlas.

## 🚀 Cambios Realizados

Se ha migrado completamente de Supabase a MongoDB Atlas con un backend Node.js + Express propio.

### ✅ Lo que se eliminó:
- ❌ Toda dependencia de Supabase
- ❌ Supabase Edge Functions
- ❌ Cliente de Supabase en el frontend

### ✅ Lo que se agregó:
- ✅ Backend Node.js + Express
- ✅ Conexión directa a MongoDB Atlas
- ✅ API REST completa
- ✅ Controladores organizados por colección
- ✅ Manejo de errores robusto

## 📋 Requisitos Previos

- Node.js 18 o superior
- Una cuenta de MongoDB Atlas (gratuita)
- npm o yarn

## 🗄️ Configuración de MongoDB Atlas

1. **Crear una cuenta en MongoDB Atlas**
   - Ve a [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Crea una cuenta gratuita

2. **Crear un Cluster**
   - Crea un cluster gratuito (M0)
   - Selecciona la región más cercana

3. **Configurar acceso a la base de datos**
   - Ve a "Database Access"
   - Crea un usuario con permisos de lectura y escritura
   - Guarda el usuario y contraseña

4. **Configurar acceso de red**
   - Ve a "Network Access"
   - Agrega tu IP o permite acceso desde cualquier lugar (0.0.0.0/0) para desarrollo

5. **Obtener el Connection String**
   - Ve a "Database" → "Connect" → "Connect your application"
   - Copia el connection string
   - Reemplaza `<password>` con tu contraseña real

6. **Crear la base de datos y colecciones**
   - Ve a "Collections" → "Create Database"
   - Nombre de la base de datos: `f1championship`
   - Crea las siguientes colecciones:
     - `championships`
     - `teams`
     - `drivers`
     - `races`
     - `results`

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd monoposto-champs-web-main
```

### 2. Configurar el Backend

```bash
cd backend

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env
```

Edita el archivo `backend/.env` y configura:

```env
# Tu connection string de MongoDB Atlas
MONGODB_URI=mongodb+srv://tuusuario:tupassword@cluster.mongodb.net/?retryWrites=true&w=majority

# Clave secreta para crear campeonatos
SUPER_ADMIN_KEY=tu_clave_super_secreta_123

# Puerto del servidor (opcional)
PORT=3001

# URL del frontend para CORS
FRONTEND_URL=http://localhost:5173
```

### 3. Configurar el Frontend

```bash
# Desde la raíz del proyecto
cd ..

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env
```

Edita el archivo `.env` del frontend:

```env
VITE_API_URL=http://localhost:3001/api
```

## ▶️ Ejecutar la Aplicación

### Opción 1: Ejecutar todo manualmente

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Opción 2: Usar un script (crear este archivo)

Crea un archivo `start.sh` en la raíz del proyecto:

```bash
#!/bin/bash

# Iniciar backend en background
cd backend && npm run dev &
BACKEND_PID=$!

# Iniciar frontend
cd .. && npm run dev

# Limpiar al salir
trap "kill $BACKEND_PID" EXIT
```

Hazlo ejecutable y ejecútalo:
```bash
chmod +x start.sh
./start.sh
```

## 🌐 Acceder a la Aplicación

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001/api
- **Health Check:** http://localhost:3001/api/health

## 📡 Endpoints de la API

### Championships
- `POST /api/championships/login` - Login a un campeonato
- `POST /api/championships/get` - Obtener datos de un campeonato
- `POST /api/championships/create` - Crear nuevo campeonato (requiere SUPER_ADMIN_KEY)

### Teams
- `POST /api/teams/list` - Listar equipos
- `POST /api/teams/create` - Crear equipo
- `POST /api/teams/update` - Actualizar equipo
- `POST /api/teams/delete` - Eliminar equipo

### Drivers
- `POST /api/drivers/list` - Listar pilotos
- `POST /api/drivers/create` - Crear piloto
- `POST /api/drivers/update` - Actualizar piloto
- `POST /api/drivers/delete` - Eliminar piloto

### Races
- `POST /api/races/list` - Listar carreras
- `POST /api/races/create` - Crear carrera
- `POST /api/races/update` - Actualizar carrera
- `POST /api/races/delete` - Eliminar carrera

### Results
- `POST /api/results/list` - Listar todos los resultados
- `POST /api/results/get` - Obtener resultado de una carrera específica
- `POST /api/results/saveQualifying` - Guardar resultado de clasificación
- `POST /api/results/saveRace` - Guardar resultado de carrera

## 🔒 Seguridad

- Las variables de entorno no deben compartirse públicamente
- Cambia `SUPER_ADMIN_KEY` a algo único y seguro
- En producción, configura `FRONTEND_URL` a tu dominio real
- No commits archivos `.env` al repositorio

## 🐛 Solución de Problemas

### Error de conexión a MongoDB

**Error:** `MongoServerError: Authentication failed`
- Verifica que el usuario y contraseña en el connection string sean correctos
- Asegúrate de haber configurado "Database Access" en MongoDB Atlas

**Error:** `MongoServerError: connection refused`
- Verifica que hayas configurado "Network Access" en MongoDB Atlas
- Agrega tu IP o permite acceso desde 0.0.0.0/0

### Error CORS

Si ves errores de CORS en el navegador:
- Verifica que `FRONTEND_URL` en el backend `.env` coincida con la URL del frontend
- Reinicia el servidor backend después de cambiar `.env`

### Puerto en uso

Si el puerto 3001 ya está en uso:
- Cambia `PORT` en `backend/.env` a otro puerto (ej: 3002)
- Actualiza `VITE_API_URL` en el frontend `.env`

## 📦 Build para Producción

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
npm run build
npm run preview
```

## 🗂️ Estructura del Proyecto

```
monoposto-champs-web-main/
├── backend/                    # Backend Node.js + Express
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js    # Configuración MongoDB
│   │   ├── controllers/       # Controladores por colección
│   │   │   ├── championshipsController.js
│   │   │   ├── teamsController.js
│   │   │   ├── driversController.js
│   │   │   ├── racesController.js
│   │   │   └── resultsController.js
│   │   ├── routes/
│   │   │   └── index.js       # Definición de rutas
│   │   └── index.js           # Servidor Express
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
├── src/                        # Frontend React + Vite
│   ├── services/
│   │   └── api.ts             # Cliente API (actualizado)
│   └── ...
├── .env.example
├── package.json
└── README.md
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Notas Importantes

- **NO** subas archivos `.env` al repositorio
- El archivo `.gitignore` ya está configurado para ignorarlos
- Mantén actualizado el `.env.example` con las variables necesarias (sin valores reales)
- Cambia las claves secretas en producción

## 📄 Licencia

Este proyecto es de código abierto.

## 🆘 Soporte

Si tienes problemas:
1. Revisa la sección "Solución de Problemas"
2. Verifica los logs del backend y frontend
3. Asegúrate de que MongoDB Atlas esté configurado correctamente
4. Crea un issue en el repositorio con detalles del error

---

¡Hecho con ❤️ para la comunidad de F1!
