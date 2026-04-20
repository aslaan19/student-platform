// student/school-assigned/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface StudentData {
  profile: { full_name: string };
  school: { name: string } | null;
}

interface IntakeAttempt {
  score: number | null;
  total: number | null;
}

export default function StudentSchoolAssignedPage() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [attempt, setAttempt] = useState<IntakeAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    console.log("Starting fetches...");

    fetch("/api/student")
      .then((r) => {
        console.log("student status:", r.status);
        return r.json();
      })
      .then((d) => {
        console.log("student data:", d);
        setStudent(d);
      })
      .catch((e) => console.log("student error:", e));

    fetch("/api/student/intake-result")
      .then((r) => {
        console.log("intake-result status:", r.status);
        return r.json();
      })
      .then((d) => {
        console.log("intake-result data:", d);
        setAttempt(d.attempt ?? null);
      })
      .catch((e) => console.log("intake-result error:", e))
      .finally(() => {
        console.log("Setting loading false");
        setLoading(false);
        setTimeout(() => setVisible(true), 80);
      });
  }, []);

  function handleStart() {
    setStarting(true);
    router.push("/student/placement");
  }

  const pct =
    attempt?.score != null && attempt?.total
      ? Math.round((attempt.score / attempt.total) * 100)
      : null;

  if (loading)
    return (
      <div className="shell">
        <div className="spinner" />
        <style>{baseStyles}</style>
      </div>
    );

  return (
    <div className="shell">
      <div
        className="card"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        <div className="celebration">
          <div className="confetti-ring" />
          <div className="big-icon">🎉</div>
        </div>

        <div className="congrats-text">
          <div className="congrats-label">مبروك!</div>
          <h1 className="congrats-title">
            {student?.profile.full_name
              ? `أهلاً ${student.profile.full_name}،`
              : "أهلاً بك!"}
          </h1>
          <p className="congrats-sub">تم قبولك في المنصة وتعيينك في مدرسة!</p>
        </div>

        {student?.school && (
          <div className="school-card">
            <div className="school-icon">🏫</div>
            <div className="school-info">
              <div className="school-label-sm">مدرستك</div>
              <div className="school-name">{student.school.name}</div>
            </div>
          </div>
        )}

        {pct !== null && attempt && (
          <div className="score-section">
            <div className="score-label-top">نتيجة اختبار القبول</div>
            <div className="score-display">
              <span className="score-num">{attempt.score}</span>
              <span className="score-sep">/</span>
              <span className="score-den">{attempt.total}</span>
              <div className="score-pct-badge">{pct}%</div>
            </div>
            <div className="score-bar-wrap">
              <div
                className="score-bar"
                style={{
                  width: `${pct}%`,
                  background:
                    pct >= 70 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444",
                }}
              />
            </div>
          </div>
        )}

        <div className="next-step-box">
          <div className="next-step-icon">📝</div>
          <div className="next-step-body">
            <div className="next-step-title">
              الخطوة التالية: اختبار التصنيف
            </div>
            <div className="next-step-desc">
              ستجري الآن اختباراً قصيراً تعدّه مدرستك لتحديد الفصل المناسب لك.
              الاختبار يشمل أسئلة اختيار متعدد وصح أم خطأ وأسئلة مكتوبة.
            </div>
          </div>
        </div>

        <button className="start-btn" onClick={handleStart} disabled={starting}>
          {starting ? (
            <>
              <div className="btn-spin" />
              جارٍ التحميل...
            </>
          ) : (
            <>ابدأ اختبار التصنيف ←</>
          )}
        </button>

        <div className="footer-note">الاختبار إلزامي لتحديد فصلك الدراسي</div>
      </div>

      <style>{baseStyles}</style>
      <style>{pageStyles}</style>
    </div>
  );
}

