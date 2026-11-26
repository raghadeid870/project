const Profile = require('../models/Profile');
const Medication = require('../models/Medication');
const Appointment = require('../models/Appointment');
const DoseLog = require('../models/DoseLog');

// Keep v2 so existing demo profiles/records created by earlier project builds
// are reused instead of duplicated. New records use stable keys under v2.
const DEMO_VERSION = 'medi-reminder-demo-v2';
const DEMO_NOTE = 'بيانات خيالية تجريبية للعرض واختبار الواجهة فقط؛ ليست دواءً حقيقياً ولا وصفة أو تعليمات طبية.';
const APPOINTMENT_NOTE = 'موعد افتراضي للعرض وتجربة صفحة المواعيد فقط؛ ليس حجزاً طبياً حقيقياً.';
const DOSE_HISTORY_DAYS = 30;

const pad = (n) => String(n).padStart(2, '0');
const hhmm = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

function nextDemoTime(now) {
  const next = new Date(now.getTime() + 40 * 60 * 1000);
  next.setMinutes(Math.ceil(next.getMinutes() / 5) * 5, 0, 0);
  if (next.toDateString() !== now.toDateString()) {
    next.setTime(now.getTime());
    next.setHours(23, 55, 0, 0);
  }
  return hhmm(next);
}

