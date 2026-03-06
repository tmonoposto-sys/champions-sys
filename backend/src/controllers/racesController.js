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

async function normalizeOrders(db, championshipCode) {
  const races = await db.collection('races')
    .find({ championshipCode })
    .sort({ order: 1 })
    .toArray();

  const ops = races.map((race, i) => ({
    updateOne: {
      filter: { _id: race._id },
      update: { $set: { order: i + 1 } },
    },
  }));

  if (ops.length > 0) {
    await db.collection('races').bulkWrite(ops);
  }
}

export const createRace = async (req, res) => {
  try {
    const { code, circuitId, order, isSprint, isRain } = req.body;

    if (!code || !circuitId || order === undefined) {
      return res.status(400).json({ error: 'Código, circuitId y orden son requeridos' });
    }

    const championshipCode = code.toUpperCase();
    const db = getDB();

    await db.collection('races').updateMany(
      { championshipCode, order: { $gte: order } },
      { $inc: { order: 1 } }
    );

    const result = await db.collection('races').insertOne({
      championshipCode,
      circuitId,
      order,
      isSprint: isSprint || false,
      isRain: isRain || false,
      createdAt: new Date(),
    });

    await normalizeOrders(db, championshipCode);

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
    const existing = await db.collection('races').findOne({ _id: new ObjectId(id) });
    if (!existing) {
      return res.status(404).json({ error: 'Carrera no encontrada' });
    }

    const oldOrder = existing.order;
    const championshipCode = existing.championshipCode;

    if (oldOrder !== order) {
      if (order > oldOrder) {
        await db.collection('races').updateMany(
          { championshipCode, _id: { $ne: new ObjectId(id) }, order: { $gt: oldOrder, $lte: order } },
          { $inc: { order: -1 } }
        );
      } else {
        await db.collection('races').updateMany(
          { championshipCode, _id: { $ne: new ObjectId(id) }, order: { $gte: order, $lt: oldOrder } },
          { $inc: { order: 1 } }
        );
      }
    }

    await db.collection('races').updateOne(
      { _id: new ObjectId(id) },
      { $set: { circuitId, order, isSprint, isRain, updatedAt: new Date() } }
    );

    await normalizeOrders(db, championshipCode);

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
    const existing = await db.collection('races').findOne({ _id: new ObjectId(id) });
    await db.collection('races').deleteOne({ _id: new ObjectId(id) });

    if (existing) {
      await normalizeOrders(db, existing.championshipCode);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error eliminando carrera:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
