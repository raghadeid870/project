const router = require('express').Router();
const Medication = require('../models/Medication');
const DoseLog = require('../models/DoseLog');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { getOwnedProfile, checkId, httpError } = require('../utils/ownership');

router.use(auth);

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

// بيفحص ويرجّع بيانات نظيفة (whitelist): بناخد بس الحقول المسموحة
function clean(body) {
  const { name, dose = '', times, startDate, endDate = null, notes = '' } = body;
  if (typeof name !== 'string' || !name.trim() || name.length > 80) throw httpError(400, 'اسم الدواء غير صالح');
  if (typeof dose !== 'string' || dose.length > 60) throw httpError(400, 'الجرعة غير صالحة');
  if (typeof notes !== 'string' || notes.length > 300) throw httpError(400, 'الملاحظات طويلة');
  if (!Array.isArray(times) || !times.length || times.length > 12 || !times.every((t) => typeof t === 'string' && TIME_RE.test(t)))
    throw httpError(400, 'أوقات الدواء غير صالحة');
  const start = new Date(startDate);
  if (typeof startDate !== 'string' || isNaN(start)) throw httpError(400, 'تاريخ البداية غير صالح');
  start.setHours(0, 0, 0, 0);
  let end = null;
  if (endDate) {
    end = new Date(endDate);
    if (isNaN(end)) throw httpError(400, 'تاريخ النهاية غير صالح');
    end.setHours(0, 0, 0, 0);
    if (end < start) throw httpError(400, 'تاريخ النهاية قبل البداية');
  }
  return { name, dose, times: [...new Set(times)].sort(), startDate: start, endDate: end, notes };
}

async function getOwnedMedication(userId, id) {
  checkId(id);
  const med = await Medication.findById(id);
  if (!med) throw httpError(404, 'الدواء غير موجود');
  await getOwnedProfile(userId, med.profile); // بنتأكد إنه تابع لملف إلك
  return med;
}

router.get('/', asyncHandler(async (req, res) => {
  const profile = await getOwnedProfile(req.userId, req.query.profileId);
  res.json(await Medication.find({ profile: profile._id }).sort('name'));
}));

router.post('/', asyncHandler(async (req, res) => {
  const profile = await getOwnedProfile(req.userId, req.body.profileId);
  const med = await Medication.create({ ...clean(req.body), profile: profile._id });
  res.status(201).json(med);
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const med = await getOwnedMedication(req.userId, req.params.id);
  Object.assign(med, clean(req.body));
  await med.save();
  // الجدول تغيّر، فبنمسح الجرعات المنتظرة وبتنعاد حسب الجدول الجديد
  await DoseLog.deleteMany({ medication: med._id, status: 'pending' });
  res.json(med);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const med = await getOwnedMedication(req.userId, req.params.id);
  await DoseLog.deleteMany({ medication: med._id });
  await med.deleteOne();
  res.json({ ok: true });
}));

module.exports = router;
