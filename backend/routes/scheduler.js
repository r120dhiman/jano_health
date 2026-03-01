import express from 'express';
import { createSession, updateSession } from '../controller/scheduler.js';

const router = express.Router();


router.post('/:unitId',createSession);
router.patch("/update/:sessionID", updateSession);

export default router;