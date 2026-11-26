const mongoose = require('mongoose');

// ملف شخصي = فرد من العيلة. المستخدم الواحد ممكن يكون عنده أكتر من ملف
const profileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);
