import { getDB } from '../config/database.js';
import { ObjectId } from 'mongodb';

export const listCircuits = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Código es requerido' });
    }

    const db = getDB();
    const circuits = await db.collection('circuits')
      .find({ championshipCode: code.toUpperCase() })
      .sort({ name: 1 })
      .toArray();

    res.json(circuits);
  } catch (error) {
    console.error('Error listando circuitos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createCircuit = async (req, res) => {
  try {
    const { code, name, circuit, country, flag } = req.body;

    if (!code || !name) {
      return res.status(400).json({ error: 'Código y nombre son requeridos' });
    }

    const db = getDB();
    const result = await db.collection('circuits').insertOne({
      championshipCode: code.toUpperCase(),
      name,
      circuit: circuit || '',
      country: country || '',
      flag: flag || '🏁',
      createdAt: new Date(),
    });

    res.json({ success: true, id: result.insertedId.toString() });
  } catch (error) {
    console.error('Error creando circuito:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateCircuit = async (req, res) => {
  try {
    const { id, name, circuit, country, flag } = req.body;

    if (!id || !name) {
      return res.status(400).json({ error: 'ID y nombre son requeridos' });
    }

    const db = getDB();
    await db.collection('circuits').updateOne(
      { _id: new ObjectId(id) },
      { $set: { name, circuit: circuit || '', country: country || '', flag: flag || '🏁', updatedAt: new Date() } }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error actualizando circuito:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteCircuit = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID es requerido' });
    }

    const db = getDB();
    await db.collection('circuits').deleteOne({ _id: new ObjectId(id) });

    res.json({ success: true });
  } catch (error) {
    console.error('Error eliminando circuito:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
