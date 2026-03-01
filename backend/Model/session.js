import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  patient_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Patient', 
    required: true,
    index: true 
  },
  machine_id: { type: String },
  unit_id: { type: String, required: true },
  timestamps: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  vitals: {
    pre_weight: { type: Number, required: true },
    pre_bp_sys: { type: Number, required: true },
    pre_bp_dia: { type: Number, required: true },
    post_weight: { type: Number, required: false },
    post_bp_sys: { type: Number, required: false },
    post_bp_dia: { type: Number, required: false }
  },
  nurse_notes: String,
  anomalies: [{ type: String }], 
  status:{type: String, enum: ['scheduled', 'in_progress', 'completed'], default: 'scheduled' },
  createdAt: { type: Date, default: Date.now }
});


sessionSchema.index({ "timestamps.start": -1 });

export const Session = mongoose.model('Session', sessionSchema);