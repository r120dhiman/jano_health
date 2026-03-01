import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Patient } from './Model/patient.js';
import { Session } from './Model/session.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dialysis';

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');
  await Patient.deleteMany({});
  await Session.deleteMany({});

  const patients = await Patient.insertMany([
    {
      name: 'Rohit',
      email: 'rohitkumar@gmail.com',
      dob: new Date('1980-01-01'),
      dry_weight_kg: 65,
      unit_id: 'A1',
    },
    {
      name: 'Bob Jones',
      email: 'bob@example.com',
      dob: new Date('1975-05-15'),
      dry_weight_kg: 72,
      unit_id: 'A1',
    },
    {
      name: 'Carlos Lee',
      email: 'carlos@example.com',
      dob: new Date('1990-09-09'),
      dry_weight_kg: 80,
      unit_id: 'B2',
    },
  ]);

  // Example sessions (today)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0);
  await Session.insertMany([
    {
      patient_id: patients[0]._id,
      unit_id: 'A1',
      timestamps: { start: today, end: new Date(today.getTime() + 4 * 60 * 60 * 1000) },
      vitals: { pre_weight: 68, pre_bp_sys: 140, pre_bp_dia: 85, post_weight: 65, post_bp_sys: 155, post_bp_dia: 80 },
      nurse_notes: 'Stable session.',
      status: 'completed',
      anomalies: [],
    },
    {
      patient_id: patients[1]._id,
      unit_id: 'A1',
      timestamps: { start: today, end: new Date(today.getTime() + 2 * 60 * 60 * 1000) },
      vitals: { pre_weight: 75, pre_bp_sys: 150, pre_bp_dia: 90, post_weight: 72, post_bp_sys: 170, post_bp_dia: 95 },
      nurse_notes: 'Short session, high BP.',
      status: 'completed',
      anomalies: ['HIGH_POST_BP', 'SHORT_SESSION'],
    },
    {
      patient_id: patients[2]._id,
      unit_id: 'B2',
      timestamps: { start: today, end: new Date(today.getTime() + 6 * 60 * 60 * 1000) },
      vitals: { pre_weight: 85, pre_bp_sys: 135, pre_bp_dia: 80, post_weight: 80, post_bp_sys: 140, post_bp_dia: 78 },
      nurse_notes: 'Long session.',
      status: 'completed',
      anomalies: ['LONG_SESSION'],
    },
  ]);

  console.log('Seeded example patients and sessions.');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
