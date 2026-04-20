"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarItems = [
  {
    label: "الرئيسية",
    href: "/teacher",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: "فصولي",
    href: "/teacher/classes",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    label: "الاختبارات",
    href: "/teacher/quizzes",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    ),
  },
];

export default function TeacherLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [name, setName] = useState("المعلم");
  const [initials, setInitials] = useState("م");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/teacher")
      .then((r) => r.json())
      .then((d) => {
        if (d?.profile?.full_name) {
          setName(d.profile.full_name);
          setInitials(
            d.profile.full_name
              .split(" ")
              .map((w: string) => w[0])
              .slice(0, 2)
              .join("")
          );
        }
      });
  }, []);

  return (
    <div className="tl-root" dir="rtl">
      {/* ── Mobile top bar ── */}
      <header className="tl-mobile-bar">
        <button className="tl-hamburger" onClick={() => setSidebarOpen(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span className="tl-mobile-title">لوحة المعلم</span>
        <div className="tl-mobile-avatar">{initials}</div>
      </header>

      {/* ── Backdrop (mobile) ── */}
      {sidebarOpen && (
        <div className="tl-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="tl-body">
        {/* ── Sidebar ── */}
        <aside className={`tl-sidebar ${sidebarOpen ? "open" : ""}`}>
          {/* Brand */}
          <div className="tl-brand">
            <div className="tl-brand-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <div className="tl-brand-text">
              <span className="tl-brand-title">المنصة التعليمية</span>
              <span className="tl-brand-sub">لوحة المعلم</span>
            </div>
            <button className="tl-close-btn" onClick={() => setSidebarOpen(false)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Teacher profile */}
          <div className="tl-profile">
            <div className="tl-profile-avatar">{initials}</div>
            <div className="tl-profile-info">
              <span className="tl-profile-name">{name}</span>
              <span className="tl-profile-role">معلم</span>
            </div>
          </div>

          {/* Divider */}
          <div className="tl-divider" />

          {/* Nav */}
          <nav className="tl-nav">
            <span className="tl-nav-group-label">القائمة الرئيسية</span>
            {sidebarItems.map((item) => {
              const isActive =
                item.href === "/teacher"
                  ? pathname === "/teacher"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`tl-nav-item ${isActive ? "active" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="tl-nav-icon">{item.icon}</span>
                  <span className="tl-nav-label">{item.label}</span>
                  {isActive && <span className="tl-nav-active-bar" />}
                </Link>
              );
            })}
          </nav>

          {/* Bottom: logout */}
          <div className="tl-sidebar-footer">
            <div className="tl-divider" style={{ marginBottom: 12 }} />
            <a href="/login" className="tl-logout">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              تسجيل الخروج
            </a>
          </div>
        </aside>

        {/* ── Page content ── */}
        <main className="tl-main">{children}</main>
      </div>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap');

  @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .tl-root {
    min-height: 100vh;
    background: #f4f5f7;
    font-family: Tajawal, sans-serif;
  }

  /* ── Body: sidebar + main side by side ── */
  .tl-body {
    display: flex;
    min-height: 100vh;
  }

  /* ── Sidebar ── */
  .tl-sidebar {
    width: 256px;
    flex-shrink: 0;
    background: #111827;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
    z-index: 30;
  }

  /* ── Brand ── */
  .tl-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px 18px 16px;
    flex-shrink: 0;
  }
  .tl-brand-icon {
    width: 36px; height: 36px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: white;
    flex-shrink: 0;
  }
  .tl-brand-text { flex: 1; display: flex; flex-direction: column; }
  .tl-brand-title { font-size: 13px; font-weight: 800; color: white; letter-spacing: -0.2px; }
  .tl-brand-sub { font-size: 10.5px; color: rgba(255,255,255,0.4); font-weight: 500; }
  .tl-close-btn {
    display: none;
    background: none; border: none; color: rgba(255,255,255,0.5);
    cursor: pointer; padding: 4px; border-radius: 6px;
    transition: color 0.15s;
  }
  .tl-close-btn:hover { color: white; }

  /* ── Profile ── */
  .tl-profile {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 12px 16px;
    padding: 12px 14px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    flex-shrink: 0;
  }
  .tl-profile-avatar {
    width: 36px; height: 36px;
    border-radius: 9px;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 900; color: white;
    flex-shrink: 0;
  }
  .tl-profile-info { display: flex; flex-direction: column; gap: 1px; overflow: hidden; }
  .tl-profile-name {
    font-size: 13px; font-weight: 800; color: white;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .tl-profile-role { font-size: 11px; color: rgba(255,255,255,0.4); font-weight: 500; }

  /* ── Divider ── */
  .tl-divider {
    height: 1px;
    background: rgba(255,255,255,0.07);
    margin: 0 12px 16px;
    flex-shrink: 0;
  }

  /* ── Nav ── */
  .tl-nav {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 0 10px;
    flex: 1;
  }
  .tl-nav-group-label {
    font-size: 10px;
    font-weight: 700;
    color: rgba(255,255,255,0.3);
    text-transform: uppercase;
    letter-spacing: 0.8px;
    padding: 0 8px 8px;
  }
  .tl-nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 10px;
    text-decoration: none;
    color: rgba(255,255,255,0.55);
    font-size: 13.5px;
    font-weight: 600;
    transition: all 0.16s ease;
    position: relative;
  }
  .tl-nav-item:hover {
    background: rgba(255,255,255,0.07);
    color: rgba(255,255,255,0.9);
  }
  .tl-nav-item.active {
    background: rgba(255,255,255,0.11);
    color: white;
    font-weight: 800;
  }
  .tl-nav-icon {
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 8px;
    background: rgba(255,255,255,0.06);
    flex-shrink: 0;
    transition: background 0.16s;
  }
  .tl-nav-item:hover .tl-nav-icon { background: rgba(255,255,255,0.1); }
  .tl-nav-item.active .tl-nav-icon { background: rgba(255,255,255,0.15); }
  .tl-nav-label { flex: 1; }
  .tl-nav-active-bar {
    width: 3px; height: 16px;
    background: white;
    border-radius: 99px;
    opacity: 0.6;
  }

  /* ── Sidebar footer ── */
  .tl-sidebar-footer {
    padding: 0 10px 20px;
    flex-shrink: 0;
  }
  .tl-logout {
    display: flex; align-items: center; gap: 9px;
    padding: 9px 12px; border-radius: 10px;
    color: rgba(255,255,255,0.4);
    text-decoration: none;
    font-size: 13px; font-weight: 600;
    transition: all 0.16s;
  }
  .tl-logout:hover { background: rgba(239,68,68,0.12); color: #fca5a5; }

  /* ── Main ── */
  .tl-main {
    flex: 1;
    min-width: 0;
    overflow-x: hidden;
  }

  /* ── Mobile bar ── */
  .tl-mobile-bar {
    display: none;
    align-items: center;
    justify-content: space-between;
    padding: 0 18px;
    height: 54px;
    background: #111827;
    position: sticky;
    top: 0;
    z-index: 40;
  }
  .tl-hamburger {
    background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px; color: white;
    width: 34px; height: 34px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
  }
  .tl-mobile-title { font-size: 14px; font-weight: 800; color: white; }
  .tl-mobile-avatar {
    width: 32px; height: 32px; border-radius: 8px;
    background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.15);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 900; color: white;
  }

  /* ── Backdrop ── */
  .tl-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 29;
    animation: fadeIn 0.2s ease;
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .tl-mobile-bar { display: flex; }
    .tl-sidebar {
      position: fixed;
      right: 0; top: 0; bottom: 0;
      transform: translateX(100%);
      transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
      height: 100%;
    }
    .tl-sidebar.open {
      transform: translateX(0);
      box-shadow: -8px 0 32px rgba(0,0,0,0.3);
    }
    .tl-close-btn { display: flex; }
    .tl-body { flex-direction: column; }
    .tl-main { min-height: calc(100vh - 54px); }
  }
`;
