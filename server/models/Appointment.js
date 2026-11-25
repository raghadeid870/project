const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    dateTime: { type: Date, required: true },
    notes: { type: String, trim: true, maxlength: 300, default: '' },
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
