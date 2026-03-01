import express from 'express';
import { getUnitSchedule } from '../controller/scheduler.js';

const router = express.Router();

router.get('/:unitId', getUnitSchedule);

export default router;