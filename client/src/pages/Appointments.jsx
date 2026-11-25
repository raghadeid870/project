import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { colorVars } from '../colors.js';

const fmtTime = (d) => new Date(d).toLocaleString('ar-JO-u-nu-latn', { weekday: 'long', hour: '2-digit', minute: '2-digit' });

export default function Appointments() {
  const [profiles, setProfiles] = useState([]);
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ profileId: '', title: '', dateTime: '', notes: '' });
  const [error, setError] = useState('');

  const load = () => api('/appointments').then(setList).catch((e) => setError(e.message));
  useEffect(() => {
    api('/profiles').then((p) => {
      setProfiles(p);
      if (p.length) setForm((f) => ({ ...f, profileId: p[0]._id }));
    });
    load();
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      // datetime-local بيرجّع وقت محلي بدون منطقة، فبنحوّله لـ ISO قبل الإرسال
      await api('/appointments', { method: 'POST', body: { ...form, dateTime: new Date(form.dateTime).toISOString() } });
      setForm({ ...form, title: '', dateTime: '', notes: '' });
      load();
    } catch (err) { setError(err.message); }
  }

  async function remove(a) {
    if (!confirm('حذف الموعد؟')) return;
    try { await api(`/appointments/${a._id}`, { method: 'DELETE' }); load(); }
    catch (err) { setError(err.message); }
  }

  if (profiles.length === 0) return (
    <div className="page-shell" dir="rtl">
      <section className="page-hero"><div><span className="eyebrow">تنظيم الرعاية</span><h1>المواعيد الطبية</h1><p>احتفظي بمواعيد الزيارات والفحوصات في مكان واحد.</p></div><div className="page-hero-icon">◷</div></section>
      <section className="setup-state card"><div className="setup-illustration">◷</div><div className="setup-copy"><span className="setup-kicker">خطوة أولى بسيطة</span><h2>أضيفي فردًا من العائلة أولًا</h2><p>أنشئي ملفًا للشخص صاحب الموعد، وبعدها يمكنكِ تسجيل موعد الطبيب وتاريخه وملاحظاته.</p><Link className="setup-action" to="/profiles">الانتقال إلى أفراد العائلة <span>←</span></Link></div></section>
    </div>
  );

  return (
    <div className="page-shell" dir="rtl">
      <section className="page-hero"><div><span className="eyebrow">تنظيم الرعاية</span><h1>المواعيد الطبية</h1><p>احتفظي بمواعيد الزيارات والفحوصات في مكان واحد.</p></div><div className="page-hero-icon">◷</div></section>
      <form className="card form" style={colorVars(form.profileId)} onSubmit={submit}>
        <div className="row">
          <label>الشخص
            <select value={form.profileId} onChange={set('profileId')}>
              {profiles.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </label>
          <label>العنوان<input value={form.title} onChange={set('title')} placeholder="مثلاً: مراجعة دكتور" required maxLength={100} /></label>
        </div>
        <label>التاريخ والوقت<input type="datetime-local" value={form.dateTime} onChange={set('dateTime')} required /></label>
        <label>ملاحظات<input value={form.notes} onChange={set('notes')} maxLength={300} /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <button>إضافة الموعد</button>
      </form>

      {list.length === 0 && <div className="empty"><span className="caps" /><p>ما في مواعيد قادمة.</p></div>}
      {list.map((a) => (
        <div className="card appt" style={colorVars(a.profile?._id)} key={a._id}>
          <div className="date-tile">
            <b>{new Date(a.dateTime).getDate()}</b>
            <span>{new Date(a.dateTime).toLocaleDateString('ar-JO-u-nu-latn', { month: 'short' })}</span>
          </div>
          <div>
            <strong>{a.title}</strong>
            <div className="muted"><span className="person-chip"><i /> {a.profile?.name}</span> · {fmtTime(a.dateTime)}</div>
            {a.notes && <div className="muted">{a.notes}</div>}
          </div>
          <span className="spacer" />
          <button className="ghost danger" onClick={() => remove(a)}>حذف</button>
        </div>
      ))}
    </div>
  );
}
