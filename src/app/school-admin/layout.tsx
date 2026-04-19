// school-admin/layout.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  {
    href: "/school-admin",
    label: "الرئيسية",
    exact: true,
    icon: (
      <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: "/school-admin/placement-assessment",
    label: "اختبار التصنيف",
    icon: (
      <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    href: "/school-admin/submissions",
    label: "النتائج",
    icon: (
      <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
        <path d="M12 11v6M9 14l3 3 3-3" />
      </svg>
    ),
  },
  {
    href: "/school-admin/students",
    label: "الطلاب",
    icon: (
      <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    href: "/school-admin/teachers",
    label: "المعلمون",
    icon: (
      <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    href: "/school-admin/classes",
    label: "الفصول",
    icon: (
      <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      </svg>
    ),
  },
];

export default function SchoolAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [schoolName, setSchoolName] = useState("المدرسة");
  const [adminName, setAdminName] = useState("المدير");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/school-admin/stats")
      .then((r) => r.json())
      .then((d) => { if (d.school?.name) setSchoolName(d.school.name); });

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.full_name) setAdminName(user.user_metadata.full_name);
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <div className="sa-shell" dir="rtl">
      {sidebarOpen && <div className="sa-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sa-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sa-brand">
          <div className="sa-brand-icon">🏫</div>
          <div className="sa-brand-text">
            <span className="sa-school-name">{schoolName}</span>
            <span className="sa-role-tag">لوحة المدير</span>
          </div>
        </div>

        <nav className="sa-nav">
          <div className="sa-nav-label">القائمة</div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sa-nav-item ${isActive(item) ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sa-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {isActive(item) && <span className="sa-active-dot" />}
            </Link>
          ))}
        </nav>

        <div className="sa-footer">
          <div className="sa-admin-info">
            <div className="sa-admin-avatar">{adminName.charAt(0)}</div>
            <div className="sa-admin-meta">
              <span className="sa-admin-name">{adminName}</span>
              <span className="sa-admin-tag">مدير المدرسة</span>
            </div>
          </div>
          <button className="sa-logout-btn" onClick={handleLogout} title="تسجيل الخروج">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>

      <div className="sa-main">
        <header className="sa-topbar">
          <button className="sa-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="sa-topbar-title">
            {navItems.find((n) => isActive(n))?.label ?? "لوحة التحكم"}
          </span>
          <div className="sa-status-dot" title="متصل" />
        </header>
        <main className="sa-content">{children}</main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #f7f8fa; --surface: #ffffff; --surface2: #f1f3f6;
          --border: #e5e7eb; --border2: #d1d5db;
          --accent: #2563eb; --accent2: #7c3aed;
          --accent-soft: rgba(37,99,235,0.08);
          --text: #111827; --text2: #6b7280; --text3: #9ca3af;
          --success: #10b981; --warning: #f59e0b; --danger: #ef4444;
          --sidebar-w: 240px;
        }

        html, body { background: var(--bg); color: var(--text); font-family: 'Tajawal', sans-serif; }

        .sa-shell { display: flex; min-height: 100vh; background: var(--bg); }

        .sa-sidebar {
          width: var(--sidebar-w); min-height: 100vh;
          background: var(--surface); border-left: 1px solid var(--border);
          display: flex; flex-direction: column;
          position: fixed; top: 0; right: 0; z-index: 50;
          transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
        }

        .sa-brand {
          display: flex; align-items: center; gap: 10px;
          padding: 18px 16px; border-bottom: 1px solid var(--border);
        }
        .sa-brand-icon { font-size: 26px; }
        .sa-brand-text { display: flex; flex-direction: column; min-width: 0; }
        .sa-school-name { font-size: 13.5px; font-weight: 800; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sa-role-tag { font-size: 10px; font-weight: 600; color: var(--accent); letter-spacing: 0.3px; }

        .sa-nav { flex: 1; padding: 14px 10px; display: flex; flex-direction: column; gap: 2px; }
        .sa-nav-label { font-size: 10px; font-weight: 700; color: var(--text3); letter-spacing: 0.8px; text-transform: uppercase; padding: 0 8px; margin-bottom: 6px; }

        .sa-nav-item {
          display: flex; align-items: center; gap: 9px;
          padding: 9px 10px; border-radius: 8px;
          text-decoration: none; color: var(--text2);
          font-size: 13.5px; font-weight: 500;
          transition: all 0.15s; position: relative;
        }
        .sa-nav-item:hover { background: var(--surface2); color: var(--text); }
        .sa-nav-item.active { background: var(--accent-soft); color: var(--accent); font-weight: 700; }
        .sa-nav-icon { flex-shrink: 0; }
        .sa-active-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); margin-right: auto; }

        .sa-footer {
          padding: 12px 14px; border-top: 1px solid var(--border);
          display: flex; align-items: center; gap: 8px;
        }
        .sa-admin-info { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
        .sa-admin-avatar {
          width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 800; color: white;
        }
        .sa-admin-meta { display: flex; flex-direction: column; min-width: 0; }
        .sa-admin-name { font-size: 12.5px; font-weight: 700; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sa-admin-tag { font-size: 10px; color: var(--accent); font-weight: 500; }
        .sa-logout-btn {
          background: none; border: 1px solid var(--border2); color: var(--text3);
          width: 30px; height: 30px; border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.15s; flex-shrink: 0;
        }
        .sa-logout-btn:hover { border-color: var(--danger); color: var(--danger); }

        .sa-main { flex: 1; margin-right: var(--sidebar-w); display: flex; flex-direction: column; min-height: 100vh; }
        .sa-topbar {
          height: 54px; background: var(--surface); border-bottom: 1px solid var(--border);
          display: flex; align-items: center; padding: 0 22px; gap: 14px;
          position: sticky; top: 0; z-index: 40;
        }
        .sa-menu-btn { display: none; background: none; border: none; color: var(--text2); cursor: pointer; padding: 4px; }
        .sa-topbar-title { font-size: 14px; font-weight: 700; color: var(--text); }
        .sa-status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--success); box-shadow: 0 0 6px var(--success); margin-right: auto; }
        .sa-content { padding: 26px 24px; flex: 1; }

        .sa-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 49; }

        @media (max-width: 768px) {
          .sa-sidebar { transform: translateX(100%); }
          .sa-sidebar.open { transform: translateX(0); }
          .sa-overlay { display: block; }
          .sa-main { margin-right: 0; }
          .sa-menu-btn { display: flex; }
          .sa-content { padding: 18px 14px; }
        }
      `}</style>
    </div>
  );
}