"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface School {
  id: string;
  name: string;
  language: string;
  slug: string;
  description: string | null;
}

export default function SchoolLoginClient({ school }: { school: School }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isAlbanian = school.language === "sq";
  const dir = isAlbanian ? "ltr" : "rtl";

  const L = isAlbanian
    ? {
        title: "Hyrje",
        sub: `Hyni në ${school.name}`,
        emailLabel: "Email",
        passLabel: "Fjalëkalimi",
        btn: "Hyni",
        loading: "Duke hyrë...",
        error: "Email ose fjalëkalim i gabuar",
        backTo: "Kthehu te",
        signup: "Regjistrohu",
        haveAccount: "Nuk keni llogari?",
      }
    : {
        title: "تسجيل الدخول",
        sub: `سجّل دخولك في ${school.name}`,
        emailLabel: "البريد الإلكتروني",
        passLabel: "كلمة المرور",
        btn: "دخول",
        loading: "جارٍ تسجيل الدخول...",
        error: "البريد أو كلمة المرور غير صحيحة",
        backTo: "العودة إلى",
        signup: "إنشاء حساب",
        haveAccount: "لا تملك حسابًا؟",
      };

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password) {
      setError(L.error);
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        { email: email.trim(), password },
      );
      if (authError || !data.user) {
        setError(L.error);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();
      if (!profile) {
        setError(L.error);
        return;
      }

      const roleRoutes: Record<string, string> = {
        OWNER: "/owner",
        SCHOOL_ADMIN: "/school-admin",
        TEACHER: "/teacher",
        STUDENT: "/student",
      };
      const dest = roleRoutes[profile.role];
      if (dest) window.location.href = dest;
      else setError("نوع الحساب غير معروف");
    } catch {
      setError(L.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main
        dir={dir}
        style={{
          minHeight: "100vh",
          background: "#0B0B0C",
          fontFamily: "'Cairo', sans-serif",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glows */}
        <div
          style={{
            position: "absolute",
            top: -150,
            right: -150,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(200,169,106,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -200,
            left: -150,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(229,185,60,0.05) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Header */}
        <header
          style={{
            padding: "16px 28px",
            borderBottom: "1px solid rgba(200,169,106,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 5,
          }}
        >
          <Link
            href={`/schools/${school.slug}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "#C8A96A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5z"
                  fill="#0B0B0C"
                  opacity="0.9"
                />
                <path
                  d="M2 17l10 5 10-5"
                  stroke="#0B0B0C"
                  strokeWidth="1.8"
                  fill="none"
                  opacity="0.7"
                />
                <path
                  d="M2 12l10 5 10-5"
                  stroke="#0B0B0C"
                  strokeWidth="1.8"
                  fill="none"
                  opacity="0.85"
                />
              </svg>
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#C8A96A" }}>
              {school.name}
            </span>
          </Link>
          <span
            style={{
              fontSize: 11,
              color: "rgba(200,169,106,0.3)",
              fontWeight: 500,
            }}
          >
            {isAlbanian ? "🇦🇱 Shqip" : "🇸🇦 العربية"}
          </span>
        </header>

        {/* Card */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px 16px",
            position: "relative",
            zIndex: 5,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 400,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(200,169,106,0.16)",
              borderRadius: 20,
              padding: "40px 36px",
              display: "flex",
              flexDirection: "column",
              gap: 26,
            }}
          >
            {/* Brand */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                textAlign: "center",
              }}
            >
              <div style={{ position: "relative" }}>
                <svg
                  width="72"
                  height="72"
                  viewBox="0 0 72 72"
                  fill="none"
                  style={{ opacity: 0.65 }}
                >
                  <circle
                    cx="36"
                    cy="36"
                    r="33"
                    stroke="#C8A96A"
                    strokeWidth="0.5"
                    strokeDasharray="3 3"
                  />
                  <circle
                    cx="36"
                    cy="36"
                    r="25"
                    stroke="#C8A96A"
                    strokeWidth="0.5"
                  />
                  <circle
                    cx="36"
                    cy="36"
                    r="16"
                    stroke="#E5B93C"
                    strokeWidth="0.8"
                  />
                  <circle
                    cx="36"
                    cy="36"
                    r="8"
                    stroke="#C8A96A"
                    strokeWidth="1"
                  />
                  {[0, 60, 120, 180, 240, 300].map((a) => {
                    const r2 = (a * Math.PI) / 180;
                    return (
                      <line
                        key={a}
                        x1={36 + 10 * Math.cos(r2)}
                        y1={36 + 10 * Math.sin(r2)}
                        x2={36 + 24 * Math.cos(r2)}
                        y2={36 + 24 * Math.sin(r2)}
                        stroke="#C8A96A"
                        strokeWidth="0.5"
                        opacity="0.5"
                      />
                    );
                  })}
                </svg>
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%,-50%)",
                    width: 24,
                    height: 24,
                    background: "#C8A96A",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 900,
                    color: "#0B0B0C",
                  }}
                >
                  {school.name.charAt(0)}
                </div>
              </div>
              <h1
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: "#C8A96A",
                  letterSpacing: "-0.3px",
                }}
              >
                {L.title}
              </h1>
              <p
                style={{
                  fontSize: 12.5,
                  color: "rgba(200,169,106,0.4)",
                  fontWeight: 500,
                }}
              >
                {L.sub}
              </p>
            </div>

            {/* Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "rgba(200,169,106,0.55)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {L.emailLabel}
                </label>
                <input
                  type="email"
                  dir="ltr"
                  placeholder="example@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(200,169,106,0.16)",
                    borderRadius: 9,
                    color: "white",
                    fontSize: 14,
                    fontFamily: "'Cairo', sans-serif",
                    outline: "none",
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "rgba(200,169,106,0.55)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {L.passLabel}
                </label>
                <input
                  type="password"
                  dir="ltr"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(200,169,106,0.16)",
                    borderRadius: 9,
                    color: "white",
                    fontSize: 14,
                    fontFamily: "'Cairo', sans-serif",
                    outline: "none",
                  }}
                />
              </div>

              {error && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "rgba(139,26,26,0.15)",
                    border: "1px solid rgba(139,26,26,0.3)",
                    color: "#f87171",
                    fontSize: 12.5,
                    padding: "10px 12px",
                    borderRadius: 8,
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4m0 4h.01" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={loading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 9,
                  width: "100%",
                  padding: 13,
                  background: "#C8A96A",
                  color: "#0B0B0C",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: "pointer",
                  fontFamily: "'Cairo', sans-serif",
                  marginTop: 2,
                  opacity: loading ? 0.5 : 1,
                }}
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        display: "inline-block",
                        width: 14,
                        height: 14,
                        border: "2px solid rgba(11,11,12,0.3)",
                        borderTopColor: "#0B0B0C",
                        borderRadius: "50%",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />
                    {L.loading}
                  </>
                ) : (
                  L.btn
                )}
              </button>
            </div>

            <p
              style={{
                textAlign: "center",
                fontSize: 12.5,
                color: "rgba(200,169,106,0.35)",
              }}
            >
              {L.haveAccount}{" "}
              <Link
                href="/signup"
                style={{
                  color: "#C8A96A",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                {L.signup}
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer
          style={{
            padding: "14px 28px",
            borderTop: "1px solid rgba(200,169,106,0.08)",
            textAlign: "center",
            position: "relative",
            zIndex: 5,
          }}
        >
          <span style={{ fontSize: 11, color: "rgba(200,169,106,0.25)" }}>
            {isAlbanian ? "E mundësuar nga" : "مدعومة من"}{" "}
            <span style={{ color: "rgba(200,169,106,0.5)", fontWeight: 700 }}>
              بناء الأهلية
            </span>
          </span>
        </footer>
      </main>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{box-sizing:border-box;margin:0;padding:0} @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');`}</style>
    </>
  );
}
