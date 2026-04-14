"use client";

import { useEffect, useState } from "react";

type Option = { id: string; text: string; order: number };
type Question = {
  id: string;
  type: "MCQ" | "TF";
  text: string;
  order: number;
  options: Option[];
};
type Attempt = { score: number; total: number };
type Quiz = {
  id: string;
  name: string;
  questions: Question[];
  attempts: Attempt[];
};

export default function StudentQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [studentId, setStudentId] = useState("");
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; total: number } | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchQuizzes = async () => {
    const res = await fetch("/api/student/quizzes");
    const data = await res.json();
    setQuizzes(data.quizzes ?? []);
    setStudentId(data.studentId ?? "");
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await fetchQuizzes();
    })();
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
    if (unanswered.length > 0)
      return alert(`لم تجب على ${unanswered.length} سؤال بعد`);

    setSubmitting(true);
    const res = await fetch("/api/student/quizzes/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quizId: activeQuiz.id,
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer,
        })),
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) return alert(data.error);

    setResult({ score: data.score, total: data.total });
    fetchQuizzes();
  };

  if (loading)
    return (
      <div className="p-6 text-gray-400" dir="rtl">
        جارٍ التحميل...
      </div>
    );

  // Result screen
  if (result && activeQuiz) {
    const percent = Math.round((result.score / result.total) * 100);
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] p-6 space-y-4"
        dir="rtl"
      >
        <div className="rounded-2xl border p-8 text-center space-y-4 max-w-sm w-full">
          <div
            className={`text-6xl font-bold ${percent >= 50 ? "text-green-500" : "text-red-500"}`}
          >
            {percent}%
          </div>
          <h2 className="text-xl font-bold">{activeQuiz.name}</h2>
          <p className="text-gray-600">
            أجبت على {result.score} من {result.total} سؤال بشكل صحيح
          </p>
          <div
            className={`rounded-lg px-4 py-2 text-sm font-medium ${percent >= 50 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
          >
            {percent >= 50 ? "أحسنت! نتيجة ممتازة" : "حاول المراجعة والتحسين"}
          </div>
          <button
            onClick={() => {
              setActiveQuiz(null);
              setResult(null);
            }}
            className="w-full border rounded-lg py-2 text-sm hover:bg-gray-50"
          >
            العودة إلى الاختبارات
          </button>
        </div>
      </div>
    );
  }

  // Active quiz screen
  if (activeQuiz) {
    const answered = Object.keys(answers).length;
    const total = activeQuiz.questions.length;

    return (
      <div className="space-y-6 p-6 max-w-2xl mx-auto" dir="rtl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{activeQuiz.name}</h1>
            <p className="text-sm text-gray-500">
              {answered} / {total} تمت الإجابة
            </p>
          </div>
          <button
            onClick={() => setActiveQuiz(null)}
            className="text-sm text-gray-400 hover:text-black"
          >
            إلغاء
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-black h-2 rounded-full transition-all"
            style={{ width: `${(answered / total) * 100}%` }}
          />
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {activeQuiz.questions.map((q, qi) => (
            <div
              key={q.id}
              className={`rounded-xl border p-4 space-y-3 transition ${answers[q.id] ? "border-black" : ""}`}
            >
              <p className="font-medium text-sm">
                <span className="text-gray-400 ml-1">{qi + 1}.</span> {q.text}
              </p>

              <div className="space-y-2">
                {q.type === "TF"
                  ? ["صح", "خطأ"].map((opt) => (
                      <label
                        key={opt}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition ${
                          answers[q.id] === opt
                            ? "bg-black text-white border-black"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          className="hidden"
                          name={q.id}
                          value={opt}
                          onChange={() => handleAnswer(q.id, opt)}
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))
                  : q.options.map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition ${
                          answers[q.id] === opt.text
                            ? "bg-black text-white border-black"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          className="hidden"
                          name={q.id}
                          value={opt.text}
                          onChange={() => handleAnswer(q.id, opt.text)}
                        />
                        <span className="text-sm">{opt.text}</span>
                      </label>
                    ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || answered < total}
          className="w-full bg-black text-white py-3 rounded-xl text-sm font-medium disabled:opacity-40"
        >
          {submitting
            ? "جارٍ التسليم..."
            : answered < total
              ? `أجب على ${total - answered} سؤال متبقي`
              : "تسليم الاختبار"}
        </button>
      </div>
    );
  }

  // Quizzes list
  return (
    <div className="space-y-6 p-6" dir="rtl">
      <h1 className="text-2xl font-bold">الاختبارات</h1>

      {quizzes.length === 0 ? (
        <div className="rounded-xl border p-8 text-center text-gray-400 text-sm">
          لا توجد اختبارات متاحة بعد
        </div>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((quiz) => {
            const attempt = quiz.attempts[0];
            const done = !!attempt;
            const percent = done
              ? Math.round((attempt.score / attempt.total) * 100)
              : null;

            return (
              <div
                key={quiz.id}
                className="rounded-xl border p-4 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-semibold">{quiz.name}</h3>
                  <p className="text-sm text-gray-500">
                    {quiz.questions.length} سؤال
                  </p>
                </div>

                {done ? (
                  <div className="text-left">
                    <span
                      className={`text-lg font-bold ${percent! >= 50 ? "text-green-600" : "text-red-500"}`}
                    >
                      {percent}%
                    </span>
                    <p className="text-xs text-gray-400">
                      {attempt.score} / {attempt.total}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => startQuiz(quiz)}
                    className="bg-black text-white px-4 py-2 rounded-lg text-sm"
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
