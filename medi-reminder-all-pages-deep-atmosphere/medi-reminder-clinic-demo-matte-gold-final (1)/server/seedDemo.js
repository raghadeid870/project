require('dotenv').config();
process.env.TZ = process.env.TZ || 'Asia/Amman';

const connectDB = require('./config/db');
const mongoose = require('mongoose');
const User = require('./models/User');
const { seedDemoData } = require('./utils/demoData');

async function main() {
  const email = (process.env.DEMO_EMAIL || '').trim().toLowerCase();
  if (!email) throw new Error('أضيفي DEMO_EMAIL في server/.env ليطابق بريد حسابك المسجل.');
  await connectDB();
  const user = await User.findOne({ email });
  if (!user) throw new Error(`لم يتم العثور على حساب بهذا البريد: ${email}`);
  const result = await seedDemoData(user._id);
  console.log(result.message);
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });
