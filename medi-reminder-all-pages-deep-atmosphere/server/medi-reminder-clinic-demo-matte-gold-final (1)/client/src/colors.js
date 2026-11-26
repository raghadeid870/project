// كل فرد من العيلة إله لون ثابت بكل الصفحات (الجرعات، الأدوية، المواعيد).
// بنعطي كل شخص جديد أول لون ما استخدمه أحد، وبنحفظه بالمتصفح عشان ما يتغير
// (هيك ما بيتكرر نفس اللون بين شخصين متل ما كان يصير مع الـ hash)
const PALETTE = [
  { main: '#8B7650', soft: '#E9DFC9', on: '#fff' }, // برونزي مطفي
  { main: '#567565', soft: '#DCE8DF', on: '#fff' }, // أخضر مريمي
  { main: '#A88954', soft: '#F0E5CC', on: '#2E3027' }, // ذهبي شامبين
  { main: '#6E8174', soft: '#E0E8DF', on: '#fff' }, // أخضر رمادي
  { main: '#92745D', soft: '#EFE2D5', on: '#fff' }, // بني دافئ
  { main: '#7D8064', soft: '#E7E7D4', on: '#fff' }, // زيتوني هادئ
  { main: '#6D817F', soft: '#DCE8E5', on: '#fff' }, // تركواز رمادي
  { main: '#9A8568', soft: '#ECE2D2', on: '#fff' }, // رملي
];

const KEY = 'medi-profile-colors';
let registry = {};
try { registry = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { registry = {}; }

export function colorFor(id = '') {
  id = String(id);
  if (registry[id] === undefined) {
    const used = new Set(Object.values(registry));
    let idx = PALETTE.findIndex((_, i) => !used.has(i));
    if (idx === -1) idx = Object.keys(registry).length % PALETTE.length; // لو خلصت الألوان منبدأ من جديد
    registry[id] = idx;
    try { localStorage.setItem(KEY, JSON.stringify(registry)); } catch { /* مش مشكلة */ }
  }
  return PALETTE[registry[id]];
}

// بنحوّل اللون لمتغيرات CSS عشان الـ CSS يستعملها
export function colorVars(id) {
  const c = colorFor(id);
  return { '--c': c.main, '--soft': c.soft, '--on': c.on };
}
