"use client";
export const dynamic = 'force-dynamic';

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
interface School {
  id: string;
  name: string;
}

export default function StudentPlacementPage() {
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [noAssessment, setNoAssessment] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/student/placement")
      .then((r) => r.json())
      .then((d) => {
        if (d.assessment) {
          setAssessment(d.assessment);
          setSchool(d.school ?? null);
        } else setNoAssessment(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const setAnswer = (qid: string, val: string) =>
    setAnswers((a) => ({ ...a, [qid]: val }));
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
      setError(`ÙŠÙˆØ¬Ø¯ ${unanswered.length} Ø³Ø¤Ø§Ù„ Ù„Ù… ØªØ¬Ø¨ Ø¹Ù„ÙŠÙ‡`);
      setCurrentQ(questions.findIndex((q) => !answers[q.id]));
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const r = await fetch("/api/student/placement", {
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
      if (d.success) router.push("/student/waiting-class");
      else setError(d.error ?? "Ø­Ø¯Ø« Ø®Ø·Ø£");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading)
    return (
      <Shell>
        <Spinner />
      </Shell>
    );

  if (noAssessment)
    return (
      <Shell>
        <div className="p-empty">
          <div className="p-empty-icon">ðŸ“‹</div>
          <h2>Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø§Ø®ØªØ¨Ø§Ø± ØªØµÙ†ÙŠÙ Ù…ØªØ§Ø­ Ø­Ø§Ù„ÙŠØ§Ù‹</h2>
          <p>Ø³ÙŠØªÙ… Ø¥Ø®Ø·Ø§Ø±Ùƒ Ø¹Ù†Ø¯Ù…Ø§ ÙŠÙƒÙˆÙ† Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø± Ø¬Ø§Ù‡Ø²Ø§Ù‹</p>
        </div>
        <style>{styles}</style>
      </Shell>
    );

  if (!assessment) return null;

  return (
    <Shell>
      <div className="p-wrap">
        <div className="p-header">
          <div>
            {school && <div className="school-badge">ðŸ« {school.name}</div>}
            <div className="p-label">Ø§Ø®ØªØ¨Ø§Ø± Ø§Ù„ØªØµÙ†ÙŠÙ</div>
            <h1 className="p-title">{assessment.title}</h1>
          </div>
          <div className="p-meta">
            <span className="q-counter">
              {currentQ + 1} / {questions.length}
            </span>
            <span className="answered">{answeredCount} Ù…Ø¬Ø§Ø¨</span>
          </div>
        </div>

        <div className="progress-wrap">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>

        <div className="q-dots">
          {questions.map((q, i) => (
            <button
              key={q.id}
              className={`q-dot ${i === currentQ ? "current" : ""} ${answers[q.id] ? "answered" : ""}`}
              onClick={() => setCurrentQ(i)}
            />
          ))}
        </div>

        {current && (
          <div className="q-card" key={current.id}>
            <div className="q-type-badge">
              {current.type === "MCQ"
                ? "Ø§Ø®ØªÙŠØ§Ø± Ù…Ù† Ù…ØªØ¹Ø¯Ø¯"
                : current.type === "TF"
                  ? "ØµØ­ Ø£Ù… Ø®Ø·Ø£"
                  : "Ø¥Ø¬Ø§Ø¨Ø© Ù…ÙƒØªÙˆØ¨Ø©"}
            </div>
            <div className="q-text">{current.text}</div>

            {current.type === "MCQ" && (
              <div className="q-options">
                {current.options.map((opt) => (
                  <button
                    key={opt.id}
                    className={`q-opt-btn ${answers[current.id] === opt.text ? "selected" : ""}`}
                    onClick={() => setAnswer(current.id, opt.text)}
                  >
                    <span className="opt-radio">
                      {answers[current.id] === opt.text && (
                        <span className="opt-fill" />
                      )}
                    </span>
                    {opt.text}
                  </button>
                ))}
              </div>
            )}

            {current.type === "TF" && (
              <div className="tf-row">
                {[
                  { val: "true", label: "âœ“ ØµØ­ÙŠØ­" },
                  { val: "false", label: "âœ— Ø®Ø·Ø£" },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    className={`tf-btn ${answers[current.id] === opt.val ? "sel" : ""} ${opt.val}`}
                    onClick={() => setAnswer(current.id, opt.val)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {current.type === "WRITTEN" && (
              <textarea
                className="written-inp"
                placeholder="Ø§ÙƒØªØ¨ Ø¥Ø¬Ø§Ø¨ØªÙƒ Ù‡Ù†Ø§..."
                value={answers[current.id] ?? ""}
                onChange={(e) => setAnswer(current.id, e.target.value)}
                rows={5}
                dir="rtl"
              />
            )}
          </div>
        )}

        <div className="nav-row">
          <button
            className="nav-btn secondary"
            onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
            disabled={currentQ === 0}
          >
            â† Ø§Ù„Ø³Ø§Ø¨Ù‚
          </button>
          {currentQ < questions.length - 1 ? (
            <button
              className="nav-btn primary"
              onClick={() => setCurrentQ((q) => q + 1)}
            >
              Ø§Ù„ØªØ§Ù„ÙŠ â†’
            </button>
          ) : (
            <button
              className={`nav-btn submit ${allAnswered ? "ready" : ""}`}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Ø¬Ø§Ø±Ù Ø§Ù„ØªÙ‚Ø¯ÙŠÙ…..." : "ØªÙ‚Ø¯ÙŠÙ… Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø± âœ“"}
            </button>
          )}
        </div>
        {error && <div className="p-error">{error}</div>}
      </div>
      <style>{styles}</style>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-shell">
      {children}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .p-shell { min-height: 100vh; background: #f7f8fa; font-family: 'Tajawal', sans-serif; direction: rtl; display: flex; align-items: flex-start; justify-content: center; padding: 32px 16px; }
      `}</style>
    </div>
  );
}

function Spinner() {
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
          borderTopColor: "#2563eb",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }}
      />
      Ø¬Ø§Ø±Ù ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø±...
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles = `
  .p-wrap { width: 100%; max-width: 660px; display: flex; flex-direction: column; gap: 18px; }
  .p-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
  .school-badge { font-size: 12px; font-weight: 700; color: #2563eb; background: rgba(37,99,235,0.08); border-radius: 7px; padding: 3px 10px; width: fit-content; margin-bottom: 6px; }
  .p-label { font-size: 10.5px; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 4px; }
  .p-title { font-size: 21px; font-weight: 800; color: #111827; }
  .p-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
  .q-counter { font-size: 18px; font-weight: 800; color: #111827; }
  .answered { font-size: 12px; color: #6b7280; }

  .progress-wrap { height: 6px; background: #e5e7eb; border-radius: 99px; overflow: hidden; }
  .progress-bar { height: 100%; background: linear-gradient(90deg, #2563eb, #7c3aed); border-radius: 99px; transition: width 0.4s ease; }

  .q-dots { display: flex; flex-wrap: wrap; gap: 5px; }
  .q-dot { width: 28px; height: 8px; border-radius: 99px; background: #e5e7eb; border: none; cursor: pointer; transition: all 0.2s; }
  .q-dot.answered { background: #2563eb; }
  .q-dot.current { background: #111827; transform: scaleY(1.3); }

  .q-card { background: white; border: 1px solid #e5e7eb; border-radius: 14px; padding: 22px; display: flex; flex-direction: column; gap: 16px; animation: fadeUp 0.2s ease both; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  .q-type-badge { font-size: 11px; font-weight: 700; color: #6b7280; background: #f1f3f6; border-radius: 6px; padding: 3px 10px; width: fit-content; }
  .q-text { font-size: 16px; font-weight: 700; color: #111827; line-height: 1.6; }

  .q-options { display: flex; flex-direction: column; gap: 9px; }
  .q-opt-btn { display: flex; align-items: center; gap: 11px; padding: 12px 15px; border-radius: 10px; background: #f7f8fa; border: 1.5px solid #e5e7eb; color: #374151; font-size: 14px; font-weight: 500; cursor: pointer; text-align: right; transition: all 0.15s; font-family: 'Tajawal', sans-serif; }
  .q-opt-btn:hover { border-color: #2563eb; background: rgba(37,99,235,0.04); }
  .q-opt-btn.selected { border-color: #2563eb; background: rgba(37,99,235,0.07); color: #1d4ed8; font-weight: 700; }
  .opt-radio { width: 18px; height: 18px; border-radius: 50%; border: 2px solid #d1d5db; flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: border-color 0.15s; }
  .q-opt-btn.selected .opt-radio { border-color: #2563eb; }
  .opt-fill { width: 8px; height: 8px; border-radius: 50%; background: #2563eb; }

  .tf-row { display: flex; gap: 10px; }
  .tf-btn { flex: 1; padding: 13px; border-radius: 11px; font-size: 16px; font-weight: 700; cursor: pointer; border: 1.5px solid #e5e7eb; background: #f7f8fa; transition: all 0.15s; font-family: 'Tajawal', sans-serif; color: #374151; }
  .tf-btn.sel.true { background: rgba(16,185,129,0.1); border-color: #10b981; color: #065f46; }
  .tf-btn.sel.false { background: rgba(239,68,68,0.1); border-color: #ef4444; color: #991b1b; }

  .written-inp { width: 100%; padding: 12px 13px; background: #f7f8fa; border: 1.5px solid #e5e7eb; border-radius: 10px; color: #111827; font-size: 14px; font-family: 'Tajawal', sans-serif; line-height: 1.7; resize: vertical; outline: none; transition: border-color 0.15s; }
  .written-inp:focus { border-color: #2563eb; background: white; }

  .nav-row { display: flex; justify-content: space-between; gap: 10px; }
  .nav-btn { padding: 11px 22px; border-radius: 9px; font-size: 14px; font-weight: 700; cursor: pointer; border: none; transition: all 0.15s; font-family: 'Tajawal', sans-serif; }
  .nav-btn.primary { background: #111827; color: white; }
  .nav-btn.primary:hover { background: #1f2937; }
  .nav-btn.secondary { background: white; color: #374151; border: 1.5px solid #e5e7eb; }
  .nav-btn.secondary:disabled { opacity: 0.35; cursor: not-allowed; }
  .nav-btn.submit { background: #e5e7eb; color: #9ca3af; }
  .nav-btn.submit.ready { background: #2563eb; color: white; }
  .nav-btn.submit.ready:hover { background: #1d4ed8; }
  .nav-btn.submit:disabled { opacity: 0.5; cursor: not-allowed; }

  .p-error { background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.2); color: #dc2626; font-size: 13px; padding: 9px 13px; border-radius: 9px; text-align: center; }

  .p-empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 70px 28px; text-align: center; background: white; border-radius: 16px; border: 1px solid #e5e7eb; }
  .p-empty-icon { font-size: 44px; }
  .p-empty h2 { font-size: 17px; font-weight: 800; color: #111827; }
  .p-empty p { font-size: 13px; color: #6b7280; }
`;



