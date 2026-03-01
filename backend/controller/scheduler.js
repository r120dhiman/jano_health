import { Session } from '../Model/session.js';

export const getUnitSchedule = async (req, res) => {
  try {
    const { unitId } = req.params;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const sessions = await Session.find({
      "timestamps.start": { $gte: start, $lte: end }
    })
    .populate({
      path: 'patient_id',
      match: { unit_id: unitId }, 
      select: 'name dry_weight_kg unit_id' 
    })
    .lean();

    const filteredSessions = sessions.filter(s => s.patient_id !== null);

    res.status(200).json({
      unit: unitId,
      date: start.toISOString().split('T')[0],
      count: filteredSessions.length,
      data: filteredSessions
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching schedule", error: error.message });
  }
};