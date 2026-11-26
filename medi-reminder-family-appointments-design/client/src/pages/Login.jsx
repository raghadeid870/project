import { useState } from 'react';
import { useAuth } from '../AuthContext.jsx';
import Icon from '../components/Icons.jsx';
import { HeartLogo } from '../components/Art.jsx';

export default function Login() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // login | register
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault(); // منع إعادة تحميل الصفحة
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <section className="auth-art">
        <div className="auth-brand"><HeartLogo /><span><strong>Medi Reminder</strong><small>رعاية أقرب، كل يوم</small></span></div>
        <div className="auth-art-content">
          <span className="auth-kicker"><i /> عناية منظمة لعائلتك</span>
          <h1>صحتك وصحة عائلتك، <em>بكل سهولة.</em></h1>
          <p>نظّمي الأدوية والمواعيد في مساحة واحدة، وتابعي الجرعات اليومية بوضوح وراحة بال.</p>
          <div className="auth-benefits">
            <span><Icon name="check-circle" size={18} /> متابعة الجرعات اليومية</span>
            <span><Icon name="calendar" size={18} /> تنظيم المواعيد الطبية</span>
            <span><Icon name="users" size={18} /> ملفات منفصلة لكل فرد</span>
          </div>
        </div>
        <div className="auth-illustration" aria-hidden="true">
          <div className="illustration-orbit orbit-one" />
          <div className="illustration-orbit orbit-two" />
          <div className="illustration-card">
            <div className="illustration-card-top"><span className="illustration-dot" /><span className="illustration-dot" /><span className="illustration-dot" /></div>
            <svg viewBox="0 0 340 250" role="presentation">
              <defs>
                <linearGradient id="medCard" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff"/><stop offset="1" stopColor="#e8f8f3"/></linearGradient>
                <linearGradient id="medTeal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#61c7b2"/><stop offset="1" stopColor="#168b83"/></linearGradient>
              </defs>
              <rect x="36" y="22" width="268" height="204" rx="24" fill="url(#medCard)" />
              <rect x="58" y="44" width="102" height="12" rx="6" fill="#b5dcd3" />
              <rect x="58" y="65" width="66" height="8" rx="4" fill="#d8ebe6" />
              <rect x="58" y="96" width="224" height="94" rx="17" fill="#f5fbf9" stroke="#dcefe9" />
              <rect x="75" y="114" width="48" height="48" rx="14" fill="#dff3ed" />
              <g transform="translate(83 122) rotate(-35 16 16)"><rect x="0" y="7" width="34" height="18" rx="9" fill="#fff" stroke="#b8ddd4" strokeWidth="2"/><path d="M9 7h8v18H9a9 9 0 0 1 0-18" fill="#35aaa0"/></g>
              <rect x="137" y="115" width="112" height="9" rx="4.5" fill="#8bbeb3" />
              <rect x="137" y="133" width="78" height="7" rx="3.5" fill="#d0e7e1" />
              <rect x="137" y="151" width="94" height="7" rx="3.5" fill="#d0e7e1" />
              <circle cx="258" cy="170" r="15" fill="#dff4e8" />
              <path d="m251 170 5 5 10-11" fill="none" stroke="#269c68" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="269" cy="55" r="25" fill="#d9f2eb" />
              <path d="M269 69s-17-10-17-22a9 9 0 0 1 17-4 9 9 0 0 1 17 4c0 12-17 22-17 22" fill="#35aaa0" />
            </svg>
          </div>
          <div className="float-note note-calendar"><span>▦</span><div><b>المواعيد</b><small>كل شيء بوقته</small></div></div>
          <div className="float-note note-dose"><span>✓</span><div><b>الجرعات</b><small>متابعة يومية</small></div></div>
        </div>
        <div className="auth-art-footer"><span>MEDI REMINDER</span><span>رعاية تهتم بالتفاصيل</span></div>
        <span className="pill p1" /><span className="pill p2" /><span className="pill p3" />
      </section>

      <section className="auth-form">
        <div className="auth-form-inner">
          <div className="auth-mobile-brand"><HeartLogo /><strong>Medi Reminder</strong></div>
          <div className="auth-welcome"><span className="auth-form-kicker">مرحباً بعودتك</span><h2>{mode === 'login' ? 'سجّلي دخولك' : 'أنشئي حسابك'}</h2><p>{mode === 'login' ? 'أدخلي بياناتك لمتابعة روتينك الصحي.' : 'ابدئي بتنظيم رعاية عائلتك في مكان واحد.'}</p></div>
          <div className="card form">
            <h2 className="form-title">{mode === 'login' ? 'تسجيل الدخول' : 'بيانات الحساب'}</h2>
          <form onSubmit={submit}>
            {mode === 'register' && (
              <label>الاسم<input value={form.name} onChange={set('name')} required maxLength={60} /></label>
            )}
            <label>البريد الإلكتروني<input type="email" value={form.email} onChange={set('email')} required dir="ltr" placeholder="name@example.com" autoComplete="email" /></label>
            <label>
              كلمة السر
              <input type="password" value={form.password} onChange={set('password')} required minLength={8} dir="ltr" placeholder="••••••••" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            </label>
            {mode === 'register' && <p className="muted">8 أحرف على الأقل</p>}
            {error && <p className="error" role="alert">{error}</p>}
            <button disabled={busy} style={{ width: '100%', marginTop: 8 }}>
              {mode === 'login' ? 'دخول' : 'إنشاء الحساب'}
            </button>
          </form>
          <div className="auth-switch">{mode === 'login' ? 'لسه ما عندك حساب؟' : 'عندك حساب بالفعل؟'} <button className="ghost" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>{mode === 'login' ? 'أنشئي حساباً' : 'سجّلي دخولك'}</button></div>
          <p className="auth-privacy"><Icon name="shield-check" size={15} /> بياناتك محفوظة بشكل آمن</p>
          </div>
        </div>
      </section>
    </div>
  );
}
