"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

const navItems = [
  {
    href: "/owner",
    label: "???? ??????",
    icon: (
      <svg
        width="18"
        height="18"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
    exact: true,
  },
  {
    href: "/owner/schools",
    label: "???????",
    icon: (
      <svg
        width="18"
        height="18"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path d="M3 21V9l9-6 9 6v12" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    href: "/owner/intake-assessment",
    label: "?????? ??????",
    icon: (
      <svg
        width="18"
        height="18"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    href: "/owner/submissions",
    label: "???????? ??????????",
    icon: (
      <svg
        width="18"
        height="18"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
        <path d="M12 11v6M9 14l3 3 3-3" />
      </svg>
    ),
  },
];

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [ownerName, setOwnerName] = useState("???????");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.full_name) {
        setOwnerName(user.user_metadata.full_name);
      }
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
    <div className="owner-shell" dir="rtl">
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`owner-sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-mark">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity="0.95" />
              <path
                d="M2 17l10 5 10-5"
                stroke="white"
                strokeWidth="1.8"
                fill="none"
              />
              <path
                d="M2 12l10 5 10-5"
                stroke="white"
                strokeWidth="1.8"
                fill="none"
              />
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-name">?????? ?????????</span>
            <span className="brand-role">???? ????? ??????</span>
          </div>
        </div>

        <div className="sidebar-divider" />

        <nav className="sidebar-nav">
          <div className="nav-section-label">??????? ????????</div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive(item) ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {isActive(item) && <span className="nav-active-bar" />}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="owner-badge">
            <div className="owner-avatar">{ownerName.charAt(0)}</div>
            <div className="owner-info">
              <span className="owner-name">{ownerName}</span>
              <span className="owner-tag">???? ??????</span>
            </div>
          </div>
          <button
            className="logout-btn"
            onClick={handleLogout}
            title="????? ??????"
          >
            <svg
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>

      <div className="owner-main">
        <header className="owner-topbar">
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="topbar-breadcrumb">
            <span className="breadcrumb-prefix">??????</span>
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              style={{ opacity: 0.35 }}
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span>
              {navItems.find((n) => isActive(n))?.label ?? "????????"}
            </span>
          </div>
          <div className="topbar-actions">
            <div className="status-indicator">
              <div className="status-dot" />
              <span className="status-text">?????? ????</span>
            </div>
          </div>
        </header>

        <main className="owner-content">{children}</main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #f5f6f8;
          --bg2: #eef0f4;
          --surface: #ffffff;
          --surface2: #f8f9fb;
          --surface3: #f0f2f6;
          --border: #e2e5ed;
          --border2: #d0d5e0;
          --accent: #1a4fa0;
          --accent-light: #2563c4;
          --accent-muted: rgba(26,79,160,0.08);
          --accent-muted2: rgba(26,79,160,0.14);
          --gold: #b8872a;
          --gold-light: rgba(184,135,42,0.1);
          --text: #0f1624;
          --text2: #4a5568;
          --text3: #8492a6;
          --success: #0d7c4f;
          --success-bg: rgba(13,124,79,0.08);
          --warning: #b45309;
          --warning-bg: rgba(180,83,9,0.08);
          --danger: #c0392b;
          --danger-bg: rgba(192,57,43,0.08);
          --sidebar-w: 260px;
          --radius: 10px;
          --shadow-sm: 0 1px 3px rgba(15,22,36,0.06), 0 1px 2px rgba(15,22,36,0.04);
          --shadow: 0 4px 12px rgba(15,22,36,0.08), 0 1px 4px rgba(15,22,36,0.04);
          --shadow-md: 0 8px 24px rgba(15,22,36,0.10), 0 2px 8px rgba(15,22,36,0.05);
        }

        html, body {
          background: var(--bg);
          color: var(--text);
          font-family: 'Cairo', sans-serif;
          direction: rtl;
        }

        .owner-shell {
          display: flex;
          min-height: 100vh;
          background: var(--bg);
        }

        /* ?? Sidebar ?? */
        .owner-sidebar {
          width: var(--sidebar-w);
          min-height: 100vh;
          background: var(--surface);
          border-left: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0; right: 0;
          z-index: 50;
          transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
          box-shadow: var(--shadow-sm);
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 22px 18px 18px;
        }
        .brand-mark {
          width: 40px; height: 40px;
          background: linear-gradient(145deg, var(--accent) 0%, var(--accent-light) 100%);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(26,79,160,0.3);
        }
        .brand-text { display: flex; flex-direction: column; }
        .brand-name {
          font-size: 14px; font-weight: 800;
          color: var(--text); letter-spacing: -0.2px;
          line-height: 1.2;
        }
        .brand-role {
          font-size: 10.5px; font-weight: 600;
          color: var(--accent); letter-spacing: 0.3px;
          margin-top: 1px;
        }

        .sidebar-divider {
          height: 1px; background: var(--border); margin: 0 16px;
        }

        .sidebar-nav {
          flex: 1;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .nav-section-label {
          font-size: 10px; font-weight: 700;
          color: var(--text3); letter-spacing: 0.8px;
          text-transform: uppercase;
          padding: 0 8px; margin-bottom: 6px; margin-top: 4px;
        }
        .nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 8px;
          text-decoration: none; color: var(--text2);
          font-size: 13.5px; font-weight: 600;
          transition: all 0.15s ease;
          position: relative; overflow: hidden;
        }
        .nav-item:hover {
          background: var(--surface3); color: var(--text);
        }
        .nav-item.active {
          background: var(--accent-muted2);
          color: var(--accent);
        }
        .nav-icon { flex-shrink: 0; }
        .nav-label { flex: 1; }
        .nav-active-bar {
          position: absolute; right: 0; top: 20%; bottom: 20%;
          width: 3px; background: var(--accent); border-radius: 3px 0 0 3px;
        }

        .sidebar-footer {
          padding: 14px 14px;
          border-top: 1px solid var(--border);
          display: flex; align-items: center; gap: 10px;
          background: var(--surface2);
        }
        .owner-badge { display: flex; align-items: center; gap: 9px; flex: 1; min-width: 0; }
        .owner-avatar {
          width: 34px; height: 34px;
          background: linear-gradient(145deg, var(--accent), var(--accent-light));
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 800; color: white;
          flex-shrink: 0;
        }
        .owner-info { display: flex; flex-direction: column; min-width: 0; }
        .owner-name {
          font-size: 13px; font-weight: 700; color: var(--text);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .owner-tag { font-size: 10px; font-weight: 600; color: var(--accent); }
        .logout-btn {
          background: none; border: 1px solid var(--border2);
          color: var(--text3); width: 32px; height: 32px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.15s; flex-shrink: 0;
        }
        .logout-btn:hover { border-color: var(--danger); color: var(--danger); background: var(--danger-bg); }

        /* ?? Main ?? */
        .owner-main {
          flex: 1;
          margin-right: var(--sidebar-w);
          display: flex; flex-direction: column;
          min-height: 100vh;
        }
        .owner-topbar {
          height: 58px;
          border-bottom: 1px solid var(--border);
          background: var(--surface);
          display: flex; align-items: center;
          padding: 0 28px; gap: 16px;
          position: sticky; top: 0; z-index: 40;
          box-shadow: var(--shadow-sm);
        }
        .mobile-menu-btn {
          display: none; background: none; border: none;
          color: var(--text2); cursor: pointer; padding: 4px;
        }
        .topbar-breadcrumb {
          display: flex; align-items: center; gap: 8px;
          font-size: 13.5px; font-weight: 600; color: var(--text);
        }
        .breadcrumb-prefix { color: var(--text3); font-weight: 500; }
        .topbar-actions { margin-right: auto; display: flex; align-items: center; gap: 12px; }
        .status-indicator {
          display: flex; align-items: center; gap: 6px;
          background: var(--success-bg);
          border: 1px solid rgba(13,124,79,0.18);
          border-radius: 20px; padding: 4px 12px;
        }
        .status-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--success);
          box-shadow: 0 0 6px rgba(13,124,79,0.5);
          animation: pulse 2.5s infinite;
        }
        .status-text { font-size: 11px; font-weight: 700; color: var(--success); }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }

        .owner-content { padding: 30px 30px; flex: 1; }

        /* Mobile */
        .sidebar-overlay {
          display: none; position: fixed; inset: 0;
          background: rgba(15,22,36,0.5); z-index: 49;
          backdrop-filter: blur(2px);
        }
        @media (max-width: 768px) {
          .owner-sidebar { transform: translateX(100%); }
          .owner-sidebar.open { transform: translateX(0); }
          .sidebar-overlay { display: block; }
          .owner-main { margin-right: 0; }
          .mobile-menu-btn { display: flex; }
          .owner-content { padding: 20px 16px; }
          .owner-topbar { padding: 0 16px; }
        }
      `}</style>
    </div>
  );
}
