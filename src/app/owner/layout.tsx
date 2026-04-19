// owner/layout.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

const navItems = [
  {
    href: "/owner",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    exact: true,
  },
  {
    href: "/owner/schools",
    label: "Schools",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M3 21V9l9-6 9 6v12" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    href: "/owner/intake-assessment",
    label: "Intake Assessment",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    href: "/owner/submissions",
    label: "Submissions",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
        <path d="M12 11v6M9 14l3 3 3-3" />
      </svg>
    ),
  },
];

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ownerName, setOwnerName] = useState("Owner");
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
    <div className="owner-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`owner-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" opacity="0.9"/>
              <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.8" fill="none"/>
              <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.8" fill="none"/>
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-name">Platform</span>
            <span className="brand-role">Owner Console</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive(item) ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {isActive(item) && <span className="nav-active-dot" />}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="owner-badge">
            <div className="owner-avatar">
              {ownerName.charAt(0).toUpperCase()}
            </div>
            <div className="owner-info">
              <span className="owner-name">{ownerName}</span>
              <span className="owner-tag">Owner</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="owner-main">
        <header className="owner-topbar">
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="topbar-breadcrumb">
            {navItems.find((n) => isActive(n))?.label ?? "Owner"}
          </div>
          <div className="topbar-actions">
            <div className="status-dot" title="System online" />
          </div>
        </header>

        <main className="owner-content">{children}</main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #f7f8fa;
          --surface: #ffffff;
          --surface2: #f1f3f6;
          --border: #e5e7eb;
          --border2: #d1d5db;
          --accent: #4f8ef7;
          --accent2: #7c5cfc;
          --accent-glow: rgba(79,142,247,0.1);
          --text: #111827;
          --text2: #6b7280;
          --text3: #9ca3af;
          --success: #10b981;
          --warning: #f59e0b;
          --danger: #ef4444;
          --sidebar-w: 240px;
        }

        html, body { background: var(--bg); color: var(--text); font-family: 'Sora', sans-serif; }

        .owner-shell {
          display: flex;
          min-height: 100vh;
          background: var(--bg);
        }

        /* Sidebar */
        .owner-sidebar {
          width: var(--sidebar-w);
          min-height: 100vh;
          background: var(--surface);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0; left: 0;
          z-index: 50;
          transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 20px 16px;
          border-bottom: 1px solid var(--border);
        }
        .brand-mark {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        .brand-text { display: flex; flex-direction: column; }
        .brand-name { font-size: 14px; font-weight: 700; color: var(--text); letter-spacing: -0.3px; }
        .brand-role { font-size: 10px; font-weight: 500; color: var(--accent); letter-spacing: 0.5px; text-transform: uppercase; }

        .sidebar-nav {
          flex: 1;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .nav-section-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--text3);
          letter-spacing: 0.8px;
          text-transform: uppercase;
          padding: 0 8px;
          margin-bottom: 8px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          border-radius: 8px;
          text-decoration: none;
          color: var(--text2);
          font-size: 13.5px;
          font-weight: 500;
          transition: all 0.15s ease;
          position: relative;
        }
        .nav-item:hover { background: var(--surface2); color: var(--text); }
        .nav-item.active {
          background: var(--accent-glow);
          color: var(--accent);
        }
        .nav-icon { flex-shrink: 0; opacity: 0.8; }
        .nav-item.active .nav-icon { opacity: 1; }
        .nav-label { flex: 1; }
        .nav-active-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--accent);
        }

        .sidebar-footer {
          padding: 14px 16px;
          border-top: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .owner-badge { display: flex; align-items: center; gap: 9px; flex: 1; min-width: 0; }
        .owner-avatar {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: white;
          flex-shrink: 0;
        }
        .owner-info { display: flex; flex-direction: column; min-width: 0; }
        .owner-name { font-size: 12.5px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .owner-tag { font-size: 10px; font-weight: 500; color: var(--accent); }
        .logout-btn {
          background: none; border: 1px solid var(--border2);
          color: var(--text3);
          width: 30px; height: 30px;
          border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .logout-btn:hover { border-color: var(--danger); color: var(--danger); }

        /* Main area */
        .owner-main {
          flex: 1;
          margin-left: var(--sidebar-w);
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .owner-topbar {
          height: 56px;
          border-bottom: 1px solid var(--border);
          background: var(--surface);
          display: flex;
          align-items: center;
          padding: 0 24px;
          gap: 16px;
          position: sticky;
          top: 0;
          z-index: 40;
        }
        .mobile-menu-btn {
          display: none;
          background: none; border: none; color: var(--text2); cursor: pointer;
          padding: 4px;
        }
        .topbar-breadcrumb {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
        }
        .topbar-actions { margin-left: auto; display: flex; align-items: center; gap: 12px; }
        .status-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: var(--success);
          box-shadow: 0 0 8px var(--success);
        }
        .owner-content {
          padding: 28px 28px;
          flex: 1;
        }

        /* Mobile */
        .sidebar-overlay {
          display: none;
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 49;
        }
        @media (max-width: 768px) {
          .owner-sidebar { transform: translateX(-100%); }
          .owner-sidebar.open { transform: translateX(0); }
          .sidebar-overlay { display: block; }
          .owner-main { margin-left: 0; }
          .mobile-menu-btn { display: flex; }
          .owner-content { padding: 20px 16px; }
        }
      `}</style>
    </div>
  );
}