"use client";

import { useEffect, useState } from "react";

interface AssessmentOption {
  id: string;
  text: string;
  order: number;
}
interface AssessmentQuestion {
  id: string;
  type: "MCQ" | "TF" | "WRITTEN";
  text: string;
  correct_answer: string | null;
  order: number;
  options: AssessmentOption[];
}
interface Assessment {
  id: string;
  title: string;
  is_active: boolean;
  questions: AssessmentQuestion[];
}

type QuestionType = "MCQ" | "TF" | "WRITTEN";
type ModalMode = "add" | "edit";

const TYPE_LABELS: Record<QuestionType, string> = {
  MCQ: "Multiple Choice",
  TF: "True / False",
  WRITTEN: "Written",
};
const TYPE_COLORS: Record<QuestionType, string> = {
  MCQ: "#4f8ef7",
  TF: "#34d399",
  WRITTEN: "#fbbf24",
};

const EMPTY_FORM = {
  type: "MCQ" as QuestionType,
  text: "",
  correct_answer: "",
  options: [{ text: "" }, { text: "" }],
};

export default function OwnerIntakeAssessmentPage() {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("Platform Intake Assessment");

  // Question modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("add");
  const [editingQId, setEditingQId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Edit title inline
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");

  useEffect(() => {
    loadAssessment();
  }, []);

  async function loadAssessment() {
    setLoading(true);
    const r = await fetch("/api/owner/intake-assessment");
    const d = await r.json();
    setAssessment(d.assessment ?? null);
    setLoading(false);
  }

  async function handleCreate() {
    setCreating(true);
    const r = await fetch("/api/owner/intake-assessment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
    const d = await r.json();
    if (d.assessment) {
      setAssessment({ ...d.assessment, questions: [] });
    }
    setCreating(false);
  }

  async function handleTitleSave() {
    if (!assessment) return;
    await fetch(`/api/owner/intake-assessment/${assessment.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: titleDraft }),
    });
    setAssessment((a) => (a ? { ...a, title: titleDraft } : a));
    setEditingTitle(false);
  }

  async function handleToggleActive() {
    if (!assessment) return;
    await fetch(`/api/owner/intake-assessment/${assessment.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !assessment.is_active }),
    });
    setAssessment((a) => (a ? { ...a, is_active: !a.is_active } : a));
  }

  function openAdd() {
    setForm(EMPTY_FORM);
    setModalMode("add");
    setEditingQId(null);
    setModalOpen(true);
  }

  function openEdit(q: AssessmentQuestion) {
    setForm({
      type: q.type,
      text: q.text,
      correct_answer: q.correct_answer ?? "",
      options:
        q.options.length > 0
          ? q.options.map((o) => ({ text: o.text }))
          : [{ text: "" }, { text: "" }],
    });
    setModalMode("edit");
    setEditingQId(q.id);
    setModalOpen(true);
  }

  async function handleSaveQuestion() {
    if (!assessment) return;
    setSaving(true);
    try {
      const body: any = {
        type: form.type,
        text: form.text,
        correct_answer: form.correct_answer || null,
        options:
          form.type === "MCQ" ? form.options.filter((o) => o.text.trim()) : [],
      };

      if (form.type === "TF") {
        body.options = [];
        body.correct_answer = form.correct_answer; // "true" | "false"
      }

      if (modalMode === "add") {
        const r = await fetch(
          `/api/owner/intake-assessment/${assessment.id}/questions`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          },
        );
        const d = await r.json();
        if (d.question) {
          setAssessment((a) =>
            a ? { ...a, questions: [...a.questions, d.question] } : a,
          );
        }
      } else if (editingQId) {
        const r = await fetch(
          `/api/owner/intake-assessment/${assessment.id}/questions/${editingQId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          },
        );
        const d = await r.json();
        if (d.question) {
          setAssessment((a) =>
            a
              ? {
                  ...a,
                  questions: a.questions.map((q) =>
                    q.id === editingQId ? d.question : q,
                  ),
                }
              : a,
          );
        }
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteQuestion(qid: string) {
    if (!confirm("Delete this question?")) return;
    setDeleting(qid);
    await fetch(
      `/api/owner/intake-assessment/${assessment?.id}/questions/${qid}`,
      { method: "DELETE" },
    );
    setAssessment((a) =>
      a ? { ...a, questions: a.questions.filter((q) => q.id !== qid) } : a,
    );
    setDeleting(null);
  }

  const addOption = () =>
    setForm((f) => ({ ...f, options: [...f.options, { text: "" }] }));
  const removeOption = (i: number) =>
    setForm((f) => ({
      ...f,
      options: f.options.filter((_, idx) => idx !== i),
    }));
  const updateOption = (i: number, text: string) =>
    setForm((f) => ({
      ...f,
      options: f.options.map((o, idx) => (idx === i ? { text } : o)),
    }));

  if (loading)
    return (
      <div className="ia-loading">
        <div className="spinner" />
        Loading…
      </div>
    );

  // No assessment yet
  if (!assessment) {
    return (
      <div className="ia-page">
        <div className="ia-header">
          <h1 className="ia-title">Intake Assessment</h1>
          <p className="ia-sub">
            No platform intake assessment has been created yet.
          </p>
        </div>
        <div className="create-card">
          <div className="create-icon">📋</div>
          <h2 className="create-title">Create Intake Assessment</h2>
          <p className="create-desc">
            This assessment will be taken by all new students before they are
            assigned to a school. It supports MCQ, True/False, and Written
            questions.
          </p>
          <input
            className="ia-input"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Assessment title"
          />
          <button
            className="ia-btn primary"
            onClick={handleCreate}
            disabled={creating || !newTitle.trim()}
          >
            {creating ? "Creating…" : "Create Assessment"}
          </button>
        </div>
        <style>{sharedStyles}</style>
      </div>
    );
  }

  return (
    <div className="ia-page">
      <div className="ia-header">
        <div className="ia-title-row">
          {editingTitle ? (
            <div className="title-edit-row">
              <input
                className="ia-input title-input"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                autoFocus
              />
              <button className="ia-btn primary sm" onClick={handleTitleSave}>
                Save
              </button>
              <button
                className="ia-btn ghost sm"
                onClick={() => setEditingTitle(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <h1 className="ia-title">{assessment.title}</h1>
              <button
                className="icon-btn"
                onClick={() => {
                  setTitleDraft(assessment.title);
                  setEditingTitle(true);
                }}
                title="Edit title"
              >
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </>
          )}
        </div>
        <div className="ia-meta-row">
          <div
            className={`active-badge ${assessment.is_active ? "active" : "inactive"}`}
          >
            <div className="active-dot" />
            {assessment.is_active ? "Active" : "Inactive"}
          </div>
          <button className="ia-btn ghost sm" onClick={handleToggleActive}>
            {assessment.is_active ? "Deactivate" : "Activate"}
          </button>
          <span className="ia-count">
            {assessment.questions.length} question
            {assessment.questions.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Questions list */}
      <div className="q-list">
        {assessment.questions.length === 0 && (
          <div className="q-empty">
            No questions yet. Add your first question below.
          </div>
        )}
        {assessment.questions.map((q, idx) => (
          <div key={q.id} className="q-card">
            <div className="q-card-header">
              <div className="q-num">Q{idx + 1}</div>
              <div
                className={`q-type-badge`}
                style={{ "--type-color": TYPE_COLORS[q.type] } as any}
              >
                {TYPE_LABELS[q.type]}
              </div>
              <div className="q-actions">
                <button
                  className="icon-btn"
                  onClick={() => openEdit(q)}
                  title="Edit question"
                >
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  className="icon-btn danger"
                  onClick={() => handleDeleteQuestion(q.id)}
                  disabled={deleting === q.id}
                  title="Delete question"
                >
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="q-text">{q.text}</div>
            {q.type === "MCQ" && q.options.length > 0 && (
              <div className="q-options">
                {q.options.map((o) => (
                  <div
                    key={o.id}
                    className={`q-option ${o.text === q.correct_answer ? "correct" : ""}`}
                  >
                    {o.text === q.correct_answer && (
                      <svg
                        width="12"
                        height="12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {o.text}
                  </div>
                ))}
              </div>
            )}
            {q.type === "TF" && (
              <div className="q-tf-answer">
                Correct:{" "}
                <strong>
                  {q.correct_answer === "true" ? "True ✓" : "False ✓"}
                </strong>
              </div>
            )}
            {q.type === "WRITTEN" && (
              <div className="q-written-note">
                <svg
                  width="12"
                  height="12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                Manually graded by owner
              </div>
            )}
          </div>
        ))}
      </div>

      <button className="add-q-btn" onClick={openAdd}>
        <svg
          width="16"
          height="16"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add Question
      </button>

      {/* Modal */}
      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">
                {modalMode === "add" ? "Add Question" : "Edit Question"}
              </h2>
              <button className="icon-btn" onClick={() => setModalOpen(false)}>
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Question type selector */}
            <div className="modal-field">
              <label className="field-label">Question Type</label>
              <div className="type-selector">
                {(["MCQ", "TF", "WRITTEN"] as QuestionType[]).map((t) => (
                  <button
                    key={t}
                    className={`type-btn ${form.type === t ? "selected" : ""}`}
                    style={{ "--type-color": TYPE_COLORS[t] } as never}
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        type: t,
                        correct_answer: "",
                        options:
                          t === "MCQ" ? [{ text: "" }, { text: "" }] : [],
                      }))
                    }
                  >
                    {TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            {/* Question text */}
            <div className="modal-field">
              <label className="field-label">Question Text</label>
              <textarea
                className="ia-textarea"
                placeholder="Enter your question…"
                value={form.text}
                onChange={(e) =>
                  setForm((f) => ({ ...f, text: e.target.value }))
                }
                rows={3}
              />
            </div>

            {/* MCQ options */}
            {form.type === "MCQ" && (
              <div className="modal-field">
                <label className="field-label">
                  Options{" "}
                  <span className="field-hint">(mark the correct one)</span>
                </label>
                <div className="options-list">
                  {form.options.map((o, i) => (
                    <div key={i} className="option-row">
                      <button
                        className={`correct-radio ${form.correct_answer === o.text && o.text ? "selected" : ""}`}
                        onClick={() =>
                          o.text &&
                          setForm((f) => ({ ...f, correct_answer: o.text }))
                        }
                        title="Mark as correct"
                        type="button"
                      >
                        {form.correct_answer === o.text && o.text && (
                          <svg
                            width="10"
                            height="10"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                      <input
                        className="ia-input option-input"
                        placeholder={`Option ${i + 1}`}
                        value={o.text}
                        onChange={(e) => updateOption(i, e.target.value)}
                      />
                      {form.options.length > 2 && (
                        <button
                          className="icon-btn danger sm"
                          onClick={() => removeOption(i)}
                        >
                          <svg
                            width="12"
                            height="12"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  {form.options.length < 6 && (
                    <button className="add-option-btn" onClick={addOption}>
                      <svg
                        width="13"
                        height="13"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      Add Option
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* T/F answer */}
            {form.type === "TF" && (
              <div className="modal-field">
                <label className="field-label">Correct Answer</label>
                <div className="tf-selector">
                  {["true", "false"].map((val) => (
                    <button
                      key={val}
                      className={`tf-btn ${form.correct_answer === val ? "selected" : ""}`}
                      onClick={() =>
                        setForm((f) => ({ ...f, correct_answer: val }))
                      }
                    >
                      {val === "true" ? "✓ True" : "✗ False"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Written: no correct answer */}
            {form.type === "WRITTEN" && (
              <div className="modal-written-note">
                Written questions are manually graded by you during submission
                review.
              </div>
            )}

            <div className="modal-actions">
              <button
                className="ia-btn ghost"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="ia-btn primary"
                onClick={handleSaveQuestion}
                disabled={saving || !form.text.trim()}
              >
                {saving
                  ? "Saving…"
                  : modalMode === "add"
                    ? "Add Question"
                    : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{sharedStyles}</style>
    </div>
  );
}

const sharedStyles = `
  .ia-page { display: flex; flex-direction: column; gap: 24px; }
  .ia-loading { display: flex; align-items: center; gap: 12px; height: 200px; justify-content: center; color: var(--text2); font-size: 14px; }
  .spinner { width: 18px; height: 18px; border: 2px solid var(--border2); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .ia-header { display: flex; flex-direction: column; gap: 8px; }
  .ia-title-row { display: flex; align-items: center; gap: 10px; }
  .title-edit-row { display: flex; align-items: center; gap: 8px; flex: 1; }
  .ia-title { font-size: 22px; font-weight: 700; color: var(--text); letter-spacing: -0.4px; }
  .ia-sub { font-size: 13px; color: var(--text2); }
  .ia-meta-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .ia-count { font-size: 12px; color: var(--text3); margin-left: auto; }

  .active-badge { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 6px; }
  .active-badge.active { background: rgba(52,211,153,0.1); color: #34d399; }
  .active-badge.inactive { background: rgba(248,113,113,0.1); color: #f87171; }
  .active-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

  .create-card {
    background: var(--surface); border: 1px dashed var(--border2);
    border-radius: 16px; padding: 40px 32px;
    display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center;
    max-width: 480px; margin: 0 auto;
  }
  .create-icon { font-size: 48px; }
  .create-title { font-size: 18px; font-weight: 700; color: var(--text); }
  .create-desc { font-size: 13px; color: var(--text2); line-height: 1.6; }

  .ia-input {
    background: var(--surface2); border: 1px solid var(--border2);
    color: var(--text); border-radius: 8px; padding: 9px 12px;
    font-size: 13px; font-family: 'Sora', sans-serif; outline: none; width: 100%;
    transition: border-color 0.15s;
  }
  .ia-input:focus { border-color: var(--accent); }
  .title-input { font-size: 16px; font-weight: 600; }
  .ia-textarea {
    background: var(--surface2); border: 1px solid var(--border2);
    color: var(--text); border-radius: 8px; padding: 10px 12px;
    font-size: 13px; font-family: 'Sora', sans-serif; outline: none; width: 100%;
    resize: vertical; line-height: 1.5;
    transition: border-color 0.15s;
  }
  .ia-textarea:focus { border-color: var(--accent); }

  .ia-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 600;
    cursor: pointer; border: none; transition: all 0.15s; font-family: 'Sora', sans-serif;
  }
  .ia-btn.primary { background: var(--accent); color: white; }
  .ia-btn.primary:hover:not(:disabled) { opacity: 0.85; }
  .ia-btn.primary:disabled { opacity: 0.4; cursor: not-allowed; }
  .ia-btn.ghost { background: none; border: 1px solid var(--border2); color: var(--text2); }
  .ia-btn.ghost:hover { border-color: var(--accent); color: var(--accent); }
  .ia-btn.sm { padding: 6px 12px; font-size: 12px; }

  .icon-btn {
    background: none; border: 1px solid var(--border); color: var(--text3);
    width: 28px; height: 28px; border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.15s; flex-shrink: 0;
  }
  .icon-btn:hover { border-color: var(--accent); color: var(--accent); }
  .icon-btn.danger:hover { border-color: var(--danger); color: var(--danger); }
  .icon-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* Questions */
  .q-list { display: flex; flex-direction: column; gap: 10px; }
  .q-empty { text-align: center; color: var(--text3); padding: 32px; font-size: 13px;
    background: var(--surface); border: 1px dashed var(--border2); border-radius: 10px; }
  .q-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px 18px; display: flex; flex-direction: column; gap: 10px; }
  .q-card-header { display: flex; align-items: center; gap: 10px; }
  .q-num { font-size: 11px; font-weight: 700; color: var(--text3); font-family: 'JetBrains Mono', monospace; background: var(--surface2); padding: 3px 8px; border-radius: 5px; }
  .q-type-badge {
    font-size: 10.5px; font-weight: 600;
    color: var(--type-color, var(--accent));
    background: color-mix(in srgb, var(--type-color, var(--accent)) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--type-color, var(--accent)) 30%, transparent);
    padding: 2px 8px; border-radius: 5px;
  }
  .q-actions { margin-left: auto; display: flex; gap: 6px; }
  .q-text { font-size: 14px; color: var(--text); line-height: 1.5; }
  .q-options { display: flex; flex-wrap: wrap; gap: 6px; }
  .q-option {
    font-size: 12px; padding: 4px 10px; border-radius: 6px;
    background: var(--surface2); border: 1px solid var(--border);
    color: var(--text2); display: flex; align-items: center; gap: 5px;
  }
  .q-option.correct { background: rgba(52,211,153,0.1); border-color: rgba(52,211,153,0.3); color: #34d399; }
  .q-tf-answer { font-size: 12px; color: var(--text2); }
  .q-written-note { display: flex; align-items: center; gap: 5px; font-size: 11.5px; color: var(--warning); font-style: italic; }

  .add-q-btn {
    display: flex; align-items: center; gap: 8px; justify-content: center;
    background: none; border: 1px dashed var(--border2); color: var(--text2);
    padding: 12px; border-radius: 10px; cursor: pointer; font-size: 13px; font-weight: 600;
    transition: all 0.15s; font-family: 'Sora', sans-serif; width: 100%;
  }
  .add-q-btn:hover { border-color: var(--accent); color: var(--accent); }

  /* Modal */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7);
    display: flex; align-items: center; justify-content: center;
    z-index: 100; padding: 20px;
  }
  .modal {
    background: var(--surface); border: 1px solid var(--border2);
    border-radius: 16px; padding: 24px; width: 100%; max-width: 520px;
    display: flex; flex-direction: column; gap: 18px;
    max-height: 90vh; overflow-y: auto;
  }
  .modal-header { display: flex; align-items: center; justify-content: space-between; }
  .modal-title { font-size: 16px; font-weight: 700; color: var(--text); }
  .modal-field { display: flex; flex-direction: column; gap: 8px; }
  .field-label { font-size: 12px; font-weight: 600; color: var(--text2); text-transform: uppercase; letter-spacing: 0.5px; }
  .field-hint { font-size: 10.5px; color: var(--text3); font-weight: 400; text-transform: none; letter-spacing: 0; }

  .type-selector { display: flex; gap: 8px; }
  .type-btn {
    flex: 1; padding: 8px; border-radius: 8px; font-size: 12.5px; font-weight: 600;
    cursor: pointer; border: 1px solid var(--border2); background: var(--surface2); color: var(--text2);
    transition: all 0.15s; font-family: 'Sora', sans-serif;
  }
  .type-btn.selected {
    background: color-mix(in srgb, var(--type-color) 15%, transparent);
    border-color: var(--type-color); color: var(--type-color);
  }

  .options-list { display: flex; flex-direction: column; gap: 7px; }
  .option-row { display: flex; align-items: center; gap: 8px; }
  .correct-radio {
    width: 20px; height: 20px; border-radius: 50%; border: 2px solid var(--border2);
    background: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
    color: #34d399; flex-shrink: 0; transition: all 0.15s;
  }
  .correct-radio.selected { border-color: #34d399; background: rgba(52,211,153,0.1); }
  .option-input { flex: 1; }
  .add-option-btn {
    display: flex; align-items: center; gap: 6px;
    background: none; border: 1px dashed var(--border2); color: var(--text3);
    padding: 7px 12px; border-radius: 7px; cursor: pointer; font-size: 12px;
    font-family: 'Sora', sans-serif; transition: all 0.15s; width: fit-content;
  }
  .add-option-btn:hover { border-color: var(--accent); color: var(--accent); }

  .tf-selector { display: flex; gap: 10px; }
  .tf-btn {
    flex: 1; padding: 10px; border-radius: 9px; font-size: 13.5px; font-weight: 700;
    cursor: pointer; border: 1px solid var(--border2); background: var(--surface2); color: var(--text2);
    transition: all 0.15s; font-family: 'Sora', sans-serif;
  }
  .tf-btn.selected { background: rgba(52,211,153,0.1); border-color: #34d399; color: #34d399; }

  .modal-written-note {
    background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.2);
    color: #fbbf24; font-size: 12.5px; padding: 10px 14px; border-radius: 8px;
  }
  .modal-actions { display: flex; justify-content: flex-end; gap: 8px; padding-top: 4px; }
`;
