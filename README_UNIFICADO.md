# Monoposto Championship Manager 🏎️
### Todo en un Solo Servidor

## 🎯 Arquitectura Unificada

En esta configuración, **un solo servidor Express** sirve tanto la API como el frontend:
- **Puerto único:** 3001 (configurable)
- **Backend:** Express + MongoDB Atlas
- **Frontend:** React compilado y servido como archivos estáticos

```
           Puerto 3001
                |
        ┌───────┴───────┐
        |   Express     |
        |   Server      |
        └───────┬───────┘
                |
        ┌───────┴───────────┐
        |                   |
    /api/*              /*
   Backend           Frontend
    (JSON)           (HTML/JS)
```

## 🚀 Inicio Rápido

### 1. Configurar MongoDB Atlas

Crea tu base de datos en MongoDB Atlas y obtén tu connection string:
1. Ve a [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster gratuito
3. Crea un usuario de base de datos
4. Configura acceso de red (agregar tu IP)
5. Copia el connection string

Crea las siguientes colecciones en la base de datos `f1championship`:
- `championships`
- `teams`
- `drivers`
- `races`
- `results`

### 2. Configurar Variables de Entorno

Crea el archivo `backend/.env`:

```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/
SUPER_ADMIN_KEY=mi_clave_secreta_123
PORT=3001
NODE_ENV=production
```

**No necesitas crear archivo `.env` en la raíz del proyecto** - solo el del backend.

### 3. Instalar e Iniciar

```bash
# Opción A: Script automático (Recomendado)
chmod +x start-unified.sh
./start-unified.sh

# Opción B: Manual
npm install
cd backend && npm install && cd ..
npm run build
cd backend && npm start
```

### 4. Acceder a la Aplicación

Abre tu navegador en: **http://localhost:3001**

¡Eso es todo! 🎉

## 📂 Estructura del Proyecto

```
monoposto-champs-web-main/
├── backend/                    # Servidor Express
│   ├── src/
│   │   ├── config/            # Configuración MongoDB
│   │   ├── controllers/       # Lógica de negocio
│   │   ├── routes/            # Rutas API
│   │   └── index.js           # Servidor principal
│   ├── .env                   # Variables de entorno (CREAR)
│   └── package.json
├── src/                       # Código fuente React
├── dist/                      # Frontend compilado (auto-generado)
├── start-unified.sh          # Script de inicio
└── package.json
```

## 🔧 Comandos Disponibles

### Desarrollo del Frontend (opcional)
```bash
# Solo si necesitas trabajar en el frontend con hot-reload
npm run dev
# Abre: http://localhost:8080
```

### Producción (Recomendado)
```bash
# Compilar frontend + Iniciar servidor
npm run build
cd backend && npm start

# O usar el script:
./start-unified.sh
```

## 🌐 Endpoints

### Frontend
- Todas las rutas (`/`, `/admin`, `/public/*`, etc.)
- Servido desde: `http://localhost:3001`

### API Backend
- Base: `http://localhost:3001/api`
- Health check: `http://localhost:3001/api/health`
- Championships: `/api/championships/*`
- Teams: `/api/teams/*`
- Drivers: `/api/drivers/*`
- Races: `/api/races/*`
- Results: `/api/results/*`

## 📝 Notas Importantes

### ✅ Ventajas de esta arquitectura:
- **Simplicidad:** Un solo servidor, un solo puerto
- **Fácil despliegue:** Solo necesitas desplegar el backend
- **Sin CORS:** Frontend y API en el mismo origen
- **Producción lista:** Optimizado para deployment

### 🔄 Flujo de Trabajo

**Desarrollo:**
1. Trabaja en el código del frontend (`src/`)
2. Usa `npm run dev` para ver cambios en tiempo real
3. El proxy de Vite redirige `/api` al backend en 3001

**Producción:**
1. Compila el frontend: `npm run build` → genera `dist/`
2. Inicia el backend: `cd backend && npm start`
3. El backend sirve los archivos de `dist/` y la API

## 🐛 Solución de Problemas

### El servidor no inicia
- Verifica que `backend/.env` exista y tenga `MONGODB_URI`
- Revisa que el puerto 3001 esté disponible

### No se conecta a MongoDB
- Verifica tu connection string
- Asegúrate de haber configurado "Network Access" en MongoDB Atlas
- Verifica que el usuario tenga permisos

### Cambios en el frontend no se ven
- Debes recompilar: `npm run build`
- O usa modo desarrollo: `npm run dev` en puerto 8080

## 🚀 Desplegar en Producción

Para desplegar en un servidor (Heroku, Railway, DigitalOcean, etc.):

1. Sube el código al servidor
2. Configura las variables de entorno en el servidor
3. Ejecuta:
```bash
npm install
cd backend && npm install && cd ..
npm run build
cd backend && npm start
```

4. Configura tu dominio para apuntar al puerto del servidor

## 💡 Tips

- **Puerto personalizado:** Cambia `PORT` en `backend/.env`
- **Logs:** Revisa la consola del servidor para debug
- **Base de datos:** Usa MongoDB Compass para ver tus datos

## 🆘 Soporte

Si tienes problemas:
1. Verifica los logs en la consola
2. Asegúrate de que MongoDB Atlas esté configurado correctamente
3. Revisa que todas las dependencias estén instaladas

---

**¡Listo para correr! 🏁**
