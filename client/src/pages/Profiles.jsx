import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { colorVars } from '../colors.js';
import Icon from '../components/Icons.jsx';

export default function Profiles() {
  const [profiles, setProfiles] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const load = () => api('/profiles').then(setProfiles).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault();
    setError('');
    try {
      await api('/profiles', { method: 'POST', body: { name } });
      setName('');
      load();
    } catch (err) { setError(err.message); }
  }

  async function rename(p) {
    const n = prompt('الاسم الجديد:', p.name);
    if (!n || n === p.name) return;
    try { await api(`/profiles/${p._id}`, { method: 'PUT', body: { name: n } }); load(); }
    catch (err) { setError(err.message); }
  }

  async function remove(p) {
    if (!confirm(`حذف "${p.name}" بيمسح كل أدويته ومواعيده. متأكدة؟`)) return;
    try { await api(`/profiles/${p._id}`, { method: 'DELETE' }); load(); }
    catch (err) { setError(err.message); }
  }

  return (
    <div className="profiles-page" dir="rtl">
      <section className="page-hero profiles-hero">
        <div><span className="eyebrow">مساحة العائلة</span><h1>أفراد العائلة</h1><p>اجمعي ملفات أحبائكِ الصحية في مكان واحد، وتابعي رعايتهم بسهولة.</p></div>
        <div className="page-hero-icon"><Icon name="users" size={34} /></div>
      </section>
      <div className="profiles-content">
      <div className="profiles-section-head"><div><h2>الملفات الشخصية</h2><p>أضيفي شخصاً لإدارة أدويته ومواعيده بشكل مستقل.</p></div><span className="count-pill">{profiles.length} {profiles.length === 1 ? 'ملف' : 'ملفات'}</span></div>
      <form className="card form profile-add" onSubmit={add}>
        <div className="profile-add-icon"><Icon name="user-plus" size={22} /></div>
        <div className="profile-add-field"><label htmlFor="profile-name">إضافة فرد جديد</label><input id="profile-name" placeholder="اكتبي الاسم، مثلاً: ماما" value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} aria-label="اسم الشخص" style={{ marginTop: 0 }} /></div>
        <button><Icon name="plus" size={17} /> إضافة فرد</button>
      </form>
      {error && <p className="error" role="alert">{error}</p>}
      {profiles.length === 0 && (
        <div className="empty"><span className="caps" /><p>ابدئي بإضافة أول ملف عائلي. يمكنكِ إضافة ملفكِ الشخصي أيضاً.</p></div>
      )}
      <div className="profile-grid">
      {profiles.map((p) => (
        <article className="card profile-card" style={colorVars(p._id)} key={p._id}>
          <div className="profile-card-top"><span className="avatar">{p.name.trim()[0]}</span><span className="profile-status"><i /> ملف نشط</span></div>
          <div className="profile-card-name"><strong>{p.name}</strong><span>الملف الصحي</span></div>
          <div className="profile-card-actions"><button className="ghost" onClick={() => rename(p)}><Icon name="edit-2" size={16} /> تعديل الاسم</button><button className="ghost danger" onClick={() => remove(p)}><Icon name="trash-2" size={16} /> حذف</button></div>
        </article>
      ))}
      </div>
      </div>
    </div>
  );
}
