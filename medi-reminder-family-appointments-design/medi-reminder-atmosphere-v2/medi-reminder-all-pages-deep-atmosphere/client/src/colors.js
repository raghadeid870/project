// كل فرد من العيلة إله لون ثابت بكل الصفحات (الجرعات، الأدوية، المواعيد).
// بنعطي كل شخص جديد أول لون ما استخدمه أحد، وبنحفظه بالمتصفح عشان ما يتغير
// (هيك ما بيتكرر نفس اللون بين شخصين متل ما كان يصير مع الـ hash)
const PALETTE = [
  { main: '#168B83', soft: '#E5F5F2', on: '#fff' }, // تركوازي
  { main: '#E5484D', soft: '#FFE8E8', on: '#fff' }, // مرجاني
  { main: '#2563EB', soft: '#E1ECFF', on: '#fff' }, // أزرق
  { main: '#F5A524', soft: '#FFF2D3', on: '#231942' }, // أصفر
  { main: '#7C3AED', soft: '#EDE5FF', on: '#fff' }, // بنفسجي
  { main: '#DB2777', soft: '#FFE3F0', on: '#fff' }, // وردي
  { main: '#EA580C', soft: '#FFE9DB', on: '#fff' }, // برتقالي
  { main: '#0891B2', soft: '#D8F3F9', on: '#fff' }, // سماوي
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
