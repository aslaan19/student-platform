"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";

interface Option {
  id: string;
  text: string;
  order: number;
}
interface Question {
  id: string;
  type: "MCQ" | "TF";
  text: string;
  correct_answer: string;
  options: Option[];
}
interface Module {
  id: string;
  title: string;
  order: number;
  questions: Question[];
}
interface Stage {
  id: string;
  title: string;
  order: number;
  modules: Module[];
}
interface Roadmap {
  id: string;
  title: string;
  stages: Stage[];
}

/* ═══════════════════════════════════════════════════════════
   ICONS
   ═══════════════════════════════════════════════════════════ */

const Icons = {
  stages: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  modules: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  questions: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  plus: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  chevronDown: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  trash: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  edit: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  close: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  check: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  x: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  book: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  map: (
    <svg
      width="64"
      height="64"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  ),
  folder: (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
};

/* ═══════════════════════════════════════════════════════════
   QUESTION MODAL
   ═══════════════════════════════════════════════════════════ */

function QuestionModal({
  moduleId,
  question,
  onClose,
  onSaved,
}: {
  moduleId: string;
  question?: Question;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [type, setType] = useState<"MCQ" | "TF">(question?.type ?? "MCQ");
  const [text, setText] = useState(question?.text ?? "");
  const [correctAnswer, setCorrectAnswer] = useState(
    question?.correct_answer ?? "",
  );
  const [options, setOptions] = useState<string[]>(
    question?.options?.map((o) => o.text) ?? ["", "", "", ""],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setError("");
    if (!text.trim()) {
      setError("نص السؤال مطلوب");
      return;
    }
    if (!correctAnswer.trim()) {
      setError("يجب تحديد الإجابة الصحيحة");
      return;
    }
    if (type === "MCQ" && options.filter((o) => o.trim()).length < 2) {
      setError("يجب إضافة خيارين على الأقل");
      return;
    }
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        type,
        text: text.trim(),
        correct_answer: correctAnswer.trim(),
      };
      if (type === "MCQ") body.options = options.filter((o) => o.trim());
      const url = question
        ? `/api/school-admin/roadmap/questions/${question.id}`
        : `/api/school-admin/roadmap/modules/${moduleId}/questions`;
      const res = await fetch(url, {
        method: question ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "فشل الحفظ");
      onSaved();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "خطأ");
    } finally {
      setLoading(false);
    }
  };

  const updateOption = (i: number, val: string) => {
    const n = [...options];
    n[i] = val;
    setOptions(n);
    if (correctAnswer === options[i]) setCorrectAnswer("");
  };

  return (
    <div
      className="rb-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="rb-modal">
        <div className="rb-modal-header">
          <div className="rb-modal-icon">{Icons.questions}</div>
          <div className="rb-modal-header-text">
            <h3 className="rb-modal-title">
              {question ? "تعديل السؤال" : "إضافة سؤال جديد"}
            </h3>
            <p className="rb-modal-subtitle">
              {question
                ? "قم بتعديل بيانات السؤال"
                : "أضف سؤالاً جديداً للمستوى"}
            </p>
          </div>
          <button className="rb-close-btn" onClick={onClose}>
            {Icons.close}
          </button>
        </div>

        <div className="rb-modal-body">
          <div className="rb-field-group">
            <label className="rb-label">نوع السؤال</label>
            <div className="rb-type-row">
              {(["MCQ", "TF"] as const).map((t) => (
                <button
                  key={t}
                  className={`rb-type-btn${type === t ? " active" : ""}`}
                  onClick={() => {
                    setType(t);
                    setCorrectAnswer("");
                  }}
                >
                  <span className="rb-type-icon">
                    {t === "MCQ" ? Icons.modules : Icons.check}
                  </span>
                  <span className="rb-type-label">
                    {t === "MCQ" ? "اختيار من متعدد" : "صح / خطأ"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rb-field-group">
            <label className="rb-label">نص السؤال</label>
            <textarea
              className="rb-textarea"
              rows={3}
              placeholder="اكتب نص السؤال هنا..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              dir="rtl"
            />
          </div>

          {type === "MCQ" && (
            <div className="rb-field-group">
              <label className="rb-label">
                الخيارات
                <span className="rb-label-hint">
                  اضغط الدائرة لتحديد الإجابة الصحيحة
                </span>
              </label>
              <div className="rb-options-list">
                {options.map((opt, i) => (
                  <div
                    key={i}
                    className={`rb-opt-row${correctAnswer === opt && opt ? " selected" : ""}`}
                  >
                    <button
                      type="button"
                      className={`rb-opt-radio${correctAnswer === opt && opt ? " sel" : ""}`}
                      onClick={() => opt.trim() && setCorrectAnswer(opt)}
                    >
                      {correctAnswer === opt && opt && Icons.check}
                    </button>
                    <input
                      className="rb-opt-input"
                      type="text"
                      placeholder={`الخيار ${i + 1}`}
                      value={opt}
                      onChange={(e) => updateOption(i, e.target.value)}
                      dir="rtl"
                    />
                    <span className="rb-opt-num">{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {type === "TF" && (
            <div className="rb-field-group">
              <label className="rb-label">الإجابة الصحيحة</label>
              <div className="rb-tf-row">
                <button
                  className={`rb-tf-btn${correctAnswer === "true" ? " sel true" : ""}`}
                  onClick={() => setCorrectAnswer("true")}
                >
                  <span className="rb-tf-icon">{Icons.check}</span>
                  <span>صح</span>
                </button>
                <button
                  className={`rb-tf-btn${correctAnswer === "false" ? " sel false" : ""}`}
                  onClick={() => setCorrectAnswer("false")}
                >
                  <span className="rb-tf-icon">{Icons.x}</span>
                  <span>خطأ</span>
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="rb-error">
              <span className="rb-error-icon">{Icons.x}</span>
              {error}
            </div>
          )}
        </div>

        <div className="rb-modal-footer">
          <button className="rb-btn-primary" onClick={save} disabled={loading}>
            {loading ? (
              <>
                <span className="rb-btn-spinner" />
                جارٍ الحفظ...
              </>
            ) : question ? (
              "حفظ التعديلات"
            ) : (
              "إضافة السؤال"
            )}
          </button>
          <button className="rb-btn-ghost" onClick={onClose}>
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MODULE CARD
   ═══════════════════════════════════════════════════════════ */

function ModuleCard({
  mod,
  onRefresh,
}: {
  mod: Module;
  onRefresh: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [addingQ, setAddingQ] = useState(false);
  const [editingQ, setEditingQ] = useState<Question | null>(null);
  const [deleting, setDeleting] = useState(false);

  const deleteModule = async () => {
    if (!confirm(`حذف المستوى "${mod.title}" وجميع أسئلتها؟`)) return;
    setDeleting(true);
    await fetch(`/api/school-admin/roadmap/modules/${mod.id}`, {
      method: "DELETE",
    });
    onRefresh();
  };

  const deleteQuestion = async (qid: string) => {
    if (!confirm("حذف هذا السؤال؟")) return;
    await fetch(`/api/school-admin/roadmap/questions/${qid}`, {
      method: "DELETE",
    });
    onRefresh();
  };

  return (
    <div className={`rb-module${open ? " expanded" : ""}`}>
      <div className="rb-module-head">
        <button className="rb-module-toggle" onClick={() => setOpen(!open)}>
          <div className="rb-module-indicator">
            <span className="rb-module-dot" />
          </div>
          <div className="rb-module-info">
            <span className="rb-module-name">{mod.title}</span>
            <span className="rb-module-meta">{mod.questions.length} سؤال</span>
          </div>
          <span className={`rb-chevron${open ? " open" : ""}`}>
            {Icons.chevronDown}
          </span>
        </button>
        <button
          className="rb-icon-btn danger"
          onClick={deleteModule}
          disabled={deleting}
          title="حذف المستوى"
        >
          {Icons.trash}
        </button>
      </div>

      {open && (
        <div className="rb-module-body">
          {mod.questions.length === 0 ? (
            <div className="rb-empty-inline">
              <span className="rb-empty-inline-icon">{Icons.questions}</span>
              <span>لا توجد أسئلة بعد</span>
            </div>
          ) : (
            <div className="rb-q-list">
              {mod.questions.map((q, idx) => {
                const correctDisplay =
                  q.type === "TF"
                    ? q.correct_answer === "true"
                      ? "صح"
                      : "خطأ"
                    : q.correct_answer;
                return (
                  <div key={q.id} className="rb-q-item">
                    <div className="rb-q-number">{idx + 1}</div>
                    <div className="rb-q-content">
                      <p className="rb-q-text" dir="rtl">
                        {q.text}
                      </p>
                      <div className="rb-q-footer">
                        <span
                          className={`rb-tag rb-tag-${q.type === "MCQ" ? "mcq" : "tf"}`}
                        >
                          {q.type === "MCQ" ? "اختيار متعدد" : "صح/خطأ"}
                        </span>
                        <span className="rb-tag rb-tag-answer">
                          {Icons.check}
                          <span>{correctDisplay}</span>
                        </span>
                      </div>
                    </div>
                    <div className="rb-q-actions">
                      <button
                        className="rb-icon-btn"
                        onClick={() => setEditingQ(q)}
                        title="تعديل"
                      >
                        {Icons.edit}
                      </button>
                      <button
                        className="rb-icon-btn danger"
                        onClick={() => deleteQuestion(q.id)}
                        title="حذف"
                      >
                        {Icons.trash}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <button className="rb-add-q-btn" onClick={() => setAddingQ(true)}>
            <span className="rb-add-icon">{Icons.plus}</span>
            <span>إضافة سؤال</span>
          </button>
        </div>
      )}

      {(addingQ || editingQ) && (
        <QuestionModal
          moduleId={mod.id}
          question={editingQ ?? undefined}
          onClose={() => {
            setAddingQ(false);
            setEditingQ(null);
          }}
          onSaved={onRefresh}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STAGE CARD
   ═══════════════════════════════════════════════════════════ */

function StageCard({
  stage,
  stageIndex,
  onRefresh,
}: {
  stage: Stage;
  stageIndex: number;
  onRefresh: () => void;
}) {
  const [open, setOpen] = useState(true);
  const [moduleName, setModuleName] = useState("");
  const [adding, setAdding] = useState(false);

  const deleteStage = async () => {
    if (!confirm(`حذف المرحلة "${stage.title}" وجميع وحداتها؟`)) return;
    await fetch(`/api/school-admin/roadmap/stages/${stage.id}`, {
      method: "DELETE",
    });
    onRefresh();
  };

  const addModule = async () => {
    if (!moduleName.trim()) return;
    setAdding(true);
    await fetch(`/api/school-admin/roadmap/stages/${stage.id}/modules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: moduleName.trim() }),
    });
    setModuleName("");
    setAdding(false);
    onRefresh();
  };

  const totalQuestions = stage.modules.reduce(
    (a, m) => a + m.questions.length,
    0,
  );

  return (
    <div className="rb-stage">
      <div className="rb-stage-head">
        <button className="rb-stage-toggle" onClick={() => setOpen(!open)}>
          <div className="rb-stage-badge">{stageIndex + 1}</div>
          <div className="rb-stage-info">
            <span className="rb-stage-name">{stage.title}</span>
            <div className="rb-stage-stats">
              <span className="rb-stage-stat">
                {Icons.modules}
                <span>{stage.modules.length} مستوى</span>
              </span>
              <span className="rb-stage-divider" />
              <span className="rb-stage-stat">
                {Icons.questions}
                <span>{totalQuestions} سؤال</span>
              </span>
            </div>
          </div>
          <span className={`rb-chevron${open ? " open" : ""}`}>
            {Icons.chevronDown}
          </span>
        </button>
        <button className="rb-btn-danger-sm" onClick={deleteStage}>
          {Icons.trash}
          <span>حذف</span>
        </button>
      </div>

      {open && (
        <div className="rb-stage-body">
          {stage.modules.length === 0 && (
            <div className="rb-empty-inline large">
              <span className="rb-empty-inline-icon">{Icons.folder}</span>
              <div className="rb-empty-inline-text">
                <span className="rb-empty-inline-title">
                  لا توجد مستويات بعد
                </span>
                <span className="rb-empty-inline-sub">أضف أول مستوى للبدء</span>
              </div>
            </div>
          )}

          {stage.modules.map((mod) => (
            <ModuleCard key={mod.id} mod={mod} onRefresh={onRefresh} />
          ))}

          <div className="rb-add-module-row">
            <div className="rb-input-wrapper">
              <input
                className="rb-input"
                type="text"
                placeholder="اسم المستوى الجديد..."
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addModule()}
                dir="rtl"
              />
            </div>
            <button
              className="rb-btn-secondary"
              onClick={addModule}
              disabled={adding || !moduleName.trim()}
            >
              {adding ? <span className="rb-btn-spinner" /> : Icons.plus}
              <span>{adding ? "..." : "إضافة مستوى"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */

export default function RoadmapBuilderPage() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [stageName, setStageName] = useState("");
  const [creating, setCreating] = useState(false);

  const load = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch("/api/school-admin/roadmap");
      const data = await res.json();
      setRoadmap(data.roadmap ?? null);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    void load(true);
  }, []);

  const createRoadmap = async () => {
    setCreating(true);
    await fetch("/api/school-admin/roadmap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setCreating(false);
    load();
  };

  const addStage = async () => {
    if (!stageName.trim()) return;
    await fetch("/api/school-admin/roadmap/stages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: stageName.trim() }),
    });
    setStageName("");
    load();
  };

  const totalModules =
    roadmap?.stages.reduce((a, s) => a + s.modules.length, 0) ?? 0;
  const totalQuestions =
    roadmap?.stages.reduce(
      (a, s) => a + s.modules.reduce((b, m) => b + m.questions.length, 0),
      0,
    ) ?? 0;

  if (loading)
    return (
      <div className="rb-loading">
        <div className="rb-loading-content">
          <div className="rb-spinner" />
          <span className="rb-loading-text">جارٍ التحميل...</span>
        </div>
        <style>{css}</style>
      </div>
    );

  return (
    <div className="rb-page" dir="rtl">
      {!roadmap ? (
        <div className="rb-empty-state">
          <div className="rb-empty-visual">
            <div className="rb-empty-icon-bg">{Icons.map}</div>
            <div className="rb-empty-glow" />
          </div>
          <h2 className="rb-empty-title">لا يوجد بنك أسئلة بعد</h2>
          <p className="rb-empty-sub">
            أنشئ خارطة الطريق التعليمية لمدرستك وابدأ بإضافة المراحل والمستويات
            والأسئلة
          </p>
          <button
            className="rb-btn-primary lg"
            onClick={createRoadmap}
            disabled={creating}
          >
            {creating ? (
              <>
                <span className="rb-btn-spinner" />
                جارٍ الإنشاء...
              </>
            ) : (
              <>
                {Icons.plus}
                إنشاء بنك الأسئلة
              </>
            )}
          </button>
        </div>
      ) : (
        <>
          <header className="rb-header">
            <div className="rb-header-content">
              <div className="rb-header-icon">{Icons.book}</div>
              <div className="rb-header-text">
                <h1 className="rb-page-title">{roadmap.title}</h1>
                <p className="rb-page-sub">
                  إدارة مراحل التعلم والوحدات وبنك الأسئلة
                </p>
              </div>
            </div>
          </header>

          <div className="rb-stats-row">
            {[
              {
                num: roadmap.stages.length,
                label: "المراحل",
                icon: Icons.stages,
                color: "gold",
              },
              {
                num: totalModules,
                label: "المستويات",
                icon: Icons.modules,
                color: "red",
              },
              {
                num: totalQuestions,
                label: "الأسئلة",
                icon: Icons.questions,
                color: "black",
              },
            ].map((s) => (
              <div key={s.label} className={`rb-stat-card rb-stat-${s.color}`}>
                <div className="rb-stat-icon">{s.icon}</div>
                <div className="rb-stat-content">
                  <div className="rb-stat-num">{s.num}</div>
                  <div className="rb-stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="rb-stages-section">
            <div className="rb-section-header">
              <h2 className="rb-section-title">المراحل التعليمية</h2>
              <span className="rb-section-count">{roadmap.stages.length}</span>
            </div>

            <div className="rb-stages-list">
              {roadmap.stages.length === 0 && (
                <div className="rb-empty-state sm">
                  <div className="rb-empty-visual sm">
                    <div className="rb-empty-icon-bg sm">{Icons.folder}</div>
                  </div>
                  <p className="rb-empty-text">لا توجد مراحل بعد</p>
                  <p className="rb-empty-hint">
                    أضف أول مرحلة باستخدام النموذج أدناه
                  </p>
                </div>
              )}
              {roadmap.stages.map((stage, idx) => (
                <StageCard
                  key={stage.id}
                  stage={stage}
                  stageIndex={idx}
                  onRefresh={load}
                />
              ))}
            </div>

            <div className="rb-add-stage-bar">
              <div className="rb-add-stage-icon">{Icons.plus}</div>
              <div className="rb-input-wrapper">
                <input
                  className="rb-input"
                  type="text"
                  placeholder="اسم المرحلة الجديدة..."
                  value={stageName}
                  onChange={(e) => setStageName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addStage()}
                  dir="rtl"
                />
              </div>
              <button
                className="rb-btn-primary"
                onClick={addStage}
                disabled={!stageName.trim()}
              >
                إضافة مرحلة
              </button>
            </div>
          </div>
        </>
      )}
      <style>{css}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CSS
   ═══════════════════════════════════════════════════════════ */

const css = `
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;600;700;800;900&display=swap');

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ═══════════════════════════════════════════════════════════
   CSS VARIABLES
   ═══════════════════════════════════════════════════════════ */

:root {
  --gold-primary: #E5B93C;
  --gold-secondary: #C8A96A;
  --gold-light: rgba(229, 185, 60, 0.1);
  --gold-border: rgba(229, 185, 60, 0.25);
  --red-primary: #7A1E1E;
  --red-light: rgba(122, 30, 30, 0.08);
  --red-border: rgba(122, 30, 30, 0.2);
  --black: #0B0B0C;
  --ink: #1a1a1a;
  --ink2: #444444;
  --ink3: #888888;
  --surface: #FFFFFF;
  --surface2: #FAFAFA;
  --surface3: #F5F5F5;
  --border: #E8E8E8;
  --border2: #D4D4D4;
  --r: 12px;
  --r2: 16px;
  --r3: 20px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
  --shadow: 0 2px 8px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.1), 0 16px 48px rgba(0,0,0,0.06);
  --transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ═══════════════════════════════════════════════════════════
   ANIMATIONS
   ═══════════════════════════════════════════════════════════ */

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* ═══════════════════════════════════════════════════════════
   PAGE LAYOUT
   ═══════════════════════════════════════════════════════════ */

.rb-page {
  font-family: 'Tajawal', sans-serif;
  color: var(--ink);
  background: linear-gradient(180deg, var(--surface2) 0%, var(--surface) 100%);
  min-height: 100vh;
  padding: 40px 32px 80px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  max-width: 900px;
  margin: 0 auto;
}

/* ═══════════════════════════════════════════════════════════
   LOADING
   ═══════════════════════════════════════════════════════════ */

.rb-loading {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  font-family: 'Tajawal', sans-serif;
}

.rb-loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.rb-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--gold-border);
  border-top-color: var(--gold-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.rb-loading-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--ink3);
}

.rb-btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* ═══════════════════════════════════════════════════════════
   HEADER
   ═══════════════════════════════════════════════════════════ */

.rb-header {
  animation: slideUp 0.4s ease;
}

.rb-header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.rb-header-icon {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, var(--gold-primary) 0%, var(--gold-secondary) 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(229, 185, 60, 0.3);
}

.rb-header-text {
  flex: 1;
}

.rb-page-title {
  font-size: 26px;
  font-weight: 800;
  color: var(--black);
  letter-spacing: -0.3px;
  line-height: 1.2;
}

.rb-page-sub {
  font-size: 14px;
  color: var(--ink3);
  margin-top: 4px;
  font-weight: 500;
}

/* ═══════════════════════════════════════════════════════════
   STATS ROW
   ═══════════════════════════════════════════════════════════ */

.rb-stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  animation: slideUp 0.4s ease 0.1s both;
}

.rb-stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r2);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
}

.rb-stat-card:hover {
  box-shadow: var(--shadow);
  transform: translateY(-2px);
}

.rb-stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rb-stat-gold .rb-stat-icon {
  background: var(--gold-light);
  color: var(--gold-primary);
}

.rb-stat-red .rb-stat-icon {
  background: var(--red-light);
  color: var(--red-primary);
}

.rb-stat-black .rb-stat-icon {
  background: rgba(11, 11, 12, 0.06);
  color: var(--black);
}

.rb-stat-content {
  flex: 1;
  min-width: 0;
}

.rb-stat-num {
  font-size: 28px;
  font-weight: 800;
  color: var(--black);
  line-height: 1;
}

.rb-stat-label {
  font-size: 13px;
  color: var(--ink3);
  margin-top: 4px;
  font-weight: 600;
}

/* ═══════════════════════════════════════════════════════════
   STAGES SECTION
   ═══════════════════════════════════════════════════════════ */

.rb-stages-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: slideUp 0.4s ease 0.2s both;
}

.rb-section-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rb-section-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--black);
}

.rb-section-count {
  background: var(--gold-light);
  color: var(--gold-primary);
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 100px;
}

.rb-stages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ═══════════════════════════════════════════════════════════
   STAGE CARD
   ═══════════════════════════════════════════════════════════ */

.rb-stage {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r2);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
}

.rb-stage:hover {
  box-shadow: var(--shadow);
}

.rb-stage-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: var(--black);
  border-bottom: 2px solid var(--gold-primary);
}

.rb-stage-toggle {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  background: none;
  border: none;
  cursor: pointer;
  text-align: right;
}

.rb-stage-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--gold-primary) 0%, var(--gold-secondary) 100%);
  color: var(--black);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 800;
  flex-shrink: 0;
}

.rb-stage-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rb-stage-name {
  font-size: 16px;
  font-weight: 700;
  color: white;
}

.rb-stage-stats {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rb-stage-stat {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: rgba(255,255,255,0.5);
}

.rb-stage-stat svg {
  width: 14px;
  height: 14px;
  opacity: 0.7;
}

.rb-stage-divider {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
}

.rb-chevron {
  color: rgba(255,255,255,0.4);
  transition: transform var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
}

.rb-chevron.open {
  transform: rotate(180deg);
}

.rb-stage-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--surface2);
}

/* ═══════════════════════════════════════════════════════════
   MODULE CARD
   ═══════════════════════════════════════════════════════════ */

.rb-module {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r);
  overflow: hidden;
  transition: var(--transition);
}

.rb-module.expanded {
  border-color: var(--gold-border);
  box-shadow: var(--shadow-sm);
}

.rb-module-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
}

.rb-module-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  background: none;
  border: none;
  cursor: pointer;
  text-align: right;
}

.rb-module-indicator {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--gold-light);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rb-module-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--gold-primary);
}

.rb-module-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rb-module-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
}

.rb-module-meta {
  font-size: 12px;
  color: var(--ink3);
  font-weight: 500;
}

.rb-module .rb-chevron {
  color: var(--ink3);
}

.rb-module-body {
  border-top: 1px solid var(--border);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--surface2);
}

/* ═══════════════════════════════════════════════════════════
   QUESTION LIST
   ═══════════════════════════════════════════════════════════ */

.rb-q-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rb-q-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px 16px;
  transition: var(--transition);
}

.rb-q-item:hover {
  border-color: var(--gold-border);
  box-shadow: var(--shadow-sm);
}

.rb-q-number {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: var(--red-light);
  color: var(--red-primary);
  font-size: 12px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rb-q-content {
  flex: 1;
  min-width: 0;
}

.rb-q-text {
  font-size: 14px;
  color: var(--ink);
  line-height: 1.6;
  margin-bottom: 10px;
  font-weight: 500;
}

.rb-q-footer {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.rb-tag {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 100px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.rb-tag svg {
  width: 12px;
  height: 12px;
}

.rb-tag-mcq {
  background: var(--black);
  color: var(--gold-primary);
}

.rb-tag-tf {
  background: var(--red-light);
  color: var(--red-primary);
}

.rb-tag-answer {
  background: var(--gold-light);
  color: #8B7330;
  border: 1px solid var(--gold-border);
}

.rb-q-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}

/* ═══════════════════════════════════════════════════════════
   BUTTONS
   ═══════════════════════════════════════════════════════════ */

.rb-icon-btn {
  background: none;
  border: 1px solid transparent;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  color: var(--ink3);
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
}

.rb-icon-btn:hover {
  background: var(--surface3);
  color: var(--ink);
  border-color: var(--border);
}

.rb-icon-btn.danger:hover {
  background: var(--red-light);
  color: var(--red-primary);
  border-color: var(--red-border);
}

.rb-icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.rb-add-q-btn {
  width: 100%;
  border: 2px dashed var(--gold-border);
  background: var(--gold-light);
  border-radius: 10px;
  padding: 12px;
  font-size: 13px;
  color: var(--gold-primary);
  cursor: pointer;
  font-family: 'Tajawal', sans-serif;
  font-weight: 700;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.rb-add-q-btn:hover {
  border-color: var(--gold-primary);
  background: rgba(229, 185, 60, 0.15);
}

.rb-add-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.rb-btn-primary {
  background: linear-gradient(135deg, var(--gold-primary) 0%, var(--gold-secondary) 100%);
  color: var(--black);
  border: none;
  border-radius: var(--r);
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Tajawal', sans-serif;
  white-space: nowrap;
  transition: var(--transition);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(229, 185, 60, 0.3);
}

.rb-btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(229, 185, 60, 0.4);
}

.rb-btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.rb-btn-primary.lg {
  padding: 16px 40px;
  font-size: 16px;
  border-radius: var(--r2);
}

.rb-btn-secondary {
  background: var(--surface);
  color: var(--ink);
  border: 1px solid var(--border2);
  border-radius: var(--r);
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Tajawal', sans-serif;
  white-space: nowrap;
  transition: var(--transition);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.rb-btn-secondary:hover:not(:disabled) {
  border-color: var(--gold-primary);
  color: var(--gold-primary);
}

.rb-btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.rb-btn-ghost {
  background: transparent;
  color: var(--ink2);
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Tajawal', sans-serif;
  white-space: nowrap;
  transition: var(--transition);
}

.rb-btn-ghost:hover {
  border-color: var(--ink3);
  background: var(--surface3);
}

.rb-btn-danger-sm {
  font-size: 12px;
  color: white;
  background: var(--red-primary);
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  cursor: pointer;
  font-family: 'Tajawal', sans-serif;
  white-space: nowrap;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}

.rb-btn-danger-sm:hover {
  background: #5c1616;
}

.rb-btn-danger-sm svg {
  width: 14px;
  height: 14px;
}

/* ═══════════════════════════════════════════════════════════
   INPUTS
   ═══════════════════════════════════════════════════════════ */

.rb-add-module-row {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

.rb-add-stage-bar {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r2);
  padding: 16px 20px;
  display: flex;
  gap: 12px;
  align-items: center;
  box-shadow: var(--shadow-sm);
}

.rb-add-stage-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--gold-light);
  color: var(--gold-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rb-input-wrapper {
  flex: 1;
}

.rb-input {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 12px 16px;
  font-size: 14px;
  font-family: 'Tajawal', sans-serif;
  color: var(--ink);
  outline: none;
  background: var(--surface);
  transition: var(--transition);
}

.rb-input:focus {
  border-color: var(--gold-primary);
  box-shadow: 0 0 0 3px var(--gold-light);
}

.rb-input::placeholder {
  color: var(--ink3);
}

/* ═══════════════════════════════════════════════════════════
   EMPTY STATES
   ═══════════════════════════════════════════════════════════ */

.rb-empty-state {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r3);
  padding: 80px 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  animation: fadeIn 0.4s ease;
}

.rb-empty-state.sm {
  padding: 48px 32px;
}

.rb-empty-visual {
  position: relative;
  margin-bottom: 8px;
}

.rb-empty-visual.sm {
  margin-bottom: 0;
}

.rb-empty-icon-bg {
  width: 100px;
  height: 100px;
  border-radius: 24px;
  background: linear-gradient(135deg, var(--gold-light) 0%, rgba(200, 169, 106, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gold-primary);
  position: relative;
  z-index: 1;
}

.rb-empty-icon-bg.sm {
  width: 64px;
  height: 64px;
  border-radius: 16px;
}

.rb-empty-icon-bg.sm svg {
  width: 28px;
  height: 28px;
}

.rb-empty-glow {
  position: absolute;
  inset: -20px;
  background: radial-gradient(circle, rgba(229, 185, 60, 0.15) 0%, transparent 70%);
  z-index: 0;
  animation: pulse 3s ease-in-out infinite;
}

.rb-empty-title {
  font-size: 22px;
  font-weight: 800;
  color: var(--black);
}

.rb-empty-sub {
  font-size: 14px;
  color: var(--ink3);
  max-width: 320px;
  line-height: 1.6;
}

.rb-empty-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--ink2);
}

.rb-empty-hint {
  font-size: 13px;
  color: var(--ink3);
}

.rb-empty-inline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  color: var(--ink3);
  font-size: 13px;
  font-weight: 500;
}

.rb-empty-inline.large {
  flex-direction: column;
  padding: 32px;
  gap: 12px;
}

.rb-empty-inline-icon {
  color: var(--gold-secondary);
  display: flex;
}

.rb-empty-inline-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.rb-empty-inline-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink2);
}

.rb-empty-inline-sub {
  font-size: 12px;
  color: var(--ink3);
}

/* ═══════════════════════════════════════════════════════════
   MODAL
   ═══════════════════════════════════════════════════════════ */

.rb-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(11, 11, 12, 0.6);
  backdrop-filter: blur(8px);
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

.rb-modal {
  background: var(--surface);
  border-radius: var(--r3);
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
  animation: modalIn 0.25s ease;
}

.rb-modal-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 24px 24px 0;
}

.rb-modal-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--gold-light);
  color: var(--gold-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rb-modal-header-text {
  flex: 1;
}

.rb-modal-title {
  font-size: 18px;
  font-weight: 800;
  color: var(--black);
}

.rb-modal-subtitle {
  font-size: 13px;
  color: var(--ink3);
  margin-top: 2px;
}

.rb-close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--ink3);
  padding: 6px;
  border-radius: 8px;
  line-height: 1;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
}

