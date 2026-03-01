import { Session } from '../Model/session.js';

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