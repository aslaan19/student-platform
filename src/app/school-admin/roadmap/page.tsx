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
        <div className="rb-modal-top">
          <h3 className="rb-modal-title">
            {question ? "تعديل السؤال" : "إضافة سؤال جديد"}
          </h3>
          <button className="rb-close-btn" onClick={onClose}>
            ✕
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
                  {t === "MCQ" ? "اختيار من متعدد" : "صح / خطأ"}
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
                الخيارات{" "}
                <span className="rb-label-hint">
                  — اضغط الدائرة لتحديد الإجابة الصحيحة
                </span>
              </label>
              <div className="rb-options-list">
                {options.map((opt, i) => (
                  <div key={i} className="rb-opt-row">
                    <button
                      type="button"
                      className={`rb-opt-radio${correctAnswer === opt && opt ? " sel" : ""}`}
                      onClick={() => opt.trim() && setCorrectAnswer(opt)}
                    />
                    <input
                      className={`rb-opt-input${correctAnswer === opt && opt ? " correct" : ""}`}
                      type="text"
                      placeholder={`الخيار ${i + 1}`}
                      value={opt}
                      onChange={(e) => updateOption(i, e.target.value)}
                      dir="rtl"
                    />
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
                  className={`rb-tf-btn true-btn${correctAnswer === "true" ? " sel" : ""}`}
                  onClick={() => setCorrectAnswer("true")}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="2,7 6,11 12,3" />
                  </svg>
                  صح
                </button>
                <button
                  className={`rb-tf-btn false-btn${correctAnswer === "false" ? " sel" : ""}`}
                  onClick={() => setCorrectAnswer("false")}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="3" y1="3" x2="11" y2="11" />
                    <line x1="11" y1="3" x2="3" y2="11" />
                  </svg>
                  خطأ
                </button>
              </div>
            </div>
          )}
          {error && <div className="rb-error">{error}</div>}
        </div>
        <div className="rb-modal-footer">
          <button className="rb-btn-primary" onClick={save} disabled={loading}>
            {loading
              ? "جارٍ الحفظ..."
              : question
                ? "حفظ التعديلات"
                : "إضافة السؤال"}
          </button>
          <button className="rb-btn-ghost" onClick={onClose}>
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

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
    if (!confirm(`حذف الوحدة "${mod.title}" وجميع أسئلتها؟`)) return;
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
    <div className="rb-module">
      <div className="rb-module-head">
        <button className="rb-module-toggle" onClick={() => setOpen(!open)}>
          <div className="rb-module-dot" />
          <span className="rb-module-name">{mod.title}</span>
          <span className="rb-q-pill">{mod.questions.length} سؤال</span>
          <span className={`rb-chevron${open ? " open" : ""}`}>▼</span>
        </button>
        <button
          className="rb-icon-btn danger"
          onClick={deleteModule}
          disabled={deleting}
        >
          ✕
        </button>
      </div>
      {open && (
        <div className="rb-module-body">
          {mod.questions.length === 0 ? (
            <div className="rb-empty-small">لا توجد أسئلة بعد</div>
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
                    <div className="rb-q-index">{idx + 1}</div>
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
                          ✓ {correctDisplay}
                        </span>
                      </div>
                    </div>
                    <div className="rb-q-btns">
                      <button
                        className="rb-icon-btn"
                        onClick={() => setEditingQ(q)}
                      >
                        ✏
                      </button>
                      <button
                        className="rb-icon-btn danger"
                        onClick={() => deleteQuestion(q.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <button className="rb-add-q-btn" onClick={() => setAddingQ(true)}>
            + إضافة سؤال
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
          <span className="rb-stage-name">{stage.title}</span>
          <span className="rb-stage-meta">
            {stage.modules.length} وحدة · {totalQuestions} سؤال
          </span>
          <span className={`rb-chevron${open ? " open" : ""}`}>▼</span>
        </button>
        <button className="rb-btn-danger-sm" onClick={deleteStage}>
          حذف
        </button>
      </div>
      {open && (
        <div className="rb-stage-body">
          {stage.modules.length === 0 && (
            <div className="rb-empty-small">
              لا توجد وحدات بعد. أضف أول وحدة.
            </div>
          )}
          {stage.modules.map((mod) => (
            <ModuleCard key={mod.id} mod={mod} onRefresh={onRefresh} />
          ))}
          <div className="rb-add-module-row">
            <input
              className="rb-input"
              type="text"
              placeholder="اسم الوحدة الجديدة..."
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addModule()}
              dir="rtl"
            />
            <button
              className="rb-btn-ghost sm"
              onClick={addModule}
              disabled={adding}
            >
              {adding ? "..." : "إضافة وحدة"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

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
        <div className="rb-spinner" />
        <style>{css}</style>
      </div>
    );

  return (
    <div className="rb-page" dir="rtl">
      {!roadmap ? (
        <div className="rb-empty-state">
          <div className="rb-empty-icon">🗺️</div>
          <h2 className="rb-empty-title">لا يوجد بنك أسئلة بعد</h2>
          <p className="rb-empty-sub">أنشئ خارطة الطريق التعليمية لمدرستك</p>
          <button
            className="rb-btn-primary lg"
            onClick={createRoadmap}
            disabled={creating}
          >
            {creating ? "جارٍ الإنشاء..." : "إنشاء بنك الأسئلة"}
          </button>
        </div>
      ) : (
        <>
          <div className="rb-page-header">
            <div>
              <h1 className="rb-page-title">{roadmap.title}</h1>
              <p className="rb-page-sub">
                إدارة مراحل التعلم والوحدات وبنك الأسئلة
              </p>
            </div>
          </div>
          <div className="rb-stats-row">
            {[
              { num: roadmap.stages.length, label: "المراحل" },
              { num: totalModules, label: "الوحدات" },
              { num: totalQuestions, label: "الأسئلة" },
            ].map((s) => (
              <div key={s.label} className="rb-stat-card">
                <div className="rb-stat-num">{s.num}</div>
                <div className="rb-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="rb-stages-list">
            {roadmap.stages.length === 0 && (
              <div className="rb-empty-state sm">
                <div className="rb-empty-icon sm">📋</div>
                <p>لا توجد مراحل. أضف أول مرحلة أدناه.</p>
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
            <input
              className="rb-input"
              type="text"
              placeholder="اسم المرحلة الجديدة..."
              value={stageName}
              onChange={(e) => setStageName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addStage()}
              dir="rtl"
            />
            <button className="rb-btn-primary" onClick={addStage}>
              + إضافة مرحلة
            </button>
          </div>
        </>
      )}
      <style>{css}</style>
    </div>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes modalIn{from{opacity:0;transform:scale(0.97) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}

:root{
  --red:#7A1E1E;
  --red-dark:#5c1616;
  --red-muted:rgba(122,30,30,0.08);
  --red-border:rgba(122,30,30,0.2);
  --gold:#C8A96A;
  --gold-muted:rgba(200,169,106,0.12);
  --gold-border:rgba(200,169,106,0.3);
  --black:#0B0B0C;
  --ink:#1a0a0a;
  --ink2:#4a2a2a;
  --ink3:#8a6a6a;
  --surface:#ffffff;
  --surface2:#faf7f5;
  --surface3:#f5f0ec;
  --border:#e8ddd5;
  --border2:#d8c8bc;
  --r:10px;
  --r2:16px;
  --shadow:0 1px 3px rgba(11,11,12,0.07),0 4px 14px rgba(11,11,12,0.05);
}

.rb-page{font-family:'Cairo',sans-serif;color:var(--ink);background:var(--surface2);min-height:100vh;padding:32px 28px 60px;display:flex;flex-direction:column;gap:22px;max-width:820px;margin:0 auto}

.rb-loading{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--surface2);font-family:'Cairo',sans-serif}
.rb-spinner{width:28px;height:28px;border:3px solid var(--gold-border);border-top-color:var(--red);border-radius:50%;animation:spin 0.7s linear infinite}

.rb-page-header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.rb-page-title{font-size:22px;font-weight:800;color:var(--black);letter-spacing:-0.3px}
.rb-page-sub{font-size:13px;color:var(--ink3);margin-top:3px;font-weight:500}

.rb-stats-row{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.rb-stat-card{background:var(--black);border-radius:var(--r2);padding:20px 22px;box-shadow:var(--shadow);position:relative;overflow:hidden}
.rb-stat-card::before{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:var(--gold)}
.rb-stat-num{font-size:30px;font-weight:800;color:var(--gold);line-height:1}
.rb-stat-label{font-size:12.5px;color:rgba(255,255,255,0.5);margin-top:4px;font-weight:600}

.rb-stages-list{display:flex;flex-direction:column;gap:14px}
.rb-stage{background:var(--surface);border:1px solid var(--border);border-radius:var(--r2);overflow:hidden;box-shadow:var(--shadow);animation:fadeUp 0.3s ease}
.rb-stage-head{display:flex;align-items:center;gap:10px;padding:15px 18px;background:var(--black);border-bottom:1px solid rgba(200,169,106,0.2)}
.rb-stage-toggle{display:flex;align-items:center;gap:10px;flex:1;background:none;border:none;cursor:pointer;text-align:right}
.rb-stage-badge{width:30px;height:30px;border-radius:8px;background:var(--gold);color:var(--black);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;flex-shrink:0}
.rb-stage-name{font-size:14.5px;font-weight:700;color:white;flex:1}
.rb-stage-meta{font-size:11.5px;color:rgba(200,169,106,0.7);background:rgba(200,169,106,0.1);border:1px solid rgba(200,169,106,0.2);padding:3px 10px;border-radius:99px;font-weight:600}
.rb-chevron{font-size:10px;color:rgba(255,255,255,0.4);transition:transform 0.2s}
.rb-chevron.open{transform:rotate(180deg)}
.rb-stage-body{padding:16px 18px;display:flex;flex-direction:column;gap:10px;background:var(--surface)}

.rb-module{background:var(--surface2);border:1px solid var(--border);border-radius:var(--r);overflow:hidden}
.rb-module-head{display:flex;align-items:center;gap:8px;padding:11px 14px}
.rb-module-toggle{display:flex;align-items:center;gap:8px;flex:1;background:none;border:none;cursor:pointer;text-align:right}
.rb-module-dot{width:7px;height:7px;border-radius:50%;background:var(--gold);flex-shrink:0}
.rb-module-name{font-size:13.5px;font-weight:700;color:var(--ink);flex:1}
.rb-q-pill{font-size:11px;color:var(--red);background:var(--red-muted);border:1px solid var(--red-border);padding:2px 9px;border-radius:99px;font-weight:600}
.rb-module-body{border-top:1px solid var(--border);padding:12px 14px;display:flex;flex-direction:column;gap:8px}
.rb-empty-small{font-size:12.5px;color:var(--ink3);text-align:center;padding:12px 0}

.rb-q-list{display:flex;flex-direction:column;gap:7px}
.rb-q-item{display:flex;align-items:flex-start;gap:9px;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:11px 13px;animation:fadeUp 0.2s ease}
.rb-q-index{font-size:11px;font-weight:800;color:var(--red);min-width:18px;padding-top:2px}
.rb-q-content{flex:1;min-width:0}
.rb-q-text{font-size:13px;color:var(--ink);line-height:1.55;margin-bottom:6px}
.rb-q-footer{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.rb-tag{font-size:10.5px;padding:2px 9px;border-radius:99px;font-weight:600}
.rb-tag-mcq{background:#1a0a0a;color:var(--gold)}
.rb-tag-tf{background:var(--red-muted);color:var(--red)}
.rb-tag-answer{background:var(--gold-muted);color:#7a5a20;border:1px solid var(--gold-border)}
.rb-q-btns{display:flex;flex-direction:column;gap:3px;flex-shrink:0}

.rb-icon-btn{background:none;border:none;cursor:pointer;padding:4px 7px;border-radius:6px;font-size:11.5px;color:var(--ink3);transition:all 0.12s;font-family:'Cairo',sans-serif}
.rb-icon-btn:hover{background:var(--surface3);color:var(--ink)}
.rb-icon-btn.danger:hover{background:#fef2f2;color:#b91c1c}
.rb-icon-btn:disabled{opacity:0.4;cursor:not-allowed}

.rb-add-q-btn{width:100%;border:1.5px dashed var(--gold-border);background:none;border-radius:8px;padding:9px;font-size:12.5px;color:var(--gold);cursor:pointer;font-family:'Cairo',sans-serif;font-weight:600;transition:all 0.15s}
.rb-add-q-btn:hover{border-color:var(--gold);background:var(--gold-muted)}

.rb-add-module-row{display:flex;gap:8px;margin-top:4px}
.rb-add-stage-bar{background:var(--surface);border:1px solid var(--border);border-radius:var(--r2);padding:14px 18px;display:flex;gap:10px;align-items:center;box-shadow:var(--shadow)}

.rb-input{width:100%;border:1px solid var(--border2);border-radius:var(--r);padding:9px 13px;font-size:13.5px;font-family:'Cairo',sans-serif;color:var(--ink);outline:none;background:var(--surface);transition:border-color 0.15s}
.rb-input:focus{border-color:var(--red);box-shadow:0 0 0 3px var(--red-muted)}

.rb-btn-primary{background:var(--red);color:#fff;border:none;border-radius:var(--r);padding:10px 20px;font-size:13.5px;font-weight:700;cursor:pointer;font-family:'Cairo',sans-serif;white-space:nowrap;transition:all 0.15s}
.rb-btn-primary:hover:not(:disabled){background:var(--red-dark)}
.rb-btn-primary:disabled{opacity:0.5;cursor:not-allowed}
.rb-btn-primary.lg{padding:13px 36px;font-size:15px}

.rb-btn-ghost{background:var(--surface);color:var(--ink2);border:1px solid var(--border2);border-radius:var(--r);padding:10px 20px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:'Cairo',sans-serif;white-space:nowrap;transition:all 0.15s}
.rb-btn-ghost:hover{border-color:var(--red);color:var(--red)}
.rb-btn-ghost.sm{padding:8px 16px;font-size:13px}
.rb-btn-ghost:disabled{opacity:0.5;cursor:not-allowed}

.rb-btn-danger-sm{font-size:12px;color:var(--red);background:none;border:1px solid var(--red-border);border-radius:7px;padding:5px 12px;cursor:pointer;font-family:'Cairo',sans-serif;white-space:nowrap;transition:all 0.15s}
.rb-btn-danger-sm:hover{background:var(--red-muted)}

.rb-empty-state{background:var(--surface);border:1px solid var(--border);border-radius:var(--r2);padding:60px 32px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px;animation:fadeUp 0.4s ease}
.rb-empty-state.sm{padding:32px}
.rb-empty-icon{font-size:44px}
.rb-empty-icon.sm{font-size:28px}
.rb-empty-title{font-size:18px;font-weight:800;color:var(--black)}
.rb-empty-sub{font-size:13px;color:var(--ink3)}

.rb-overlay{position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;background:rgba(11,11,12,0.5);backdrop-filter:blur(4px);padding:16px}
.rb-modal{background:var(--surface);border-radius:20px;width:100%;max-width:500px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(11,11,12,0.25);animation:modalIn 0.2s ease}
.rb-modal-top{display:flex;align-items:center;justify-content:space-between;padding:22px 24px 0}
.rb-modal-title{font-size:17px;font-weight:800;color:var(--black)}
.rb-close-btn{background:none;border:none;cursor:pointer;color:var(--ink3);font-size:17px;padding:4px 6px;border-radius:7px;line-height:1;transition:all 0.12s}
.rb-close-btn:hover{background:var(--surface3);color:var(--ink)}
.rb-modal-body{padding:18px 24px;display:flex;flex-direction:column;gap:16px}
.rb-modal-footer{display:flex;gap:8px;justify-content:flex-start;padding:14px 24px 22px;border-top:1px solid var(--border)}

.rb-field-group{display:flex;flex-direction:column;gap:7px}
.rb-label{font-size:11.5px;font-weight:700;color:var(--ink2);letter-spacing:0.03em;text-transform:uppercase}
.rb-label-hint{font-size:11px;color:var(--ink3);font-weight:400;text-transform:none}
.rb-type-row{display:flex;gap:8px}
.rb-type-btn{flex:1;padding:10px;border:1.5px solid var(--border2);border-radius:var(--r);font-size:13px;font-weight:600;cursor:pointer;background:var(--surface);color:var(--ink2);font-family:'Cairo',sans-serif;transition:all 0.15s}
.rb-type-btn.active{background:var(--red-muted);color:var(--red);border-color:var(--red)}
.rb-textarea{width:100%;border:1px solid var(--border2);border-radius:var(--r);padding:10px 13px;font-family:'Cairo',sans-serif;font-size:13.5px;color:var(--ink);outline:none;resize:vertical;line-height:1.6;background:var(--surface);transition:border-color 0.15s}
.rb-textarea:focus{border-color:var(--red);box-shadow:0 0 0 3px var(--red-muted)}

.rb-options-list{display:flex;flex-direction:column;gap:8px}
.rb-opt-row{display:flex;align-items:center;gap:9px}
.rb-opt-radio{width:20px;height:20px;border-radius:50%;border:2px solid var(--border2);cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all 0.15s;background:var(--surface);position:relative}
.rb-opt-radio.sel{border-color:var(--red);background:var(--red)}
.rb-opt-radio.sel::after{content:'';width:7px;height:7px;background:#fff;border-radius:50%;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}
.rb-opt-input{flex:1;border:1px solid var(--border2);border-radius:var(--r);padding:9px 12px;font-family:'Cairo',sans-serif;font-size:13.5px;color:var(--ink);outline:none;background:var(--surface);transition:all 0.15s}
.rb-opt-input:focus{border-color:var(--red)}
.rb-opt-input.correct{border-color:var(--gold);background:var(--gold-muted)}

.rb-tf-row{display:flex;gap:10px}
.rb-tf-btn{flex:1;padding:12px;border:1.5px solid var(--border2);border-radius:var(--r);font-size:14px;font-weight:700;cursor:pointer;background:var(--surface);font-family:'Cairo',sans-serif;transition:all 0.15s;display:flex;align-items:center;justify-content:center;gap:7px;color:var(--ink3)}
.rb-tf-btn.true-btn.sel{background:var(--gold-muted);color:#7a5a20;border-color:var(--gold)}
.rb-tf-btn.false-btn.sel{background:var(--red-muted);color:var(--red);border-color:var(--red)}

.rb-error{background:#fef2f2;border:1px solid #fecaca;color:#b91c1c;font-size:12.5px;padding:9px 13px;border-radius:8px;font-weight:500}
`;
