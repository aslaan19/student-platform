// login/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password) {
      setError("من فضلك أدخل البريد الإلكتروني وكلمة المرور");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        { email: email.trim(), password },
      );
      if (authError || !data.user) {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        return;
      }
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();
      if (profileError || !profile) {
        setError("تعذر جلب بيانات الحساب");
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
      else setError("نوع الحساب غير معروف: " + profile.role);
    } catch {
      setError("تعذر الاتصال بالخادم، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="a-shell">
      <div className="a-card">
        <div className="a-brand">
          <div className="a-logo-mark">
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
          <h1 className="a-title">منصة الرواد</h1>
          <p className="a-sub">سجّل دخولك للوصول إلى لوحتك</p>
        </div>

        <div className="a-fields">
          <div className="a-field">
            <label className="a-label">البريد الإلكتروني</label>
            <input
              type="email"
              className="a-input"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              dir="ltr"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>
          <div className="a-field">
            <label className="a-label">كلمة المرور</label>
            <input
              type="password"
              className="a-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              dir="ltr"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          {error && (
            <div className="a-error">
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

          <button className="a-btn" onClick={handleLogin} disabled={loading}>
            {loading ? (
              <>
                <span className="a-spin" />
                جارٍ تسجيل الدخول...
              </>
            ) : (
              "دخول"
            )}
          </button>
        </div>

        <p className="a-footer">
          لا تملك حسابًا؟{" "}
          <Link href="/signup" className="a-link">
            إنشاء حساب طالب
          </Link>
        </p>
      </div>
      <style>{css}</style>
    </main>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}

  .a-shell{
    min-height:100vh;
    background:#0B0B0C;
    display:flex;align-items:center;justify-content:center;
    padding:24px 16px;
    font-family:'Cairo',sans-serif;
    direction:rtl;
    position:relative;
    overflow:hidden;
  }
  .a-shell::before{
    content:'';position:absolute;
    top:-200px;right:-200px;
    width:500px;height:500px;border-radius:50%;
    background:radial-gradient(circle,rgba(200,169,106,0.07) 0%,transparent 70%);
    pointer-events:none;
  }
  .a-shell::after{
    content:'';position:absolute;
    bottom:-200px;left:-200px;
    width:400px;height:400px;border-radius:50%;
    background:radial-gradient(circle,rgba(229,185,60,0.05) 0%,transparent 70%);
    pointer-events:none;
  }

  .a-card{
    background:rgba(255,255,255,0.03);
    border:1px solid rgba(200,169,106,0.18);
    border-radius:20px;
    padding:40px 36px;
    width:100%;max-width:400px;
    display:flex;flex-direction:column;gap:28px;
    position:relative;z-index:1;
    animation:fadeUp 0.4s ease both;
    backdrop-filter:blur(8px);
  }

  .a-brand{display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center}
  .a-logo-mark{
    width:52px;height:52px;border-radius:14px;
    background:#C8A96A;
    display:flex;align-items:center;justify-content:center;
    color:#0B0B0C;
    box-shadow:0 4px 20px rgba(200,169,106,0.3);
  }
  .a-title{font-size:22px;font-weight:900;color:#C8A96A;letter-spacing:-0.3px}
  .a-sub{font-size:13px;color:rgba(200,169,106,0.45);font-weight:500}

  .a-fields{display:flex;flex-direction:column;gap:14px}
  .a-field{display:flex;flex-direction:column;gap:6px}
  .a-label{font-size:12px;font-weight:700;color:rgba(200,169,106,0.6);text-transform:uppercase;letter-spacing:0.5px}
  .a-input{
    width:100%;padding:11px 14px;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(200,169,106,0.18);
    border-radius:10px;
    color:white;
    font-size:14px;font-family:'Cairo',sans-serif;
    outline:none;
    transition:border-color 0.18s,background 0.18s;
  }
  .a-input:focus{border-color:rgba(200,169,106,0.55);background:rgba(200,169,106,0.05)}
  .a-input::placeholder{color:rgba(255,255,255,0.18)}
  .a-input:disabled{opacity:0.5;cursor:not-allowed}

  .a-error{
    display:flex;align-items:center;gap:8px;
    background:rgba(139,26,26,0.15);border:1px solid rgba(139,26,26,0.3);
    color:#f87171;font-size:12.5px;padding:10px 12px;border-radius:9px;
  }

  .a-btn{
    display:flex;align-items:center;justify-content:center;gap:9px;
    width:100%;padding:13px;
    background:#C8A96A;color:#0B0B0C;
    border:none;border-radius:10px;
    font-size:15px;font-weight:800;
    cursor:pointer;transition:all 0.18s;
    font-family:'Cairo',sans-serif;
    letter-spacing:-0.2px;
    margin-top:2px;
  }
  .a-btn:hover:not(:disabled){background:#E5B93C;box-shadow:0 4px 20px rgba(200,169,106,0.3)}
  .a-btn:disabled{opacity:0.45;cursor:not-allowed}

  .a-spin{
    display:inline-block;width:14px;height:14px;
    border:2px solid rgba(11,11,12,0.3);border-top-color:#0B0B0C;
    border-radius:50%;animation:spin 0.7s linear infinite;
  }

  .a-footer{text-align:center;font-size:13px;color:rgba(200,169,106,0.4)}
  .a-link{color:#C8A96A;font-weight:700;text-decoration:none;transition:color 0.15s}
  .a-link:hover{color:#E5B93C}

  .a-divider{height:1px;background:rgba(200,169,106,0.1)}
`;
