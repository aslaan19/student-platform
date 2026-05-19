"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

// ─── TYPES ───────────────────────────────────────────────────────────────────

type InviteState =
  | { status: "loading" }
  | { status: "invalid"; reason: string }
  | { status: "valid"; school_name: string; type: string }
  | { status: "success"; school_name: string };

// ─── ERROR MESSAGES ───────────────────────────────────────────────────────────

const ERROR_MESSAGES: Record<
  string,
  { title: string; sub: string; icon: string }
> = {
  not_found: {
    icon: "🔗",
    title: "رابط الدعوة غير صالح",
    sub: "تأكد من الرابط أو تواصل مع مدير المدرسة للحصول على رابط جديد.",
  },
  disabled: {
    icon: "🚫",
    title: "تم تعطيل هذه الدعوة",
    sub: "قام مدير المدرسة بتعطيل هذا الرابط. تواصل معه للحصول على دعوة جديدة.",
  },
  expired: {
    icon: "⏰",
    title: "انتهت صلاحية الدعوة",
    sub: "انتهت مدة هذا الرابط. تواصل مع مدير المدرسة للحصول على رابط جديد.",
  },
  used: {
    icon: "✅",
    title: "تم استخدام هذه الدعوة مسبقاً",
    sub: "هذا الرابط مخصص لشخص واحد فقط وقد تم استخدامه. تواصل مع مدير المدرسة.",
  },
};

// ─── MANDALA ─────────────────────────────────────────────────────────────────

function MiniMandala() {
  return (
    <svg
      width="320"
      height="320"
      viewBox="0 0 320 320"
      fill="none"
      style={{ opacity: 0.12 }}
    >
      {[140, 120, 100, 82, 66, 52, 38, 26, 16].map((r, i) => (
        <circle
          key={i}
          cx="160"
          cy="160"
          r={r}
          stroke="#C8A96A"
          strokeWidth={i === 0 ? 0.7 : 0.4}
          opacity={0.08 + i * 0.07}
          strokeDasharray={i % 3 === 1 ? "3 5" : i % 3 === 2 ? "1 4" : "none"}
        />
      ))}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * 45 * Math.PI) / 180;
        return (
          <line
            key={i}
            x1="160"
            y1="160"
            x2={Math.round(160 + 140 * Math.sin(a))}
            y2={Math.round(160 - 140 * Math.cos(a))}
            stroke="#C8A96A"
            strokeWidth="0.5"
            opacity="0.12"
          />
        );
      })}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * 45 * Math.PI) / 180;
        const r = 100;
        return (
          <circle
            key={i}
            cx={Math.round(160 + r * Math.sin(a))}
            cy={Math.round(160 - r * Math.cos(a))}
            r="28"
            stroke="#C8A96A"
            strokeWidth="0.4"
            opacity="0.1"
          />
        );
      })}
      <circle
        cx="160"
        cy="160"
        r="8"
        fill="none"
        stroke="#E5B93C"
        strokeWidth="0.6"
        opacity="0.3"
      />
      <circle cx="160" cy="160" r="3.5" fill="#E5B93C" opacity="0.5" />
    </svg>
  );
}

