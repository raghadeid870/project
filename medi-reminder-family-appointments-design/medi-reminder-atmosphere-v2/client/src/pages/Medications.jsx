import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { colorVars } from '../colors.js';

const today = () => new Date().toISOString().slice(0, 10);
const emptyForm = () => ({ name: '', dose: '', times: ['08:00'], startDate: today(), endDate: '', notes: '' });

export default function Medications() {
  const [profiles, setProfiles] = useState([]);
  const [profileId, setProfileId] = useState('');
  const [meds, setMeds] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/profiles').then((list) => {
      setProfiles(list);
      if (list.length) setProfileId(list[0]._id);
    }).catch((e) => setError(e.message));
  }, []);

  const loadMeds = () => profileId && api(`/medications?profileId=${profileId}`).then(setMeds).catch((e) => setError(e.message));
  useEffect(() => { loadMeds(); }, [profileId]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setTime = (i, v) => setForm({ ...form, times: form.times.map((t, j) => (j === i ? v : t)) });

  async function submit(e) {
    e.preventDefault();
    setError('');
    const body = { ...form, profileId, endDate: form.endDate || null };
    try {
      if (editingId) await api(`/medications/${editingId}`, { method: 'PUT', body });
      else await api('/medications', { method: 'POST', body });
      setForm(emptyForm());
      setEditingId(null);
      loadMeds();
    } catch (err) { setError(err.message); }
  }

  function edit(m) {
    setEditingId(m._id);
    setForm({ name: m.name, dose: m.dose, times: m.times, startDate: m.startDate.slice(0, 10), endDate: m.endDate ? m.endDate.slice(0, 10) : '', notes: m.notes });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function remove(m) {
    if (!confirm(`حذف ${m.name}؟`)) return;
    try { await api(`/medications/${m._id}`, { method: 'DELETE' }); loadMeds(); }
    catch (err) { setError(err.message); }
  }

  if (profiles.length === 0 && !error)
    return (
      <div className="page-shell" dir="rtl">
        <section className="page-hero">
          <div><span className="eyebrow">إدارة العلاج</span><h1>أدويتي</h1><p>نظّمي الأدوية والجرعات ومواعيدها لكل فرد من العائلة.</p></div>
          <div className="page-hero-icon"><span className="caps" /></div>
        </section>
        <section className="setup-state card">
          <div className="setup-illustration"><span className="caps" /></div>
          <div className="setup-copy"><span className="setup-kicker">خطوة أولى بسيطة</span><h2>ابدئي بإنشاء ملف عائلي</h2><p>حتى نعرض الأدوية بشكل منظم، أضيفي ملفًا للشخص الذي تتابعين أدويته. بعد ذلك يمكنكِ إضافة الأدوية وتحديد الجرعات والأوقات.</p><Link className="setup-action" to="/profiles">الانتقال إلى أفراد العائلة <span>←</span></Link></div>
        </section>
      </div>
    );

  return (
    <div className="page-shell" dir="rtl">
      <section className="page-hero">
        <div><span className="eyebrow">إدارة العلاج</span><h1>أدويتي</h1><p>نظّمي الأدوية والجرعات ومواعيدها لكل فرد من العائلة.</p></div>
        <div className="page-hero-icon"><span className="caps" /></div>
      </section>
      <div className="people" role="group" aria-label="اختاري الشخص">
        {profiles.map((p) => (
          <button key={p._id} style={colorVars(p._id)} aria-pressed={p._id === profileId} onClick={() => setProfileId(p._id)}>
            <span className="avatar">{p.name.trim()[0]}</span> {p.name}
          </button>
        ))}
      </div>

      <form className="card form" style={colorVars(profileId)} onSubmit={submit}>
        <h3>{editingId ? 'تعديل الدواء' : 'إضافة دواء'}</h3>
        <div className="row">
          <label>اسم الدواء<input value={form.name} onChange={set('name')} required maxLength={80} /></label>
          <label>الجرعة<input value={form.dose} onChange={set('dose')} placeholder="مثلاً: حبة وحدة" maxLength={60} /></label>
        </div>
        <label>أوقات الأخذ</label>
        <div className="row wrap">
          {form.times.map((t, i) => (
            <span key={i} className="chip">
              <input type="time" value={t} onChange={(e) => setTime(i, e.target.value)} required aria-label={`الوقت ${i + 1}`} />
              {form.times.length > 1 && (
                <button type="button" className="ghost danger" aria-label="احذفي الوقت" onClick={() => setForm({ ...form, times: form.times.filter((_, j) => j !== i) })}>✕</button>
              )}
            </span>
          ))}
          {form.times.length < 12 && (
            <button type="button" className="soft" onClick={() => setForm({ ...form, times: [...form.times, '20:00'] })}>+ وقت</button>
          )}
        </div>
        <div className="row">
          <label>من تاريخ<input type="date" value={form.startDate} onChange={set('startDate')} required /></label>
          <label>إلى تاريخ (اختياري)<input type="date" value={form.endDate} min={form.startDate} onChange={set('endDate')} /></label>
        </div>
        <label>ملاحظات<input value={form.notes} onChange={set('notes')} placeholder="مثلاً: بعد الأكل" maxLength={300} /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="row">
          <button>{editingId ? 'حفظ التعديل' : 'إضافة الدواء'}</button>
          {editingId && <button type="button" className="ghost" onClick={() => { setEditingId(null); setForm(emptyForm()); }}>إلغاء</button>}
        </div>
      </form>

      {meds.length === 0 && <div className="empty"><span className="caps" /><p>ما في أدوية لهالشخص لسا.</p></div>}
      {meds.map((m) => (
        <div className="card row med" style={colorVars(profileId)} key={m._id}>
          <div>
            <strong>{m.name}</strong> {m.dose && <span className="muted">({m.dose})</span>}
            <div className="times">{m.times.map((t) => <span className="time" key={t} dir="ltr">{t}</span>)}</div>
            {m.notes && <div className="muted">{m.notes}</div>}
          </div>
          <span className="spacer" />
          <button className="ghost" onClick={() => edit(m)}>تعديل</button>
          <button className="ghost danger" onClick={() => remove(m)}>حذف</button>
        </div>
      ))}
    </div>
  );
}
