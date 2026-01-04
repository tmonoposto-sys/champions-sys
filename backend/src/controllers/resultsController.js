import { getDB } from '../config/database.js';
import { ObjectId } from 'mongodb';

export const listResults = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Código es requerido' });
    }

    const db = getDB();
    const results = await db.collection('results')
      .find({ championshipCode: code.toUpperCase() })
      .toArray();

    res.json(results);
  } catch (error) {
    console.error('Error listando resultados:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getRaceResult = async (req, res) => {
  try {
    const { code, raceId } = req.body;

    if (!code || !raceId) {
      return res.status(400).json({ error: 'Código y raceId son requeridos' });
    }

    const db = getDB();
    const result = await db.collection('results').findOne({ 
      championshipCode: code.toUpperCase(),
      raceId 
    });

    res.json(result || { 
      championshipCode: code.toUpperCase(),
      raceId,
      qualifying: [], 
      race: [], 
      fastestLap: null 
    });
  } catch (error) {
    console.error('Error obteniendo resultado:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const saveQualifyingResult = async (req, res) => {
  try {
    const { code, raceId, qualifying } = req.body;

    if (!code || !raceId || !qualifying) {
      return res.status(400).json({ error: 'Código, raceId y qualifying son requeridos' });
    }

    const db = getDB();
    await db.collection('results').updateOne(
      { championshipCode: code.toUpperCase(), raceId },
      { 
        $set: { 
          championshipCode: code.toUpperCase(),
          raceId,
          qualifying, 
          updatedAt: new Date() 
        } 
      },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error guardando clasificación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const saveRaceResult = async (req, res) => {
  try {
    const { code, raceId, race, fastestLap } = req.body;

    if (!code || !raceId || !race) {
      return res.status(400).json({ error: 'Código, raceId y race son requeridos' });
    }

    const db = getDB();
    await db.collection('results').updateOne(
      { championshipCode: code.toUpperCase(), raceId },
      { 
        $set: { 
          championshipCode: code.toUpperCase(),
          raceId,
          race, 
          fastestLap: fastestLap || null, 
          updatedAt: new Date() 
        } 
      },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error guardando resultado de carrera:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
