import { getDB } from '../config/database.js';

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
    console.log(championship);
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
    const { adminKey, name, adminUsername } = req.body;

    if (!adminKey || !name || !adminUsername) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const expectedKey = process.env.SUPER_ADMIN_KEY;
    if (adminKey !== expectedKey) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const code = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    const db = getDB();

    const existingByCode = await db.collection('championships').findOne({ code });
    if (existingByCode) {
      return res.status(400).json({ error: 'Ya existe un campeonato con un nombre similar (código duplicado)' });
    }

    const existingByName = await db.collection('championships').findOne({
      name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });
    if (existingByName) {
      return res.status(400).json({ error: 'Ya existe un campeonato con ese nombre' });
    }

    const result = await db.collection('championships').insertOne({
      adminKey,
      code,
      name,
      adminUsername,
      createdAt: new Date(),
    });

    res.json({ success: true, id: result.insertedId.toString(), code });
  } catch (error) {
    console.error('Error creando campeonato:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateUsername = async (req, res) => {
  try {
    const { code, currentUsername, newUsername } = req.body;

    if (!code || !currentUsername || !newUsername) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (newUsername.trim().length < 3) {
      return res.status(400).json({ error: 'El nuevo usuario debe tener al menos 3 caracteres' });
    }

    const db = getDB();
    const championship = await db.collection('championships').findOne({ code: code.toUpperCase() });

    if (!championship) {
      return res.status(404).json({ error: 'Campeonato no encontrado' });
    }

    if (championship.adminUsername !== currentUsername) {
      return res.status(401).json({ error: 'Usuario actual no coincide' });
    }

    await db.collection('championships').updateOne(
      { code: code.toUpperCase() },
      { $set: { adminUsername: newUsername.trim() } }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error actualizando username:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const VALID_TARGETS = ['results', 'races', 'drivers', 'teams', 'all'];

export const resetData = async (req, res) => {
  try {
    const { code, username, target } = req.body;

    if (!code || !username || !target) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (!VALID_TARGETS.includes(target)) {
      return res.status(400).json({ error: 'Target inválido' });
    }

    const db = getDB();
    const championshipCode = code.toUpperCase();
    const championship = await db.collection('championships').findOne({ code: championshipCode });

    if (!championship) {
      return res.status(404).json({ error: 'Campeonato no encontrado' });
    }

    if (championship.adminUsername !== username) {
      return res.status(401).json({ error: 'Usuario no autorizado' });
    }

    const filter = { championshipCode };
    const deleted = {};

    if (target === 'results' || target === 'all') {
      const r = await db.collection('results').deleteMany(filter);
      deleted.results = r.deletedCount;
    }
    if (target === 'races' || target === 'all') {
      const r = await db.collection('races').deleteMany(filter);
      deleted.races = r.deletedCount;
    }
    if (target === 'drivers' || target === 'all') {
      const r = await db.collection('drivers').deleteMany(filter);
      deleted.drivers = r.deletedCount;
    }
    if (target === 'teams' || target === 'all') {
      const r = await db.collection('teams').deleteMany(filter);
      deleted.teams = r.deletedCount;
    }
    if (target === 'all') {
      const r = await db.collection('circuits').deleteMany(filter);
      deleted.circuits = r.deletedCount;
    }

    res.json({ success: true, deleted });
  } catch (error) {
    console.error('Error reseteando datos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
