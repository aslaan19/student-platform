"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/language-context";
import LangToggle from "@/lib/LangToggle";
import { t } from "@/lib/translations";

const ONBOARDING_ROUTES: Record<string, string> = {
  PENDING_INTAKE: "/student/intake",
  INTAKE_SUBMITTED: "/student/waiting",
  SCHOOL_ASSIGNED: "/student/school-assigned",
  SCHOOL_PLACEMENT_SUBMITTED: "/student/waiting-class",
  CLASS_ASSIGNED: "/student/welcome",
};

const ALLOWED_PAGES: Record<string, string[]> = {
  PENDING_INTAKE: ["/student/intake"],
  INTAKE_SUBMITTED: ["/student/waiting"],
  SCHOOL_ASSIGNED: ["/student/school-assigned", "/student/placement"],
  SCHOOL_PLACEMENT_SUBMITTED: ["/student/waiting-class"],
  CLASS_ASSIGNED: [
    "/student/welcome",
    "/student",
    "/student/classes",
    "/student/quizzes",
    "/student/announcements",
    "/student/roadmap",
  ],
};

const navItems = [
  {
    key: "dashboard" as const,
    href: "/student",
    exact: true,
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
    key: "myClass" as const,
    href: "/student/classes",
    exact: false,
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
    href: "/student/quizzes",
    exact: false,
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
  {
    key: "roadmap" as const,
    href: "/student/roadmap",
    exact: false,
    labelAr: "بنك الأسئلة",
    labelSq: "Banka e Pyetjeve",
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
        <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
      </svg>
    ),
  },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [name, setName] = useState("");
  const [initials, setInitials] = useState("ط");
  const [schoolName, setSchoolName] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const [checked, setChecked] = useState(false);
  const langInitialized = useRef(false); // ← track if lang was already set
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang } = useLang();
  const tr = t[lang];
  const isRtl = lang === "ar";

  useEffect(() => {
    fetch("/api/student")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          router.push("/login");
          return;
        }

        if (data?.profile?.full_name) {
          setName(data.profile.full_name);
          setInitials(
            data.profile.full_name
              .split(" ")
              .map((w: string) => w[0])
              .slice(0, 2)
              .join(""),
          );
        }
        if (data?.school?.name) setSchoolName(data.school.name);

        // ✅ Only set language ONCE on first load — never override user's choice after that
        if (data.school?.language && !langInitialized.current) {
          langInitialized.current = true;
          setLang(data.school.language as "ar" | "sq");
          if (data.school.language === "sq") setShowToggle(true);
        }
        // If already initialized, still show toggle for sq schools
        if (data.school?.language === "sq") setShowToggle(true);

        const status: string = data.onboarding_status;
        const allowed = ALLOWED_PAGES[status];
        if (!allowed) {
          setChecked(true);
          return;
        }

        if (status === "CLASS_ASSIGNED") {
          const onDashboard =
            pathname === "/student" || pathname.startsWith("/student/");
          if (!onDashboard || pathname === "/student/school-assigned")
            router.push("/student/welcome");
          else setChecked(true);
          return;
        }

        const isAllowed = allowed.some(
          (p) => p === pathname || pathname.startsWith(p + "/"),
        );
        if (!isAllowed) router.push(ONBOARDING_ROUTES[status] ?? "/student");
        else setChecked(true);
      })
      .catch(() => router.push("/login"));
  }, [pathname]);

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (!checked)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf7f4",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: "3px solid rgba(200,169,106,0.3)",
            borderTopColor: "#7A1E1E",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  return (
    <div className="sl-root" dir={isRtl ? "rtl" : "ltr"}>
      <header className="sl-mobile-bar">
        <button className="sl-hamburger" onClick={() => setSidebarOpen(true)}>
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
        <span className="sl-mobile-title">{schoolName || tr.platform}</span>
        <div className="sl-mobile-avatar">{initials}</div>
      </header>

      {sidebarOpen && (
        <div className="sl-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="sl-body">
        <aside className={`sl-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sl-brand">
            <div className="sl-brand-icon">
              <svg
                width="20"
                height="20"
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
            <div className="sl-brand-text">
              <span className="sl-brand-title">
                {schoolName || tr.platform}
              </span>
              <span className="sl-brand-sub">
                {lang === "ar" ? "بوابة الطالب" : "Porta e Nxënësit"}
              </span>
            </div>
            <button
              className="sl-close-btn"
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

          <div className="sl-profile">
            <div className="sl-profile-avatar">{initials}</div>
            <div className="sl-profile-info">
              <span className="sl-profile-name">{name}</span>
              <span className="sl-profile-role">
                {lang === "ar" ? "طالب" : "Nxënës"}
              </span>
            </div>
          </div>

          {showToggle && (
            <div style={{ padding: "0 12px 12px" }}>
              <LangToggle dark />
            </div>
          )}

          <div className="sl-divider" />

          <nav className="sl-nav">
            <span className="sl-nav-group-label">
              {lang === "ar" ? "القائمة الرئيسية" : "Menuja Kryesore"}
            </span>
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const label = item.labelAr
                ? lang === "ar"
                  ? item.labelAr
                  : item.labelSq!
                : (tr[item.key as keyof typeof tr] as string);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sl-nav-item ${isActive ? "active" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sl-nav-icon">{item.icon}</span>
                  <span className="sl-nav-label">{label}</span>
                  {isActive && <span className="sl-nav-active-bar" />}
                </Link>
              );
            })}
          </nav>

          <div className="sl-sidebar-footer">
            <div className="sl-divider" style={{ marginBottom: 12 }} />
            <button
              className="sl-logout"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? (
                <div className="sl-logout-spin" />
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

        <main className="sl-main">{children}</main>
      </div>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes sp{to{transform:rotate(360deg)}}

  :root{
    --red:#7A1E1E;
    --red-dark:#5c1616;
    --red-muted:rgba(122,30,30,0.1);
    --red-border:rgba(122,30,30,0.25);
    --gold:#C8A96A;
    --gold-muted:rgba(200,169,106,0.1);
    --gold-border:rgba(200,169,106,0.2);
    --black:#0B0B0C;
  }

  .sl-root{min-height:100vh;background:#faf7f4;font-family:Tajawal,sans-serif}
  .sl-body{display:flex;min-height:100vh}
  .sl-sidebar{width:256px;flex-shrink:0;background:var(--black);display:flex;flex-direction:column;min-height:100vh;position:sticky;top:0;height:100vh;overflow-y:auto;overflow-x:hidden;z-index:30;border-left:1px solid rgba(200,169,106,0.08)}
  .sl-brand{display:flex;align-items:center;gap:10px;padding:20px 18px 16px;flex-shrink:0}
  .sl-brand-icon{width:36px;height:36px;background:var(--red-muted);border:1px solid var(--red-border);border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--gold);flex-shrink:0}
  .sl-brand-text{flex:1;display:flex;flex-direction:column;min-width:0}
  .sl-brand-title{font-size:13px;font-weight:800;color:var(--gold);letter-spacing:-0.2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .sl-brand-sub{font-size:10.5px;color:rgba(200,169,106,0.5);font-weight:500}
  .sl-close-btn{display:none;background:none;border:none;color:rgba(200,169,106,0.4);cursor:pointer;padding:4px;border-radius:6px;transition:color 0.15s;flex-shrink:0}
  .sl-close-btn:hover{color:var(--gold)}
  .sl-profile{display:flex;align-items:center;gap:10px;margin:0 12px 16px;padding:12px 14px;background:var(--red-muted);border:1px solid var(--red-border);border-radius:12px;flex-shrink:0}
  .sl-profile-avatar{width:36px;height:36px;border-radius:9px;background:var(--red);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:var(--gold);flex-shrink:0;border:1px solid rgba(200,169,106,0.2)}
  .sl-profile-info{display:flex;flex-direction:column;gap:1px;overflow:hidden;min-width:0}
  .sl-profile-name{font-size:13px;font-weight:800;color:white;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .sl-profile-role{font-size:11px;color:rgba(200,169,106,0.5);font-weight:500}
  .sl-divider{height:1px;background:rgba(200,169,106,0.1);margin:0 12px 16px;flex-shrink:0}
  .sl-nav{display:flex;flex-direction:column;gap:2px;padding:0 10px;flex:1}
  .sl-nav-group-label{font-size:10px;font-weight:700;color:rgba(200,169,106,0.35);text-transform:uppercase;letter-spacing:0.8px;padding:0 8px 8px}
  .sl-nav-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;text-decoration:none;color:rgba(200,169,106,0.5);font-size:13.5px;font-weight:600;transition:all 0.16s ease;position:relative}
  .sl-nav-item:hover{background:var(--red-muted);color:var(--gold)}
  .sl-nav-item.active{background:var(--red-muted);color:var(--gold);font-weight:800;border:1px solid var(--red-border)}
  .sl-nav-icon{width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:rgba(200,169,106,0.05);flex-shrink:0;transition:background 0.16s}
  .sl-nav-item:hover .sl-nav-icon,.sl-nav-item.active .sl-nav-icon{background:var(--red-muted)}
  .sl-nav-label{flex:1}
  .sl-nav-active-bar{width:3px;height:16px;background:var(--gold);border-radius:99px;opacity:0.8}
  .sl-sidebar-footer{padding:0 10px 20px;flex-shrink:0}
  .sl-logout{display:flex;align-items:center;gap:9px;padding:9px 12px;border-radius:10px;color:rgba(200,169,106,0.35);background:none;border:none;font-size:13px;font-weight:600;font-family:Tajawal,sans-serif;cursor:pointer;transition:all 0.16s;width:100%}
  .sl-logout:hover:not(:disabled){background:var(--red-muted);color:var(--gold)}
  .sl-logout:disabled{opacity:0.5;cursor:not-allowed}
  .sl-logout-spin{width:14px;height:14px;border:2px solid rgba(200,169,106,0.2);border-top-color:var(--gold);border-radius:50%;animation:sp 0.7s linear infinite;flex-shrink:0}
  .sl-main{flex:1;min-width:0;overflow-x:hidden;padding:28px}
  .sl-mobile-bar{display:none;align-items:center;justify-content:space-between;padding:0 18px;height:54px;background:var(--black);position:sticky;top:0;z-index:40;border-bottom:1px solid rgba(200,169,106,0.12)}
  .sl-hamburger{background:var(--red-muted);border:1px solid var(--red-border);border-radius:8px;color:var(--gold);width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer}
  .sl-mobile-title{font-size:14px;font-weight:800;color:var(--gold)}
  .sl-mobile-avatar{width:32px;height:32px;border-radius:8px;background:var(--red);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;color:var(--gold)}
  .sl-backdrop{position:fixed;inset:0;background:rgba(11,11,12,0.6);z-index:29;animation:fadeIn 0.2s ease}
  @media(max-width:768px){
    .sl-mobile-bar{display:flex}
    .sl-sidebar{position:fixed;right:0;top:0;bottom:0;transform:translateX(100%);transition:transform 0.28s cubic-bezier(0.4,0,0.2,1);height:100%}
    .sl-sidebar.open{transform:translateX(0);box-shadow:-8px 0 40px rgba(11,11,12,0.5)}
    .sl-close-btn{display:flex}
    .sl-body{flex-direction:column}
    .sl-main{min-height:calc(100vh - 54px);padding:16px}
  }
`;
