// Express 4 ما بيلتقط أخطاء الدوال async لحاله، فبنلفّها بهاد الـ wrapper
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
