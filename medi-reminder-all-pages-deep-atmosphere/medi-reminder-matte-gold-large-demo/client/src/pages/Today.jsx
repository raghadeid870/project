import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { colorVars } from '../colors.js';
import Icon from '../components/Icons.jsx';
import { BigCapsule, CalendarArt, PillsArt } from '../components/Art.jsx';

const time = (d) => new Date(d).toLocaleTimeString('ar-JO-u-nu-latn', { hour: '2-digit', minute: '2-digit' });
const dateLabel = new Date().toLocaleDateString('ar-JO-u-nu-latn', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

function relative(d) {
  const mins = Math.round((new Date(d) - new Date()) / 60000);
  const abs = Math.abs(mins), h = Math.floor(abs / 60), m = abs % 60;
  const span = h ? (m ? `${h} ساعة و${m} دقيقة` : `${h} ساعة`) : `${m} دقيقة`;
  if (mins > 1) return `بعد ${span}`;
  if (mins >= -1) return 'حان وقتها الآن';
  return `متأخرة ${span}`;
}

export default function Today() {
  const { user } = useAuth();
  const [doses, setDoses] = useState([]);
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [demoBusy, setDemoBusy] = useState(false);
  const [demoMessage, setDemoMessage] = useState('');
  const [demoError, setDemoError] = useState('');

  async function load() {
    try {
      const [d, s, a] = await Promise.all([
        api('/doses/today'), api('/doses/stats?days=7'), api('/appointments')
      ]);
      setDoses(d);
      setStats(s);
      setAppointments(a.slice(0, 3));
      setError('');
    } catch (e) { setError(e.message); }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, []);

  async function addDemoData() {
    setDemoBusy(true);
    setDemoMessage('');
    setDemoError('');
    try {
      const result = await api('/demo/seed', { method: 'POST' });
      setDemoMessage(result.message || 'تم تجهيز بيانات العرض.');
      await load();
    } catch (e) {
      setDemoError(e.message);
    } finally {
      setDemoBusy(false);
    }
  }

  async function toggle(dose) {
    const status = dose.status === 'taken' ? 'pending' : 'taken';
    setBusy(dose._id);
    try {
      await api(`/doses/${dose._id}`, { method: 'PATCH', body: { status } });
      await load();
    } catch (e) { setError(e.message); }
    finally { setBusy(''); }
  }

  const next = doses.find((d) => d.status === 'pending');
  const taken = doses.filter((d) => d.status === 'taken').length;
  const missed = doses.filter((d) => d.status === 'missed').length;
  const progress = doses.length ? Math.round((taken / doses.length) * 100) : 0;
  const firstName = user?.name?.trim().split(' ')[0] || 'بكِ';

  return (
    <div className="dashboard" dir="rtl">
      <section className="dashboard-heading">
        <div>
          <p className="eyebrow">{dateLabel}</p>
          <h1>أهلاً {firstName}، يومكِ صحي ومنظّم <span>♥</span></h1>
          <p className="heading-note">تابعي أدويتكِ ومواعيدكِ الصحية من مكان واحد.</p>
        </div>
        <div className="heading-art"><CalendarArt /><PillsArt /></div>
      </section>

      <section className="demo-seed-panel" aria-label="بيانات تجريبية">
        <div className="demo-seed-copy">
          <span className="demo-seed-icon"><Icon name="notebook" size={21} /></span>
          <div>
            <strong>جرّب التطبيق ببيانات جاهزة</strong>
            <p>مجموعة موسّعة تضم حتى 14 ملفاً عائلياً، عشرات التذكيرات، مواعيد مستقبلية وسجل جرعات لمدة 30 يوماً. بيانات خيالية للعرض فقط ولا تستبدل بياناتك الحالية.</p>
          </div>
        </div>
        <button type="button" className="demo-seed-button" onClick={addDemoData} disabled={demoBusy}>
          <Icon name="plus" size={17} /> {demoBusy ? 'جارٍ تجهيز البيانات...' : 'إضافة مجموعة تجريبية موسّعة'}
        </button>
        {(demoMessage || demoError) && <p className={`demo-seed-feedback ${demoError ? 'is-error' : 'is-success'}`} role="status">{demoError || demoMessage}</p>}
      </section>

      {error && <p className="error" role="alert">{error}</p>}

      <section className="stats-grid" aria-label="ملخص اليوم">
        <article className="stat-card stat-purple">
          <span className="stat-icon"><Icon name="list" size={23} /></span>
          <div><p>جرعات اليوم</p><strong>{doses.length}</strong><small>إجمالي الجرعات المجدولة</small></div>
        </article>
        <article className="stat-card stat-green">
          <span className="stat-icon"><Icon name="check" size={23} /></span>
          <div><p>تم أخذها</p><strong>{taken}</strong><small>جرعات مكتملة اليوم</small></div>
        </article>
        <article className="stat-card stat-amber">
          <span className="stat-icon"><Icon name="clock" size={23} /></span>
          <div><p>بانتظارك</p><strong>{doses.filter(d => d.status === 'pending').length}</strong><small>جرعات لم يتم تسجيلها</small></div>
        </article>
        <article className="stat-card stat-pink">
          <span className="stat-icon"><Icon name="calendar" size={23} /></span>
          <div><p>جرعات فائتة</p><strong>{missed}</strong><small>تحتاج إلى متابعة</small></div>
        </article>
      </section>

      <div className="dashboard-columns">
        <div className="dashboard-main">
          {next ? (
            <section className="next-panel card" style={colorVars(next.profile?._id)}>
              <div className="panel-title"><div><span className="eyebrow">لا تنسي موعدكِ</span><h2>الجرعة القادمة</h2></div><span className="next-pill"><BigCapsule /></span></div>
              <div className="next-details">
                <div className="next-clock"><strong>{time(next.scheduledAt)}</strong><span>{relative(next.scheduledAt)}</span></div>
                <div className="next-description"><h3>{next.medication?.name}</h3><p>{next.medication?.dose || 'حسب الوصفة'}</p><span className="person-chip"><i /> {next.profile?.name}</span></div>
              </div>
              <button className="wide" disabled={busy === next._id} onClick={() => toggle(next)}>
                {busy === next._id ? 'جارٍ الحفظ...' : 'تم أخذ الجرعة'} <Icon name="check" size={18} />
              </button>
            </section>
          ) : (
            <section className="next-panel card no-next">
              <span className="empty-check"><Icon name="check" size={28} /></span>
              <div><h2>{doses.length ? 'رائع! لا توجد جرعات قادمة اليوم' : 'ابدئي بتنظيم أدويتكِ'}</h2><p>{doses.length ? 'تم تسجيل جميع الجرعات أو لا توجد جرعات متبقية.' : 'أضيفي أول دواء حتى تظهر مواعيد الجرعات هنا.'}</p></div>
              <Link className="action-link" to="/medications">{doses.length ? 'عرض أدويتي' : 'إضافة دواء'} <Icon name="arrow-left" size={17} /></Link>
            </section>
          )}

          <section className="section-block">
            <div className="section-heading"><div><span className="eyebrow">جدولكِ اليومي</span><h2>جرعات اليوم</h2></div><Link to="/medications">إدارة الأدوية <Icon name="arrow-left" size={16} /></Link></div>
            {doses.length === 0 ? (
              <div className="empty"><span className="caps" /><p>لا توجد جرعات مسجلة لهذا اليوم.</p><Link to="/medications">أضيفي دواء جديداً</Link></div>
            ) : doses.map((d) => {
              const hour = new Date(d.scheduledAt).getHours();
              const day = hour >= 5 && hour < 18;
              return (
                <article className={`dose-row card ${d.status}`} style={colorVars(d.profile?._id)} key={d._id}>
                  <span className={`tod ${day ? 'sun' : 'moon'}`}><Icon name={day ? 'sun' : 'moon'} size={25} /></span>
                  <div className="dose-info"><strong>{d.medication?.name}</strong><p>{d.medication?.dose || 'حسب الوصفة'} <span>·</span> {d.profile?.name}</p></div>
                  <time dir="ltr">{time(d.scheduledAt)}</time>
                  <span className={`status-label ${d.status}`}>{d.status === 'taken' ? 'تمت' : d.status === 'missed' ? 'فاتت' : 'بانتظارها'}</span>
                  <button className={`mini ${d.status === 'taken' ? 'is-taken' : ''}`} disabled={busy === d._id || d.status === 'missed'} onClick={() => toggle(d)} aria-label="تحديث حالة الجرعة"><Icon name="check" size={17} /></button>
                </article>
              );
            })}
          </section>
        </div>

        <aside className="dashboard-side">
          <section className="side-card card adherence-card">
            <div className="section-heading"><h2>معدل الالتزام</h2><Icon name="activity" size={21} /></div>
            <div className="adherence-number">{stats?.adherence ?? '—'}<small>{stats?.adherence == null ? '' : '%'}</small></div>
            <p>نسبة الالتزام خلال آخر 7 أيام</p>
            <div className="progress-track"><span style={{ width: `${stats?.adherence ?? 0}%` }} /></div>
            <div className="progress-foot"><span>الجرعات المسجلة</span><strong>{stats ? stats.taken + stats.missed : 0}</strong></div>
          </section>

          <section className="side-card card appointments-card">
            <div className="section-heading"><h2>المواعيد القادمة</h2><Link to="/appointments">عرض الكل</Link></div>
            {appointments.length === 0 ? <div className="side-empty">لا توجد مواعيد قادمة حالياً.</div> : appointments.map(a => (
              <div className="upcoming-item" key={a._id}>
                <div className="date-box"><strong>{new Date(a.dateTime).getDate()}</strong><span>{new Date(a.dateTime).toLocaleDateString('ar-JO-u-nu-latn', { month: 'short' })}</span></div>
                <div><strong>{a.title}</strong><p>{a.profile?.name || 'بدون ملف'} · {time(a.dateTime)}</p></div>
              </div>
            ))}
            <Link className="add-appointment" to="/appointments"><Icon name="plus" size={17} /> إضافة موعد جديد</Link>
          </section>

          <section className="tip-card">
            <span><Icon name="heart" size={22} /></span><div><strong>تذكير صغير</strong><p>اتبعي تعليمات الطبيب أو الصيدلي عند تناول أدويتكِ، ولا تغيّري الجرعة من نفسكِ.</p></div>
          </section>
        </aside>
      </div>
    </div>
  );
}
