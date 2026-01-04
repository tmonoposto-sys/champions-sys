import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/database.js';
import routes from './routes/index.js';

// Necesario para __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes PRIMERO (antes de servir archivos estáticos)
app.use('/api', routes);

// Servir archivos estáticos del frontend
const frontendPath = path.join(__dirname, '../../dist');
app.use(express.static(frontendPath));

// Todas las rutas no-API devuelven index.html (para React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
async function startServer() {
  try {
    // Conectar a MongoDB
    await connectDB();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════╗
║  🏎️  Monoposto Championship                  ║
║  ✅ Servidor corriendo en puerto ${PORT}        ║
║  ✅ MongoDB Atlas conectado                   ║
║  🌐 Aplicación: http://localhost:${PORT}      ║
║  📡 API: http://localhost:${PORT}/api         ║
╚═══════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
}

startServer();

export default app;
