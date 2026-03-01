import { Session } from '../Model/session.js';
import { Patient } from '../Model/patient.js';
import { detectSessionAnomalies } from '../utils/detectAnomalies.js';

// Returns all sessions for a unit, grouped by patient (example implementation)
// Get a session by sessionID


export const createSession = async (req, res) => {
  try {
    const {
      name,
      email,
      dob,
      dry_weight_kg,
      unit_id,
      timestamps,
      vitals,
      nurse_notes,
      anomalies
    } = req.body;

    // Basic validation
    if (!name || !dob || !dry_weight_kg || !unit_id) {
      return res.status(400).json({ message: "Missing required patient fields" });
    }

    if (!timestamps?.start || !timestamps?.end || !vitals) {
      return res.status(400).json({ message: "Missing required session fields" });
    }
    // Validate vitals fields for creation (only pre values required)
    if (
      typeof vitals.pre_weight !== 'number' ||
      typeof vitals.pre_bp_sys !== 'number' ||
      typeof vitals.pre_bp_dia !== 'number'
    ) {
      return res.status(400).json({ message: "Missing or invalid pre-session vitals (pre_weight, pre_bp_sys, pre_bp_dia)" });
    }

    // 1️⃣ Check if patient exists (using email if provided)
    let patient = null;

    if (email) {
      patient = await Patient.findOne({ email });
    }

    // 2️⃣ If patient doesn't exist → create new one
    if (!patient) {
      patient = await Patient.create({
        name,
        email,
        dob,
        dry_weight_kg,
        unit_id
      });
    }


    // Detect anomalies (pre-session only, as post values not present yet)
    const sessionForDetection = {
      vitals: {
        pre_weight: vitals.pre_weight,
        pre_bp_sys: vitals.pre_bp_sys,
        pre_bp_dia: vitals.pre_bp_dia
      },
      timestamps
    };
    const detectedAnomalies = await detectSessionAnomalies(sessionForDetection, patient._id);

    // 3️⃣ Create new session
    const newSession = await Session.create({
      patient_id: patient._id,
      unit_id,
      timestamps,
      vitals: {
        pre_weight: vitals.pre_weight,
        pre_bp_sys: vitals.pre_bp_sys,
        pre_bp_dia: vitals.pre_bp_dia
      },
      nurse_notes,
      anomalies: detectedAnomalies
    });

    // 4️⃣ Populate patient details in response
    const populatedSession = await Session.findById(newSession._id)
      .populate("patient_id", "name email");

    res.status(201).json({
      message: "Session created successfully",
      data: populatedSession
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to create session",
      error: error.message
    });
  }
};


// PATCH /api/schedule/update/:sessionID
export const updateSession = async (req, res) => {
  try {
    const { sessionID } = req.params;
    const { status, vitals, nurse_notes } = req.body;

    // Find session by ID
    const session = await Session.findById(sessionID);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Update status
    if (status) {
      session.status = status;
    }

    // Update post vitals if provided (for ending session)
    if (vitals) {
      session.vitals = {
        ...session.vitals,
        ...vitals, // merge existing vitals with new post vitals
      };
    }

    // Update nurse notes if provided
    if (nurse_notes !== undefined) {
      session.nurse_notes = nurse_notes;
    }

    // Detect anomalies (now we may have post values)
    const detectedAnomalies = await detectSessionAnomalies(session, session.patient_id);
    session.anomalies = detectedAnomalies;

    // Save changes
    await session.save();

    res.status(200).json({
      message: "Session updated successfully",
      session,
    });
  } catch (error) {
    console.error("Error updating session:", error);
    res.status(500).json({ message: "Failed to update session", error: error.message });
  }
};