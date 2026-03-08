/**
 * Migración de JSON de torneo a Champions Sys (MongoDB).
 * Uso: node scripts/migrate-from-json.js <ruta-al-archivo.json> <username>
 * Requiere backend/.env con MONGODB_URI y SUPER_ADMIN_KEY.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.join(__dirname, '..');
const rootDir = path.join(backendDir, '..');
// Cargar .env: primero backend/.env, luego raíz del proyecto (por si solo existe ahí)
dotenv.config({ path: path.join(backendDir, '.env') });
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.join(rootDir, '.env') });
}

// Import dinámico para que database.js lea MONGODB_URI después de cargar .env (en ESM los import estáticos se ejecutan antes que el código)
let connectDB, getDB, closeDB;

const GP_ID_TO_CIRCUIT_ID = {
  1: 'australia', 2: 'china', 3: 'japan', 4: 'bahrain', 5: 'saudi', 6: 'turkey',
  7: 'imola', 8: 'monaco', 9: 'canada', 10: 'spain', 11: 'austria', 12: 'austria',
  13: 'hungary', 14: 'belgium', 15: 'monza', 16: 'monza', 17: 'netherlands',
  18: 'silverstone', 19: 'azerbaijan', 20: 'azerbaijan', 21: 'singapore',
  22: 'usa', 23: 'usa', 24: 'mexico', 25: 'brazil', 26: 'brazil', 27: 'lasvegas',
  28: 'qatar', 29: 'abudhabi',
};

function usage() {
  console.error('Uso: node scripts/migrate-from-json.js <ruta-al-archivo.json> <username>');
  console.error('  ruta-al-archivo.json  Ruta al JSON del torneo (absoluta o relativa al directorio actual)');
  console.error('  username              Usuario administrador del campeonato (adminUsername)');
}

async function run() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    usage();
    process.exit(1);
  }

  const jsonPath = path.resolve(process.cwd(), args[0]);
  const adminUsername = args[1].trim();
  if (!adminUsername) {
    console.error('Error: username no puede estar vacío.');
    process.exit(1);
  }

  const adminKey = process.env.SUPER_ADMIN_KEY;
  if (!adminKey) {
    console.error('Error: SUPER_ADMIN_KEY no está definida en backend/.env');
    process.exit(1);
  }

  let data;
  try {
    const raw = fs.readFileSync(jsonPath, 'utf-8');
    data = JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') console.error('Error: archivo no encontrado:', jsonPath);
    else if (err instanceof SyntaxError) console.error('Error: el archivo JSON no es válido:', err.message);
    else console.error('Error leyendo el archivo:', err.message);
    process.exit(1);
  }

  if (!data.championship || !data.teams || !data.drivers || !data.grandPrix || !data.results) {
    console.error('Error: el JSON debe contener championship, teams, drivers, grandPrix y results.');
    process.exit(1);
  }

  const name = data.championship.season
    ? `${data.championship.name} ${data.championship.season}`.trim()
    : data.championship.name;
  const code = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

  const dbModule = await import('../src/config/database.js');
  connectDB = dbModule.connectDB;
  getDB = dbModule.getDB;
  closeDB = dbModule.closeDB;
  await connectDB();
  const db = getDB();

  try {
    const existing = await db.collection('championships').findOne({ code });
    if (existing) {
      console.error(`Error: ya existe un campeonato con código "${code}". Usa otro nombre o resetea datos.`);
      process.exit(1);
    }

    await db.collection('championships').insertOne({
      adminKey, code, name, adminUsername, createdAt: new Date(),
    });
    console.log('Campeonato creado:', code, '-', name);

    const jsonTeamIdToMongoId = {};
    for (const team of data.teams) {
      const res = await db.collection('teams').insertOne({
        championshipCode: code, name: team.name, color: team.color, createdAt: new Date(),
      });
      jsonTeamIdToMongoId[team.id] = res.insertedId.toString();
    }
    console.log('Equipos creados:', data.teams.length);

    const jsonDriverIdToMongoId = {};
    for (const driver of data.drivers) {
      const teamId = jsonTeamIdToMongoId[driver.team];
      if (!teamId) {
        console.error(`Error: equipo "${driver.team}" no encontrado para piloto ${driver.name} (id ${driver.id}).`);
        process.exit(1);
      }
      const res = await db.collection('drivers').insertOne({
        championshipCode: code,
        name: driver.name,
        teamId,
        number: driver.number,
        estado: driver.estado || 'Titular',
        createdAt: new Date(),
      });
      jsonDriverIdToMongoId[driver.id] = res.insertedId.toString();
    }
    console.log('Pilotos creados:', data.drivers.length);

    const sortedGp = [...data.grandPrix].sort((a, b) => a.id - b.id);
    const jsonGpIdToRaceId = {};
    for (const gp of sortedGp) {
      const circuitId = GP_ID_TO_CIRCUIT_ID[gp.id];
      if (!circuitId) {
        console.error(`Error: no hay mapeo de circuito para GP id ${gp.id} (${gp.name}).`);
        process.exit(1);
      }
      const res = await db.collection('races').insertOne({
        championshipCode: code,
        circuitId,
        order: gp.id,
        isSprint: gp.isSprint ?? false,
        isRain: gp.isRain ?? false,
        createdAt: new Date(),
      });
      jsonGpIdToRaceId[gp.id] = res.insertedId.toString();
    }
    console.log('Carreras creadas:', sortedGp.length);

    let resultsCount = 0;
    for (const key of Object.keys(data.results)) {
      const gpId = parseInt(key, 10);
      if (Number.isNaN(gpId)) continue;
      const raceId = jsonGpIdToRaceId[gpId];
      if (!raceId) {
        console.error(`Error: no hay carrera para result key "${key}".`);
        process.exit(1);
      }
      const result = data.results[key];
      const qualifying = (result.qualifying || [])
        .map((q) => {
          const mongoDriverId = jsonDriverIdToMongoId[q.driverId];
          return mongoDriverId ? { driverId: mongoDriverId, time: q.time || '--:--' } : null;
        })
        .filter(Boolean);
      const race = (result.race || []).map((driverId) => {
        const mongoDriverId = jsonDriverIdToMongoId[driverId];
        if (!mongoDriverId) {
          console.error(`Error: piloto id ${driverId} no encontrado para race en GP ${gpId}.`);
          process.exit(1);
        }
        return mongoDriverId;
      });
      const fastestLap = result.fastestLap != null ? (jsonDriverIdToMongoId[result.fastestLap] ?? null) : null;
      await db.collection('results').updateOne(
        { championshipCode: code, raceId },
        { $set: { championshipCode: code, raceId, qualifying, race, fastestLap, updatedAt: new Date() } },
        { upsert: true }
      );
      resultsCount++;
    }
    console.log('Resultados guardados:', resultsCount);
    console.log('\n--- Migración completada ---');
    console.log('Código del campeonato:', code);
    console.log('Resumen: teams:', data.teams.length, '| drivers:', data.drivers.length, '| races:', sortedGp.length, '| results:', resultsCount);
    console.log('Inicia sesión en el panel con username:', adminUsername, 'y código:', code);
  } catch (err) {
    console.error('Error durante la migración:', err);
    process.exit(1);
  } finally {
    await closeDB();
  }
  process.exit(0);
}

run();
