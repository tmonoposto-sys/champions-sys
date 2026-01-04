import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = 'f1championship';

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI no está configurada en las variables de entorno');
}

let client = null;
let db = null;

export async function connectDB() {
  try {
    if (db) {
      console.log('✅ Ya existe una conexión a MongoDB');
      return db;
    }

    console.log('🔄 Conectando a MongoDB Atlas...');
    client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();
    db = client.db(DATABASE_NAME);
    
    console.log('✅ Conectado exitosamente a MongoDB Atlas');
    return db;
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    throw error;
  }
}

export function getDB() {
  if (!db) {
    throw new Error('Base de datos no inicializada. Llama a connectDB() primero.');
  }
  return db;
}

export async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('🔌 Conexión a MongoDB cerrada');
  }
}

// Manejo de señales para cerrar la conexión correctamente
process.on('SIGINT', async () => {
  await closeDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDB();
  process.exit(0);
});
