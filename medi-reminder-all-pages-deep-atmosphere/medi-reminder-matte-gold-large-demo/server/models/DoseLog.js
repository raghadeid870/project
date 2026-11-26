const mongoose = require('mongoose');

// سجل لكل جرعة بوقتها. منه بنعرض قائمة اليوم وبنحسب نسبة الالتزام
const doseLogSchema = new mongoose.Schema(
  {
    medication: { type: mongoose.Schema.Types.ObjectId, ref: 'Medication', required: true },
    profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    scheduledAt: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'taken', 'missed'], default: 'pending' },
    takenAt: { type: Date, default: null },
    reminderSent: { type: Boolean, default: false },
    demoKey: { type: String, default: null, index: true }, // سجل جرعة تجريبي
  },
  { timestamps: true }
);

// نفس الدواء بنفس الوقت ما ينعمل إلو سجلين
doseLogSchema.index({ medication: 1, scheduledAt: 1 }, { unique: true });

module.exports = mongoose.model('DoseLog', doseLogSchema);