// 14 fictional family profiles, 42 sample reminder records, and 28 sample
// appointments. Every medication label/dose is intentionally non-clinical.
const FAMILY = [
  {
    key: 'sara', name: 'سارة (بيانات تجريبية)',
    medication: [
      { key: 'sara-morning', name: 'تذكير صباحي تجريبي', dose: 'مثال توضيحي فقط - ليس جرعة', times: ['08:00', '__NEXT__'] },
      { key: 'sara-evening', name: 'تذكير مسائي تجريبي', dose: 'بيانات عرض فقط', times: ['19:00'] },
      { key: 'sara-extra', name: 'عنصر متابعة تجريبي 03', dose: 'بيانات شكلية فقط', times: ['13:00'] },
    ],
    appointments: [
      { key: 'main', title: 'موعد متابعة تجريبي', days: 2, hour: 10, minute: 30 },
      { key: 'visit-2', title: 'زيارة عيادة تجريبية', days: 12, hour: 12, minute: 0 },
    ],
  },
  {
    key: 'omar', name: 'عمر (بيانات تجريبية)',
    medication: [
      { key: 'omar-noon', name: 'تذكير منتصف اليوم التجريبي', dose: 'بيانات عرض فقط', times: ['12:30'] },
      { key: 'omar-evening', name: 'تذكير المساء التجريبي', dose: 'بيانات عرض فقط', times: ['20:30'] },
      { key: 'omar-extra', name: 'عنصر تجريبي 04', dose: 'مثال غير طبي', times: ['07:30', '16:30'] },
    ],
    appointments: [
      { key: 'main', title: 'استشارة عامة تجريبية', days: 4, hour: 11, minute: 0 },
      { key: 'visit-2', title: 'موعد متابعة روتيني تجريبي', days: 16, hour: 9, minute: 30 },
    ],
  },
  {
    key: 'layan', name: 'ليان (بيانات تجريبية)',
    medication: [
      { key: 'layan-routine', name: 'روتين المتابعة التجريبي', dose: 'مثال للواجهة فقط', times: ['09:15', '16:00'] },
      { key: 'layan-extra-1', name: 'تذكير علبة تجريبية 05', dose: 'غير مخصص للاستخدام الطبي', times: ['11:00'] },
      { key: 'layan-extra-2', name: 'تذكير علبة تجريبية 06', dose: 'بيانات عرض فقط', times: ['18:30', '21:00'] },
    ],
    appointments: [
      { key: 'main', title: 'مراجعة صحية تجريبية', days: 7, hour: 12, minute: 15 },
      { key: 'visit-2', title: 'موعد متابعة تجريبي', days: 21, hour: 10, minute: 0 },
    ],
  },
  {
    key: 'mama', name: 'ماما (بيانات تجريبية)',
    medication: [
      { key: 'mama-afternoon', name: 'تذكير بعد الظهر التجريبي', dose: 'جرعة شكلية للعرض فقط', times: ['15:30'] },
      { key: 'mama-night', name: 'تذكير المساء العائلي التجريبي', dose: 'جرعة شكلية للعرض فقط', times: ['21:00'] },
      { key: 'mama-extra', name: 'عنصر متابعة تجريبي 07', dose: 'مثال غير طبي', times: ['08:30', '14:30'] },
    ],
    appointments: [
      { key: 'main', title: 'فحص دوري تجريبي', days: 10, hour: 9, minute: 45 },
      { key: 'visit-2', title: 'زيارة متابعة تجريبية', days: 24, hour: 11, minute: 15 },
    ],
  },
  {
    key: 'baba', name: 'بابا (بيانات تجريبية)',
    medication: [
      { key: 'baba-1', name: 'تذكير روتيني تجريبي 08', dose: 'بيانات شكلية فقط', times: ['07:00'] },
      { key: 'baba-2', name: 'مستحضر تجريبي 09', dose: 'مثال للواجهة وليس جرعة', times: ['13:30', '20:00'] },
      { key: 'baba-3', name: 'تذكير مسائي تجريبي 10', dose: 'بيانات عرض فقط', times: ['21:30'] },
    ],
    appointments: [
      { key: 'visit-1', title: 'موعد عيادة تجريبي', days: 3, hour: 8, minute: 45 },
      { key: 'visit-2', title: 'متابعة دورية تجريبية', days: 19, hour: 10, minute: 30 },
    ],
  },
  {
    key: 'khaled', name: 'خالد (بيانات تجريبية)',
    medication: [
      { key: 'khaled-1', name: 'عنصر تجريبي 11', dose: 'بيانات غير طبية', times: ['08:15'] },
      { key: 'khaled-2', name: 'تذكير عبوة تجريبية 12', dose: 'مثال توضيحي', times: ['14:00'] },
      { key: 'khaled-3', name: 'تذكير ليلي تجريبي 13', dose: 'بيانات عرض فقط', times: ['22:00'] },
    ],
    appointments: [
      { key: 'visit-1', title: 'موعد متابعة تجريبي', days: 5, hour: 13, minute: 0 },
      { key: 'visit-2', title: 'زيارة عامة تجريبية', days: 27, hour: 9, minute: 15 },
    ],
  },
  {
    key: 'noor', name: 'نور (بيانات تجريبية)',
    medication: [
      { key: 'noor-1', name: 'تذكير صباحي تجريبي 14', dose: 'ليس جرعة فعلية', times: ['06:45', '18:45'] },
      { key: 'noor-2', name: 'عنصر عرض تجريبي 15', dose: 'بيانات شكلية فقط', times: ['12:00'] },
      { key: 'noor-3', name: 'تذكير ليلي تجريبي 16', dose: 'للعرض فقط', times: ['21:15'] },
    ],
    appointments: [
      { key: 'visit-1', title: 'موعد فحص تجريبي', days: 6, hour: 10, minute: 0 },
      { key: 'visit-2', title: 'مراجعة متابعة تجريبية', days: 22, hour: 14, minute: 0 },
    ],
  },
  {
    key: 'yousef', name: 'يوسف (بيانات تجريبية)',
    medication: [
      { key: 'yousef-1', name: 'تذكير روتيني تجريبي 17', dose: 'مثال غير طبي', times: ['08:45'] },
      { key: 'yousef-2', name: 'عبوة شكلية تجريبية 18', dose: 'بيانات عرض فقط', times: ['15:00', '20:45'] },
      { key: 'yousef-3', name: 'عنصر متابعة تجريبي 19', dose: 'ليس دواءً حقيقياً', times: ['11:45'] },
    ],
    appointments: [
      { key: 'visit-1', title: 'موعد عام تجريبي', days: 8, hour: 11, minute: 30 },
      { key: 'visit-2', title: 'موعد متابعة تجريبي', days: 25, hour: 8, minute: 30 },
    ],
  },
  {
    key: 'dana', name: 'دانا (بيانات تجريبية)',
    medication: [
      { key: 'dana-1', name: 'عنصر تجريبي 20', dose: 'بيانات شكلية فقط', times: ['07:15', '19:15'] },
      { key: 'dana-2', name: 'تذكير تجريبي 21', dose: 'غير مخصص للاستعمال الطبي', times: ['12:45'] },
      { key: 'dana-3', name: 'عبوة عرض تجريبية 22', dose: 'مثال للواجهة فقط', times: ['21:45'] },
    ],
    appointments: [
      { key: 'visit-1', title: 'زيارة متابعة تجريبية', days: 9, hour: 9, minute: 0 },
      { key: 'visit-2', title: 'موعد روتيني تجريبي', days: 29, hour: 12, minute: 30 },
    ],
  },
  {
    key: 'jad', name: 'جاد (بيانات تجريبية)',
    medication: [
      { key: 'jad-1', name: 'تذكير تجريبي 23', dose: 'ليس جرعة طبية', times: ['09:00'] },
      { key: 'jad-2', name: 'عنصر شكلي تجريبي 24', dose: 'بيانات عرض فقط', times: ['13:15', '20:15'] },
      { key: 'jad-3', name: 'تذكير مسائي تجريبي 25', dose: 'مثال غير طبي', times: ['22:15'] },
    ],
    appointments: [
      { key: 'visit-1', title: 'موعد متابعة تجريبي', days: 11, hour: 10, minute: 15 },
      { key: 'visit-2', title: 'زيارة افتراضية تجريبية', days: 30, hour: 13, minute: 15 },
    ],
  },
  {
    key: 'layla', name: 'ليلى (بيانات تجريبية)',
    medication: [
      { key: 'layla-1', name: 'عنصر متابعة تجريبي 26', dose: 'بيانات شكلية فقط', times: ['08:30'] },
      { key: 'layla-2', name: 'تذكير توضيحي 27', dose: 'مثال للعرض فقط', times: ['16:15'] },
      { key: 'layla-3', name: 'عبوة تجريبية 28', dose: 'ليس مستحضراً حقيقياً', times: ['20:30', '22:30'] },
    ],
    appointments: [
      { key: 'visit-1', title: 'فحص روتيني تجريبي', days: 13, hour: 11, minute: 45 },
      { key: 'visit-2', title: 'موعد متابعة تجريبي', days: 26, hour: 15, minute: 0 },
    ],
  },
  {
    key: 'faisal', name: 'فيصل (بيانات تجريبية)',
    medication: [
      { key: 'faisal-1', name: 'تذكير تجريبي 29', dose: 'بيانات عرض فقط', times: ['07:30'] },
      { key: 'faisal-2', name: 'عنصر توضيحي 30', dose: 'ليس جرعة فعلية', times: ['14:15', '19:45'] },
      { key: 'faisal-3', name: 'مستحضر شكلي 31', dose: 'بيانات غير طبية', times: ['21:00'] },
    ],
    appointments: [
      { key: 'visit-1', title: 'استشارة افتراضية تجريبية', days: 14, hour: 9, minute: 30 },
      { key: 'visit-2', title: 'زيارة متابعة تجريبية', days: 28, hour: 10, minute: 45 },
    ],
  },
  {
    key: 'reem', name: 'ريم (بيانات تجريبية)',
    medication: [
      { key: 'reem-1', name: 'عنصر تجريبي 32', dose: 'مثال توضيحي فقط', times: ['08:00', '17:00'] },
      { key: 'reem-2', name: 'تذكير روتيني 33', dose: 'بيانات شكلية فقط', times: ['12:15'] },
      { key: 'reem-3', name: 'عبوة تجريبية 34', dose: 'ليس منتجاً طبياً', times: ['22:00'] },
    ],
    appointments: [
      { key: 'visit-1', title: 'موعد دوري تجريبي', days: 15, hour: 12, minute: 45 },
      { key: 'visit-2', title: 'مراجعة افتراضية تجريبية', days: 31, hour: 9, minute: 45 },
    ],
  },
  {
    key: 'adam', name: 'آدم (بيانات تجريبية)',
    medication: [
      { key: 'adam-1', name: 'تذكير عرض تجريبي 35', dose: 'ليس جرعة طبية', times: ['06:30', '18:00'] },
      { key: 'adam-2', name: 'عنصر متابعة 36', dose: 'بيانات شكلية فقط', times: ['11:30'] },
      { key: 'adam-3', name: 'تذكير تجريبي 37', dose: 'للعرض والاختبار فقط', times: ['20:00'] },
    ],
    appointments: [
      { key: 'visit-1', title: 'موعد عيادة افتراضي', days: 17, hour: 10, minute: 0 },
      { key: 'visit-2', title: 'موعد متابعة افتراضي', days: 32, hour: 13, minute: 30 },
    ],
  },
];

