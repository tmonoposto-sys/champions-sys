import { getDB } from '../config/database.js';
import { ObjectId } from 'mongodb';

export const listRaces = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Código es requerido' });
    }

    const db = getDB();
    const races = await db.collection('races')
      .find({ championshipCode: code.toUpperCase() })
      .sort({ order: 1 })
      .toArray();

    res.json(races);
  } catch (error) {
    console.error('Error listando carreras:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createRace = async (req, res) => {
  try {
    const { code, circuitId, order, isSprint, isRain } = req.body;

    if (!code || !circuitId || order === undefined) {
      return res.status(400).json({ error: 'Código, circuitId y orden son requeridos' });
    }

    const db = getDB();
    const result = await db.collection('races').insertOne({
      championshipCode: code.toUpperCase(),
      circuitId,
      order,
      isSprint: isSprint || false,
      isRain: isRain || false,
      createdAt: new Date(),
    });

    res.json({ success: true, id: result.insertedId.toString() });
  } catch (error) {
    console.error('Error creando carrera:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateRace = async (req, res) => {
  try {
    const { id, circuitId, order, isSprint, isRain } = req.body;

    if (!id || !circuitId || order === undefined) {
      return res.status(400).json({ error: 'ID, circuitId y orden son requeridos' });
    }

    const db = getDB();
    await db.collection('races').updateOne(
      { _id: new ObjectId(id) },
      { $set: { circuitId, order, isSprint, isRain, updatedAt: new Date() } }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error actualizando carrera:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteRace = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID es requerido' });
    }

    const db = getDB();
    await db.collection('races').deleteOne({ _id: new ObjectId(id) });

    res.json({ success: true });
  } catch (error) {
    console.error('Error eliminando carrera:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
