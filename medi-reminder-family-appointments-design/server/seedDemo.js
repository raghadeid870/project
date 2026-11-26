require('dotenv').config();
process.env.TZ = process.env.TZ || 'Asia/Amman';

const connectDB = require('./config/db');
const User = require('./models/User');
const Profile = require('./models/Profile');
const Medication = require('./models/Medication');
const Appointment = require('./models/Appointment');
const { ensureDoseLogs } = require('./utils/doses');

async function seedDemo() {
  const email = (process.env.DEMO_EMAIL || '').trim().toLowerCase();
  if (!email) throw new Error('حددي DEMO_EMAIL في server/.env ليطابق بريد حسابك المسجل.');
  await connectDB();
  const user = await User.findOne({ email });
  if (!user) throw new Error(`لم يتم العثور على حساب بهذا البريد: ${email}`);

  let profile = await Profile.findOne({ user: user._id, name: 'سارة (بيانات تجريبية)' });
  if (!profile) {
    profile = await Profile.create({ user: user._id, name: 'سارة (بيانات تجريبية)' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await Medication.create([
      { profile: profile._id, name: 'فيتامين تجريبي', dose: 'قرص واحد', times: ['09:00'], startDate: today, notes: 'بيانات للعرض فقط — استبدليها بوصفة صحيحة' },
      { profile: profile._id, name: 'مكمل تجريبي', dose: 'حسب المثال', times: ['14:00', '21:00'], startDate: today, notes: 'بيانات للعرض فقط — ليست توصية طبية' },
    ]);
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + 3);
    appointmentDate.setHours(10, 30, 0, 0);
    await Appointment.create({
      user: user._id, profile: profile._id,
      title: 'موعد متابعة تجريبي',
      dateTime: appointmentDate,
      notes: 'موعد توضيحي — عدّليه أو احذفيه بعد تجربة الواجهة',
    });
  }

  await ensureDoseLogs(new Date(), user._id);
  console.log('تمت إضافة بيانات العرض التجريبية. احذفي الملف التجريبي من صفحة أفراد العائلة عند الانتهاء.');
  process.exit(0);
}

seedDemo().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
