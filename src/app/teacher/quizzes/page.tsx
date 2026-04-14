"use client";

import { useEffect, useState } from "react";

type Option = { id: string; text: string; order: number };
type Question = { id: string; type: "MCQ" | "TF"; text: string; correct_answer: string; order: number; options: Option[] };
type Attempt = { id: string; score: number; total: number; submitted_at: string; student: { profile: { full_name: string } } };
type Quiz = { id: string; name: string; class: { name: string }; questions: Question[]; attempts: Attempt[] };
type ClassItem = { id: string; name: string };

type NewQuestion = {
  type: "MCQ" | "TF";
  text: string;
  options: string[];
  correct_answer: string;
};

export default function TeacherQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [creating, setCreating] = useState(false);
  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [quizName, setQuizName] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [questions, setQuestions] = useState<NewQuestion[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    const [qRes, tRes] = await Promise.all([
      fetch("/api/teacher/quizzes"),
      fetch("/api/teacher"),
    ]);
    const qData = await qRes.json();
    const tData = await tRes.json();
    setQuizzes(qData);
    setClasses(tData.classes ?? []);
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await fetchData();
    })();
  }, []);

  const addQuestion = (type: "MCQ" | "TF") => {
    setQuestions(prev => [...prev, {
      type,
      text: "",
      options: type === "MCQ" ? ["", "", "", ""] : ["صح", "خطأ"],
      correct_answer: "",
    }]);
  };

  const updateQuestion = (index: number, field: string, value: string) => {
    setQuestions(prev => prev.map((q, i) => i === index ? { ...q, [field]: value } : q));
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q;
      const opts = [...q.options];
      opts[oIndex] = value;
      return { ...q, options: opts };
    }));
  };

  const removeQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitQuiz = async () => {
    if (!quizName.trim()) return alert("أدخل اسم الاختبار");
    if (!selectedClass) return alert("اختر الفصل");
    if (questions.length === 0) return alert("أضف سؤالاً على الأقل");

    for (const q of questions) {
      if (!q.text.trim()) return alert("أكمل نص جميع الأسئلة");
      if (!q.correct_answer) return alert("اختر الإجابة الصحيحة لجميع الأسئلة");
      if (q.type === "MCQ") {
        const filled = q.options.filter(o => o.trim());
        if (filled.length < 2) return alert("أضف خيارين على الأقل لكل سؤال MCQ");
      }
    }

    setSubmitting(true);
    const res = await fetch("/api/teacher/quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: quizName,
        classId: selectedClass,
        questions: questions.map(q => ({
          ...q,
          options: q.type === "MCQ" ? q.options.filter(o => o.trim()) : undefined,
        })),
      }),
    });

    setSubmitting(false);
    if (!res.ok) {
      const err = await res.json();
      return alert("فشل: " + err.error);
    }

    setQuizName(""); setSelectedClass(""); setQuestions([]); setCreating(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الاختبار؟")) return;
    await fetch(`/api/teacher/quizzes/${id}`, { method: "DELETE" });
    fetchData();
  };

  if (loading) return <div className="p-6 text-gray-400" dir="rtl">جارٍ التحميل...</div>;

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">الاختبارات</h1>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm"
          >
            + إنشاء اختبار
          </button>
        )}
      </div>

      {/* Create Quiz Form */}
      {creating && (
        <div className="rounded-xl border p-6 space-y-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">اختبار جديد</h2>
            <button onClick={() => setCreating(false)} className="text-gray-400 hover:text-black text-sm">إلغاء</button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">اسم الاختبار</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                placeholder="مثال: اختبار الفصل الأول"
                value={quizName}
                onChange={e => setQuizName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">الفصل</label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
              >
                <option value="">اختر الفصل</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            {questions.map((q, qi) => (
              <div key={qi} className="rounded-xl border bg-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    سؤال {qi + 1} — {q.type === "MCQ" ? "اختيار متعدد" : "صح / خطأ"}
                  </span>
                  <button onClick={() => removeQuestion(qi)} className="text-red-400 text-xs hover:underline">حذف</button>
                </div>

                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="نص السؤال"
                  value={q.text}
                  onChange={e => updateQuestion(qi, "text", e.target.value)}
                />

                {q.type === "MCQ" ? (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">الخيارات (2-4 خيارات)</p>
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qi}`}
                          checked={q.correct_answer === opt && opt.trim() !== ""}
                          onChange={() => updateQuestion(qi, "correct_answer", opt)}
                        />
                        <input
                          className="flex-1 border rounded-lg px-3 py-1.5 text-sm"
                          placeholder={`الخيار ${oi + 1}`}
                          value={opt}
                          onChange={e => {
                            updateOption(qi, oi, e.target.value);
                            if (q.correct_answer === opt) updateQuestion(qi, "correct_answer", e.target.value);
                          }}
                        />
                      </div>
                    ))}
                    <p className="text-xs text-gray-400">اختر الإجابة الصحيحة بالضغط على الدائرة</p>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    {["صح", "خطأ"].map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`correct-${qi}`}
                          checked={q.correct_answer === opt}
                          onChange={() => updateQuestion(qi, "correct_answer", opt)}
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Question Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => addQuestion("MCQ")}
              className="border px-4 py-2 rounded-lg text-sm hover:bg-white transition"
            >
              + سؤال اختيار متعدد
            </button>
            <button
              onClick={() => addQuestion("TF")}
              className="border px-4 py-2 rounded-lg text-sm hover:bg-white transition"
            >
              + سؤال صح / خطأ
            </button>
          </div>

          <button
            onClick={handleSubmitQuiz}
            disabled={submitting}
            className="w-full bg-black text-white py-2.5 rounded-lg text-sm disabled:opacity-40"
          >
            {submitting ? "جارٍ الحفظ..." : `حفظ الاختبار (${questions.length} سؤال)`}
          </button>
        </div>
      )}

      {/* Quizzes List */}
      <div className="space-y-4">
        {quizzes.length === 0 ? (
          <div className="rounded-xl border p-8 text-center text-gray-400 text-sm">
            لا توجد اختبارات بعد
          </div>
        ) : (
          quizzes.map(quiz => (
            <div key={quiz.id} className="rounded-xl border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{quiz.name}</h3>
                  <p className="text-sm text-gray-500">
                    {quiz.class.name} · {quiz.questions.length} سؤال · {quiz.attempts.length} محاولة
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setExpandedQuiz(expandedQuiz === quiz.id ? null : quiz.id)}
                    className="text-sm border px-3 py-1.5 rounded-lg hover:bg-gray-50"
                  >
                    {expandedQuiz === quiz.id ? "إخفاء النتائج" : "عرض النتائج"}
                  </button>
                  <button
                    onClick={() => handleDelete(quiz.id)}
                    className="text-sm border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50"
                  >
                    حذف
                  </button>
                </div>
              </div>

              {/* Scores */}
              {expandedQuiz === quiz.id && (
                <div className="border-t pt-3 space-y-2">
                  <h4 className="text-sm font-medium text-gray-600">نتائج الطلاب</h4>
                  {quiz.attempts.length === 0 ? (
                    <p className="text-sm text-gray-400">لم يؤدِ أي طالب الاختبار بعد</p>
                  ) : (
                    quiz.attempts.map(a => (
                      <div key={a.id} className="flex justify-between items-center text-sm bg-gray-50 rounded-lg px-3 py-2">
                        <span>{a.student.profile.full_name}</span>
                        <span className={`font-semibold ${a.score / a.total >= 0.5 ? "text-green-600" : "text-red-500"}`}>
                          {a.score} / {a.total}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}