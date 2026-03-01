import express from 'express';
import { getTodaySchedule } from '../controller/session.js';

const router = express.Router();

router.get('/:unitId/today', getTodaySchedule);

export default router;