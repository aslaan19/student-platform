"use client";

import { useEffect, useState, useRef } from "react";

type Option = { id: string; text: string; order: number };
type Question = { id: string; type: "MCQ" | "TF"; text: string; order: number; options: Option[] };
type Attempt = { score: number; total: number };
type Quiz = { id: string; name: string; questions: Question[]; attempts: Attempt[] };

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-xl bg-gray-100 dark:bg-gray-800 ${className}`}
      style={{ animation: "pulse 1.5s ease-in-out infinite" }}
    />
  );
}

export default function StudentQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const visibleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ✅ Fix: fetch is a plain async function, not wrapped in useCallback with setState
  async function fetchQuizzes() {
    try {
      const data = await fetch("/api/student/quizzes").then((r) => r.json());
      setQuizzes(data.quizzes ?? []);
    } catch {
      setQuizzes([]);
    } finally {
      setLoading(false);
      visibleTimerRef.current = setTimeout(() => setVisible(true), 50);
    }
  }

  useEffect(() => {
    fetchQuizzes();
    return () => {
      if (visibleTimerRef.current) clearTimeout(visibleTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setAnswers({});
    setResult(null);
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (!activeQuiz) return;
    const unanswered = activeQuiz.questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) return alert(`لم تجب على ${unanswered.length} سؤال بعد`);
    setSubmitting(true);
    const res = await fetch("/api/student/quizzes/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quizId: activeQuiz.id,
        answers: Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer })),
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) return alert(data.error);
    setResult({ score: data.score, total: data.total });
    fetchQuizzes();
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4 p-6 max-w-2xl mx-auto" dir="rtl">
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }`}</style>
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-5 w-48" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // ── Result screen ─────────────────────────────────────────────────────────
  if (result && activeQuiz) {
    const percent = Math.round((result.score / result.total) * 100);
    const passed = percent >= 50;
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6" dir="rtl">
        <style>{`
          @keyframes popIn {
            0%   { opacity:0; transform:scale(0.82) }
            65%  { transform:scale(1.04) }
            100% { opacity:1; transform:scale(1) }
          }
          @keyframes ringFill {
            from { stroke-dashoffset: 283 }
          }
        `}</style>

        <div
          className="rounded-2xl border border-gray-200 bg-white p-8 text-center space-y-5 max-w-sm w-full shadow-sm"
          style={{ animation: "popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards" }}
        >
          {/* Circular progress ring */}
          <div className="flex justify-center">
            <svg width="96" height="96" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="40" fill="none" stroke="#f3f4f6" strokeWidth="8" />
              <circle
                cx="48" cy="48" r="40" fill="none"
                stroke={passed ? "#22c55e" : "#ef4444"}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * percent) / 100}
                transform="rotate(-90 48 48)"
                style={{ transition: "stroke-dashoffset 0.9s ease" }}
              />
              <text x="48" y="53" textAnchor="middle" fontSize="20" fontWeight="600"
                fill={passed ? "#16a34a" : "#dc2626"}>
                {percent}%
              </text>
            </svg>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">{activeQuiz.name}</h2>
            <p className="text-sm text-gray-500 mt-1">
              أجبت على <span className="font-medium text-gray-700">{result.score}</span> من{" "}
              <span className="font-medium text-gray-700">{result.total}</span> سؤال بشكل صحيح
            </p>
          </div>

          <div
            className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
              passed ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            <span>{passed ? "✓" : "✗"}</span>
            {passed ? "أحسنت! نتيجة رائعة" : "راجع المادة وحاول مرة أخرى"}
          </div>

          <button
            onClick={() => { setActiveQuiz(null); setResult(null); }}
            className="w-full border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            العودة إلى الاختبارات
          </button>
        </div>
      </div>
    );
  }

  // ── Active quiz ───────────────────────────────────────────────────────────
  if (activeQuiz) {
    const answered = Object.keys(answers).length;
    const total = activeQuiz.questions.length;
    const progressPercent = (answered / total) * 100;

    return (
      <div className="space-y-6 p-6 max-w-2xl mx-auto" dir="rtl">
        <style>{`
          @keyframes fadeSlideIn {
            from { opacity:0; transform:translateY(10px) }
            to   { opacity:1; transform:translateY(0) }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{activeQuiz.name}</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {answered} / {total} تمت الإجابة
            </p>
          </div>
          <button
            onClick={() => setActiveQuiz(null)}
            className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors mt-0.5 shrink-0"
          >
            إلغاء
          </button>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full"
              style={{
                width: `${progressPercent}%`,
                background: progressPercent === 100 ? "#22c55e" : "#111827",
                transition: "width 0.4s cubic-bezier(0.4,0,0.2,1), background 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {activeQuiz.questions.map((q, qi) => {
            const isAnswered = !!answers[q.id];
            return (
              <div
                key={q.id}
                className={`rounded-2xl border p-5 space-y-3 transition-all duration-200 ${
                  isAnswered
                    ? "border-gray-900 shadow-sm bg-white"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
                style={{ animation: `fadeSlideIn 0.3s ease ${qi * 60}ms both` }}
              >
                <p className="font-medium text-sm text-gray-900 leading-relaxed">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold ml-2 shrink-0">
                    {qi + 1}
                  </span>
                  {q.text}
                </p>
                <div className="space-y-2">
                  {(
                    q.type === "TF"
                      ? [{ id: "t", text: "صح" }, { id: "f", text: "خطأ" }]
                      : q.options.map((o) => ({ id: o.id, text: o.text }))
                  ).map((opt) => {
                    const selected = answers[q.id] === opt.text;
                    return (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-150 select-none ${
                          selected
                            ? "bg-gray-900 text-white border-gray-900 scale-[1.01]"
                            : "border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:scale-[0.99]"
                        }`}
                      >
                        <input
                          type="radio"
                          className="hidden"
                          name={q.id}
                          value={opt.text}
                          onChange={() => handleAnswer(q.id, opt.text)}
                        />
                        {/* Custom radio indicator */}
                        <span
                          className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                            selected ? "border-white" : "border-gray-300"
                          }`}
                        >
                          {selected && <span className="w-2 h-2 rounded-full bg-white block" />}
                        </span>
                        <span className="text-sm">{opt.text}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting || answered < total}
          className="w-full bg-gray-900 text-white py-3.5 rounded-xl text-sm font-medium disabled:opacity-40 transition-all hover:bg-gray-800 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              جارٍ التسليم...
            </>
          ) : answered < total ? (
            `أجب على ${total - answered} سؤال متبقٍ`
          ) : (
            "تسليم الاختبار ✓"
          )}
        </button>
      </div>
    );
  }

  // ── Quizzes list ──────────────────────────────────────────────────────────
  const doneCount = quizzes.filter((q) => q.attempts.length > 0).length;

  return (
    <div
      dir="rtl"
      className="space-y-6 p-6 max-w-2xl mx-auto"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}
    >
      <style>{`
        @keyframes pulse       { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الاختبارات</h1>
          {quizzes.length > 0 && (
            <p className="text-sm text-gray-400 mt-0.5">
              {doneCount} من {quizzes.length} مكتمل
            </p>
          )}
        </div>
        {quizzes.length > 0 && (
          <div className="flex gap-1.5 items-center text-xs text-gray-400 mb-0.5">
            <span className="inline-block w-2 h-2 rounded-full bg-green-400" /> مكتمل
            <span className="inline-block w-2 h-2 rounded-full bg-gray-200 mr-2" /> لم يبدأ
          </div>
        )}
      </div>

      {/* Summary stats bar */}
      {quizzes.length > 0 && doneCount > 0 && (
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-1.5 rounded-full bg-green-500"
            style={{ width: `${(doneCount / quizzes.length) * 100}%`, transition: "width 0.6s ease" }}
          />
        </div>
      )}

      {quizzes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <p className="text-3xl mb-3">📋</p>
          <p className="text-gray-500 text-sm">لا توجد اختبارات متاحة بعد</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {quizzes.map((quiz, i) => {
            const attempt = quiz.attempts[0];
            const done = !!attempt;
            const percent = done ? Math.round((attempt.score / attempt.total) * 100) : null;
            const passed = percent !== null && percent >= 50;

            return (
              <div
                key={quiz.id}
                className={`rounded-2xl border p-4 flex items-center justify-between gap-4 transition-all duration-200 bg-white ${
                  done ? "border-gray-200" : "border-gray-200 hover:border-gray-400 hover:shadow-sm"
                }`}
                style={{ animation: `fadeSlideIn 0.3s ease ${i * 55}ms both` }}
              >
                {/* Left: icon + info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-base ${
                      done
                        ? passed
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-500"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {done ? (passed ? "✓" : "✗") : "?"}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{quiz.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{quiz.questions.length} سؤال</p>
                  </div>
                </div>

                {/* Right: score or start button */}
                {done ? (
                  <div className="text-left shrink-0">
                    <span className={`text-xl font-bold ${passed ? "text-green-600" : "text-red-500"}`}>
                      {percent}%
                    </span>
                    <p className="text-xs text-gray-400">
                      {attempt.score} / {attempt.total}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => startQuiz(quiz)}
                    className="shrink-0 bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-medium transition-all hover:bg-gray-800 hover:scale-[1.03] active:scale-[0.98]"
                  >
                    ابدأ الاختبار
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}