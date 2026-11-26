import { NavLink } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import Icon from './Icons.jsx';
import { HeartLogo } from './Art.jsx';

const links = [
  ['/', 'home', 'الرئيسية', true],
  ['/medications', 'list', 'أدويتي'],
  ['/appointments', 'cal', 'المواعيد'],
  ['/profiles', 'users', 'العيلة'],
];

export default function Navbar() {
  const { logout } = useAuth();
  return (
    <>
      <header className="top">
        <HeartLogo />
        <div>
          <div className="brand-title">Medi Reminder</div>
          <div className="brand-sub"><span aria-hidden="true">♥</span> رعاية صحية أسهل لكِ ولعائلتك</div>
        </div>
        <span className="spacer" />
        <button className="round" onClick={logout} aria-label="تسجيل الخروج" title="تسجيل الخروج">
          <Icon name="logout" size={22} />
        </button>
      </header>

      <nav className="tabs" aria-label="التنقل الرئيسي">
        {links.map(([to, icon, label, end]) => (
          <NavLink key={to} to={to} end={end}>
            <span className="ico"><Icon name={icon} size={24} /></span>
            <span className="lbl">{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