// ─── FIELD ───────────────────────────────────────────────────────────────────

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div className="inv-field">
      <label className="inv-label">{label}</label>
      <div className="inv-input-wrap">
        <input
          type={isPassword && show ? "text" : type}
          className={`inv-input ${error ? "error" : ""}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          dir="auto"
          autoComplete={
            type === "email"
              ? "email"
              : type === "password"
                ? "new-password"
                : "name"
          }
        />
        {isPassword && (
          <button
            type="button"
            className="inv-eye-btn"
            onClick={() => setShow((v) => !v)}
            tabIndex={-1}
          >
            {show ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && <span className="inv-field-error">{error}</span>}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [state, setState] = useState<InviteState>({ status: "loading" });
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Validate token on mount
  useEffect(() => {
    fetch(`/api/invite/${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.valid) {
          setState({
            status: "valid",
            school_name: d.school_name,
            type: d.type,
          });
        } else {
          setState({ status: "invalid", reason: d.reason });
        }
      })
      .catch(() => setState({ status: "invalid", reason: "not_found" }));
  }, [token]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.full_name.trim()) errs.full_name = "الاسم الكامل مطلوب";
    else if (form.full_name.trim().length < 3)
      errs.full_name = "الاسم يجب أن يكون 3 أحرف على الأقل";
    if (!form.email.trim()) errs.email = "البريد الإلكتروني مطلوب";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "بريد إلكتروني غير صالح";
    if (!form.password) errs.password = "كلمة المرور مطلوبة";
    else if (form.password.length < 8)
      errs.password = "يجب أن تكون 8 أحرف على الأقل";
    if (form.confirm !== form.password)
      errs.confirm = "كلمتا المرور غير متطابقتين";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError(null);

    const res = await fetch(`/api/invite/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      }),
    });

    const d = await res.json();
    if (d.success) {
      const name = state.status === "valid" ? state.school_name : "";
      setState({ status: "success", school_name: name });
    } else {
      setSubmitError(d.error ?? "حدث خطأ. حاول مجدداً.");
    }
    setSubmitting(false);
  };

  // ── LOADING ──
  if (state.status === "loading") {
    return (
      <div className="inv-shell">
        <div className="inv-loading-screen">
          <div className="inv-big-spin" />
          <span>جارٍ التحقق من الدعوة...</span>
        </div>
        <style>{css}</style>
      </div>
    );
  }

  // ── INVALID ──
  if (state.status === "invalid") {
    const msg = ERROR_MESSAGES[state.reason] ?? ERROR_MESSAGES.not_found;
    return (
      <div className="inv-shell">
        <div className="inv-bg-mandala">
          <MiniMandala />
        </div>
        <nav className="inv-nav">
          <Image
            src="/ahlia.png"
            alt="بناء الأهلية"
            width={120}
            height={40}
            style={{
              objectFit: "contain",
              height: 32,
              width: "auto",
              opacity: 0.85,
            }}
            priority
          />
        </nav>
        <div className="inv-center">
          <div className="inv-error-card">
            <div className="inv-error-icon">{msg.icon}</div>
            <h1 className="inv-error-title">{msg.title}</h1>
            <p className="inv-error-sub">{msg.sub}</p>
            <Link href="/login" className="inv-back-btn">
              العودة لتسجيل الدخول
            </Link>
          </div>
        </div>
        <style>{css}</style>
      </div>
    );
  }

  // ── SUCCESS ──
  if (state.status === "success") {
    return (
      <div className="inv-shell">
        <div className="inv-bg-mandala">
          <MiniMandala />
        </div>
        <nav className="inv-nav">
          <Image
            src="/ahlia.png"
            alt="بناء الأهلية"
            width={120}
            height={40}
            style={{
              objectFit: "contain",
              height: 32,
              width: "auto",
              opacity: 0.85,
            }}
            priority
          />
        </nav>
        <div className="inv-center">
          <div className="inv-success-card">
            <div className="inv-success-ring">
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                <circle
                  cx="30"
                  cy="30"
                  r="28"
                  stroke="#C8A96A"
                  strokeWidth="1.5"
                  opacity="0.3"
                />
                <circle
                  cx="30"
                  cy="30"
                  r="22"
                  stroke="#C8A96A"
                  strokeWidth="1"
                  opacity="0.2"
                />
                <circle
                  cx="30"
                  cy="30"
                  r="28"
                  stroke="#2D8A4A"
                  strokeWidth="2"
                  strokeDasharray="176"
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  style={{
                    transform: "rotate(-90deg)",
                    transformOrigin: "30px 30px",
                    transition: "stroke-dashoffset 1s ease",
                  }}
                />
              </svg>
              <div className="inv-success-check">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
            <h1 className="inv-success-title">تم إنشاء حسابك بنجاح! 🎉</h1>
            <p className="inv-success-sub">
              مرحباً بك في منصة <strong>{state.school_name}</strong>.<br />
              يمكنك الآن تسجيل الدخول باستخدام بريدك الإلكتروني وكلمة المرور.
            </p>
            <Link href="/login" className="inv-login-btn">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
              </svg>
              تسجيل الدخول الآن
            </Link>
          </div>
        </div>
        <style>{css}</style>
      </div>
    );
  }

  // ── VALID — SIGNUP FORM ──
  return (
    <div className="inv-shell">
      <div className="inv-bg-mandala">
        <MiniMandala />
      </div>

      <nav className="inv-nav">
        <Image
          src="/ahlia.png"
          alt="بناء الأهلية"
          width={120}
          height={40}
          style={{
            objectFit: "contain",
            height: 32,
            width: "auto",
            opacity: 0.85,
          }}
          priority
        />
        <Link href="/login" className="inv-nav-login">
          لدي حساب بالفعل
        </Link>
      </nav>

      <div className="inv-center" dir="rtl">
        <div className="inv-form-card">
          {/* Header */}
          <div className="inv-form-header">
            <div className="inv-school-badge">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <p className="inv-form-school">{state.school_name}</p>
              <h1 className="inv-form-title">إنشاء حساب معلم</h1>
            </div>
          </div>

          {/* Invite info strip */}
          <div className="inv-form-strip">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.52 9.11 19.79 19.79 0 01.46 2.18 2 2 0 012.46 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.54 6.54l1.27-.65a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
            </svg>
            لقد تلقيت دعوة للانضمام كمعلم في هذه المدرسة. أكمل بياناتك أدناه.
          </div>

          {/* Form fields */}
          <div className="inv-form-fields">
            <Field
              label="الاسم الكامل"
              type="text"
              value={form.full_name}
              onChange={(v) => setForm((f) => ({ ...f, full_name: v }))}
              placeholder="مثال: محمد أحمد العلي"
              error={errors.full_name}
            />

            <Field
              label="البريد الإلكتروني"
              type="email"
              value={form.email}
              onChange={(v) => setForm((f) => ({ ...f, email: v }))}
              placeholder="teacher@school.com"
              error={errors.email}
            />

            <Field
              label="كلمة المرور"
              type="password"
              value={form.password}
              onChange={(v) => setForm((f) => ({ ...f, password: v }))}
              placeholder="8 أحرف على الأقل"
              error={errors.password}
            />

            <Field
              label="تأكيد كلمة المرور"
              type="password"
              value={form.confirm}
              onChange={(v) => setForm((f) => ({ ...f, confirm: v }))}
              placeholder="أعد كتابة كلمة المرور"
              error={errors.confirm}
            />
          </div>

          {/* Submit error */}
          {submitError && (
            <div className="inv-submit-error">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {submitError}
            </div>
          )}

          {/* Submit */}
          <button
            className="inv-submit-btn"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <div className="inv-mini-spin white" />
                جارٍ إنشاء الحساب...
              </>
            ) : (
              <>
                إنشاء الحساب والانضمام
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
              </>
            )}
          </button>

          <p className="inv-form-note">
            بإنشاء الحساب، يمكنك بعد ذلك تسجيل الدخول من خلال صفحة{" "}
            <Link href="/login" className="inv-note-link">
              تسجيل الدخول
            </Link>{" "}
            المعتادة.
          </p>
        </div>
      </div>

      <style>{css}</style>
    </div>
  );
}

// ─── CSS ─────────────────────────────────────────────────────────────────────

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes float-mandala{0%,100%{transform:translate(-50%,-50%) rotate(0deg)}50%{transform:translate(-50%,-50%) rotate(0.5deg)}}
@keyframes success-in{from{opacity:0;transform:scale(0.9) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes check-draw{from{stroke-dashoffset:30}to{stroke-dashoffset:0}}

:root{
  --gold:#C8A96A;--gold2:#E5B93C;--gold-l:rgba(200,169,106,0.08);--gold-b:rgba(200,169,106,0.18);
  --black:#0B0B0C;--text:#1E1C18;--text2:#3A3020;--text3:#8A7860;
  --surface:#FFFFFF;--border:#E4DDD0;--bg:#F5F3EE;
  --red:#7A1E1E;--red-l:rgba(122,30,30,0.07);--red-b:rgba(122,30,30,0.2);
  --green:#2D8A4A;--green-l:rgba(45,138,74,0.08);
  --font:'Cairo',sans-serif;
}

.inv-shell{min-height:100vh;background:var(--bg);font-family:var(--font);display:flex;flex-direction:column;position:relative;overflow:hidden}

/* BG mandala */
.inv-bg-mandala{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;animation:float-mandala 14s ease-in-out infinite;z-index:0}

/* Nav */
.inv-nav{position:sticky;top:0;z-index:20;height:60px;padding:0 24px;display:flex;align-items:center;justify-content:space-between;background:rgba(245,243,238,0.9);backdrop-filter:blur(16px);border-bottom:1px solid rgba(200,169,106,0.12)}
.inv-nav-login{font-size:13px;font-weight:700;color:var(--text3);text-decoration:none;border:1px solid var(--border);padding:7px 16px;border-radius:9px;transition:all 0.15s}
.inv-nav-login:hover{border-color:var(--gold-b);color:var(--text2)}

/* Center */
.inv-center{flex:1;display:flex;align-items:center;justify-content:center;padding:32px 16px;position:relative;z-index:1}

/* Loading screen */
.inv-loading-screen{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;color:var(--text3);font-size:14px;font-weight:600}
.inv-big-spin{width:40px;height:40px;border:3px solid var(--gold-b);border-top-color:var(--gold);border-radius:50%;animation:spin 0.8s linear infinite}

/* Error card */
.inv-error-card{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:48px 40px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:16px;max-width:420px;width:100%;box-shadow:0 4px 24px rgba(26,26,31,0.06);animation:fadeUp 0.4s ease}
.inv-error-icon{font-size:48px;line-height:1}
.inv-error-title{font-size:20px;font-weight:900;color:var(--black);letter-spacing:-0.3px}
.inv-error-sub{font-size:14px;color:var(--text3);line-height:1.7;max-width:320px}
.inv-back-btn{display:inline-flex;align-items:center;gap:8px;background:var(--black);color:var(--gold);padding:11px 24px;border-radius:10px;font-size:13.5px;font-weight:700;text-decoration:none;margin-top:8px;transition:all 0.15s}
.inv-back-btn:hover{background:#1a1a1f}

/* Success card */
.inv-success-card{background:var(--surface);border:1px solid rgba(45,138,74,0.2);border-radius:20px;padding:48px 40px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:16px;max-width:420px;width:100%;box-shadow:0 4px 24px rgba(45,138,74,0.08);animation:success-in 0.5s cubic-bezier(0.22,1,0.36,1)}
.inv-success-ring{position:relative;width:72px;height:72px;display:flex;align-items:center;justify-content:center;margin-bottom:4px}
.inv-success-check{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--green)}
.inv-success-title{font-size:21px;font-weight:900;color:var(--black);letter-spacing:-0.3px}
.inv-success-sub{font-size:14px;color:var(--text3);line-height:1.75}
.inv-success-sub strong{color:var(--black);font-weight:800}
.inv-login-btn{display:inline-flex;align-items:center;gap:9px;background:linear-gradient(135deg,var(--gold),var(--gold2));color:var(--black);padding:13px 28px;border-radius:12px;font-size:14px;font-weight:900;text-decoration:none;margin-top:4px;transition:all 0.18s;box-shadow:0 4px 16px rgba(200,169,106,0.3)}
.inv-login-btn:hover{transform:translateY(-1px);box-shadow:0 6px 24px rgba(200,169,106,0.45)}

/* Form card */
.inv-form-card{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:36px;width:100%;max-width:460px;display:flex;flex-direction:column;gap:20px;box-shadow:0 8px 40px rgba(26,26,31,0.08);animation:fadeUp 0.4s ease;position:relative;overflow:hidden}
.inv-form-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--gold),var(--gold2))}

/* Form header */
.inv-form-header{display:flex;align-items:center;gap:14px}
.inv-school-badge{width:48px;height:48px;border-radius:14px;background:var(--black);display:flex;align-items:center;justify-content:center;color:var(--gold);flex-shrink:0}
.inv-form-school{font-size:12px;font-weight:600;color:var(--text3);margin-bottom:2px}
.inv-form-title{font-size:20px;font-weight:900;color:var(--black);letter-spacing:-0.3px}

/* Strip */
.inv-form-strip{display:flex;align-items:flex-start;gap:9px;background:var(--gold-l);border:1px solid var(--gold-b);border-radius:10px;padding:12px 14px;font-size:12.5px;color:var(--text2);line-height:1.65}

/* Fields */
.inv-form-fields{display:flex;flex-direction:column;gap:14px}
.inv-field{display:flex;flex-direction:column;gap:5px}
.inv-label{font-size:12.5px;font-weight:700;color:var(--text2)}
.inv-input-wrap{position:relative}
.inv-input{width:100%;border:1.5px solid var(--border);border-radius:10px;padding:11px 14px;font-size:14px;font-family:var(--font);color:var(--text);background:#FAFAF7;outline:none;transition:border-color 0.15s,background 0.15s}
.inv-input:focus{border-color:var(--gold-b);background:var(--surface);box-shadow:0 0 0 3px rgba(200,169,106,0.08)}
.inv-input.error{border-color:var(--red-b);background:var(--red-l)}
.inv-input::placeholder{color:var(--text3)}
.inv-eye-btn{position:absolute;inset-inline-end:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text3);display:flex;align-items:center;padding:2px;transition:color 0.15s}
.inv-eye-btn:hover{color:var(--text2)}
.inv-field-error{font-size:11.5px;color:var(--red);font-weight:600}

/* Submit error */
.inv-submit-error{display:flex;align-items:center;gap:8px;background:var(--red-l);border:1px solid var(--red-b);border-radius:9px;padding:11px 14px;font-size:13px;color:var(--red);font-weight:600}

/* Submit btn */
.inv-submit-btn{display:flex;align-items:center;justify-content:center;gap:9px;background:linear-gradient(135deg,var(--gold),var(--gold2));color:var(--black);border:none;padding:14px;border-radius:12px;font-size:14.5px;font-weight:900;font-family:var(--font);cursor:pointer;transition:all 0.18s;box-shadow:0 4px 16px rgba(200,169,106,0.25)}
.inv-submit-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 24px rgba(200,169,106,0.4)}
.inv-submit-btn:disabled{opacity:0.55;cursor:not-allowed}

/* Note */
.inv-form-note{font-size:12px;color:var(--text3);text-align:center;line-height:1.6}
.inv-note-link{color:var(--gold);font-weight:700;text-decoration:none}
.inv-note-link:hover{text-decoration:underline}

/* Mini spinner */
.inv-mini-spin{width:13px;height:13px;border:2px solid rgba(0,0,0,0.15);border-top-color:currentColor;border-radius:50%;animation:spin 0.6s linear infinite;display:inline-block;flex-shrink:0}
.inv-mini-spin.white{border-color:rgba(0,0,0,0.15);border-top-color:var(--black)}

@media(max-width:500px){
  .inv-form-card{padding:24px 18px;border-radius:16px}
  .inv-error-card,.inv-success-card{padding:36px 24px}
}
`;
