import { Session } from '../Model/session.js';

export const getSessionById = async (req, res) => {
  try {
    const { sessionID } = req.params;
    if (!sessionID) {
      return res.status(400).json({ message: 'Session ID is required.' });
    }
    const session = await Session.findById(sessionID).populate('patient_id', 'name email');
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }
    res.status(200).json({ data: session });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch session', error: error.message });
  }
};

export const getTodaySchedule = async (req, res) => {
  try {
    const { unitId } = req.params;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const sessions = await Session.find({
      "timestamps.start": { $gte: startOfDay, $lte: endOfDay }
    })
    .populate({
      path: 'patient_id',
      match: { unit_id: unitId },
      select: 'name dry_weight_kg unit_id'
    })
    .exec();

    const filteredSchedule = sessions.filter(session => session.patient_id !== null);

    res.status(200).json({
      unit: unitId,
      count: filteredSchedule.length,
      schedule: filteredSchedule
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching schedule", error: error.message });
  }
};

export const getAllSessions= async (req, res) => {
  try {

    const sessions = await Session.find({})
      .populate({
        path: 'patient_id',
        select: 'name dry_weight_kg unit_id'
      })
      .sort({ "timestamps.start": -1 }) 
      .exec();

    const filteredSessions = sessions.filter(session => session.patient_id !== null);

    res.status(200).json({
      count: filteredSessions.length,
      sessions: filteredSessions
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching sessions",
      error: error.message
    });
  }
};