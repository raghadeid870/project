const Medication = require('../models/Medication');
const Profile = require('../models/Profile');
const DoseLog = require('../models/DoseLog');

// بتنشئ سجلات الجرعات (DoseLog) لليوم المطلوب من جدول كل دواء.
// بنستعمل upsert عشان لو انعملت من قبل ما تتكرر
async function ensureDoseLogs(date = new Date(), userId = null) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const filter = { startDate: { $lte: end }, $or: [{ endDate: null }, { endDate: { $gte: start } }] };
  if (userId) {
    filter.profile = { $in: await Profile.find({ user: userId }).distinct('_id') };
  }

  const meds = await Medication.find(filter).populate('profile', 'user');
  const ops = [];
  for (const m of meds) {
    if (!m.profile) continue;
    for (const t of m.times) {
      const [h, min] = t.split(':').map(Number);
      const at = new Date(start);
      at.setHours(h, min, 0, 0);
      if (at < m.createdAt) continue; // ما منعمل جرعات لأوقات قبل ما انضاف الدواء
      ops.push({
        updateOne: {
          filter: { medication: m._id, scheduledAt: at },
          update: {
            $setOnInsert: {
              medication: m._id,
              profile: m.profile._id,
              user: m.profile.user,
              scheduledAt: at,
              status: 'pending',
              reminderSent: false,
            },
          },
          upsert: true,
        },
      });
    }
  }
  if (!ops.length) return;
  try {
    await DoseLog.bulkWrite(ops, { ordered: false });
  } catch (err) {
    if (err.code !== 11000 && !(err.writeErrors || []).every((e) => e.code === 11000)) throw err;
    // 11000 = duplicate: يعني طلبين اشتغلوا بنفس الوقت، عادي
  }
}

module.exports = { ensureDoseLogs };
