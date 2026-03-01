import { Patient } from "../Model/patient.js";

export const registerPatient = async (req, res) => {
  try {
    const { name, dob, dry_weight_kg, unit_id, email } = req.body;
    if (!name || !dry_weight_kg || !unit_id) {
      return res.status(400).json({ 
        message: "Missing required fields: name, dry_weight_kg, and unit_id are mandatory." 
      });
    }

    const patient = new Patient({
      name,
      dob,
      dry_weight_kg,
      unit_id,
      email
    });

    const savedPatient = await patient.save();

    res.status(201).json({
      message: "Patient registered successfully",
      data: savedPatient
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "A patient with this email already exists." });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: "Error fetching patients", error: error.message });
  }
};