import { getDB } from '../config/database.js';
import { ObjectId } from 'mongodb';

export const listDrivers = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Código es requerido' });
    }

    const db = getDB();
    const drivers = await db.collection('drivers')
      .find({ championshipCode: code.toUpperCase() })
      .toArray();

    res.json(drivers);
  } catch (error) {
    console.error('Error listando pilotos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createDriver = async (req, res) => {
  try {
    const { code, name, teamId, number, estado } = req.body;

    if (!code || !name || !teamId || number === undefined) {
      return res.status(400).json({ error: 'Código, nombre, teamId y número son requeridos' });
    }

    const db = getDB();
    const result = await db.collection('drivers').insertOne({
      championshipCode: code.toUpperCase(),
      name,
      teamId,
      number,
      estado: estado || 'Titular',
      createdAt: new Date(),
    });

    res.json({ success: true, id: result.insertedId.toString() });
  } catch (error) {
    console.error('Error creando piloto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateDriver = async (req, res) => {
  try {
    const { id, name, teamId, number, estado } = req.body;

    if (!id || !name || !teamId || number === undefined || !estado) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const db = getDB();
    await db.collection('drivers').updateOne(
      { _id: new ObjectId(id) },
      { $set: { name, teamId, number, estado, updatedAt: new Date() } }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error actualizando piloto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteDriver = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID es requerido' });
    }

    const db = getDB();
    await db.collection('drivers').deleteOne({ _id: new ObjectId(id) });

    res.json({ success: true });
  } catch (error) {
    console.error('Error eliminando piloto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
