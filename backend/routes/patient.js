
import express from 'express';
import { registerPatient, getAllPatients } from '../controller/patient.js';


const router = express.Router();


router.post('/', registerPatient);
router.get('/', getAllPatients);

export default router;