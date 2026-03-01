import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true }, 
  dob: { type: Date, required: true },
  dry_weight_kg: { 
    type: Number, 
    required: true,
    min: [20, 'Weight too low for standard adult dialysis'] 
  },
  unit_id: { type: String, required: true, index: true }, 
  createdAt: { type: Date, default: Date.now }
});

export const Patient = mongoose.model('Patient', patientSchema);