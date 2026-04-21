"use client";
export const dynamic = 'force-dynamic';

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
  MCQ: "Ø§Ø®ØªÙŠØ§Ø± Ù…Ù† Ù…ØªØ¹Ø¯Ø¯",
  TF: "ØµØ­ Ø£Ùˆ Ø®Ø·Ø£",
  WRITTEN: "Ø¥Ø¬Ø§Ø¨Ø© Ù…ÙƒØªÙˆØ¨Ø©",
};
const TYPE_COLORS: Record<QuestionType, string> = {
  MCQ: "#1a4fa0",
  TF: "#0d7c4f",
  WRITTEN: "#b45309",
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
  const [newTitle, setNewTitle] = useState("Ø§Ø®ØªØ¨Ø§Ø± Ø§Ù„Ù‚Ø¨ÙˆÙ„ ÙÙŠ Ø§Ù„Ù…Ù†ØµØ©");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("add");
  const [editingQId, setEditingQId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

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
    if (d.assessment) setAssessment({ ...d.assessment, questions: [] });
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
        body.correct_answer = form.correct_answer;
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
        if (d.question)
          setAssessment((a) =>
            a ? { ...a, questions: [...a.questions, d.question] } : a,
          );
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
        if (d.question)
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
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteQuestion(qid: string) {
    if (!confirm("Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø­Ø°Ù Ù‡Ø°Ø§ Ø§Ù„Ø³Ø¤Ø§Ù„ØŸ")) return;
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
        <span>Ø¬Ø§Ø±Ù Ø§Ù„ØªØ­Ù…ÙŠÙ„â€¦</span>
      </div>
    );

  if (!assessment) {
    return (
      <div className="ia-page" dir="rtl">
        <div className="ia-page-header">
          <h1 className="ia-page-title">Ø§Ø®ØªØ¨Ø§Ø± Ø§Ù„Ù‚Ø¨ÙˆÙ„</h1>
          <p className="ia-page-sub">Ù„Ù… ÙŠØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø§Ø®ØªØ¨Ø§Ø± Ø§Ù„Ù‚Ø¨ÙˆÙ„ Ø¨Ø¹Ø¯.</p>
        </div>
        <div className="create-card">
          <div className="create-icon-wrap">
            <svg
              width="32"
              height="32"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 12h6M9 16h4" />
            </svg>
          </div>
          <h2 className="create-title">Ø¥Ù†Ø´Ø§Ø¡ Ø§Ø®ØªØ¨Ø§Ø± Ø§Ù„Ù‚Ø¨ÙˆÙ„</h2>
          <p className="create-desc">
            Ø³ÙŠØªÙ… Ø¥Ø¬Ø±Ø§Ø¡ Ù‡Ø°Ø§ Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø± Ù„Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø·Ù„Ø§Ø¨ Ø§Ù„Ø¬Ø¯Ø¯ Ù‚Ø¨Ù„ ØªØ¹ÙŠÙŠÙ†Ù‡Ù… ÙÙŠ Ø§Ù„Ù…Ø¯Ø±Ø³Ø©
            Ø§Ù„Ù…Ù†Ø§Ø³Ø¨Ø©. ÙŠØ¯Ø¹Ù… Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø± Ø£Ø³Ø¦Ù„Ø© Ø§Ù„Ø§Ø®ØªÙŠØ§Ø± Ù…Ù† Ù…ØªØ¹Ø¯Ø¯ØŒ ÙˆØµØ­ Ø£Ùˆ Ø®Ø·Ø£ØŒ
            ÙˆØ§Ù„Ø¥Ø¬Ø§Ø¨Ø§Øª Ø§Ù„Ù…ÙƒØªÙˆØ¨Ø©.
          </p>
          <div className="create-input-wrap">
            <label className="field-label">Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø±</label>
            <input
              className="ia-input"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ø£Ø¯Ø®Ù„ Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø±"
            />
          </div>
          <button
            className="ia-btn primary"
            onClick={handleCreate}
            disabled={creating || !newTitle.trim()}
          >
            {creating ? "Ø¬Ø§Ø±Ù Ø§Ù„Ø¥Ù†Ø´Ø§Ø¡â€¦" : "Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø±"}
          </button>
        </div>
        <style>{sharedStyles}</style>
      </div>
    );
  }

  return (
    <div className="ia-page" dir="rtl">
      {/* Header */}
      <div className="ia-page-header">
        <div className="ia-title-area">
          {editingTitle ? (
            <div className="title-edit-row">
              <input
                className="ia-input title-input"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                autoFocus
              />
              <button className="ia-btn primary sm" onClick={handleTitleSave}>
                Ø­ÙØ¸
              </button>
              <button
                className="ia-btn ghost sm"
                onClick={() => setEditingTitle(false)}
              >
                Ø¥Ù„ØºØ§Ø¡
              </button>
            </div>
          ) : (
            <div className="title-display-row">
              <h1 className="ia-page-title">{assessment.title}</h1>
              <button
                className="icon-btn"
                onClick={() => {
                  setTitleDraft(assessment.title);
                  setEditingTitle(true);
                }}
                title="ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ø¹Ù†ÙˆØ§Ù†"
              >
                <svg
                  width="13"
                  height="13"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>
          )}
          <div className="ia-meta-row">
            <div
              className={`active-badge ${assessment.is_active ? "active" : "inactive"}`}
            >
              <div className="active-dot" />
              {assessment.is_active ? "Ù†Ø´Ø·" : "ØºÙŠØ± Ù†Ø´Ø·"}
            </div>
            <button className="ia-btn ghost sm" onClick={handleToggleActive}>
              {assessment.is_active ? "Ø¥ÙŠÙ‚Ø§Ù Ø§Ù„ØªÙØ¹ÙŠÙ„" : "ØªÙØ¹ÙŠÙ„"}
            </button>
            <span className="ia-count">{assessment.questions.length} Ø³Ø¤Ø§Ù„</span>
          </div>
        </div>
        <button className="add-q-top-btn" onClick={openAdd}>
          <svg
            width="15"
            height="15"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Ø¥Ø¶Ø§ÙØ© Ø³Ø¤Ø§Ù„
        </button>
      </div>

      {/* Question list */}
      <div className="q-list">
        {assessment.questions.length === 0 && (
          <div className="q-empty">
            <svg
              width="40"
              height="40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
              style={{ color: "var(--text3)", marginBottom: 8 }}
            >
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 12h6M9 16h4" />
            </svg>
            <p>Ù„Ø§ ØªÙˆØ¬Ø¯ Ø£Ø³Ø¦Ù„Ø© Ø¨Ø¹Ø¯. Ø£Ø¶Ù Ø³Ø¤Ø§Ù„Ùƒ Ø§Ù„Ø£ÙˆÙ„ Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ø²Ø± Ø£Ø¹Ù„Ø§Ù‡.</p>
          </div>
        )}
        {assessment.questions.map((q, idx) => (
          <div key={q.id} className="q-card">
            <div className="q-card-header">
              <div className="q-num">Ø³{idx + 1}</div>
              <div
                className="q-type-badge"
                style={{ "--type-color": TYPE_COLORS[q.type] } as any}
              >
                {TYPE_LABELS[q.type]}
              </div>
              <div className="q-actions">
                <button
                  className="icon-btn"
                  onClick={() => openEdit(q)}
                  title="ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ø³Ø¤Ø§Ù„"
                >
                  <svg
                    width="13"
                    height="13"
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
                  title="Ø­Ø°Ù Ø§Ù„Ø³Ø¤Ø§Ù„"
                >
                  <svg
                    width="13"
                    height="13"
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
                        width="11"
                        height="11"
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
                Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø© Ø§Ù„ØµØ­ÙŠØ­Ø©:{" "}
                <strong>
                  {q.correct_answer === "true" ? "ØµØ­ âœ“" : "Ø®Ø·Ø£ âœ“"}
                </strong>
              </div>
            )}
            {q.type === "WRITTEN" && (
              <div className="q-written-note">
                <svg
                  width="11"
                  height="11"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                ÙŠØªÙ… ØªØµØ­ÙŠØ­ Ù‡Ø°Ø§ Ø§Ù„Ø³Ø¤Ø§Ù„ ÙŠØ¯ÙˆÙŠØ§Ù‹ Ù…Ù† Ù‚ÙØ¨Ù„ Ø§Ù„Ù…Ø§Ù„Ùƒ
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom add button */}
      {assessment.questions.length > 0 && (
        <button className="add-q-btn" onClick={openAdd}>
          <svg
            width="15"
            height="15"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Ø¥Ø¶Ø§ÙØ© Ø³Ø¤Ø§Ù„ Ø¢Ø®Ø±
        </button>
      )}

      {/* Modal */}
      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">
                {modalMode === "add" ? "Ø¥Ø¶Ø§ÙØ© Ø³Ø¤Ø§Ù„ Ø¬Ø¯ÙŠØ¯" : "ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ø³Ø¤Ø§Ù„"}
              </h2>
              <button className="icon-btn" onClick={() => setModalOpen(false)}>
                <svg
                  width="15"
                  height="15"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="modal-field">
              <label className="field-label">Ù†ÙˆØ¹ Ø§Ù„Ø³Ø¤Ø§Ù„</label>
              <div className="type-selector">
                {(["MCQ", "TF", "WRITTEN"] as QuestionType[]).map((t) => (
                  <button
                    key={t}
                    className={`type-btn ${form.type === t ? "selected" : ""}`}
                    style={{ "--type-color": TYPE_COLORS[t] } as any}
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

            <div className="modal-field">
              <label className="field-label">Ù†Øµ Ø§Ù„Ø³Ø¤Ø§Ù„</label>
              <textarea
                className="ia-textarea"
                placeholder="Ø§ÙƒØªØ¨ Ø§Ù„Ø³Ø¤Ø§Ù„ Ù‡Ù†Ø§â€¦"
                value={form.text}
                onChange={(e) =>
                  setForm((f) => ({ ...f, text: e.target.value }))
                }
                rows={3}
              />
            </div>

            {form.type === "MCQ" && (
              <div className="modal-field">
                <label className="field-label">
                  Ø®ÙŠØ§Ø±Ø§Øª Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø©{" "}
                  <span className="field-hint">(Ø­Ø¯Ø¯ Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø© Ø§Ù„ØµØ­ÙŠØ­Ø©)</span>
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
                        title="ØªØ­Ø¯ÙŠØ¯ ÙƒØ¥Ø¬Ø§Ø¨Ø© ØµØ­ÙŠØ­Ø©"
                        type="button"
                      >
                        {form.correct_answer === o.text && o.text && (
                          <svg
                            width="9"
                            height="9"
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
                        placeholder={`Ø§Ù„Ø®ÙŠØ§Ø± ${i + 1}`}
                        value={o.text}
                        onChange={(e) => updateOption(i, e.target.value)}
                      />
                      {form.options.length > 2 && (
                        <button
                          className="icon-btn danger sm"
                          onClick={() => removeOption(i)}
                        >
                          <svg
                            width="11"
                            height="11"
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
                        width="12"
                        height="12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      Ø¥Ø¶Ø§ÙØ© Ø®ÙŠØ§Ø±
                    </button>
                  )}
                </div>
              </div>
            )}

            {form.type === "TF" && (
              <div className="modal-field">
                <label className="field-label">Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø© Ø§Ù„ØµØ­ÙŠØ­Ø©</label>
                <div className="tf-selector">
                  {[
                    { val: "true", label: "âœ“ ØµØ­" },
                    { val: "false", label: "âœ— Ø®Ø·Ø£" },
                  ].map(({ val, label }) => (
                    <button
                      key={val}
                      className={`tf-btn ${form.correct_answer === val ? "selected" : ""}`}
                      onClick={() =>
                        setForm((f) => ({ ...f, correct_answer: val }))
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {form.type === "WRITTEN" && (
              <div className="modal-written-note">
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
                Ø§Ù„Ø£Ø³Ø¦Ù„Ø© Ø§Ù„Ù…ÙƒØªÙˆØ¨Ø© ÙŠØªÙ… ØªØµØ­ÙŠØ­Ù‡Ø§ ÙŠØ¯ÙˆÙŠØ§Ù‹ Ù…Ù† Ù‚ÙØ¨Ù„Ùƒ Ø¹Ù†Ø¯ Ù…Ø±Ø§Ø¬Ø¹Ø©
                Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø§Øª.
              </div>
            )}

            <div className="modal-actions">
              <button
                className="ia-btn ghost"
                onClick={() => setModalOpen(false)}
              >
                Ø¥Ù„ØºØ§Ø¡
              </button>
              <button
                className="ia-btn primary"
                onClick={handleSaveQuestion}
                disabled={saving || !form.text.trim()}
              >
                {saving
                  ? "Ø¬Ø§Ø±Ù Ø§Ù„Ø­ÙØ¸â€¦"
                  : modalMode === "add"
                    ? "Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ø³Ø¤Ø§Ù„"
                    : "Ø­ÙØ¸ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„Ø§Øª"}
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
  .ia-page { display: flex; flex-direction: column; gap: 22px; }
  .ia-loading { display:flex; align-items:center; justify-content:center; gap:12px; height:220px; color:var(--text2); font-size:14px; }
  .spinner { width:20px; height:20px; border:2px solid var(--border2); border-top-color:var(--accent); border-radius:50%; animation:spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .ia-page-header {
    display:flex; align-items:flex-start; justify-content:space-between; gap:16px; flex-wrap:wrap;
    padding-bottom:20px; border-bottom:1px solid var(--border);
  }
  .ia-title-area { display:flex; flex-direction:column; gap:10px; }
  .title-display-row { display:flex; align-items:center; gap:10px; }
  .title-edit-row { display:flex; align-items:center; gap:8px; }
  .ia-page-title { font-size:24px; font-weight:800; color:var(--text); letter-spacing:-0.4px; }
  .ia-page-sub { font-size:13.5px; color:var(--text2); font-weight:500; }
  .ia-meta-row { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
  .ia-count { font-size:12px; color:var(--text3); font-weight:600; font-family:'IBM Plex Mono',monospace; }

  .active-badge {
    display:flex; align-items:center; gap:6px; font-size:12px; font-weight:700;
    padding:4px 12px; border-radius:20px; border:1px solid;
  }
  .active-badge.active { background:var(--success-bg); color:var(--success); border-color:rgba(13,124,79,0.2); }
  .active-badge.inactive { background:var(--danger-bg); color:var(--danger); border-color:rgba(192,57,43,0.2); }
  .active-dot { width:6px; height:6px; border-radius:50%; background:currentColor; }

  .add-q-top-btn {
    display:flex; align-items:center; gap:8px;
    background:var(--accent); color:white;
    padding:10px 18px; border-radius:var(--radius);
    border:none; cursor:pointer; font-size:13px; font-weight:700;
    font-family:'Cairo',sans-serif; transition:opacity 0.15s;
    box-shadow:0 2px 8px rgba(26,79,160,0.25); white-space:nowrap;
  }
  .add-q-top-btn:hover { opacity:0.88; }

  .create-card {
    background:var(--surface); border:1px dashed var(--border2); border-radius:12px;
    padding:48px 36px; display:flex; flex-direction:column; align-items:center;
    gap:16px; text-align:center; max-width:520px; margin:0 auto;
    box-shadow:var(--shadow-sm);
  }
  .create-icon-wrap {
    width:72px; height:72px; border-radius:18px;
    background:var(--accent-muted2); color:var(--accent);
    display:flex; align-items:center; justify-content:center;
  }
  .create-title { font-size:20px; font-weight:800; color:var(--text); }
  .create-desc { font-size:13px; color:var(--text2); line-height:1.7; max-width:380px; }
  .create-input-wrap { width:100%; display:flex; flex-direction:column; gap:7px; text-align:right; }

  .ia-input {
    background:var(--surface); border:1px solid var(--border2);
    color:var(--text); border-radius:8px; padding:10px 13px;
    font-size:13.5px; font-family:'Cairo',sans-serif; outline:none; width:100%;
    transition:border-color 0.15s, box-shadow 0.15s;
  }
  .ia-input:focus { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-muted); }
  .title-input { font-size:16px; font-weight:700; }
  .ia-textarea {
    background:var(--surface); border:1px solid var(--border2);
    color:var(--text); border-radius:8px; padding:11px 13px;
    font-size:13.5px; font-family:'Cairo',sans-serif; outline:none; width:100%;
    resize:vertical; line-height:1.6; transition:border-color 0.15s, box-shadow 0.15s;
  }
  .ia-textarea:focus { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-muted); }

  .ia-btn {
    display:inline-flex; align-items:center; gap:7px;
    padding:10px 20px; border-radius:8px; font-size:13px; font-weight:700;
    cursor:pointer; border:none; transition:all 0.15s; font-family:'Cairo',sans-serif;
  }
  .ia-btn.primary { background:var(--accent); color:white; box-shadow:0 2px 6px rgba(26,79,160,0.2); }
  .ia-btn.primary:hover:not(:disabled) { opacity:0.88; }
  .ia-btn.primary:disabled { opacity:0.4; cursor:not-allowed; }
  .ia-btn.ghost { background:none; border:1px solid var(--border2); color:var(--text2); }
  .ia-btn.ghost:hover { border-color:var(--accent); color:var(--accent); }
  .ia-btn.sm { padding:6px 13px; font-size:12px; }

  .icon-btn {
    background:none; border:1px solid var(--border); color:var(--text3);
    width:30px; height:30px; border-radius:7px;
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; transition:all 0.15s; flex-shrink:0;
  }
  .icon-btn:hover { border-color:var(--accent); color:var(--accent); background:var(--accent-muted); }
  .icon-btn.danger:hover { border-color:var(--danger); color:var(--danger); background:var(--danger-bg); }
  .icon-btn:disabled { opacity:0.4; cursor:not-allowed; }

  /* Questions */
  .q-list { display:flex; flex-direction:column; gap:10px; }
  .q-empty {
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    text-align:center; color:var(--text3); padding:48px;
    background:var(--surface); border:1px dashed var(--border2); border-radius:10px;
    font-size:13.5px; line-height:1.6;
  }
  .q-card {
    background:var(--surface); border:1px solid var(--border); border-radius:10px;
    padding:18px 20px; display:flex; flex-direction:column; gap:12px;
    box-shadow:var(--shadow-sm); transition:box-shadow 0.15s;
  }
  .q-card:hover { box-shadow:var(--shadow); }
  .q-card-header { display:flex; align-items:center; gap:10px; }
  .q-num {
    font-size:11px; font-weight:800; color:var(--accent);
    font-family:'IBM Plex Mono',monospace; background:var(--accent-muted);
    padding:3px 9px; border-radius:5px; border:1px solid var(--accent-muted2);
  }
  .q-type-badge {
    font-size:11px; font-weight:700;
    color:var(--type-color,var(--accent));
    background:color-mix(in srgb,var(--type-color,var(--accent)) 10%,transparent);
    border:1px solid color-mix(in srgb,var(--type-color,var(--accent)) 25%,transparent);
    padding:3px 10px; border-radius:5px;
  }
  .q-actions { margin-right:auto; display:flex; gap:6px; }
  .q-text { font-size:14px; color:var(--text); line-height:1.65; font-weight:500; }
  .q-options { display:flex; flex-wrap:wrap; gap:7px; }
  .q-option {
    font-size:12.5px; padding:5px 12px; border-radius:6px;
    background:var(--surface3); border:1px solid var(--border); color:var(--text2);
    display:flex; align-items:center; gap:5px;
  }
  .q-option.correct {
    background:var(--success-bg); border-color:rgba(13,124,79,0.25); color:var(--success);
    font-weight:700;
  }
  .q-tf-answer { font-size:12.5px; color:var(--text2); font-weight:500; }
  .q-written-note {
    display:flex; align-items:center; gap:6px; font-size:12px;
    color:var(--warning); font-weight:600;
    background:var(--warning-bg); border:1px solid rgba(180,83,9,0.18);
    padding:7px 12px; border-radius:6px; width:fit-content;
  }

  .add-q-btn {
    display:flex; align-items:center; gap:8px; justify-content:center;
    background:none; border:1px dashed var(--border2); color:var(--text2);
    padding:13px; border-radius:10px; cursor:pointer; font-size:13px; font-weight:700;
    transition:all 0.15s; font-family:'Cairo',sans-serif; width:100%;
  }
  .add-q-btn:hover { border-color:var(--accent); color:var(--accent); background:var(--accent-muted); }

  /* Modal */
  .modal-overlay {
    position:fixed; inset:0; background:rgba(15,22,36,0.55);
    display:flex; align-items:center; justify-content:center;
    z-index:100; padding:20px; backdrop-filter:blur(2px);
  }
  .modal {
    background:var(--surface); border:1px solid var(--border2);
    border-radius:14px; padding:26px; width:100%; max-width:540px;
    display:flex; flex-direction:column; gap:20px;
    max-height:90vh; overflow-y:auto; box-shadow:var(--shadow-md);
  }
  .modal-header { display:flex; align-items:center; justify-content:space-between; }
  .modal-title { font-size:17px; font-weight:800; color:var(--text); }
  .modal-field { display:flex; flex-direction:column; gap:8px; }
  .field-label { font-size:12px; font-weight:700; color:var(--text2); text-transform:uppercase; letter-spacing:0.4px; }
  .field-hint { font-size:10.5px; color:var(--text3); font-weight:400; text-transform:none; letter-spacing:0; }

  .type-selector { display:flex; gap:8px; }
  .type-btn {
    flex:1; padding:9px 6px; border-radius:8px; font-size:12.5px; font-weight:700;
    cursor:pointer; border:1px solid var(--border2); background:var(--surface3); color:var(--text2);
    transition:all 0.15s; font-family:'Cairo',sans-serif;
  }
  .type-btn.selected {
    background:color-mix(in srgb,var(--type-color) 12%,transparent);
    border-color:color-mix(in srgb,var(--type-color) 50%,transparent);
    color:var(--type-color);
  }

  .options-list { display:flex; flex-direction:column; gap:8px; }
  .option-row { display:flex; align-items:center; gap:9px; }
  .correct-radio {
    width:22px; height:22px; border-radius:50%; border:2px solid var(--border2);
    background:none; cursor:pointer; display:flex; align-items:center; justify-content:center;
    color:var(--success); flex-shrink:0; transition:all 0.15s;
  }
  .correct-radio.selected { border-color:var(--success); background:var(--success-bg); }
  .option-input { flex:1; }
  .add-option-btn {
    display:flex; align-items:center; gap:6px;
    background:none; border:1px dashed var(--border2); color:var(--text3);
    padding:8px 13px; border-radius:7px; cursor:pointer; font-size:12.5px;
    font-family:'Cairo',sans-serif; transition:all 0.15s; width:fit-content; font-weight:600;
  }
  .add-option-btn:hover { border-color:var(--accent); color:var(--accent); }

  .tf-selector { display:flex; gap:10px; }
  .tf-btn {
    flex:1; padding:11px; border-radius:9px; font-size:14px; font-weight:800;
    cursor:pointer; border:1px solid var(--border2); background:var(--surface3); color:var(--text2);
    transition:all 0.15s; font-family:'Cairo',sans-serif;
  }
  .tf-btn.selected { background:var(--success-bg); border-color:rgba(13,124,79,0.4); color:var(--success); }

  .modal-written-note {
    display:flex; align-items:center; gap:9px;
    background:var(--warning-bg); border:1px solid rgba(180,83,9,0.2);
    color:var(--warning); font-size:13px; font-weight:600;
    padding:12px 14px; border-radius:8px;
  }
  .modal-actions { display:flex; justify-content:flex-end; gap:8px; padding-top:4px; border-top:1px solid var(--border); }
`;


