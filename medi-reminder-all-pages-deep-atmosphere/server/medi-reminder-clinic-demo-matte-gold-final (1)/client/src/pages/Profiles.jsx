import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import { colorVars } from '../colors.js';
import Icon from '../components/Icons.jsx';

const FAMILY_LIMIT = 20;

function addedLabel(date) {
  if (!date) return 'ملف عائلي';
  return `أُضيف ${new Date(date).toLocaleDateString('ar-JO-u-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' })}`;
}

export default function Profiles() {
  const [profiles, setProfiles] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [name, setName] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [profileList, appointmentList] = await Promise.all([
        api('/profiles'),
        api('/appointments').catch(() => []),
      ]);
      setProfiles(profileList);
      setAppointments(appointmentList);
    } catch (e) {
      setError(e.message || 'تعذّر تحميل ملفات العائلة');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const upcomingCounts = useMemo(() => {
    const counts = {};
    appointments.forEach((appointment) => {
      const id = appointment.profile?._id;
      if (id) counts[id] = (counts[id] || 0) + 1;
    });
    return counts;
  }, [appointments]);

  const filteredProfiles = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('ar');
    if (!term) return profiles;
    return profiles.filter((profile) => profile.name.toLocaleLowerCase('ar').includes(term));
  }, [profiles, search]);

  async function add(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    try {
      await api('/profiles', { method: 'POST', body: { name: name.trim() } });
      setName('');
      setNotice('تمت إضافة فرد العائلة بنجاح.');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function rename(profile) {
    const nextName = prompt('الاسم الجديد:', profile.name);
    if (!nextName || nextName.trim() === profile.name) return;
    setError('');
    setNotice('');
    try {
      await api(`/profiles/${profile._id}`, { method: 'PUT', body: { name: nextName.trim() } });
      setNotice('تم تحديث اسم الملف.');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(profile) {
    if (!confirm(`حذف ملف "${profile.name}" سيؤدي إلى حذف أدويته ومواعيده المرتبطة به. هل تريد المتابعة؟`)) return;
    setError('');
    setNotice('');
    try {
      await api(`/profiles/${profile._id}`, { method: 'DELETE' });
      setNotice('تم حذف الملف العائلي.');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  const remaining = Math.max(FAMILY_LIMIT - profiles.length, 0);

  return (
    <div className="page-shell family-page" dir="rtl">
      <section className="page-hero family-hero">
        <div className="family-hero-copy">
          <span className="eyebrow">مساحة العائلة · رعاية أقرب</span>
          <h1>كل من تحبّهم، في ملف واحد</h1>
          <p>نظّم الملفات الصحية لأفراد عائلتك وتابع الأدوية والمواعيد الخاصة بكل شخص بسهولة.</p>
          <div className="family-hero-note"><Icon name="shield-check" size={17} /> ملفات منفصلة وتنظيم أوضح للرعاية</div>
        </div>
        <div className="family-hero-visual" aria-hidden="true">
          <div className="family-visual-orbit orbit-one" />
          <div className="family-visual-orbit orbit-two" />
          <div className="family-visual-main"><Icon name="users" size={48} /></div>
          <span className="family-visual-chip chip-top"><Icon name="heart" size={16} /></span>
          <span className="family-visual-chip chip-bottom"><Icon name="plus" size={17} /></span>
        </div>
      </section>

      <section className="family-overview" aria-label="ملخص العائلة">
        <article className="family-stat-card">
          <span className="family-stat-icon"><Icon name="users" size={19} /></span>
          <div><span>أفراد العائلة</span><strong>{profiles.length}</strong><small>من أصل {FAMILY_LIMIT} ملفاً</small></div>
        </article>
        <article className="family-stat-card family-stat-soft">
          <span className="family-stat-icon"><Icon name="user-plus" size={19} /></span>
          <div><span>ملفات متاحة</span><strong>{remaining}</strong><small>يمكنك إضافة أفراد آخرين</small></div>
        </article>
        <article className="family-stat-card family-stat-gold">
          <span className="family-stat-icon"><Icon name="calendar" size={19} /></span>
          <div><span>مواعيد قادمة</span><strong>{appointments.length}</strong><small>لكل أفراد العائلة</small></div>
        </article>
      </section>

      <section className="family-add-card">
        <div className="family-add-intro">
          <span className="family-add-symbol"><Icon name="user-plus" size={23} /></span>
          <div><span className="section-kicker">ملف جديد</span><h2>أضف فرداً إلى العائلة</h2><p>سيكون لكل فرد ملف مستقل لأدويته ومواعيده.</p></div>
        </div>
        <form className="family-add-form" onSubmit={add}>
          <label className="sr-only" htmlFor="profile-name">اسم فرد العائلة</label>
          <div className="family-input-wrap"><Icon name="user-round" size={18} /><input id="profile-name" placeholder="اكتب الاسم، مثلاً: ماما" value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} disabled={remaining === 0} /></div>
          <button type="submit" disabled={!name.trim() || remaining === 0}><Icon name="plus" size={17} /> إضافة فرد</button>
        </form>
        {remaining === 0 && <p className="family-limit-note">وصلت إلى الحد الأقصى وهو 20 ملفاً.</p>}
      </section>

      {(error || notice) && <div className={error ? 'family-message is-error' : 'family-message is-success'} role="status"><Icon name={error ? 'alert-circle' : 'check-circle'} size={17} />{error || notice}</div>}

      <section className="family-list-section">
        <div className="family-section-heading">
          <div><span className="section-kicker">ملفاتكم الصحية</span><h2>أفراد العائلة <span>{profiles.length}</span></h2><p>اختر إدارة الاسم أو راجع عدد المواعيد القادمة لكل فرد.</p></div>
          <label className="family-search"><Icon name="search" size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن فرد..." aria-label="ابحث عن فرد في العائلة" /></label>
        </div>

        {loading ? (
          <div className="family-loading"><span /><span /><span /></div>
        ) : profiles.length === 0 ? (
          <div className="family-empty">
            <span className="family-empty-art"><Icon name="users" size={36} /></span>
            <h3>ابدأوا بإنشاء مساحة العائلة</h3>
            <p>أضف أول ملف عائلي من النموذج أعلاه، ثم يمكنك تنظيم الأدوية والمواعيد بشكل مستقل لكل شخص.</p>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="family-empty family-no-results"><span className="family-empty-art"><Icon name="search" size={30} /></span><h3>ما لقينا هذا الاسم</h3><p>جرّب البحث بكلمة مختلفة.</p></div>
        ) : (
          <div className="family-grid">
            {filteredProfiles.map((profile, index) => (
              <article className="family-member-card" style={colorVars(profile._id)} key={profile._id}>
                <div className="family-member-top">
                  <span className={`family-avatar family-avatar-${index % 4}`}>{profile.name.trim().charAt(0)}</span>
                  <span className="family-file-badge"><i /> ملف محفوظ</span>
                  <span className="family-member-number">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <div className="family-member-info"><h3>{profile.name}</h3><p>{addedLabel(profile.createdAt)}</p></div>
                <div className="family-member-metrics">
                  <span><Icon name="calendar" size={16} /> المواعيد القادمة</span>
                  <strong>{upcomingCounts[profile._id] || 0}</strong>
                </div>
                <div className="family-member-footer">
                  <span>إدارة الملف الصحي</span>
                  <div className="family-member-actions">
                    <button type="button" className="family-icon-button" onClick={() => rename(profile)} aria-label={`تعديل اسم ${profile.name}`} title="تعديل الاسم"><Icon name="edit-2" size={16} /></button>
                    <button type="button" className="family-icon-button is-danger" onClick={() => remove(profile)} aria-label={`حذف ${profile.name}`} title="حذف الملف"><Icon name="trash-2" size={16} /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <aside className="family-privacy-note"><Icon name="shield-check" size={19} /><p><strong>خصوصية كل فرد محفوظة داخل ملفه.</strong> حذف ملف فرد سيحذف أيضاً الأدوية والمواعيد المرتبطة به.</p></aside>
    </div>
  );
}
