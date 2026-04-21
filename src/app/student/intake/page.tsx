"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Option {
  id: string;
  text: string;
  order: number;
}
interface Question {
  id: string;
  type: "MCQ" | "TF" | "WRITTEN";
  text: string;
  order: number;
  options: Option[];
}
interface Assessment {
  id: string;
  title: string;
  questions: Question[];
}

export default function StudentIntakePage() {
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [noAssessment, setNoAssessment] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/student/intake")
      .then((r) => r.json())
      .then((d) => {
        if (d.assessment) {
          setAssessment(d.assessment);
        } else {
          setNoAssessment(true);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function setAnswer(questionId: string, value: string) {
    setAnswers((a) => ({ ...a, [questionId]: value }));
  }

  const questions = assessment?.questions ?? [];
  const current = questions[currentQ];
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;
  const progress =
    questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  async function handleSubmit() {
    if (!assessment) return;
    const unanswered = questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      setError(`يوجد ${unanswered.length} سؤال لم تجب عليه بعد`);
      const idx = questions.findIndex((q) => !answers[q.id]);
      setCurrentQ(idx);
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const r = await fetch("/api/student/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessment_id: assessment.id,
          answers: Object.entries(answers).map(([question_id, answer]) => ({
            question_id,
            answer,
          })),
        }),
      });
      const d = await r.json();
      if (d.success) {
        router.push("/student/waiting");
      } else {
        setError(d.error ?? "حدث خطأ أثناء التقديم");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading)
    return (
      <PageShell>
        <LoadingSpinner />
      </PageShell>
    );

  if (noAssessment)
    return (
      <PageShell>
        <div className="intake-empty">
          <div className="empty-icon">📋</div>
          <h2>لا يوجد اختبار متاح حالياً</h2>
          <p>سيتم إخطارك عندما يكون الاختبار جاهزاً</p>
        </div>
      </PageShell>
    );

  if (!assessment) return null;

  return (
    <PageShell>
      <div className="intake-wrap">
        {/* Header */}
        <div className="intake-header">
          <div className="intake-title-row">
            <div className="intake-label">اختبار القبول</div>
            <h1 className="intake-title">{assessment.title}</h1>
          </div>
          <div className="intake-meta">
            <span className="q-counter">
              {currentQ + 1} / {questions.length}
            </span>
            <span className="answered-count">{answeredCount} مجاب</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-wrap">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>

        {/* Question dots */}
        <div className="q-dots">
          {questions.map((q, i) => (
            <button
              key={q.id}
              className={`q-dot ${i === currentQ ? "current" : ""} ${answers[q.id] ? "answered" : ""}`}
              onClick={() => setCurrentQ(i)}
              title={`سؤال ${i + 1}`}
            />
          ))}
        </div>

        {/* Current question */}
        {current && (
          <div className="q-card" key={current.id}>
            <div className="q-type-badge">
              {current.type === "MCQ"
                ? "اختيار من متعدد"
                : current.type === "TF"
                  ? "صح أم خطأ"
                  : "إجابة مكتوبة"}
            </div>
            <div className="q-text">{current.text}</div>

            {/* MCQ */}
            {current.type === "MCQ" && (
              <div className="q-options">
                {current.options.map((opt) => (
                  <button
                    key={opt.id}
                    className={`q-option-btn ${answers[current.id] === opt.text ? "selected" : ""}`}
                    onClick={() => setAnswer(current.id, opt.text)}
                  >
                    <span className="opt-radio">
                      {answers[current.id] === opt.text && (
                        <span className="opt-radio-fill" />
                      )}
                    </span>
                    {opt.text}
                  </button>
                ))}
              </div>
            )}

            {/* T/F */}
            {current.type === "TF" && (
              <div className="tf-row">
                {[
                  { val: "true", label: "✔ صحيح" },
                  { val: "false", label: "✘ خطأ" },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    className={`tf-btn ${answers[current.id] === opt.val ? "selected" : ""} ${opt.val === "true" ? "true-btn" : "false-btn"}`}
                    onClick={() => setAnswer(current.id, opt.val)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {/* Written */}
            {current.type === "WRITTEN" && (
              <textarea
                className="written-input"
                placeholder="اكتب إجابتك هنا..."
                value={answers[current.id] ?? ""}
                onChange={(e) => setAnswer(current.id, e.target.value)}
                rows={5}
                dir="rtl"
              />
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="nav-row">
          <button
            className="nav-btn secondary"
            onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
            disabled={currentQ === 0}
          >
            → السابق
          </button>

          {currentQ < questions.length - 1 ? (
            <button
              className="nav-btn primary"
              onClick={() => setCurrentQ((q) => q + 1)}
            >
              التالي ←
            </button>
          ) : (
            <button
              className={`nav-btn submit ${allAnswered ? "ready" : ""}`}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "جارٍ التقديم..." : "تقديم الاختبار ✔"}
            </button>
          )}
        </div>

        {error && <div className="intake-error">{error}</div>}
      </div>

      <style>{intakeStyles}</style>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="intake-shell">
      {children}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .intake-shell {
          min-height: 100vh;
          background: #f7f8fa;
          font-family: 'Tajawal', sans-serif;
          direction: rtl;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 32px 16px;
        }
      `}</style>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        color: "#6b7280",
        fontSize: 14,
        padding: "80px 0",
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          border: "2px solid #e5e7eb",
          borderTopColor: "#4f8ef7",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }}
      />
      جارٍ تحميل الاختبار...
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const intakeStyles = `
  .intake-wrap {
    width: 100%; max-width: 680px;
    display: flex; flex-direction: column; gap: 20px;
  }

  .intake-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    flex-wrap: wrap; gap: 8px;
  }
  .intake-label {
    font-size: 11px; font-weight: 700; letter-spacing: 0.8px;
    text-transform: uppercase; color: #4f8ef7;
    background: rgba(79,142,247,0.1); border-radius: 6px;
    padding: 3px 10px; width: fit-content; margin-bottom: 6px;
  }
  .intake-title { font-size: 22px; font-weight: 800; color: #111827; }
  .intake-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
  .q-counter { font-size: 18px; font-weight: 800; color: #111827; }
  .answered-count { font-size: 12px; color: #6b7280; }

  .progress-wrap {
    height: 6px; background: #e5e7eb; border-radius: 99px; overflow: hidden;
  }
  .progress-bar {
    height: 100%; background: linear-gradient(90deg, #4f8ef7, #7c5cfc);
    border-radius: 99px; transition: width 0.4s ease;
  }

  .q-dots {
    display: flex; flex-wrap: wrap; gap: 6px;
  }
  .q-dot {
    width: 28px; height: 8px; border-radius: 99px;
    background: #e5e7eb; border: none; cursor: pointer;
    transition: all 0.2s;
  }
  .q-dot.answered { background: #4f8ef7; }
  .q-dot.current { background: #111827; transform: scaleY(1.3); }

  .q-card {
    background: white; border: 1px solid #e5e7eb;
    border-radius: 16px; padding: 24px;
    display: flex; flex-direction: column; gap: 18px;
    animation: fadeUp 0.2s ease both;
  }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  .q-type-badge {
    font-size: 11px; font-weight: 700; color: #6b7280;
    background: #f1f3f6; border-radius: 6px; padding: 3px 10px;
    width: fit-content;
  }
  .q-text { font-size: 17px; font-weight: 600; color: #111827; line-height: 1.6; }

  .q-options { display: flex; flex-direction: column; gap: 10px; }
  .q-option-btn {
    display: flex; align-items: center; gap: 12px;
    padding: 13px 16px; border-radius: 10px;
    background: #f7f8fa; border: 1.5px solid #e5e7eb;
    color: #374151; font-size: 14px; font-weight: 500;
    cursor: pointer; text-align: right;
    transition: all 0.15s; font-family: 'Tajawal', sans-serif;
  }
  .q-option-btn:hover { border-color: #4f8ef7; background: rgba(79,142,247,0.04); }
  .q-option-btn.selected { border-color: #4f8ef7; background: rgba(79,142,247,0.08); color: #1d4ed8; font-weight: 700; }
  .opt-radio {
    width: 18px; height: 18px; border-radius: 50%;
    border: 2px solid #d1d5db; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    transition: border-color 0.15s;
  }
  .q-option-btn.selected .opt-radio { border-color: #4f8ef7; }
  .opt-radio-fill { width: 8px; height: 8px; border-radius: 50%; background: #4f8ef7; }

  .tf-row { display: flex; gap: 12px; }
  .tf-btn {
    flex: 1; padding: 14px; border-radius: 12px; font-size: 16px;
    font-weight: 700; cursor: pointer; border: 1.5px solid #e5e7eb;
    background: #f7f8fa; transition: all 0.15s; font-family: 'Tajawal', sans-serif;
  }
  .tf-btn.true-btn.selected { background: rgba(16,185,129,0.1); border-color: #10b981; color: #065f46; }
  .tf-btn.false-btn.selected { background: rgba(239,68,68,0.1); border-color: #ef4444; color: #991b1b; }
  .tf-btn:not(.selected):hover { border-color: #9ca3af; }

  .written-input {
    width: 100%; padding: 12px 14px;
    background: #f7f8fa; border: 1.5px solid #e5e7eb;
    border-radius: 10px; color: #111827;
    font-size: 14px; font-family: 'Tajawal', sans-serif;
    line-height: 1.7; resize: vertical; outline: none;
    transition: border-color 0.15s;
  }
  .written-input:focus { border-color: #4f8ef7; background: white; }

  .nav-row {
    display: flex; justify-content: space-between; align-items: center; gap: 12px;
  }
  .nav-btn {
    padding: 11px 24px; border-radius: 10px;
    font-size: 14px; font-weight: 700;
    cursor: pointer; border: none;
    transition: all 0.15s; font-family: 'Tajawal', sans-serif;
  }
  .nav-btn.primary { background: #111827; color: white; }
  .nav-btn.primary:hover { background: #1f2937; }
  .nav-btn.secondary {
    background: white; color: #374151;
    border: 1.5px solid #e5e7eb;
  }
  .nav-btn.secondary:hover { border-color: #9ca3af; }
  .nav-btn.secondary:disabled { opacity: 0.3; cursor: not-allowed; }
  .nav-btn.submit { background: #e5e7eb; color: #9ca3af; }
  .nav-btn.submit.ready { background: #4f8ef7; color: white; }
  .nav-btn.submit.ready:hover { background: #3b82f6; }
  .nav-btn.submit:disabled { opacity: 0.5; cursor: not-allowed; }

  .intake-error {
    background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
    color: #dc2626; font-size: 13px; padding: 10px 14px;
    border-radius: 9px; text-align: center;
  }

  .intake-empty {
    display: flex; flex-direction: column; align-items: center;
    gap: 12px; padding: 80px 32px; text-align: center;
    background: white; border-radius: 16px; border: 1px solid #e5e7eb;
  }
  .empty-icon { font-size: 48px; }
  .intake-empty h2 { font-size: 18px; font-weight: 700; color: #111827; }
  .intake-empty p { font-size: 14px; color: #6b7280; }
`;
