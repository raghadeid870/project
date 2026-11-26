const router = require('express').Router();
const mongoose = require('mongoose');
const DoseLog = require('../models/DoseLog');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { ensureDoseLogs } = require('../utils/doses');
const { checkId, httpError } = require('../utils/ownership');

router.use(auth);

// قائمة جرعات اليوم
router.get('/today', asyncHandler(async (req, res) => {
  const now = new Date();
  await ensureDoseLogs(now, req.userId);
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  const end = new Date(now); end.setHours(23, 59, 59, 999);
  const logs = await DoseLog.find({ user: req.userId, scheduledAt: { $gte: start, $lte: end } })
    .populate('medication', 'name dose')
    .populate('profile', 'name')
    .sort('scheduledAt');
  res.json(logs.filter((l) => l.medication && l.profile));
}));

// تعليم جرعة "تم" أو إرجاعها
router.patch('/:id', asyncHandler(async (req, res) => {
  checkId(req.params.id);
  const { status } = req.body;
  if (!['taken', 'pending'].includes(status)) throw httpError(400, 'حالة غير صالحة');
  const log = await DoseLog.findOneAndUpdate(
    { _id: req.params.id, user: req.userId }, // user بالفلتر = ما حدا يعدّل جرعات غيره
    { status, takenAt: status === 'taken' ? new Date() : null },
    { new: true }
  );
  if (!log) throw httpError(404, 'غير موجود');
  res.json(log);
}));

// نسبة الالتزام آخر N يوم
router.get('/stats', asyncHandler(async (req, res) => {
  const days = Math.min(Math.max(parseInt(req.query.days) || 7, 1), 90);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const rows = await DoseLog.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(req.userId), scheduledAt: { $gte: since, $lte: new Date() } } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const c = { taken: 0, missed: 0, pending: 0 };
  rows.forEach((r) => (c[r._id] = r.count));
  const finished = c.taken + c.missed;
  res.json({ days, ...c, adherence: finished ? Math.round((c.taken / finished) * 100) : null });
}));

module.exports = router;