.rb-close-btn:hover {
  background: var(--surface3);
  color: var(--ink);
}

.rb-modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.rb-modal-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-start;
  padding: 16px 24px 24px;
  border-top: 1px solid var(--border);
}

/* ═══════════════════════════════════════════════════════════
   FORM ELEMENTS
   ═══════════════════════════════════════════════════════════ */

.rb-field-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rb-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--ink2);
  letter-spacing: 0.02em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 8px;
}

.rb-label-hint {
  font-size: 11px;
  color: var(--ink3);
  font-weight: 500;
  text-transform: none;
}

.rb-type-row {
  display: flex;
  gap: 10px;
}

.rb-type-btn {
  flex: 1;
  padding: 14px;
  border: 2px solid var(--border);
  border-radius: var(--r);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  background: var(--surface);
  color: var(--ink2);
  font-family: 'Tajawal', sans-serif;
  transition: var(--transition);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.rb-type-btn:hover {
  border-color: var(--gold-border);
}

.rb-type-btn.active {
  background: var(--gold-light);
  color: var(--black);
  border-color: var(--gold-primary);
}

.rb-type-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink3);
}

.rb-type-btn.active .rb-type-icon {
  color: var(--gold-primary);
}

.rb-type-label {
  font-weight: 700;
}

