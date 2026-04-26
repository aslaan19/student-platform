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
      key: "dashboard" as const,
      href: "/school-admin",
      label: lang === "ar" ? "الرئيسية" : "Kryesore",
      icon: "🏠",
    },
    {
      key: "students" as const,
      href: "/school-admin/students",
      label: tr.students,
      icon: "🎓",
    },
    {
      key: "teachers" as const,
      href: "/school-admin/teachers",
      label: tr.teachers,
      icon: "👨‍🏫",
    },
    {
      key: "classes" as const,
      href: "/school-admin/classes",
      label: tr.classes,
      icon: "📚",
    },
    {
      key: "placementAssessment" as const,
      href: "/school-admin/placement-assessment",
      label: tr.placementAssessment,
      icon: "📋",
    },
    {
      key: "submissions" as const,
      href: "/school-admin/submissions",
      label: tr.submissions,
      icon: "📝",
    },
  ];

  useEffect(() => {
    fetch("/api/school-admin/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d?.school) {
          setSchoolName(d.school.name);
          // Auto-set language from school
          if (d.school.language) {
            setLang(d.school.language as "ar" | "sq");
            if (d.school.language === "sq") setShowToggle(true);
          }
        }
      });

    fetch("/api/school-admin/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d?.full_name) {
          setName(d.full_name);
          setInitials(
            d.full_name
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
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f4f5f7",
        fontFamily: "Tajawal, sans-serif",
        direction: isRtl ? "rtl" : "ltr",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: 256,
          flexShrink: 0,
          background: "#111827",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
          zIndex: 30,
        }}
      >
        {/* Brand */}
        <div
          style={{
            padding: "20px 18px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            🏫
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "white" }}>
              {schoolName || tr.platform}
            </div>
            <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.4)" }}>
              {lang === "ar" ? "لوحة المدير" : "Paneli i Drejtorit"}
            </div>
          </div>
        </div>

        {/* Profile */}
        <div
          style={{
            margin: "0 12px 16px",
            padding: "12px 14px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 900,
              color: "white",
            }}
          >
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "white" }}>
              {name}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
              {lang === "ar" ? "مدير المدرسة" : "Drejtori i Shkollës"}
            </div>
          </div>
        </div>

        {showToggle && (
          <div style={{ padding: "0 12px 12px" }}>
            <LangToggle />
          </div>
        )}

        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.07)",
            margin: "0 12px 16px",
          }}
        />

        {/* Nav */}
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            padding: "0 10px",
            flex: 1,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "rgba(255,255,255,0.3)",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              padding: "0 8px 8px",
            }}
          >
            {lang === "ar" ? "القائمة الرئيسية" : "Menuja Kryesore"}
          </div>
          {navItems.map((item) => {
            const isActive =
              item.href === "/school-admin"
                ? pathname === "/school-admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 10,
                  textDecoration: "none",
                  color: isActive ? "white" : "rgba(255,255,255,0.55)",
                  fontSize: 13.5,
                  fontWeight: isActive ? 800 : 600,
                  background: isActive
                    ? "rgba(255,255,255,0.11)"
                    : "transparent",
                  transition: "all 0.16s",
                }}
              >
                <span
                  style={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 8,
                    background: isActive
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(255,255,255,0.06)",
                    fontSize: 16,
                  }}
                >
                  {item.icon}
                </span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {isActive && (
                  <span
                    style={{
                      width: 3,
                      height: 16,
                      background: "white",
                      borderRadius: 99,
                      opacity: 0.6,
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: "0 10px 20px" }}>
          <div
            style={{
              height: 1,
              background: "rgba(255,255,255,0.07)",
              margin: "0 2px 12px",
            }}
          />
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "9px 12px",
              borderRadius: 10,
              color: "rgba(255,255,255,0.4)",
              background: "none",
              border: "none",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "Tajawal, sans-serif",
              cursor: "pointer",
              width: "100%",
            }}
          >
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
            {loggingOut ? "..." : tr.logout}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0, overflowX: "hidden", padding: 28 }}>
        {children}
      </main>
    </div>
  );
}
