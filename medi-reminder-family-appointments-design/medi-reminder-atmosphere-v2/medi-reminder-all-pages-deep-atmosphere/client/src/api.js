// دالة وحدة لكل طلبات الـ API: بتضيف الـ token تلقائياً وبترجّع الأخطاء برسالة واضحة
const BASE = import.meta.env.VITE_API_URL || '/api';

export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth-expired'));
    }
    throw new Error(data.message || 'صار خطأ، جرّبي مرة ثانية');
  }
  return data;
}
