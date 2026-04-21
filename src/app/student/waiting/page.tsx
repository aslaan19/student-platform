"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function StudentWaitingPage() {
  const [studentName, setStudentName] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch("/api/student")
      .then((r) => r.json())
      .then((d) => {
        if (d.profile?.full_name) setStudentName(d.profile.full_name);
      });
    setTimeout(() => setVisible(true), 50);
  }, []);

  return (
    <div className="wait-shell">
      <div
        className="wait-card"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        {/* Animated check */}
        <div className="wait-icon-wrap">
          <div className="wait-icon-ring" />
          <div className="wait-icon">✔</div>
        </div>

        <div className="wait-body">
          <h1 className="wait-title">
            {studentName ? `شكراً، ${studentName}!` : "تم التقديم بنجاح!"}
          </h1>
          <p className="wait-desc">
            تم استلام إجاباتك بنجاح. سيقوم المسؤول بمراجعة اختبارك وتحديد
            المدرسة المناسبة لك قريباً.
          </p>

          <div className="wait-steps">
            <div className="step done">
              <div className="step-dot">✔</div>
              <div className="step-text">
                <div className="step-title">تقديم اختبار القبول</div>
                <div className="step-sub">تم بنجاح</div>
              </div>
            </div>
            <div className="step-line" />
            <div className="step active">
              <div className="step-dot pulse">
                <span />
              </div>
              <div className="step-text">
                <div className="step-title">مراجعة المسؤول</div>
                <div className="step-sub">قيد الانتظار...</div>
              </div>
            </div>
            <div className="step-line faded" />
            <div className="step">
              <div className="step-dot empty" />
              <div className="step-text">
                <div className="step-title">تحديد المدرسة</div>
                <div className="step-sub">قريباً</div>
              </div>
            </div>
            <div className="step-line faded" />
            <div className="step">
              <div className="step-dot empty" />
              <div className="step-text">
                <div className="step-title">الانضمام للفصل</div>
                <div className="step-sub">قريباً</div>
              </div>
            </div>
          </div>

          <div className="wait-note">
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4m0 4h.01" />
            </svg>
            ستظهر هذه الصفحة حتى يتم تعيينك في مدرسة. لا حاجة لفعل أي شيء الآن.
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .wait-shell {
          min-height: 100vh;
          background: #f7f8fa;
          font-family: 'Tajawal', sans-serif;
          direction: rtl;
          display: flex; align-items: center; justify-content: center;
          padding: 32px 16px;
        }

        .wait-card {
          background: white; border: 1px solid #e5e7eb;
          border-radius: 20px; padding: 40px 36px;
          width: 100%; max-width: 520px;
          display: flex; flex-direction: column; align-items: center;
          gap: 28px; text-align: center;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
        }

        .wait-icon-wrap {
          position: relative; width: 80px; height: 80px;
          display: flex; align-items: center; justify-content: center;
        }
        .wait-icon-ring {
          position: absolute; inset: 0; border-radius: 50%;
          border: 2px solid rgba(79,142,247,0.3);
          animation: ringPulse 2s ease infinite;
        }
        @keyframes ringPulse {
          0%,100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        .wait-icon {
          width: 64px; height: 64px; border-radius: 50%;
          background: linear-gradient(135deg, #4f8ef7, #7c5cfc);
          color: white; font-size: 28px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 20px rgba(79,142,247,0.3);
        }

        .wait-body { display: flex; flex-direction: column; gap: 16px; width: 100%; }
        .wait-title { font-size: 24px; font-weight: 800; color: #111827; }
        .wait-desc { font-size: 14px; color: #6b7280; line-height: 1.7; }

        .wait-steps {
          display: flex; flex-direction: column; gap: 0;
          background: #f7f8fa; border-radius: 14px; padding: 20px;
          text-align: right;
        }
        .step { display: flex; align-items: center; gap: 12px; padding: 8px 0; }
        .step-line { width: 2px; height: 20px; background: #e5e7eb; margin-right: 15px; }
        .step-line.faded { opacity: 0.4; }

        .step-dot {
          width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700;
        }
        .step.done .step-dot { background: #10b981; color: white; }
        .step.active .step-dot {
          background: rgba(79,142,247,0.1);
          border: 2px solid #4f8ef7;
          position: relative;
        }
        .step.active .step-dot span {
          width: 10px; height: 10px; border-radius: 50%;
          background: #4f8ef7;
          animation: dotPulse 1.5s ease infinite;
        }
        @keyframes dotPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        .step-dot.empty {
          background: #f1f3f6; border: 2px solid #e5e7eb;
        }

        .step-text { flex: 1; }
        .step-title { font-size: 13.5px; font-weight: 700; color: #111827; }
        .step-sub { font-size: 11.5px; color: #9ca3af; margin-top: 1px; }
        .step.done .step-sub { color: #10b981; }
        .step.active .step-sub { color: #4f8ef7; }

        .wait-note {
          display: flex; align-items: center; gap: 8px; justify-content: center;
          background: rgba(79,142,247,0.06); border: 1px solid rgba(79,142,247,0.15);
          color: #4f8ef7; font-size: 12.5px; padding: 10px 14px; border-radius: 9px;
        }
      `}</style>
    </div>
  );
}
