"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/language-context";
import LangToggle from "@/lib/LangToggle";
import { t } from "@/lib/translations";

export default function SchoolAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [name, setName] = useState("");
  const [initials, setInitials] = useState("م");
  const [schoolName, setSchoolName] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang } = useLang();
  const tr = t[lang];
  const isRtl = lang === "ar";

  const navItems = [
    {
      href: "/school-admin",
      label: lang === "ar" ? "الرئيسية" : "Kryesore",
      icon: "🏠",
      exact: true,
    },
    {
      href: "/school-admin/students",
      label: tr.students,
      icon: "🎓",
      exact: false,
    },
    {
      href: "/school-admin/teachers",
      label: tr.teachers,
      icon: "👨‍🏫",
      exact: false,
    },
    {
      href: "/school-admin/classes",
      label: tr.classes,
      icon: "📚",
      exact: false,
    },
    {
      href: "/school-admin/placement-assessment",
      label: tr.placementAssessment,
      icon: "📋",
      exact: false,
    },
    {
      href: "/school-admin/submissions",
      label: tr.submissions,
      icon: "📝",
      exact: false,
    },
    {
      href: "/school-admin/roadmap",
      label: lang === "ar" ? "بنك الأسئلة" : "Banka e Pyetjeve",
      icon: "🗺️",
      exact: false,
    },
  ];

  useEffect(() => {
    fetch("/api/school-admin/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d?.school) {
          setSchoolName(d.school.name);
          if (d.school.language) {
            setLang(d.school.language as "ar" | "sq");
            if (d.school.language === "sq") setShowToggle(true);
          }
        }
      });

    // Get admin name from stats profile or fallback
    fetch("/api/school-admin/stats")
      .then((r) => r.json())
      .then((d) => {
        // Try to get name from profile if available
        if (d?.adminName) {
          setName(d.adminName);
          setInitials(
            d.adminName
              .split(" ")
              .map((w: string) => w[0])
              .slice(0, 2)
              .join(""),
          );
        }
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="sa-root" dir={isRtl ? "rtl" : "ltr"}>
      {/* Mobile bar */}
      <header className="sa-mobile-bar">
        <button className="sa-hamburger" onClick={() => setSidebarOpen(true)}>
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
        <span className="sa-mobile-title">{schoolName || tr.platform}</span>
        <div className="sa-mobile-avatar">{initials}</div>
      </header>

      {sidebarOpen && (
        <div className="sa-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="sa-body">
        <aside className={`sa-sidebar ${sidebarOpen ? "open" : ""}`}>
          {/* Brand */}
          <div className="sa-brand">
            <div className="sa-brand-icon">🏫</div>
            <div className="sa-brand-text">
              <div className="sa-brand-name">{schoolName || tr.platform}</div>
              <div className="sa-brand-sub">
                {lang === "ar" ? "لوحة المدير" : "Paneli i Drejtorit"}
              </div>
            </div>
            <button
              className="sa-close-btn"
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
          <div className="sa-profile">
            <div className="sa-profile-av">{initials}</div>
            <div className="sa-profile-info">
              <div className="sa-profile-name">
                {name || (lang === "ar" ? "المدير" : "Drejtori")}
              </div>
              <div className="sa-profile-role">
                {lang === "ar" ? "مدير المدرسة" : "Drejtori i Shkollës"}
              </div>
            </div>
          </div>

          {showToggle && (
            <div style={{ padding: "0 12px 12px" }}>
              <LangToggle dark />
            </div>
          )}

          <div className="sa-divider" />

          {/* Nav */}
          <nav className="sa-nav">
            <div className="sa-nav-label">
              {lang === "ar" ? "القائمة الرئيسية" : "Menuja Kryesore"}
            </div>
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sa-nav-item ${isActive ? "active" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sa-nav-icon">{item.icon}</span>
                  <span className="sa-nav-label-text">{item.label}</span>
                  {isActive && <span className="sa-nav-bar" />}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="sa-footer">
            <div className="sa-divider" style={{ marginBottom: 12 }} />
            <button
              className="sa-logout"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? (
                <div className="sa-spin" />
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

        <main className="sa-main">{children}</main>
      </div>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes sp{to{transform:rotate(360deg)}}

  .sa-root{min-height:100vh;background:#f4f5f7;font-family:Tajawal,sans-serif}
  .sa-body{display:flex;min-height:100vh}

  .sa-sidebar{width:256px;flex-shrink:0;background:#111827;display:flex;flex-direction:column;min-height:100vh;position:sticky;top:0;height:100vh;overflow-y:auto;overflow-x:hidden;z-index:30}

  .sa-brand{display:flex;align-items:center;gap:10px;padding:20px 18px 16px;flex-shrink:0}
  .sa-brand-icon{width:36px;height:36px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.12);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
  .sa-brand-text{flex:1;min-width:0;display:flex;flex-direction:column}
  .sa-brand-name{font-size:13px;font-weight:800;color:white;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .sa-brand-sub{font-size:10.5px;color:rgba(255,255,255,0.4);font-weight:500}
  .sa-close-btn{display:none;background:none;border:none;color:rgba(255,255,255,0.5);cursor:pointer;padding:4px;border-radius:6px;flex-shrink:0}
  .sa-close-btn:hover{color:white}

  .sa-profile{display:flex;align-items:center;gap:10px;margin:0 12px 16px;padding:12px 14px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:12px;flex-shrink:0}
  .sa-profile-av{width:36px;height:36px;border-radius:9px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:white;flex-shrink:0}
  .sa-profile-info{display:flex;flex-direction:column;gap:1px;overflow:hidden;min-width:0}
  .sa-profile-name{font-size:13px;font-weight:800;color:white;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .sa-profile-role{font-size:11px;color:rgba(255,255,255,0.4);font-weight:500}

  .sa-divider{height:1px;background:rgba(255,255,255,0.07);margin:0 12px 16px;flex-shrink:0}

  .sa-nav{display:flex;flex-direction:column;gap:2px;padding:0 10px;flex:1}
  .sa-nav-label{font-size:10px;font-weight:700;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.8px;padding:0 8px 8px}
  .sa-nav-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;text-decoration:none;color:rgba(255,255,255,0.55);font-size:13.5px;font-weight:600;transition:all 0.16s ease;position:relative}
  .sa-nav-item:hover{background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.9)}
  .sa-nav-item.active{background:rgba(255,255,255,0.11);color:white;font-weight:800}
  .sa-nav-icon{width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:rgba(255,255,255,0.06);flex-shrink:0;font-size:16px;transition:background 0.16s}
  .sa-nav-item:hover .sa-nav-icon{background:rgba(255,255,255,0.1)}
  .sa-nav-item.active .sa-nav-icon{background:rgba(255,255,255,0.15)}
  .sa-nav-label-text{flex:1}
  .sa-nav-bar{width:3px;height:16px;background:white;border-radius:99px;opacity:0.6}

  .sa-footer{padding:0 10px 20px;flex-shrink:0}
  .sa-logout{display:flex;align-items:center;gap:9px;padding:9px 12px;border-radius:10px;color:rgba(255,255,255,0.4);background:none;border:none;font-size:13px;font-weight:600;font-family:Tajawal,sans-serif;cursor:pointer;transition:all 0.16s;width:100%}
  .sa-logout:hover:not(:disabled){background:rgba(239,68,68,0.12);color:#fca5a5}
  .sa-logout:disabled{opacity:0.5;cursor:not-allowed}
  .sa-spin{width:14px;height:14px;border:2px solid rgba(255,255,255,0.2);border-top-color:rgba(255,255,255,0.6);border-radius:50%;animation:sp 0.7s linear infinite;flex-shrink:0}

  .sa-main{flex:1;min-width:0;overflow-x:hidden;padding:28px}

  .sa-mobile-bar{display:none;align-items:center;justify-content:space-between;padding:0 18px;height:54px;background:#111827;position:sticky;top:0;z-index:40}
  .sa-hamburger{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:white;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer}
  .sa-mobile-title{font-size:14px;font-weight:800;color:white}
  .sa-mobile-avatar{width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;color:white}

  .sa-backdrop{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:29;animation:fadeIn 0.2s ease}

  @media(max-width:768px){
    .sa-mobile-bar{display:flex}
    .sa-sidebar{position:fixed;right:0;top:0;bottom:0;transform:translateX(100%);transition:transform 0.28s cubic-bezier(0.4,0,0.2,1);height:100%}
    .sa-sidebar.open{transform:translateX(0);box-shadow:-8px 0 32px rgba(0,0,0,0.3)}
    .sa-close-btn{display:flex}
    .sa-body{flex-direction:column}
    .sa-main{min-height:calc(100vh - 54px);padding:16px}
  }
`;
