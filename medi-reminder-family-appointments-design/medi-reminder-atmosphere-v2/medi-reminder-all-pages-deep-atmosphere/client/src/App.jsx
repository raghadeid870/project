import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Today from './pages/Today.jsx';
import Profiles from './pages/Profiles.jsx';
import Medications from './pages/Medications.jsx';
import Appointments from './pages/Appointments.jsx';

// صفحات محمية: إذا ما في مستخدم بنحوّل لصفحة الدخول
function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="center muted">جاري التحميل...</p>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      {/* صفحة الدخول بتاخد الشاشة كاملة، فما بنلفّها بالـ container */}
      <main className={user ? 'container' : ''}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/" element={<Protected><Today /></Protected>} />
          <Route path="/profiles" element={<Protected><Profiles /></Protected>} />
          <Route path="/medications" element={<Protected><Medications /></Protected>} />
          <Route path="/appointments" element={<Protected><Appointments /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
