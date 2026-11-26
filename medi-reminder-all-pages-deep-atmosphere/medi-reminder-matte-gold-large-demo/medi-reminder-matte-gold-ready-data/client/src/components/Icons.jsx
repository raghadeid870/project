// أيقونات SVG بسيطة (بدون مكتبات). currentColor = بتاخد لون النص من الـ CSS
const paths = {
  home: <><path d="M3 11l9-8 9 8" /><path d="M5 10v10h5v-6h4v6h5V10" /></>,
  list: <><rect x="5" y="3" width="14" height="18" rx="3" /><path d="M9 8h6M9 12h6M9 16h4" /></>,
  cal: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M8 3v4M16 3v4M3 10h18" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.5-3.5 3.2-5.5 6.5-5.5s6 2 6.5 5.5" /><circle cx="17.5" cy="9" r="2.5" /><path d="M17 14.5c2.5.2 4 1.8 4.5 4.5" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  logout: <><path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" /><path d="M16 8l4 4-4 4M20 12H9" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M8 3v4M16 3v4M3 10h18" /></>,
  activity: <><path d="M3 12h4l3-8 4 16 3-8h4" /></>,
  'arrow-left': <><path d="M19 12H5M12 19l-7-7 7-7" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  heart: <path d="M20.8 8.8c0 5.4-8.8 11-8.8 11s-8.8-5.6-8.8-11A4.8 4.8 0 0 1 12 6.4a4.8 4.8 0 0 1 8.8 2.4z" />,
  'check-circle': <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16.5 9" /></>,
  'user-plus': <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.5-3.5 3.2-5.5 6.5-5.5s6 2 6.5 5.5M19 8v6M16 11h6" /></>,
  'edit-2': <><path d="m14 5 5 5M4 20l4.2-.9L19 8.3a2.1 2.1 0 0 0-3-3L5.2 16.1 4 20z" /></>,
  'trash-2': <><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5" /></>,
  'shield-check': <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></>,
  'user-round': <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
  'alert-circle': <><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5h.01" /></>,
  'calendar-plus': <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M8 3v4M16 3v4M3 10h18M12 13v5M9.5 15.5h5" /></>,
  notebook: <><path d="M6 4h12a2 2 0 0 1 2 2v13H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" /><path d="M8 4v15M11 8h5M11 12h5" /></>,
};

export default function Icon({ name, size = 24 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name] || paths.heart}
    </svg>
  );
}