.rb-textarea {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 14px 16px;
  font-family: 'Tajawal', sans-serif;
  font-size: 14px;
  color: var(--ink);
  outline: none;
  resize: vertical;
  line-height: 1.6;
  background: var(--surface);
  transition: var(--transition);
  min-height: 100px;
}

.rb-textarea:focus {
  border-color: var(--gold-primary);
  box-shadow: 0 0 0 3px var(--gold-light);
}

.rb-options-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rb-opt-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px;
  border-radius: 10px;
  transition: var(--transition);
}

.rb-opt-row.selected {
  background: var(--gold-light);
}

.rb-opt-radio {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--border2);
  cursor: pointer;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
  background: var(--surface);
  color: white;
}

.rb-opt-radio:hover {
  border-color: var(--gold-secondary);
}

.rb-opt-radio.sel {
  border-color: var(--gold-primary);
  background: var(--gold-primary);
}

.rb-opt-input {
  flex: 1;
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 12px 14px;
  font-family: 'Tajawal', sans-serif;
  font-size: 14px;
  color: var(--ink);
  outline: none;
  background: var(--surface);
  transition: var(--transition);
}

.rb-opt-input:focus {
  border-color: var(--gold-primary);
}

.rb-opt-row.selected .rb-opt-input {
  border-color: var(--gold-border);
  background: white;
}

.rb-opt-num {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: var(--surface3);
  color: var(--ink3);
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rb-tf-row {
  display: flex;
  gap: 12px;
}

.rb-tf-btn {
  flex: 1;
  padding: 16px;
  border: 2px solid var(--border);
  border-radius: var(--r);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  background: var(--surface);
  font-family: 'Tajawal', sans-serif;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--ink3);
}

.rb-tf-btn:hover {
  border-color: var(--gold-border);
}

.rb-tf-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.rb-tf-btn.sel.true {
  background: var(--gold-light);
  color: #8B7330;
  border-color: var(--gold-primary);
}

.rb-tf-btn.sel.false {
  background: var(--red-light);
  color: var(--red-primary);
  border-color: var(--red-primary);
}

.rb-error {
  background: var(--red-light);
  border: 1px solid var(--red-border);
  color: var(--red-primary);
  font-size: 13px;
  padding: 12px 16px;
  border-radius: 10px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
}

.rb-error-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
`;
