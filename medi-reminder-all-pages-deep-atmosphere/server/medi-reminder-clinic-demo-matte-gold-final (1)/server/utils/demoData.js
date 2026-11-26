const Profile = require('../models/Profile');
const Medication = require('../models/Medication');
const Appointment = require('../models/Appointment');
const DoseLog = require('../models/DoseLog');

const DEMO_VERSION = 'medi-reminder-demo-v2';
const DEMO_NOTE = 'بيانات تجريبية للعرض واختبار الواجهة فقط؛ لا تمثل وصفة أو تعليمات طبية حقيقية.';

const pad = (n) => String(n).padStart(2, '0');
const hhmm = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

function nextDemoTime(now) {
  // تذكير تجريبي قادم بعد نحو 40 دقيقة حتى يظهر مثال في لوحة اليوم.
  const next = new Date(now.getTime() + 40 * 60 * 1000);
  next.setMinutes(Math.ceil(next.getMinutes() / 5) * 5, 0, 0);
  if (next.toDateString() !== now.toDateString()) {
    next.setTime(now.getTime());
    next.setHours(23, 55, 0, 0);
  }
  return hhmm(next);
}

const FAMILY = [
  {
    key: 'sara',
    name: 'سارة (بيانات تجريبية)',
    medication: [
      { key: 'sara-morning', name: 'تذكير صباحي تجريبي', dose: 'مثال توضيحي فقط', times: ['08:00', '__NEXT__'] },
      { key: 'sara-evening', name: 'تذكير مسائي تجريبي', dose: 'مثال توضيحي فقط', times: ['19:00'] },
    ],
    appointment: { title: 'موعد متابعة تجريبي', days: 2, hour: 10, minute: 30 },
  },
  {
    key: 'omar',
    name: 'عمر (بيانات تجريبية)',
    medication: [
      { key: 'omar-noon', name: 'تذكير منتصف اليوم التجريبي', dose: 'بيانات عرض فقط', times: ['12:30'] },
      { key: 'omar-evening', name: 'تذكير المساء التجريبي', dose: 'بيانات عرض فقط', times: ['20:30'] },
    ],
    appointment: { title: 'استشارة عامة تجريبية', days: 4, hour: 11, minute: 0 },
  },
  {
    key: 'layan',
    name: 'ليان (بيانات تجريبية)',
    medication: [
      { key: 'layan-routine', name: 'روتين المتابعة التجريبي', dose: 'مثال للواجهة فقط', times: ['09:15', '16:00'] },
    ],
    appointment: { title: 'مراجعة صحية تجريبية', days: 7, hour: 12, minute: 15 },
  },
  {
    key: 'mama',
    name: 'ماما (بيانات تجريبية)',
    medication: [
      { key: 'mama-afternoon', name: 'تذكير بعد الظهر التجريبي', dose: 'جرعة شكلية للعرض', times: ['15:30'] },
      { key: 'mama-night', name: 'تذكير المساء العائلي التجريبي', dose: 'جرعة شكلية للعرض', times: ['21:00'] },
    ],
    appointment: { title: 'فحص دوري تجريبي', days: 10, hour: 9, minute: 45 },
  },
];

async function findOrCreateProfile(userId, familyMember) {
  const demoKey = `${DEMO_VERSION}:profile:${familyMember.key}`;
  let profile = await Profile.findOne({ user: userId, demoKey });

  // ترقية الملف الذي أنشأه إصدار البيانات التجريبية السابق بدلاً من تكراره.
  if (!profile && familyMember.key === 'sara') {
    profile = await Profile.findOne({ user: userId, name: familyMember.name });
  }

  if (profile) {
    if (profile.demoKey !== demoKey) {
      profile.demoKey = demoKey;
      await profile.save();
    }
    return { profile, created: false };
  }

  const count = await Profile.countDocuments({ user: userId });
  if (count >= 20) return { profile: null, created: false };
  profile = await Profile.create({ user: userId, name: familyMember.name, demoKey });
  return { profile, created: true };
}

async function createMedication(profile, spec, nextTime) {
  const demoKey = `${DEMO_VERSION}:medication:${spec.key}`;
  let medication = await Medication.findOne({ profile: profile._id, demoKey });
  if (medication) return { medication, created: false };

  // دعم سجل قديم إن كان الاسم نفسه موجوداً مسبقاً.
  medication = await Medication.findOne({ profile: profile._id, name: spec.name });
  if (medication) {
    medication.demoKey = demoKey;
    medication.notes = medication.notes || DEMO_NOTE;
    await medication.save();
    return { medication, created: false };
  }

  const times = [...new Set(spec.times.map((t) => t === '__NEXT__' ? nextTime : t))];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 6);
  startDate.setHours(0, 0, 0, 0);
  medication = await Medication.create({
    profile: profile._id,
    name: spec.name,
    dose: spec.dose,
    times,
    startDate,
    notes: DEMO_NOTE,
    demoKey,
  });
  return { medication, created: true };
}

