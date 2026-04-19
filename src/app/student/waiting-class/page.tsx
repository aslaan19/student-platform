// student/waiting-class/page.tsx
"use client";

import { useEffect, useState } from "react";

export default function StudentWaitingClassPage() {
  const [studentName, setStudentName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch("/api/student")
      .then((r) => r.json())
      .then((d) => {
        if (d.profile?.full_name) setStudentName(d.profile.full_name);
        if (d.school?.name) setSchoolName(d.school.name);
      });
    setTimeout(() => setVisible(true), 50);
  }, []);

  return (
    <div className="wc-shell">
      <div
        className="wc-card"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        <div className="wc-icon">🏫</div>

        <div className="wc-body">
          <h1 className="wc-title">تم تعيينك في مدرسة!</h1>
          {schoolName && <div className="school-badge">{schoolName}</div>}
          <p className="wc-desc">
            {studentName ? `مرحباً ${studentName}، ` : ""}
            تم قبولك في المدرسة. الآن سيقوم مدير المدرسة بمراجعة نتائجك وتعيينك في الفصل المناسب قريباً.
          </p>

          <div className="wc-steps">
            <div className="step done">
              <div className="step-dot">✓</div>
              <div className="step-text">
                <div className="step-title">اختبار القبول</div>
                <div className="step-sub">مكتمل</div>
              </div>
            </div>
            <div className="step-line" />
            <div className="step done">
              <div className="step-dot">✓</div>
              <div className="step-text">
                <div className="step-title">تعيين المدرسة</div>
                <div className="step-sub">مكتمل</div>
              </div>
            </div>
            <div className="step-line" />
            <div className="step active">
              <div className="step-dot pulse"><span /></div>
              <div className="step-text">
                <div className="step-title">تعيين الفصل</div>
                <div className="step-sub">قيد الانتظار...</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .wc-shell {
          min-height: 100vh; background: #f7f8fa;
          font-family: 'Tajawal', sans-serif; direction: rtl;
          display: flex; align-items: center; justify-content: center; padding: 32px 16px;
        }
        .wc-card {
          background: white; border: 1px solid #e5e7eb; border-radius: 20px;
          padding: 40px 36px; width: 100%; max-width: 480px;
          display: flex; flex-direction: column; align-items: center; gap: 24px;
          text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.06);
        }
        .wc-icon { font-size: 52px; }
        .wc-body { display: flex; flex-direction: column; gap: 14px; width: 100%; }
        .wc-title { font-size: 22px; font-weight: 800; color: #111827; }
        .school-badge {
          background: rgba(79,142,247,0.1); border: 1px solid rgba(79,142,247,0.2);
          color: #1d4ed8; font-size: 14px; font-weight: 700;
          padding: 6px 16px; border-radius: 99px; width: fit-content; margin: 0 auto;
        }
        .wc-desc { font-size: 13.5px; color: #6b7280; line-height: 1.7; }
        .wc-steps {
          display: flex; flex-direction: column;
          background: #f7f8fa; border-radius: 14px; padding: 18px; text-align: right;
        }
        .step { display: flex; align-items: center; gap: 12px; padding: 7px 0; }
        .step-line { width: 2px; height: 18px; background: #e5e7eb; margin-right: 14px; }
        .step-dot {
          width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;
        }
        .step.done .step-dot { background: #10b981; color: white; }
        .step.active .step-dot {
          background: rgba(79,142,247,0.1); border: 2px solid #4f8ef7;
        }
        .step.active .step-dot span {
          width: 9px; height: 9px; border-radius: 50%; background: #4f8ef7;
          animation: dp 1.5s ease infinite;
        }
        @keyframes dp { 0%,100%{opacity:1}50%{opacity:0.3} }
        .step-title { font-size: 13px; font-weight: 700; color: #111827; }
        .step-sub { font-size: 11px; color: #9ca3af; }
        .step.done .step-sub { color: #10b981; }
        .step.active .step-sub { color: #4f8ef7; }
      `}</style>
    </div>
  );
}