import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import Icon from '../components/Icons.jsx';

const emptyForm = { profileId: '', title: '', dateTime: '', notes: '' };

const dateParts = (value) => {
  const date = new Date(value);
  return {
    day: date.toLocaleDateString('ar-JO-u-nu-latn', { day: 'numeric' }),
    month: date.toLocaleDateString('ar-JO', { month: 'short' }),
    weekday: date.toLocaleDateString('ar-JO', { weekday: 'long' }),
    full: date.toLocaleDateString('ar-JO-u-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' }),
    time: date.toLocaleTimeString('ar-JO-u-nu-latn', { hour: '2-digit', minute: '2-digit' }),
  };
};

function dayKey(value) {
  const date = new Date(value);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function relativeDay(value) {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (dayKey(value) === dayKey(today)) return 'اليوم';
  if (dayKey(value) === dayKey(tomorrow)) return 'غداً';
  return null;
}

function groupLabel(value) {
  const relative = relativeDay(value);
  if (relative) return relative === 'اليوم' ? 'مواعيد اليوم' : 'مواعيد الغد';
  return 'مواعيد أخرى';
}

export default function Appointments() {
  const [profiles, setProfiles] = useState([]);
  const [list, setList] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadAppointments() {
    try {
      const appointments = await api('/appointments');
      setList(appointments);
    } catch (e) {
      setError(e.message || 'تعذّر تحميل المواعيد');
    }
  }

  useEffect(() => {
    let active = true;
    async function init() {
      setLoading(true);
      try {
        const [people, appointments] = await Promise.all([api('/profiles'), api('/appointments')]);
        if (!active) return;
        setProfiles(people);
        setList(appointments);
        if (people.length) setForm((current) => ({ ...current, profileId: current.profileId || people[0]._id }));
      } catch (e) {
        if (active) setError(e.message || 'تعذّر تحميل بيانات المواعيد');
      } finally {
        if (active) setLoading(false);
      }
    }
    init();
    return () => { active = false; };
  }, []);

  const set = (key) => (e) => setForm((current) => ({ ...current, [key]: e.target.value }));

  const visibleAppointments = useMemo(() => {
    if (filter === 'all') return list;
    return list.filter((appointment) => appointment.profile?._id === filter);
  }, [filter, list]);

  const stats = useMemo(() => {
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return {
      today: list.filter((a) => dayKey(a.dateTime) === dayKey(now)).length,
      week: list.filter((a) => new Date(a.dateTime) <= weekEnd).length,
      total: list.length,
    };
  }, [list]);

  const groups = useMemo(() => {
    const keys = ['مواعيد اليوم', 'مواعيد الغد', 'مواعيد أخرى'];
    return keys.map((label) => ({ label, items: visibleAppointments.filter((appointment) => groupLabel(appointment.dateTime) === label) })).filter((group) => group.items.length);
  }, [visibleAppointments]);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    if (!form.dateTime || Number.isNaN(new Date(form.dateTime).getTime())) {
      setError('اختَر تاريخاً ووقتاً صحيحين للموعد.');
      return;
    }
    setSaving(true);
    try {
      await api('/appointments', {
        method: 'POST',
        body: { ...form, title: form.title.trim(), dateTime: new Date(form.dateTime).toISOString(), notes: form.notes.trim() },
      });
      setForm((current) => ({ ...current, title: '', dateTime: '', notes: '' }));
      setNotice('تمت إضافة الموعد إلى جدولك.');
      await loadAppointments();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(appointment) {
    if (!confirm(`حذف موعد "${appointment.title}"؟`)) return;
    setError('');
    setNotice('');
    try {
      await api(`/appointments/${appointment._id}`, { method: 'DELETE' });
      setNotice('تم حذف الموعد.');
      await loadAppointments();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!loading && profiles.length === 0) return (
    <div className="page-shell appointments-page" dir="rtl">
      <section className="page-hero appointments-hero"><div><span className="eyebrow">تنظيم الرعاية</span><h1>مواعيدك، مرتّبة وواضحة</h1><p>تابع زيارات الطبيب والفحوصات القادمة لكل فرد من العائلة.</p></div><div className="appointments-hero-art"><Icon name="calendar" size={43} /></div></section>
      <section className="appointments-setup">
        <span className="appointments-setup-icon"><Icon name="users" size={34} /></span>
        <span className="section-kicker">ابدأ من هنا</span>
        <h2>أنشئ ملفاً عائلياً أولاً</h2>
        <p>أضف الشخص صاحب الموعد إلى مساحة العائلة، وبعدها يمكنك تسجيل مواعيده الطبية وملاحظاته.</p>
        <Link to="/profiles" className="appointments-primary-link">الانتقال إلى أفراد العائلة <Icon name="arrow-left" size={17} /></Link>
      </section>
    </div>
  );

  return (
    <div className="page-shell appointments-page" dir="rtl">
      <section className="page-hero appointments-hero">
        <div>
          <span className="eyebrow">تنظيم الرعاية · مواعيد العائلة</span>
          <h1>مواعيدك، مرتّبة وواضحة</h1>
          <p>كل زيارة وفحص في مكان واحد، حتى تكون مستعداً للخطوة القادمة.</p>
          <div className="appointments-hero-caption"><Icon name="shield-check" size={16} /> تذكّر مواعيد العائلة ولا تفوّت زيارة مهمة</div>
        </div>
        <div className="appointments-hero-art" aria-hidden="true"><Icon name="calendar" size={43} /><span><Icon name="check" size={19} /></span></div>
      </section>

      <section className="appointments-stats" aria-label="ملخص المواعيد">
        <article className="appointment-stat">
          <span className="appointment-stat-icon"><Icon name="calendar" size={19} /></span>
          <div><span>كل المواعيد القادمة</span><strong>{stats.total}</strong></div>
        </article>
        <article className="appointment-stat is-today">
          <span className="appointment-stat-icon"><Icon name="sun" size={19} /></span>
          <div><span>مواعيد اليوم</span><strong>{stats.today}</strong></div>
        </article>
        <article className="appointment-stat is-week">
          <span className="appointment-stat-icon"><Icon name="clock" size={19} /></span>
          <div><span>خلال 7 أيام</span><strong>{stats.week}</strong></div>
        </article>
      </section>

      <section className="appointment-create-card">
        <div className="appointment-create-heading">
          <div className="appointment-create-icon"><Icon name="calendar-plus" size={22} /></div>
          <div><span className="section-kicker">إضافة إلى الجدول</span><h2>احجز مساحة للموعد القادم</h2><p>أدخل تفاصيل الزيارة لتظهر مباشرة في جدول العائلة.</p></div>
          <span className="appointment-create-tag">موعد جديد</span>
        </div>
        <form className="appointment-form" onSubmit={submit}>
          <label className="appointment-field"><span><Icon name="user-round" size={15} /> صاحب الموعد</span>
            <select value={form.profileId} onChange={set('profileId')} required>
              {profiles.map((profile) => <option key={profile._id} value={profile._id}>{profile.name}</option>)}
            </select>
          </label>
          <label className="appointment-field"><span><Icon name="notebook" size={15} /> عنوان الموعد</span>
            <input value={form.title} onChange={set('title')} placeholder="مثلاً: مراجعة طبيب القلب" required maxLength={100} />
          </label>
          <label className="appointment-field"><span><Icon name="calendar" size={15} /> التاريخ والوقت</span>
            <input type="datetime-local" value={form.dateTime} onChange={set('dateTime')} required />
          </label>
          <label className="appointment-field appointment-notes-field"><span><Icon name="notebook" size={15} /> ملاحظات إضافية <small>اختياري</small></span>
            <textarea value={form.notes} onChange={set('notes')} placeholder="اسم الطبيب، التحضيرات المطلوبة أو أي ملاحظة..." maxLength={300} rows={2} />
          </label>
          {error && <p className="appointment-feedback is-error" role="alert"><Icon name="alert-circle" size={17} />{error}</p>}
          {notice && <p className="appointment-feedback is-success" role="status"><Icon name="check-circle" size={17} />{notice}</p>}
          <div className="appointment-form-footer"><span><Icon name="shield-check" size={15} /> بيانات الموعد محفوظة ضمن ملف صاحبه</span><button type="submit" disabled={saving || !form.profileId}>{saving ? 'جارٍ الحفظ...' : <><Icon name="plus" size={17} /> إضافة الموعد</>}</button></div>
        </form>
      </section>

      <section className="appointment-list-section">
        <div className="appointment-list-heading">
          <div><span className="section-kicker">جدول العائلة</span><h2>المواعيد القادمة</h2><p>رتّب القائمة حسب الشخص لمراجعة أسرع.</p></div>
          <span className="appointment-total-pill">{visibleAppointments.length} موعد</span>
        </div>

        <div className="appointment-filters" role="group" aria-label="تصفية المواعيد حسب فرد العائلة">
          <button type="button" className={filter === 'all' ? 'active' : ''} aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>الكل <span>{list.length}</span></button>
          {profiles.map((profile) => (
            <button type="button" key={profile._id} className={filter === profile._id ? 'active' : ''} aria-pressed={filter === profile._id} onClick={() => setFilter(profile._id)}><i>{profile.name.trim().charAt(0)}</i>{profile.name}</button>
          ))}
        </div>

        {loading ? (
          <div className="appointment-loading"><span /><span /><span /></div>
        ) : groups.length === 0 ? (
          <div className="appointment-empty">
            <span className="appointment-empty-art"><Icon name="calendar" size={35} /></span>
            <h3>{list.length ? 'لا توجد مواعيد لهذا الفرد' : 'جدولك ما زال فارغاً'}</h3>
            <p>{list.length ? 'اختر فرداً آخر أو اعرض جميع المواعيد.' : 'أضف أول موعد من النموذج أعلاه، وسيظهر هنا مرتباً حسب التاريخ.'}</p>
            {filter !== 'all' && <button type="button" className="appointment-reset-filter" onClick={() => setFilter('all')}>عرض كل المواعيد</button>}
          </div>
        ) : (
          <div className="appointment-groups">
            {groups.map((group) => (
              <section className="appointment-group" key={group.label}>
                <div className="appointment-group-title"><span className="appointment-group-dot" /><h3>{group.label}</h3><span>{group.items.length}</span></div>
                <div className="appointment-cards">
                  {group.items.map((appointment) => {
                    const date = dateParts(appointment.dateTime);
                    const relative = relativeDay(appointment.dateTime);
                    return (
                      <article className="appointment-item" key={appointment._id}>
                        <div className="appointment-date-tile"><strong>{date.day}</strong><span>{date.month}</span></div>
                        <div className="appointment-item-main">
                          <div className="appointment-item-topline"><span className="appointment-person"><i>{appointment.profile?.name?.trim().charAt(0) || '؟'}</i>{appointment.profile?.name || 'فرد من العائلة'}</span>{relative && <span className="appointment-relative">{relative}</span>}</div>
                          <h4>{appointment.title}</h4>
                          <div className="appointment-item-meta"><span><Icon name="clock" size={14} />{date.weekday} · {date.time}</span><span><Icon name="calendar" size={14} />{date.full}</span></div>
                          {appointment.notes && <p className="appointment-item-notes">{appointment.notes}</p>}
                        </div>
                        <button type="button" className="appointment-delete" onClick={() => remove(appointment)} aria-label={`حذف موعد ${appointment.title}`} title="حذف الموعد"><Icon name="trash-2" size={16} /></button>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
