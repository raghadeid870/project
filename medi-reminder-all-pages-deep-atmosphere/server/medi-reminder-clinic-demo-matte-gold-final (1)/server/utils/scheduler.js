const cron = require('node-cron');
const DoseLog = require('../models/DoseLog');
const Appointment = require('../models/Appointment');
const { ensureDoseLogs } = require('./doses');
const { sendMail } = require('./mailer');

const MISSED_AFTER_MS = 2 * 60 * 60 * 1000; // بعد ساعتين من الوقت بنعتبر الجرعة فاتت
const APPT_REMIND_MS = 60 * 60 * 1000; // تذكير بالموعد قبل ساعة

const fmt = (d) => d.toLocaleString('ar-JO', { dateStyle: 'medium', timeStyle: 'short' });

async function tick() {
  const now = new Date();

  // 1) نتأكد إن سجلات اليوم موجودة لكل الأدوية
  await ensureDoseLogs(now);

  // 2) جرعات حان وقتها ولسا ما انبعت تذكير
  const due = await DoseLog.find({ status: 'pending', reminderSent: false, scheduledAt: { $lte: now } })
    .populate('user', 'email name')
    .populate('medication', 'name dose')
    .populate('profile', 'name');

  for (const log of due) {
    // بنعلّم "انبعت" قبل الإرسال عشان ما يتكرر الإيميل لو التيك الجاي اشتغل بنص الإرسال
    const claimed = await DoseLog.updateOne({ _id: log._id, reminderSent: false }, { reminderSent: true });
    if (!claimed.modifiedCount || !log.user || !log.medication) continue;
    try {
      await sendMail(
        log.user.email,
        `تذكير دواء: ${log.medication.name}`,
        `حان وقت دواء ${log.medication.name}${log.medication.dose ? ` (${log.medication.dose})` : ''} لـ ${log.profile?.name || ''}.\nالوقت المحدد: ${fmt(log.scheduledAt)}`
      );
    } catch (err) {
      console.error('Mail failed:', err.message);
    }
  }

  // 3) جرعات فاتت
  await DoseLog.updateMany(
    { status: 'pending', scheduledAt: { $lt: new Date(now - MISSED_AFTER_MS) } },
    { status: 'missed' }
  );

  // 4) تذكير بالمواعيد القريبة
  const soon = await Appointment.find({
    reminderSent: false,
    dateTime: { $gt: now, $lte: new Date(+now + APPT_REMIND_MS) },
  })
    .populate('user', 'email')
    .populate('profile', 'name');

  for (const a of soon) {
    const claimed = await Appointment.updateOne({ _id: a._id, reminderSent: false }, { reminderSent: true });
    if (!claimed.modifiedCount || !a.user) continue;
    try {
      await sendMail(a.user.email, `تذكير بموعد: ${a.title}`, `عندك موعد "${a.title}" لـ ${a.profile?.name || ''} الساعة ${fmt(a.dateTime)}.`);
    } catch (err) {
      console.error('Mail failed:', err.message);
    }
  }
}

let running = false;
function startScheduler() {
  // كل دقيقة. الـ flag بيمنع تداخل تشغيلين إذا واحد أخد وقت
  cron.schedule('* * * * *', async () => {
    if (running) return;
    running = true;
    try {
      await tick();
    } catch (err) {
      console.error('Scheduler error:', err);
    } finally {
      running = false;
    }
  });
  console.log('Scheduler started');
}

module.exports = { startScheduler };
