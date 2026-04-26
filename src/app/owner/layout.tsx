"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

const navItems = [
  {
    href: "/owner",
    label: "لوحة التحكم",
    exact: true,
    icon: (
      <svg
        width="17"
        height="17"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.6}
      >
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/owner/schools",
    label: "المدارس",
    icon: (
      <svg
        width="17"
        height="17"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.6}
      >
        <path d="M3 21V9l9-6 9 6v12" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    href: "/owner/intake-assessment",
    label: "اختبار القبول",
    icon: (
      <svg
        width="17"
        height="17"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.6}
      >
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    href: "/owner/submissions",
    label: "الطلبات المقدمة",
    icon: (
      <svg
        width="17"
        height="17"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.6}
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
  const [ownerName, setOwnerName] = useState("المالك");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.full_name)
        setOwnerName(user.user_metadata.full_name);
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const isActive = (item: (typeof navItems)[0]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const currentLabel = navItems.find((n) => isActive(n))?.label ?? "الصفحة";

  return (
    <div className="ow-shell" dir="rtl">
      {sidebarOpen && (
        <div className="ow-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`ow-sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Logo area */}
        <div className="ow-logo">
          <div className="ow-logo-mark">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7l10 5 10-5-10-5z"
                fill="currentColor"
                opacity="0.9"
              />
              <path
                d="M2 17l10 5 10-5"
                stroke="currentColor"
                strokeWidth="1.6"
                fill="none"
                opacity="0.6"
              />
              <path
                d="M2 12l10 5 10-5"
                stroke="currentColor"
                strokeWidth="1.6"
                fill="none"
                opacity="0.8"
              />
            </svg>
          </div>
          <div className="ow-logo-text">
            <span className="ow-logo-name">منصة الرواد</span>
            <span className="ow-logo-sub">بوابة الإدارة العليا</span>
          </div>
          <button
            className="ow-close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            <svg
              width="13"
              height="13"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="ow-rule" />

        {/* Nav */}
        <nav className="ow-nav">
          <div className="ow-nav-label">القوائم الرئيسية</div>
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`ow-nav-item ${active ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="ow-nav-icon">{item.icon}</span>
                <span className="ow-nav-label-text">{item.label}</span>
                {active && <span className="ow-nav-pip" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="ow-sidebar-foot">
          <div className="ow-rule" style={{ marginBottom: 14 }} />
          <div className="ow-user">
            <div className="ow-user-av">{ownerName.charAt(0)}</div>
            <div className="ow-user-info">
              <span className="ow-user-name">{ownerName}</span>
              <span className="ow-user-role">مالك النظام</span>
            </div>
            <button
              className="ow-logout-btn"
              onClick={handleLogout}
              title="تسجيل الخروج"
            >
              <svg
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <div className="ow-main">
        {/* Top bar */}
        <header className="ow-topbar">
          <button className="ow-hamburger" onClick={() => setSidebarOpen(true)}>
            <svg
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="ow-breadcrumb">
            <span className="ow-breadcrumb-home">الرئيسية</span>
            <svg
              width="12"
              height="12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              style={{ opacity: 0.3 }}
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span className="ow-breadcrumb-current">{currentLabel}</span>
          </div>
          <div className="ow-topbar-right">
            <div className="ow-live-dot" />
            <span className="ow-live-text">نظام نشط</span>
          </div>
        </header>

        <main className="ow-content">{children}</main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes sp{to{transform:rotate(360deg)}}

        :root{
          --gold:#C8A96A;
          --gold2:#E5B93C;
          --gold-muted:rgba(200,169,106,0.12);
          --gold-border:rgba(200,169,106,0.22);
          --gold2-muted:rgba(229,185,60,0.1);
          --gold2-border:rgba(229,185,60,0.25);
          --black:#0B0B0C;
          --off-white:#F5F3EE;
          --text:#0B0B0C;
          --text2:#4a3f2f;
          --text3:#9a8a6a;
          --surface:#ffffff;
          --surface2:#faf8f4;
          --surface3:#f5f0e8;
          --border:#e8dfd0;
          --border2:#d8ccb8;
          --success:#1a6b3c;
          --success-bg:rgba(26,107,60,0.08);
          --success-border:rgba(26,107,60,0.2);
          --warning:#9a6200;
          --warning-bg:rgba(154,98,0,0.08);
          --warning-border:rgba(154,98,0,0.2);
          --danger:#8b1a1a;
          --danger-bg:rgba(139,26,26,0.08);
          --danger-border:rgba(139,26,26,0.2);
          --radius:10px;
          --shadow-sm:0 1px 3px rgba(11,11,12,0.06),0 1px 2px rgba(11,11,12,0.04);
          --shadow:0 4px 12px rgba(11,11,12,0.08),0 1px 4px rgba(11,11,12,0.04);
          --shadow-md:0 8px 24px rgba(11,11,12,0.10),0 2px 8px rgba(11,11,12,0.05);
          --sidebar-w:260px;
        }

        html,body{background:var(--off-white);color:var(--text);font-family:'Cairo',sans-serif;direction:rtl}

        .ow-shell{display:flex;min-height:100vh;background:var(--off-white)}

        /* Sidebar */
        .ow-sidebar{
          width:var(--sidebar-w);min-height:100vh;
          background:var(--black);
          display:flex;flex-direction:column;
          position:fixed;top:0;right:0;
          z-index:50;
          transition:transform 0.28s cubic-bezier(0.4,0,0.2,1);
        }

        .ow-logo{display:flex;align-items:center;gap:11px;padding:22px 18px 18px;flex-shrink:0}
        .ow-logo-mark{
          width:38px;height:38px;border-radius:10px;flex-shrink:0;
          background:var(--gold);
          display:flex;align-items:center;justify-content:center;
          color:var(--black);
        }
        .ow-logo-text{flex:1;display:flex;flex-direction:column;min-width:0}
        .ow-logo-name{font-size:13.5px;font-weight:900;color:var(--gold);letter-spacing:-0.2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .ow-logo-sub{font-size:10px;color:rgba(200,169,106,0.5);font-weight:600;margin-top:1px}
        .ow-close-btn{display:none;background:none;border:none;color:rgba(200,169,106,0.4);cursor:pointer;padding:4px;border-radius:6px;flex-shrink:0;transition:color 0.15s}
        .ow-close-btn:hover{color:var(--gold)}

        .ow-rule{height:1px;background:rgba(200,169,106,0.1);margin:0 16px 16px}

        .ow-nav{display:flex;flex-direction:column;gap:2px;padding:0 10px;flex:1}
        .ow-nav-label{font-size:9.5px;font-weight:700;color:rgba(200,169,106,0.3);text-transform:uppercase;letter-spacing:1px;padding:0 8px 10px}
        .ow-nav-item{
          display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:9px;
          text-decoration:none;color:rgba(200,169,106,0.45);
          font-size:13px;font-weight:600;transition:all 0.16s ease;position:relative;
        }
        .ow-nav-item:hover{background:rgba(200,169,106,0.07);color:rgba(200,169,106,0.8)}
        .ow-nav-item.active{background:rgba(200,169,106,0.1);color:var(--gold);font-weight:700;border:1px solid rgba(200,169,106,0.18)}
        .ow-nav-icon{width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:7px;background:rgba(200,169,106,0.05);flex-shrink:0;transition:background 0.16s}
        .ow-nav-item:hover .ow-nav-icon,.ow-nav-item.active .ow-nav-icon{background:rgba(200,169,106,0.1)}
        .ow-nav-label-text{flex:1}
        .ow-nav-pip{width:3px;height:14px;background:var(--gold);border-radius:99px;opacity:0.8}

        .ow-sidebar-foot{padding:0 10px 20px;flex-shrink:0}
        .ow-user{display:flex;align-items:center;gap:9px;padding:10px 12px;border-radius:10px;background:rgba(200,169,106,0.07);border:1px solid rgba(200,169,106,0.12)}
        .ow-user-av{width:32px;height:32px;border-radius:8px;flex-shrink:0;background:var(--gold);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:var(--black)}
        .ow-user-info{flex:1;display:flex;flex-direction:column;gap:1px;min-width:0}
        .ow-user-name{font-size:12.5px;font-weight:700;color:white;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .ow-user-role{font-size:10px;color:rgba(200,169,106,0.5);font-weight:600}
        .ow-logout-btn{background:none;border:none;color:rgba(200,169,106,0.3);cursor:pointer;padding:4px;border-radius:6px;display:flex;align-items:center;justify-content:center;transition:color 0.15s;flex-shrink:0}
        .ow-logout-btn:hover{color:rgba(200,169,106,0.8)}

        /* Main */
        .ow-main{flex:1;margin-right:var(--sidebar-w);display:flex;flex-direction:column;min-height:100vh}

        .ow-topbar{
          height:56px;
          background:var(--surface);
          border-bottom:1px solid var(--border);
          display:flex;align-items:center;padding:0 28px;gap:14px;
          position:sticky;top:0;z-index:40;
          box-shadow:var(--shadow-sm);
        }
        .ow-hamburger{display:none;background:none;border:none;color:var(--text2);cursor:pointer;padding:4px}
        .ow-breadcrumb{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--text)}
        .ow-breadcrumb-home{color:var(--text3);font-weight:500}
        .ow-breadcrumb-current{color:var(--text)}
        .ow-topbar-right{margin-right:auto;display:flex;align-items:center;gap:7px}
        .ow-live-dot{width:7px;height:7px;border-radius:50%;background:var(--success);box-shadow:0 0 6px rgba(26,107,60,0.5);animation:pulse 2.5s infinite}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .ow-live-text{font-size:11px;font-weight:700;color:var(--success)}

        .ow-content{padding:28px 30px;flex:1}

        .ow-overlay{position:fixed;inset:0;background:rgba(11,11,12,0.55);z-index:49;backdrop-filter:blur(2px);animation:fadeIn 0.2s ease}

        @media(max-width:768px){
          .ow-sidebar{transform:translateX(100%)}
          .ow-sidebar.open{transform:translateX(0);box-shadow:-8px 0 40px rgba(11,11,12,0.4)}
          .ow-close-btn{display:flex}
          .ow-main{margin-right:0}
          .ow-hamburger{display:flex}
          .ow-content{padding:18px 16px}
          .ow-topbar{padding:0 16px}
        }
      `}</style>
    </div>
  );
}
