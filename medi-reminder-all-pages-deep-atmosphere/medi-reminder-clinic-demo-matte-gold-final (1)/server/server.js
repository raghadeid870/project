require('dotenv').config();
// التوقيت: أوقات الأدوية بتنحسب حسب توقيت السيرفر، فبنثبّته على عمّان
process.env.TZ = process.env.TZ || 'Asia/Amman';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { startScheduler } = require('./utils/scheduler');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET لازم يكون موجود وطوله 32 حرف على الأقل (شوفي .env.example)');
  process.exit(1);
}

const app = express();

app.use(helmet()); // headers أمان جاهزة
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '10kb' })); // نحدد حجم الطلب

// rate limiting على الدخول والتسجيل عشان نصعّب تخمين كلمات السر
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/medications', require('./routes/medications'));
app.use('/api/doses', require('./routes/doses'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/demo', require('./routes/demo'));

app.use((req, res) => res.status(404).json({ message: 'غير موجود' }));

// معالج أخطاء مركزي: ما بنكشف تفاصيل الأخطاء الداخلية للمستخدم
app.use((err, req, res, next) => {
  if (err.status) return res.status(err.status).json({ message: err.message });
  if (err.name === 'ValidationError') return res.status(400).json({ message: 'بيانات غير صالحة' });
  console.error(err);
  res.status(500).json({ message: 'خطأ في السيرفر' });
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  startScheduler();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
