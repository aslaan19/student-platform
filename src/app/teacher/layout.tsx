"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/language-context";
import LangToggle from "@/lib/LangToggle";
import { t } from "@/lib/translations";

const sidebarItems = [
  {
    key: "dashboard" as const,
    href: "/teacher",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    key: "myClasses" as const,
    href: "/teacher/classes",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    key: "quizzes" as const,
    href: "/teacher/quizzes",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
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
  const [name, setName] = useState("");
  const [initials, setInitials] = useState("م");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang } = useLang();
  const tr = t[lang];
  const isRtl = lang === "ar";

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
              .join(""),
          );
        }
        if (d?.school?.language) {
          setLang(d.school.language as "ar" | "sq");
          if (d.school.language === "sq") setShowToggle(true);
        }
      });
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="tl-root" dir={isRtl ? "rtl" : "ltr"}>
      {/* Mobile top bar */}
      <header className="tl-mobile-bar">
        <button className="tl-hamburger" onClick={() => setSidebarOpen(true)}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span className="tl-mobile-title">{tr.dashboard}</span>
        <div className="tl-mobile-avatar">{initials}</div>
      </header>

      {sidebarOpen && (
        <div className="tl-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="tl-body">
        <aside className={`tl-sidebar ${sidebarOpen ? "open" : ""}`}>
          {/* Brand */}
          <div className="tl-brand">
            <div className="tl-brand-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <div className="tl-brand-text">
              <span className="tl-brand-title">{tr.platform}</span>
              <span className="tl-brand-sub">
                {lang === "ar" ? "لوحة المعلم" : "Paneli i Mësuesit"}
              </span>
            </div>
            <button
              className="tl-close-btn"
              onClick={() => setSidebarOpen(false)}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Profile */}
          <div className="tl-profile">
            <div className="tl-profile-avatar">{initials}</div>
            <div className="tl-profile-info">
              <span className="tl-profile-name">{name}</span>
              <span className="tl-profile-role">
                {lang === "ar" ? "معلم" : "Mësues"}
              </span>
            </div>
          </div>

          {showToggle && (
            <div style={{ padding: "0 14px 14px" }}>
              <LangToggle />
            </div>
          )}

          <div className="tl-divider" />

          {/* Nav */}
          <nav className="tl-nav">
            <span className="tl-nav-group-label">
              {lang === "ar" ? "القائمة الرئيسية" : "Menuja Kryesore"}
            </span>
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
                  <span className="tl-nav-label">{tr[item.key]}</span>
                  {isActive && <span className="tl-nav-pip" />}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="tl-sidebar-footer">
            <div className="tl-divider" style={{ marginBottom: 12 }} />
            <button
              className="tl-logout"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? (
                <div className="tl-logout-spin" />
              ) : (
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              )}
              {loggingOut ? "..." : tr.logout}
            </button>
          </div>
        </aside>

        <main className="tl-main">{children}</main>
      </div>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');

*,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }

@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
@keyframes sp      { to   { transform: rotate(360deg); } }

.tl-root {
  min-height: 100vh;
  background: #F5F3EE;
  font-family: 'Cairo', sans-serif;
}

.tl-body {
  display: flex;
  min-height: 100vh;
}

