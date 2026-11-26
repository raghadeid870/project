const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema(
  {
    profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    dose: { type: String, trim: true, maxlength: 60, default: '' },
    times: {
      type: [String], // مثل ["08:00","20:00"]
      validate: {
        validator: (arr) => arr.length > 0 && arr.length <= 12 && arr.every((t) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t)),
        message: 'أوقات غير صالحة',
      },
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null }, // null = بدون نهاية
    notes: { type: String, trim: true, maxlength: 300, default: '' },
    demoKey: { type: String, default: null, index: true }, // بيانات العرض فقط
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medication', medicationSchema);