async function createAppointment(userId, profile, spec) {
  const demoKey = `${DEMO_VERSION}:appointment:${profile.demoKey.split(':').pop()}`;
  let appointment = await Appointment.findOne({ user: userId, demoKey });
  if (appointment) return { appointment, created: false };

  // لا نكرر موعد المتابعة الذي أضافه seedDemo القديم.
  if (spec.title === 'موعد متابعة تجريبي') {
    appointment = await Appointment.findOne({ user: userId, profile: profile._id, title: spec.title });
  }
  if (appointment) {
    appointment.demoKey = demoKey;
    await appointment.save();
    return { appointment, created: false };
  }

  const dateTime = new Date();
  dateTime.setDate(dateTime.getDate() + spec.days);
  dateTime.setHours(spec.hour, spec.minute, 0, 0);
  appointment = await Appointment.create({
    user: userId,
    profile: profile._id,
    title: spec.title,
    dateTime,
    notes: 'موعد افتراضي للعرض وتجربة صفحة المواعيد فقط.',
    demoKey,
  });
  return { appointment, created: true };
}

async function createDoseHistory(userId, profile, medications) {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const ops = [];

  medications.forEach((medication, medicationIndex) => {
    medication.times.forEach((time, timeIndex) => {
      for (let dayOffset = 6; dayOffset >= 0; dayOffset -= 1) {
        const day = new Date(today);
        day.setDate(day.getDate() - dayOffset);
        const [hour, minute] = time.split(':').map(Number);
        const scheduledAt = new Date(day);
        scheduledAt.setHours(hour, minute, 0, 0);

        const isFutureToday = dayOffset === 0 && scheduledAt > now;
        const pattern = (dayOffset * 3 + medicationIndex * 2 + timeIndex) % 9;
        const status = isFutureToday ? 'pending' : (pattern === 0 ? 'missed' : 'taken');
        const takenAt = status === 'taken'
          ? new Date(Math.min(now.getTime(), scheduledAt.getTime() + 5 * 60 * 1000))
          : null;
        const demoKey = `${medication.demoKey}:${day.toISOString().slice(0, 10)}:${time}`;

        ops.push({
          updateOne: {
            filter: { medication: medication._id, scheduledAt },
            update: {
              $setOnInsert: {
                medication: medication._id,
                profile: profile._id,
                user: userId,
                scheduledAt,
                status,
                takenAt,
                reminderSent: false,
                demoKey,
              },
            },
            upsert: true,
          },
        });
      }
    });
  });

  if (!ops.length) return 0;
  const result = await DoseLog.bulkWrite(ops, { ordered: false });
  return result.upsertedCount || 0;
}

async function seedDemoData(userId) {
  const now = new Date();
  const nextTime = nextDemoTime(now);
  const summary = { profiles: 0, medications: 0, appointments: 0, doseLogs: 0 };
  let availableProfiles = Math.max(20 - await Profile.countDocuments({ user: userId }), 0);

  for (const familyMember of FAMILY) {
    const { profile, created: profileCreated } = await findOrCreateProfile(userId, familyMember);
    if (!profile) continue;
    if (profileCreated) summary.profiles += 1;

    const demoMeds = [];
    for (const medicationSpec of familyMember.medication) {
      const result = await createMedication(profile, medicationSpec, nextTime);
      demoMeds.push(result.medication);
      if (result.created) summary.medications += 1;
    }

    const appointmentResult = await createAppointment(userId, profile, familyMember.appointment);
    if (appointmentResult.created) summary.appointments += 1;

    summary.doseLogs += await createDoseHistory(userId, profile, demoMeds);
  }

  const demoProfiles = await Profile.countDocuments({ user: userId, demoKey: { $regex: `^${DEMO_VERSION}:profile:` } });
  if (!demoProfiles) {
    const error = new Error(availableProfiles === 0
      ? 'وصلت إلى الحد الأقصى لملفات العائلة (20). احذف ملفاً قبل إضافة بيانات العرض.'
      : 'تعذرت إضافة البيانات التجريبية. حاول مرة أخرى.');
    error.status = 400;
    throw error;
  }

  const createdAnything = Object.values(summary).some((count) => count > 0);
  return {
    ok: true,
    created: createdAnything,
    summary,
    message: createdAnything
      ? `تمت إضافة بيانات العرض: ${demoProfiles} ملفات عائلية، ${summary.medications} تذكيرات، و${summary.appointments} مواعيد جديدة. كل البيانات خيالية ومخصصة للتجربة.`
      : 'بيانات العرض موجودة مسبقاً ولم تتم إضافة نسخ مكررة.',
  };
}

module.exports = { seedDemoData };
