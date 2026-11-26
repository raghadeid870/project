const jwt = require('jsonwebtoken');

// بيتأكد إن الطلب معه token صحيح، وبيحط id المستخدم بـ req.userId
module.exports = function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'لازم تسجلي دخول' });
  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET).id;
    next();
  } catch {
    res.status(401).json({ message: 'الجلسة انتهت، سجلي دخول من جديد' });
  }
};
