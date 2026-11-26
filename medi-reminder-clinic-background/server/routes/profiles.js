const router = require('express').Router();
const Profile = require('../models/Profile');
const Medication = require('../models/Medication');
const DoseLog = require('../models/DoseLog');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { getOwnedProfile, httpError } = require('../utils/ownership');

router.use(auth); // كل الـ routes هون محمية

const validName = (n) => typeof n === 'string' && n.trim().length > 0 && n.length <= 60;

router.get('/', asyncHandler(async (req, res) => {
  res.json(await Profile.find({ user: req.userId }).sort('createdAt'));
}));

router.post('/', asyncHandler(async (req, res) => {
  if (!validName(req.body.name)) throw httpError(400, 'الاسم غير صالح');
  const count = await Profile.countDocuments({ user: req.userId });
  if (count >= 20) throw httpError(400, 'وصلتي الحد الأقصى من الملفات');
  res.status(201).json(await Profile.create({ user: req.userId, name: req.body.name }));
}));

router.put('/:id', asyncHandler(async (req, res) => {
  if (!validName(req.body.name)) throw httpError(400, 'الاسم غير صالح');
  const profile = await getOwnedProfile(req.userId, req.params.id);
  profile.name = req.body.name;
  await profile.save();
  res.json(profile);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const profile = await getOwnedProfile(req.userId, req.params.id);
  // بنمسح كل اللي مرتبط فيه عشان ما يضل بيانات يتيمة
  const medIds = await Medication.find({ profile: profile._id }).distinct('_id');
  await DoseLog.deleteMany({ medication: { $in: medIds } });
  await Medication.deleteMany({ profile: profile._id });
  await Appointment.deleteMany({ profile: profile._id });
  await profile.deleteOne();
  res.json({ ok: true });
}));

module.exports = router;
