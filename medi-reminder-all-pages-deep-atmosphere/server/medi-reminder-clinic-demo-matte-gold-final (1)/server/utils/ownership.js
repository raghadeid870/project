const mongoose = require('mongoose');
const Profile = require('../models/Profile');

function httpError(status, message) {
  const e = new Error(message);
  e.status = status;
  return e;
}

// بيتأكد إن الملف الشخصي فعلاً إلك. هاد أهم سطر أمان بالمشروع:
// بدونه أي مستخدم ممكن يشوف بيانات غيره بس يغيّر الـ id بالطلب
async function getOwnedProfile(userId, profileId) {
  if (!mongoose.isValidObjectId(profileId)) throw httpError(400, 'معرّف غير صالح');
  const profile = await Profile.findOne({ _id: profileId, user: userId });
  if (!profile) throw httpError(404, 'الملف غير موجود');
  return profile;
}

function checkId(id) {
  if (!mongoose.isValidObjectId(id)) throw httpError(400, 'معرّف غير صالح');
}

module.exports = { getOwnedProfile, checkId, httpError };
