// signup/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    setError("");

    if (!fullName.trim() || !email.trim() || !password) {
      setError("من فضلك أكمل جميع الحقول");
      return;
    }
    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setLoading(true);
    try {
      const r = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName.trim(), email: email.trim(), password }),
      });
      const d = await r.json();

      if (!r.ok || d.error) {
        setError(d.error ?? "حدث خطأ أثناء إنشاء الحساب");
        return;
      }

      // Redirect to login after success
      window.location.href = "/login";
    } catch {
      setError("تعذر الاتصال بالخادم، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">🎓</div>
          <h1 className="auth-title">إنشاء حساب طالب</h1>
          <p className="auth-sub">أنشئ حسابك للانضمام إلى المنصة</p>
        </div>

        <div className="auth-fields">
          <div className="field-group">
            <label className="field-label">الاسم الكامل</label>
            <input
              type="text"
              className="field-input"
              placeholder="مثال: أحمد محمد العمري"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
              dir="rtl"
            />
          </div>

          <div className="field-group">
            <label className="field-label">البريد الإلكتروني</label>
            <input
              type="email"
              className="field-input"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              dir="ltr"
            />
          </div>

          <div className="field-group">
            <label className="field-label">كلمة المرور</label>
            <input
              type="password"
              className="field-input"
              placeholder="6 أحرف أو أكثر"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              onKeyDown={(e) => e.key === "Enter" && handleSignup()}
              dir="ltr"
            />
          </div>

          {error && (
            <div className="auth-error">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="button"
            className="auth-btn"
            onClick={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <><span className="btn-spinner" /> جارٍ إنشاء الحساب...</>
            ) : "إنشاء حساب"}
          </button>
        </div>

        <p className="auth-footer">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="auth-link">تسجيل الدخول</Link>
        </p>
      </div>

      <style>{authStyles}</style>
    </main>
  );
}

const authStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .auth-shell {
    min-height: 100vh;
    background: #f7f8fa;
    display: flex; align-items: center; justify-content: center;
    padding: 24px 16px;
    font-family: 'Tajawal', sans-serif;
    direction: rtl;
  }

  .auth-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 20px;
    padding: 36px 32px;
    width: 100%; max-width: 420px;
    display: flex; flex-direction: column; gap: 24px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
  }

  .auth-brand { display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center; }
  .auth-logo { font-size: 40px; }
  .auth-title { font-size: 22px; font-weight: 800; color: #111827; }
  .auth-sub { font-size: 13px; color: #6b7280; }

  .auth-fields { display: flex; flex-direction: column; gap: 14px; }

  .field-group { display: flex; flex-direction: column; gap: 6px; }
  .field-label { font-size: 13px; font-weight: 600; color: #374151; }
  .field-input {
    width: 100%; padding: 10px 14px;
    background: #f7f8fa; border: 1.5px solid #e5e7eb;
    border-radius: 10px; color: #111827;
    font-size: 14px; font-family: 'Tajawal', sans-serif;
    outline: none; transition: border-color 0.15s, background 0.15s;
  }
  .field-input:focus { border-color: #4f8ef7; background: white; }
  .field-input:disabled { opacity: 0.6; cursor: not-allowed; }

  .auth-error {
    display: flex; align-items: center; gap: 8px;
    background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
    color: #dc2626; font-size: 13px; padding: 10px 12px; border-radius: 9px;
  }

  .auth-btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 12px;
    background: #111827; color: white;
    border: none; border-radius: 10px;
    font-size: 15px; font-weight: 700;
    cursor: pointer; transition: background 0.15s;
    font-family: 'Tajawal', sans-serif;
  }
  .auth-btn:hover:not(:disabled) { background: #1f2937; }
  .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-spinner {
    display: inline-block;
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .auth-footer { text-align: center; font-size: 13px; color: #6b7280; }
  .auth-link { color: #4f8ef7; font-weight: 700; text-decoration: none; }
  .auth-link:hover { text-decoration: underline; }
`;