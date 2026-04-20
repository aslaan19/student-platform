// student/page.tsx  (or student/welcome/page.tsx for CLASS_ASSIGNED state)
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface StudentData {
  profile: { full_name: string };
  school: { name: string } | null;
  class: {
    id: string;
    name: string;
    teacher: { profile: { full_name: string } } | null;
    students: { id: string }[];
  } | null;
  onboarding_status: string;
}

interface PlacementAttempt {
  score: number | null;
  total: number | null;
}

export default function StudentWelcomePage() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [attempt, setAttempt] = useState<PlacementAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/student").then((r) => r.json()),
      fetch("/api/student/placement-result").then((r) => r.json()),
    ]).then(([studentData, attemptData]) => {
      setStudent(studentData);
      setAttempt(attemptData.attempt ?? null);
      setLoading(false);
      setTimeout(() => setVisible(true), 80);
    });
  }, []);

  const pct = attempt?.score != null && attempt?.total
    ? Math.round((attempt.score / attempt.total) * 100)
    : null;

  if (loading) return (
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
          transition: "opacity 0.55s ease, transform 0.55s ease",
        }}
      >
        {/* Header celebration */}
        <div className="top-banner">
          <div className="stars">⭐ ⭐ ⭐</div>
          <div className="banner-title">تم تعيينك في فصلك!</div>
          <div className="banner-sub">أهلاً وسهلاً، {student?.profile.full_name}</div>
        </div>

        {/* Class card - main highlight */}
        <div className="class-highlight">
          <div className="class-big-icon">📚</div>
          <div className="class-big-label">فصلك الدراسي</div>
          <div className="class-big-name">{student?.class?.name ?? "—"}</div>
          {student?.school && (
            <div className="class-school">{student.school.name}</div>
          )}
        </div>

        {/* Teacher */}
        {student?.class?.teacher && (
          <div className="info-row">
            <div className="info-icon">👨‍🏫</div>
            <div className="info-body">
              <div className="info-label">معلمك</div>
              <div className="info-value">{student.class.teacher.profile.full_name}</div>
            </div>
          </div>
        )}

        {/* Classmates count */}
        {student?.class && (
          <div className="info-row">
            <div className="info-icon">👥</div>
            <div className="info-body">
              <div className="info-label">زملاؤك في الفصل</div>
              <div className="info-value">{student.class.students.length} طالب</div>
            </div>
          </div>
        )}

        {/* Placement score */}
        {pct !== null && attempt && (
          <div className="score-section">
            <div className="score-header">
              <span className="score-title">نتيجة اختبار التصنيف</span>
              <span
                className="score-pct-badge"
                style={{ background: pct >= 70 ? "rgba(16,185,129,0.1)" : pct >= 50 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)", color: pct >= 70 ? "#10b981" : pct >= 50 ? "#b45309" : "#dc2626" }}
              >
                {pct}%
              </span>
            </div>
            <div className="score-nums">
              <span className="score-num">{attempt.score}</span>
              <span className="score-sep">/</span>
              <span className="score-den">{attempt.total}</span>
            </div>
            <div className="score-bar-wrap">
              <div
                className="score-bar"
                style={{
                  width: `${pct}%`,
                  background: pct >= 70 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444",
                }}
              />
            </div>
          </div>
        )}

        {/* CTA */}
        <button className="go-btn" onClick={() => router.push("/student")}>
          انتقل إلى الفصل الآن ←
        </button>

        <div className="footer-note">
          يمكنك الآن رؤية إعلانات فصلك وأداء الاختبارات
        </div>
      </div>

      <style>{baseStyles}</style>
      <style>{`
        .top-banner {
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
          border-radius: 16px; padding: 22px 20px;
          text-align: center; display: flex; flex-direction: column; gap: 6px;
        }
        .stars { font-size: 20px; letter-spacing: 4px; }
        .banner-title { font-size: 20px; font-weight: 800; color: white; }
        .banner-sub { font-size: 13.5px; color: rgba(255,255,255,0.8); }

        .class-highlight {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          text-align: center; padding: 20px;
          background: #f7f8fa; border-radius: 16px; border: 1px solid #e5e7eb;
        }
        .class-big-icon { font-size: 40px; }
        .class-big-label { font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.8px; }
        .class-big-name { font-size: 28px; font-weight: 800; color: #111827; letter-spacing: -0.5px; }
        .class-school { font-size: 13px; color: #2563eb; font-weight: 600; }

        .info-row {
          display: flex; align-items: center; gap: 14px;
          background: #f7f8fa; border-radius: 12px; padding: 14px 16px;
          border: 1px solid #e5e7eb;
        }
        .info-icon { font-size: 26px; }
        .info-label { font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.4px; }
        .info-value { font-size: 15px; font-weight: 700; color: #111827; margin-top: 2px; }

        .score-section { display: flex; flex-direction: column; gap: 8px; padding: 16px; background: #f7f8fa; border-radius: 12px; border: 1px solid #e5e7eb; }
        .score-header { display: flex; align-items: center; justify-content: space-between; }
        .score-title { font-size: 12px; font-weight: 700; color: #6b7280; }
        .score-pct-badge { font-size: 12px; font-weight: 800; padding: 3px 10px; border-radius: 99px; }
        .score-nums { display: flex; align-items: baseline; gap: 3px; }
        .score-num { font-size: 32px; font-weight: 800; color: #111827; font-family: 'JetBrains Mono', monospace; letter-spacing: -1px; }
        .score-sep { font-size: 22px; color: #d1d5db; }
        .score-den { font-size: 22px; font-weight: 700; color: #9ca3af; font-family: 'JetBrains Mono', monospace; }
        .score-bar-wrap { height: 6px; background: #e5e7eb; border-radius: 99px; overflow: hidden; }
        .score-bar { height: 100%; border-radius: 99px; transition: width 1.2s ease; }

        .go-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: #111827; color: white;
          padding: 14px; border-radius: 12px; border: none;
          font-size: 15px; font-weight: 800; cursor: pointer;
          transition: all 0.2s; font-family: Tajawal, sans-serif; width: 100%;
        }
        .go-btn:hover { background: #1f2937; transform: translateY(-1px); }

        .footer-note { text-align: center; font-size: 12px; color: #9ca3af; }
      `}</style>
    </div>
  );
}

const baseStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .shell {
    min-height: 100vh; background: #f7f8fa;
    font-family: Tajawal, sans-serif; direction: rtl;
    display: flex; align-items: center; justify-content: center; padding: 28px 16px;
  }
  .spinner { width: 28px; height: 28px; border: 3px solid #e5e7eb; border-top-color: #2563eb; border-radius: 50%; animation: sp 0.7s linear infinite; }
  @keyframes sp { to { transform: rotate(360deg); } }
  .card {
    background: white; border: 1px solid #e5e7eb; border-radius: 22px;
    padding: 32px 28px; width: 100%; max-width: 460px;
    display: flex; flex-direction: column; gap: 18px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.07);
  }
`;