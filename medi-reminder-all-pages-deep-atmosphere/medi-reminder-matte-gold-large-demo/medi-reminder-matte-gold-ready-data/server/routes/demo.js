const router = require('express').Router();
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { seedDemoData } = require('../utils/demoData');

router.use(auth);

router.post('/seed', asyncHandler(async (req, res) => {
  const result = await seedDemoData(req.userId);
  res.status(result.created ? 201 : 200).json(result);
}));

module.exports = router;