async function findOrCreateProfile(userId, familyMember) {
  const demoKey = `${DEMO_VERSION}:profile:${familyMember.key}`;
  let profile = await Profile.findOne({ user: userId, demoKey });

  // Reuse older Sara record from the original demo release.
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

  // Reuse an earlier demo medication with the same visible name.
  medication = await Medication.findOne({ profile: profile._id, name: spec.name });
  if (medication) {
    medication.demoKey = demoKey;
    medication.notes = medication.notes || DEMO_NOTE;
    await medication.save();
    return { medication, created: false };
  }

  const times = [...new Set(spec.times.map((t) => t === '__NEXT__' ? nextTime : t))];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (DOSE_HISTORY_DAYS - 1));
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
  const profileKey = profile.demoKey.split(':').pop();
  const demoKey = `${DEMO_VERSION}:appointment:${profileKey}:${spec.key}`;
  let appointment = await Appointment.findOne({ user: userId, demoKey });
  if (appointment) return { appointment, created: false };

  // Migrate the single appointment created by the earlier v2 demo script.
  if (spec.key === 'main') {
    const legacyKey = `${DEMO_VERSION}:appointment:${profileKey}`;
    appointment = await Appointment.findOne({ user: userId, demoKey: legacyKey });
  }
  if (!appointment) {
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
    notes: APPOINTMENT_NOTE,
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
      for (let dayOffset = DOSE_HISTORY_DAYS - 1; dayOffset >= 0; dayOffset -= 1) {
        const day = new Date(today);
        day.setDate(day.getDate() - dayOffset);
        const [hour, minute] = time.split(':').map(Number);
        const scheduledAt = new Date(day);
        scheduledAt.setHours(hour, minute, 0, 0);

        const isFutureToday = dayOffset === 0 && scheduledAt > now;
        const pattern = (dayOffset * 3 + medicationIndex * 2 + timeIndex) % 11;
        const status = isFutureToday ? 'pending' : (pattern === 0 || pattern === 7 ? 'missed' : 'taken');
        const takenAt = status === 'taken'
          ? new Date(Math.min(now.getTime(), scheduledAt.getTime() + 5 * 60 * 1000))
          : null;
        const dayKey = `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`;
        const demoKey = `${medication.demoKey}:${dayKey}:${time}`;

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
  const nextTime = nextDemoTime(new Date());
  const summary = { profiles: 0, medications: 0, appointments: 0, doseLogs: 0 };
  let skippedByFamilyLimit = 0;

  for (const familyMember of FAMILY) {
    const { profile, created: profileCreated } = await findOrCreateProfile(userId, familyMember);
    if (!profile) {
      skippedByFamilyLimit += 1;
      continue;
    }
    if (profileCreated) summary.profiles += 1;

    const demoMeds = [];
    for (const medicationSpec of familyMember.medication) {
      const result = await createMedication(profile, medicationSpec, nextTime);
      demoMeds.push(result.medication);
      if (result.created) summary.medications += 1;
    }

    for (const appointmentSpec of familyMember.appointments) {
      const result = await createAppointment(userId, profile, appointmentSpec);
      if (result.created) summary.appointments += 1;
    }

    summary.doseLogs += await createDoseHistory(userId, profile, demoMeds);
  }

  const demoProfiles = await Profile.countDocuments({
    user: userId,
    demoKey: { $regex: `^${DEMO_VERSION}:profile:` },
  });
  if (!demoProfiles) {
    const error = new Error('تعذرت إضافة البيانات التجريبية. تأكد من وجود مساحة ضمن حد ملفات العائلة (20).');
    error.status = 400;
    throw error;
  }

  const demoProfileIds = await Profile.find({
    user: userId,
    demoKey: { $regex: `^${DEMO_VERSION}:profile:` },
  }).distinct('_id');
  const [demoMedications, demoAppointments, demoDoseLogs] = await Promise.all([
    Medication.countDocuments({ profile: { $in: demoProfileIds }, demoKey: { $regex: `^${DEMO_VERSION}:medication:` } }),
    Appointment.countDocuments({ user: userId, demoKey: { $regex: `^${DEMO_VERSION}:appointment:` } }),
    DoseLog.countDocuments({ user: userId, demoKey: { $regex: `^${DEMO_VERSION}:medication:` } }),
  ]);

  const createdAnything = Object.values(summary).some((count) => count > 0);
  const message = createdAnything
    ? `مجموعة العرض تحتوي الآن على ${demoProfiles} فرداً تجريبياً، ${demoMedications} تذكيراً، ${demoAppointments} موعداً، وسجل جرعات لمدة ${DOSE_HISTORY_DAYS} يوماً (${demoDoseLogs} سجلاً). أُضيف في هذه المرة: ${summary.profiles} ملفات، ${summary.medications} تذكيرات، ${summary.appointments} مواعيد، و${summary.doseLogs} سجلات جرعات. ${skippedByFamilyLimit ? `لم تتم إضافة ${skippedByFamilyLimit} ملفات بسبب حد 20 ملفاً.` : ''} كل البيانات خيالية وليست وصفات طبية.`
    : 'بيانات العرض الموسعة موجودة مسبقاً؛ لم تتم إضافة نسخ مكررة.';

  return { ok: true, created: createdAnything, summary, message, totals: { demoProfiles, demoMedications, demoAppointments, demoDoseLogs, doseHistoryDays: DOSE_HISTORY_DAYS } };
}

module.exports = { seedDemoData };
