const router = require('express').Router();
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { getOwnedProfile, checkId, httpError } = require('../utils/ownership');

router.use(auth);

router.get('/', asyncHandler(async (req, res) => {
  // الافتراضي: المواعيد القادمة بس (مع هامش ساعة)
  const from = new Date(Date.now() - 60 * 60 * 1000);
  res.json(await Appointment.find({ user: req.userId, dateTime: { $gte: from } }).populate('profile', 'name').sort('dateTime'));
}));

router.post('/', asyncHandler(async (req, res) => {
  const { profileId, title, dateTime, notes = '' } = req.body;
  const profile = await getOwnedProfile(req.userId, profileId);
  if (typeof title !== 'string' || !title.trim() || title.length > 100) throw httpError(400, 'عنوان الموعد غير صالح');
  if (typeof notes !== 'string' || notes.length > 300) throw httpError(400, 'الملاحظات طويلة');
  const when = new Date(dateTime);
  if (typeof dateTime !== 'string' || isNaN(when)) throw httpError(400, 'التاريخ غير صالح');
  const appt = await Appointment.create({ user: req.userId, profile: profile._id, title, dateTime: when, notes });
  res.status(201).json(await appt.populate('profile', 'name'));
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  checkId(req.params.id);
  const r = await Appointment.deleteOne({ _id: req.params.id, user: req.userId });
  if (!r.deletedCount) throw httpError(404, 'غير موجود');
  res.json({ ok: true });
}));

module.exports = router;
