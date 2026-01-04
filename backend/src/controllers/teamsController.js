import { getDB } from '../config/database.js';
import { ObjectId } from 'mongodb';

export const listTeams = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Código es requerido' });
    }

    const db = getDB();
    const teams = await db.collection('teams')
      .find({ championshipCode: code.toUpperCase() })
      .toArray();

    res.json(teams);
  } catch (error) {
    console.error('Error listando equipos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createTeam = async (req, res) => {
  try {
    const { code, name, color } = req.body;

    if (!code || !name || !color) {
      return res.status(400).json({ error: 'Código, nombre y color son requeridos' });
    }

    const db = getDB();
    const result = await db.collection('teams').insertOne({
      championshipCode: code.toUpperCase(),
      name,
      color,
      createdAt: new Date(),
    });

    res.json({ success: true, id: result.insertedId.toString() });
  } catch (error) {
    console.error('Error creando equipo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateTeam = async (req, res) => {
  try {
    const { id, name, color } = req.body;

    if (!id || !name || !color) {
      return res.status(400).json({ error: 'ID, nombre y color son requeridos' });
    }

    const db = getDB();
    await db.collection('teams').updateOne(
      { _id: new ObjectId(id) },
      { $set: { name, color, updatedAt: new Date() } }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error actualizando equipo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID es requerido' });
    }

    const db = getDB();
    await db.collection('teams').deleteOne({ _id: new ObjectId(id) });

    res.json({ success: true });
  } catch (error) {
    console.error('Error eliminando equipo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
