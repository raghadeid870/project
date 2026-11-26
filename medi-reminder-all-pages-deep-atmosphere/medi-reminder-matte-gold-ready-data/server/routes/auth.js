const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { httpError } = require('../utils/ownership');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email });

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    // typeof string: بيمنع NoSQL injection (مثل إرسال {"$gt": ""} بدل الإيميل)
    if ([name, email, password].some((v) => typeof v !== 'string')) throw httpError(400, 'بيانات ناقصة');
    if (!name.trim() || name.length > 60) throw httpError(400, 'الاسم غير صالح');
    if (!EMAIL_RE.test(email)) throw httpError(400, 'الإيميل غير صالح');
    if (password.length < 8 || password.length > 72) throw httpError(400, 'كلمة السر لازم تكون من 8 لـ 72 حرف');

    if (await User.findOne({ email: email.toLowerCase() })) throw httpError(409, 'الإيميل مستخدم من قبل');

    const passwordHash = await bcrypt.hash(password, 12); // 12 = تكلفة التشفير
    const user = await User.create({ name, email, passwordHash });
    res.status(201).json({ token: sign(user._id), user: publicUser(user) });
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string') throw httpError(400, 'بيانات ناقصة');

    const user = await User.findOne({ email: email.toLowerCase() });
    const ok = user && (await bcrypt.compare(password, user.passwordHash));
    // رسالة وحدة للحالتين عشان ما نكشف إذا الإيميل موجود
    if (!ok) throw httpError(401, 'الإيميل أو كلمة السر غلط');
    res.json({ token: sign(user._id), user: publicUser(user) });
  })
);

router.get(
  '/me',
  auth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId);
    if (!user) throw httpError(401, 'المستخدم غير موجود');
    res.json({ user: publicUser(user) });
  })
);

module.exports = router;
