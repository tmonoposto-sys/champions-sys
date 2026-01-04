import express from 'express';
import * as championshipsController from '../controllers/championshipsController.js';
import * as teamsController from '../controllers/teamsController.js';
import * as driversController from '../controllers/driversController.js';
import * as racesController from '../controllers/racesController.js';
import * as resultsController from '../controllers/resultsController.js';

const router = express.Router();

// Championships routes
router.post('/championships/login', championshipsController.loginChampionship);
router.post('/championships/get', championshipsController.getChampionship);
router.post('/championships/create', championshipsController.createChampionship);

// Teams routes
router.post('/teams/list', teamsController.listTeams);
router.post('/teams/create', teamsController.createTeam);
router.post('/teams/update', teamsController.updateTeam);
router.post('/teams/delete', teamsController.deleteTeam);

// Drivers routes
router.post('/drivers/list', driversController.listDrivers);
router.post('/drivers/create', driversController.createDriver);
router.post('/drivers/update', driversController.updateDriver);
router.post('/drivers/delete', driversController.deleteDriver);

// Races routes
router.post('/races/list', racesController.listRaces);
router.post('/races/create', racesController.createRace);
router.post('/races/update', racesController.updateRace);
router.post('/races/delete', racesController.deleteRace);

// Results routes
router.post('/results/list', resultsController.listResults);
router.post('/results/get', resultsController.getRaceResult);
router.post('/results/saveQualifying', resultsController.saveQualifyingResult);
router.post('/results/saveRace', resultsController.saveRaceResult);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API funcionando correctamente' });
});

export default router;