/* ── Sidebar ── */
.tl-sidebar {
  width: 252px;
  flex-shrink: 0;
  background: #0B0B0C;
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

/* Brand */
.tl-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 22px 16px 18px;
  flex-shrink: 0;
}
.tl-brand-icon {
  width: 36px; height: 36px;
  background: #C8A96A;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: #0B0B0C;
  flex-shrink: 0;
}
.tl-brand-text {
  flex: 1;
  display: flex; flex-direction: column;
  gap: 1px;
}
.tl-brand-title {
  font-size: 13px; font-weight: 800;
  color: #F5F3EE; letter-spacing: -0.2px;
}
.tl-brand-sub {
  font-size: 10.5px;
  color: rgba(200, 169, 106, 0.55);
  font-weight: 500;
}
.tl-close-btn {
  display: none;
  background: none; border: none;
  color: rgba(245,243,238,0.4);
  cursor: pointer; padding: 4px;
  border-radius: 6px; transition: color 0.15s;
}
.tl-close-btn:hover { color: #F5F3EE; }

/* Profile */
.tl-profile {
  display: flex; align-items: center; gap: 10px;
  margin: 0 12px 16px;
  padding: 12px 13px;
  background: rgba(200, 169, 106, 0.08);
  border: 1px solid rgba(200, 169, 106, 0.15);
  border-radius: 12px;
  flex-shrink: 0;
}
.tl-profile-avatar {
  width: 36px; height: 36px;
  border-radius: 9px;
  background: #C8A96A;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 900;
  color: #0B0B0C;
  flex-shrink: 0;
}
.tl-profile-info {
  display: flex; flex-direction: column; gap: 2px;
  overflow: hidden;
}
.tl-profile-name {
  font-size: 13px; font-weight: 700;
  color: #F5F3EE;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.tl-profile-role {
  font-size: 11px;
  color: rgba(200, 169, 106, 0.6);
  font-weight: 500;
}

/* Divider */
.tl-divider {
  height: 1px;
  background: rgba(200, 169, 106, 0.1);
  margin: 0 12px 16px;
  flex-shrink: 0;
}

/* Nav */
.tl-nav {
  display: flex; flex-direction: column;
  gap: 2px; padding: 0 10px; flex: 1;
}
.tl-nav-group-label {
  font-size: 9.5px; font-weight: 700;
  color: rgba(200, 169, 106, 0.4);
  text-transform: uppercase; letter-spacing: 0.9px;
  padding: 0 8px 10px;
}
.tl-nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 11px;
  border-radius: 10px;
  text-decoration: none;
  color: rgba(245, 243, 238, 0.45);
  font-size: 13.5px; font-weight: 600;
  transition: all 0.16s ease;
  position: relative;
}
.tl-nav-item:hover {
  background: rgba(200, 169, 106, 0.08);
  color: rgba(245, 243, 238, 0.9);
}
.tl-nav-item.active {
  background: rgba(200, 169, 106, 0.12);
  color: #C8A96A;
  font-weight: 800;
}
.tl-nav-icon {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px;
  background: rgba(245, 243, 238, 0.05);
  flex-shrink: 0;
  transition: background 0.16s;
}
.tl-nav-item:hover .tl-nav-icon {
  background: rgba(200, 169, 106, 0.1);
}
.tl-nav-item.active .tl-nav-icon {
  background: rgba(200, 169, 106, 0.18);
  color: #C8A96A;
}
.tl-nav-label { flex: 1; }
.tl-nav-pip {
  width: 3px; height: 16px;
  background: #C8A96A;
  border-radius: 99px;
  opacity: 0.8;
}

/* Footer */
.tl-sidebar-footer {
  padding: 0 10px 22px;
  flex-shrink: 0;
}
.tl-logout {
  display: flex; align-items: center; gap: 9px;
  padding: 9px 12px;
  border-radius: 10px;
  color: rgba(245, 243, 238, 0.3);
  background: none; border: none;
  font-size: 13px; font-weight: 600;
  font-family: 'Cairo', sans-serif;
  cursor: pointer;
  transition: all 0.16s;
  width: 100%;
}
.tl-logout:hover:not(:disabled) {
  background: rgba(200, 60, 60, 0.1);
  color: #f5a0a0;
}
.tl-logout:disabled { opacity: 0.4; cursor: not-allowed; }
.tl-logout-spin {
  width: 14px; height: 14px;
  border: 2px solid rgba(200, 169, 106, 0.2);
  border-top-color: #C8A96A;
  border-radius: 50%;
  animation: sp 0.7s linear infinite;
  flex-shrink: 0;
}

/* Main */
.tl-main { flex: 1; min-width: 0; overflow-x: hidden; }

/* Mobile bar */
.tl-mobile-bar {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  height: 54px;
  background: #0B0B0C;
  position: sticky; top: 0; z-index: 40;
  border-bottom: 1px solid rgba(200, 169, 106, 0.15);
}
.tl-hamburger {
  background: rgba(200, 169, 106, 0.1);
  border: 1px solid rgba(200, 169, 106, 0.2);
  border-radius: 8px;
  color: #C8A96A;
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
}
.tl-mobile-title {
  font-size: 14px; font-weight: 800;
  color: #F5F3EE;
}
.tl-mobile-avatar {
  width: 32px; height: 32px;
  border-radius: 8px;
  background: #C8A96A;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 900;
  color: #0B0B0C;
}

.tl-backdrop {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 29;
  animation: fadeIn 0.2s ease;
}

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
    box-shadow: -8px 0 40px rgba(0, 0, 0, 0.4);
  }
  .tl-close-btn { display: flex; }
  .tl-body { flex-direction: column; }
  .tl-main { min-height: calc(100vh - 54px); }
}
`;
