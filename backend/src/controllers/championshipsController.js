import { getDB } from '../config/database.js';
import { ObjectId } from 'mongodb';

export const loginChampionship = async (req, res) => {
  try {
    const { username, code } = req.body;
    
    if (!username || !code) {
      return res.status(400).json({ error: 'Username y código son requeridos' });
    }

    const db = getDB();
    const championship = await db.collection('championships').findOne({ 
      code: code.toUpperCase() 
    });

    if (!championship) {
      return res.status(404).json({ error: 'Campeonato no encontrado' });
    }

    if (championship.adminUsername !== username) {
      return res.status(401).json({ error: 'Usuario no autorizado' });
    }

    res.json({ 
      success: true, 
      championship: { 
        code: championship.code, 
        name: championship.name 
      } 
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getChampionship = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Código es requerido' });
    }

    const db = getDB();
    const championship = await db.collection('championships').findOne({ 
      code: code.toUpperCase() 
    });

    if (!championship) {
      return res.status(404).json({ error: 'Campeonato no encontrado' });
    }

    res.json({ 
      code: championship.code, 
      name: championship.name 
    });
  } catch (error) {
    console.error('Error obteniendo campeonato:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createChampionship = async (req, res) => {
  try {
    const { adminKey, code, name, adminUsername } = req.body;

    if (!adminKey || !code || !name || !adminUsername) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const expectedKey = process.env.SUPER_ADMIN_KEY;
    if (adminKey !== expectedKey) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const db = getDB();
    const existing = await db.collection('championships').findOne({ 
      code: code.toUpperCase() 
    });

    if (existing) {
      return res.status(400).json({ error: 'El código ya existe' });
    }

    const result = await db.collection('championships').insertOne({
      code: code.toUpperCase(),
      name,
      adminUsername,
      createdAt: new Date(),
    });

    res.json({ success: true, id: result.insertedId.toString() });
  } catch (error) {
    console.error('Error creando campeonato:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
