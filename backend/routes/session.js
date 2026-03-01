import express from 'express';
import { getTodaySchedule, getAllSessions, getSessionById } from '../controller/session.js';

const router = express.Router();

router.get('/:unitId/today', getTodaySchedule);
router.get('/:sessionID', getSessionById);
router.get('/', getAllSessions);

export default router;