const baseStyles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .shell { min-height: 100vh; background: #f7f8fa; font-family: Tajawal, sans-serif; direction: rtl; display: flex; align-items: center; justify-content: center; padding: 28px 16px; }
  .spinner { width: 28px; height: 28px; border: 3px solid #e5e7eb; border-top-color: #2563eb; border-radius: 50%; animation: sp 0.7s linear infinite; }
  @keyframes sp { to { transform: rotate(360deg); } }
  .card { background: white; border: 1px solid #e5e7eb; border-radius: 22px; padding: 36px 32px; width: 100%; max-width: 460px; display: flex; flex-direction: column; gap: 22px; box-shadow: 0 8px 32px rgba(0,0,0,0.07); }
`;

const pageStyles = `
  .celebration { position: relative; width: 90px; height: 90px; display: flex; align-items: center; justify-content: center; margin: 0 auto; }
  .confetti-ring { position: absolute; inset: 0; border-radius: 50%; border: 2px solid rgba(37,99,235,0.25); animation: ringPop 2.5s ease infinite; }
  @keyframes ringPop { 0%,100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.2); opacity: 1; } }
  .big-icon { font-size: 52px; line-height: 1; }
  .congrats-text { text-align: center; }
  .congrats-label { font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #2563eb; background: rgba(37,99,235,0.08); border-radius: 99px; padding: 4px 14px; width: fit-content; margin: 0 auto 10px; }
  .congrats-title { font-size: 24px; font-weight: 800; color: #111827; margin-bottom: 6px; }
  .congrats-sub { font-size: 14px; color: #6b7280; }
  .school-card { display: flex; align-items: center; gap: 14px; background: rgba(37,99,235,0.06); border: 1.5px solid rgba(37,99,235,0.2); border-radius: 14px; padding: 16px 20px; }
  .school-icon { font-size: 32px; }
  .school-info { display: flex; flex-direction: column; gap: 2px; }
  .school-label-sm { font-size: 10.5px; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px; }
  .school-name { font-size: 18px; font-weight: 800; color: #111827; }
  .score-section { display: flex; flex-direction: column; gap: 8px; }
  .score-label-top { font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; text-align: center; }
  .score-display { display: flex; align-items: baseline; gap: 4px; justify-content: center; }
  .score-num { font-size: 40px; font-weight: 800; color: #111827; letter-spacing: -2px; }
  .score-sep { font-size: 26px; color: #d1d5db; }
  .score-den { font-size: 26px; font-weight: 700; color: #9ca3af; }
  .score-pct-badge { font-size: 13px; font-weight: 800; padding: 4px 10px; background: rgba(37,99,235,0.1); color: #2563eb; border-radius: 99px; margin-right: 8px; align-self: center; }
  .score-bar-wrap { height: 6px; background: #e5e7eb; border-radius: 99px; overflow: hidden; }
  .score-bar { height: 100%; border-radius: 99px; transition: width 1s ease; }
  .next-step-box { display: flex; align-items: flex-start; gap: 14px; background: #f7f8fa; border: 1px solid #e5e7eb; border-radius: 14px; padding: 16px; }
  .next-step-icon { font-size: 28px; flex-shrink: 0; }
  .next-step-body { display: flex; flex-direction: column; gap: 4px; }
  .next-step-title { font-size: 14px; font-weight: 800; color: #111827; }
  .next-step-desc { font-size: 13px; color: #6b7280; line-height: 1.65; }
  .start-btn { display: flex; align-items: center; justify-content: center; gap: 9px; background: #2563eb; color: white; padding: 14px; border-radius: 12px; border: none; font-size: 16px; font-weight: 800; cursor: pointer; transition: all 0.2s; font-family: Tajawal, sans-serif; width: 100%; box-shadow: 0 4px 14px rgba(37,99,235,0.3); }
  .start-btn:hover:not(:disabled) { background: #1d4ed8; transform: translateY(-1px); }
  .start-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-spin { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: sp 0.7s linear infinite; }
  .footer-note { text-align: center; font-size: 12px; color: #9ca3af; }
`;
