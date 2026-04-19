// school-admin/placement-assessment/page.tsx
"use client";

import { Suspense, use, useState, useTransition } from "react";

type QuestionType = "MCQ" | "TF" | "WRITTEN";

interface Option {
  id: string;
  text: string;
  order: number;
}

interface Question {
  id: string;
  type: QuestionType;
  text: string;
  correct_answer: string | null;
  order: number;
  options: Option[];
}

interface Assessment {
  id: string;
  title: string;
  is_active: boolean;
  questions: Question[];
}

const TYPE_LABELS: Record<QuestionType, string> = {
  MCQ: "Ø§Ø®ØªÙŠØ§Ø± Ù…Ù† Ù…ØªØ¹Ø¯Ø¯",
  TF: "ØµØ­ Ø£Ù… Ø®Ø·Ø£",
  WRITTEN: "Ù…ÙƒØªÙˆØ¨",
};

const TYPE_COLORS: Record<QuestionType, string> = {
  MCQ: "#2563eb",
  TF: "#10b981",
  WRITTEN: "#f59e0b",
};

const EMPTY_FORM = {
  type: "MCQ" as QuestionType,
  text: "",
  correct_answer: "",
  options: [{ text: "" }, { text: "" }],
};

async function loadAssessmentData(): Promise<Assessment | null> {
  const r = await fetch("/api/school-admin/placement-assessment");
  const d = await r.json();
  return d.assessment ?? null;
}

function PlacementAssessmentLoading() {
  return (
    <div className="pa-loading">
      <div className="spin" />
      Ø¬Ø§Ø±Ù Ø§Ù„ØªØ­Ù…ÙŠÙ„...
      <style>{`
        .pa-loading { display: flex; align-items: center; gap: 10px; height: 180px; justify-content: center; color: var(--text2); font-size: 14px; }
        .spin { width: 18px; height: 18px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: sp 0.7s linear infinite; }
        @keyframes sp { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function PlacementAssessmentContent({
  dataPromise,
  refresh,
}: {
  dataPromise: Promise<Assessment | null>;
  refresh: () => void;
}) {
  const assessment = use(dataPromise);
  const [newTitle, setNewTitle] = useState("Ø§Ø®ØªØ¨Ø§Ø± Ø§Ù„ØªØµÙ†ÙŠÙ Ø§Ù„Ù…Ø¯Ø±Ø³ÙŠ");
  const [creating, setCreating] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingQId, setEditingQId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleCreate() {
    setCreating(true);
    try {
      await fetch("/api/school-admin/placement-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      refresh();
    } finally {
      setCreating(false);
    }
  }

  async function handleTitleSave() {
    if (!assessment) return;
    await fetch(`/api/school-admin/placement-assessment/${assessment.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: titleDraft }),
    });
    setEditingTitle(false);
    refresh();
  }

  async function handleToggleActive() {
    if (!assessment) return;
    await fetch(`/api/school-admin/placement-assessment/${assessment.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !assessment.is_active }),
    });
    refresh();
  }

  function openAdd() {
    setForm(EMPTY_FORM);
    setModalMode("add");
    setEditingQId(null);
    setModalOpen(true);
  }

  function openEdit(q: Question) {
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

  async function handleSave() {
    if (!assessment) return;
    setSaving(true);
    try {
      const body: {
        type: QuestionType;
        text: string;
        correct_answer: string | null;
        options: { text: string }[];
      } = {
        type: form.type,
        text: form.text,
        correct_answer: form.correct_answer || null,
        options: [],
      };

      if (form.type === "MCQ") {
        body.options = form.options.filter((o) => o.text.trim());
      }

      if (modalMode === "add") {
        await fetch(
          `/api/school-admin/placement-assessment/${assessment.id}/questions`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          },
        );
      } else if (editingQId) {
        await fetch(
          `/api/school-admin/placement-assessment/${assessment.id}/questions/${editingQId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          },
        );
      }

      setModalOpen(false);
      refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(qid: string) {
    if (!assessment || !confirm("Ø­Ø°Ù Ù‡Ø°Ø§ Ø§Ù„Ø³Ø¤Ø§Ù„ØŸ")) return;
    setDeleting(qid);
    try {
      await fetch(
        `/api/school-admin/placement-assessment/${assessment.id}/questions/${qid}`,
        { method: "DELETE" },
      );
      refresh();
    } finally {
      setDeleting(null);
    }
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

  if (!assessment) {
    return (
      <div className="pa-page">
        <div className="pa-header">
          <h1 className="pa-title">Ø§Ø®ØªØ¨Ø§Ø± Ø§Ù„ØªØµÙ†ÙŠÙ</h1>
          <p className="pa-sub">
            Ù„Ù… ÙŠØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø§Ø®ØªØ¨Ø§Ø± ØªØµÙ†ÙŠÙ Ù„Ù…Ø¯Ø±Ø³ØªÙƒ Ø¨Ø¹Ø¯.
          </p>
        </div>
        <div className="create-card">
          <div className="create-icon">ðŸ“‹</div>
          <h2 className="create-title">Ø¥Ù†Ø´Ø§Ø¡ Ø§Ø®ØªØ¨Ø§Ø± Ø§Ù„ØªØµÙ†ÙŠÙ</h2>
          <p className="create-desc">
            Ù‡Ø°Ø§ Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø± ÙŠØ¬Ø±ÙŠÙ‡ Ø§Ù„Ø·Ù„Ø§Ø¨ Ø¨Ø¹Ø¯ ØªØ¹ÙŠÙŠÙ†Ù‡Ù… ÙÙŠ Ù…Ø¯Ø±Ø³ØªÙƒ Ù„ØªØ­Ø¯ÙŠØ¯ Ø§Ù„ÙØµÙ„ Ø§Ù„Ù…Ù†Ø§Ø³Ø¨.
          </p>
          <input
            className="pa-input"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø±"
            dir="rtl"
          />
          <button
            className="pa-btn primary"
            onClick={handleCreate}
            disabled={creating || !newTitle.trim()}
          >
            {creating ? "Ø¬Ø§Ø±Ù Ø§Ù„Ø¥Ù†Ø´Ø§Ø¡..." : "Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø±"}
          </button>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="pa-page">
      <div className="pa-header">
        <div className="pa-title-row">
          {editingTitle ? (
            <div className="title-edit">
              <input
                className="pa-input title-inp"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                autoFocus
                dir="rtl"
              />
              <button className="pa-btn primary sm" onClick={handleTitleSave}>
                Ø­ÙØ¸
              </button>
              <button
                className="pa-btn ghost sm"
                onClick={() => setEditingTitle(false)}
              >
                Ø¥Ù„ØºØ§Ø¡
              </button>
            </div>
          ) : (
            <>
              <h1 className="pa-title">{assessment.title}</h1>
              <button
                className="icon-btn"
                onClick={() => {
                  setTitleDraft(assessment.title);
                  setEditingTitle(true);
                }}
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
            </>
          )}
        </div>
        <div className="pa-meta">
          <div className={`active-badge ${assessment.is_active ? "on" : "off"}`}>
            <div className="active-dot" />
            {assessment.is_active ? "Ù…ÙØ¹Ù‘Ù„" : "Ù…Ø¹Ø·Ù‘Ù„"}
          </div>
          <button className="pa-btn ghost sm" onClick={handleToggleActive}>
            {assessment.is_active ? "ØªØ¹Ø·ÙŠÙ„" : "ØªÙØ¹ÙŠÙ„"}
          </button>
          <span className="q-count">{assessment.questions.length} Ø³Ø¤Ø§Ù„</span>
        </div>
      </div>

      <div className="q-list">
        {assessment.questions.length === 0 && (
          <div className="q-empty">Ù„Ø§ ØªÙˆØ¬Ø¯ Ø£Ø³Ø¦Ù„Ø© Ø¨Ø¹Ø¯. Ø£Ø¶Ù Ø£ÙˆÙ„ Ø³Ø¤Ø§Ù„.</div>
        )}
        {assessment.questions.map((q, idx) => (
          <div key={q.id} className="q-card">
            <div className="q-card-top">
              <span className="q-num">Ø³{idx + 1}</span>
              <span
                className="q-type"
                style={{
                  color: TYPE_COLORS[q.type],
                  background: `${TYPE_COLORS[q.type]}15`,
                }}
              >
                {TYPE_LABELS[q.type]}
              </span>
              <div className="q-actions">
                <button className="icon-btn" onClick={() => openEdit(q)}>
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
                  onClick={() => handleDelete(q.id)}
                  disabled={deleting === q.id}
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
                    <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="q-text">{q.text}</div>
            {q.type === "MCQ" && q.options.length > 0 && (
              <div className="q-opts">
                {q.options.map((o) => (
                  <div
                    key={o.id}
                    className={`q-opt ${o.text === q.correct_answer ? "correct" : ""}`}
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
              <div className="q-tf">
                Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø©:{" "}
                <strong>{q.correct_answer === "true" ? "ØµØ­ âœ“" : "Ø®Ø·Ø£ âœ—"}</strong>
              </div>
            )}
            {q.type === "WRITTEN" && (
              <div className="q-written">
                ÙŠÙØµØ­ÙŽÙ‘Ø­ ÙŠØ¯ÙˆÙŠØ§Ù‹ Ø¨ÙˆØ§Ø³Ø·Ø© Ø§Ù„Ù…Ø¯ÙŠØ±
              </div>
            )}
          </div>
        ))}
      </div>

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
        Ø¥Ø¶Ø§ÙØ© Ø³Ø¤Ø§Ù„
      </button>

      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div className="modal" dir="rtl">
            <div className="modal-head">
              <h2 className="modal-title">
                {modalMode === "add" ? "Ø¥Ø¶Ø§ÙØ© Ø³Ø¤Ø§Ù„" : "ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ø³Ø¤Ø§Ù„"}
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
              <div className="type-btns">
                {(["MCQ", "TF", "WRITTEN"] as QuestionType[]).map((t) => (
                  <button
                    key={t}
                    className={`type-btn ${form.type === t ? "sel" : ""}`}
                    style={{ "--tc": TYPE_COLORS[t] } as React.CSSProperties}
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        type: t,
                        correct_answer: "",
                        options: t === "MCQ" ? [{ text: "" }, { text: "" }] : [],
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
                className="pa-textarea"
                placeholder="Ø§ÙƒØªØ¨ Ø§Ù„Ø³Ø¤Ø§Ù„ Ù‡Ù†Ø§..."
                value={form.text}
                onChange={(e) =>
                  setForm((f) => ({ ...f, text: e.target.value }))
                }
                rows={3}
                dir="rtl"
              />
            </div>

            {form.type === "MCQ" && (
              <div className="modal-field">
                <label className="field-label">
                  Ø§Ù„Ø®ÙŠØ§Ø±Ø§Øª{" "}
                  <span className="field-hint">(Ø§Ø®ØªØ± Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø© Ø§Ù„ØµØ­ÙŠØ­Ø©)</span>
                </label>
                <div className="opts-list">
                  {form.options.map((o, i) => (
                    <div key={i} className="opt-row">
                      <button
                        className={`correct-radio ${form.correct_answer === o.text && o.text ? "sel" : ""}`}
                        type="button"
                        onClick={() =>
                          o.text &&
                          setForm((f) => ({ ...f, correct_answer: o.text }))
                        }
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
                        className="pa-input opt-inp"
                        placeholder={`Ø®ÙŠØ§Ø± ${i + 1}`}
                        value={o.text}
                        onChange={(e) => updateOption(i, e.target.value)}
                        dir="rtl"
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
                    <button className="add-opt-btn" onClick={addOption}>
                      + Ø¥Ø¶Ø§ÙØ© Ø®ÙŠØ§Ø±
                    </button>
                  )}
                </div>
              </div>
            )}

            {form.type === "TF" && (
              <div className="modal-field">
                <label className="field-label">Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø© Ø§Ù„ØµØ­ÙŠØ­Ø©</label>
                <div className="tf-btns">
                  {[
                    { val: "true", label: "âœ“ ØµØ­ÙŠØ­" },
                    { val: "false", label: "âœ— Ø®Ø·Ø£" },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      className={`tf-btn ${form.correct_answer === opt.val ? "sel" : ""} ${opt.val}`}
                      onClick={() =>
                        setForm((f) => ({ ...f, correct_answer: opt.val }))
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {form.type === "WRITTEN" && (
              <div className="written-note">
                ÙŠÙØµØ­ÙŽÙ‘Ø­ Ù‡Ø°Ø§ Ø§Ù„Ø³Ø¤Ø§Ù„ ÙŠØ¯ÙˆÙŠØ§Ù‹ Ø£Ø«Ù†Ø§Ø¡ Ù…Ø±Ø§Ø¬Ø¹Ø© Ø§Ù„Ù†ØªØ§Ø¦Ø¬.
              </div>
            )}

            <div className="modal-actions">
              <button className="pa-btn ghost" onClick={() => setModalOpen(false)}>
                Ø¥Ù„ØºØ§Ø¡
              </button>
              <button
                className="pa-btn primary"
                onClick={handleSave}
                disabled={saving || !form.text.trim()}
              >
                {saving
                  ? "Ø¬Ø§Ø±Ù Ø§Ù„Ø­ÙØ¸..."
                  : modalMode === "add"
                    ? "Ø¥Ø¶Ø§ÙØ©"
                    : "Ø­ÙØ¸ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„Ø§Øª"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{styles}</style>
    </div>
  );
}

export default function PlacementAssessmentPage() {
  const [dataPromise, setDataPromise] = useState<Promise<Assessment | null>>(
    () => loadAssessmentData(),
  );
  const [, startTransition] = useTransition();

  function refresh() {
    startTransition(() => {
      setDataPromise(loadAssessmentData());
    });
  }

  return (
    <Suspense fallback={<PlacementAssessmentLoading />}>
      <PlacementAssessmentContent dataPromise={dataPromise} refresh={refresh} />
    </Suspense>
  );
}

const styles = `
  .pa-page { display: flex; flex-direction: column; gap: 20px; }
  .pa-header { display: flex; flex-direction: column; gap: 8px; }
  .pa-title-row { display: flex; align-items: center; gap: 10px; }
  .title-edit { display: flex; align-items: center; gap: 8px; flex: 1; }
  .pa-title { font-size: 21px; font-weight: 800; color: var(--text); }
  .pa-sub { font-size: 13px; color: var(--text2); }
  .pa-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .q-count { font-size: 12px; color: var(--text3); margin-right: auto; }

  .active-badge { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 6px; }
  .active-badge.on { background: rgba(16,185,129,0.1); color: #10b981; }
  .active-badge.off { background: rgba(239,68,68,0.1); color: #ef4444; }
  .active-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

  .create-card {
    background: var(--surface); border: 1px dashed var(--border2); border-radius: 16px;
    padding: 36px 28px; max-width: 460px; margin: 0 auto;
    display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center;
  }
  .create-icon { font-size: 44px; }
  .create-title { font-size: 17px; font-weight: 800; color: var(--text); }
  .create-desc { font-size: 13px; color: var(--text2); line-height: 1.6; }

  .pa-input {
    width: 100%; padding: 9px 12px; background: var(--surface2);
    border: 1.5px solid var(--border); border-radius: 8px;
    color: var(--text); font-size: 13px; font-family: 'Tajawal', sans-serif;
    outline: none; transition: border-color 0.15s;
  }
  .pa-input:focus { border-color: var(--accent); }
  .title-inp { font-size: 16px; font-weight: 700; }
  .pa-textarea {
    width: 100%; padding: 10px 12px; background: var(--surface2);
    border: 1.5px solid var(--border); border-radius: 8px;
    color: var(--text); font-size: 13px; font-family: 'Tajawal', sans-serif;
    outline: none; resize: vertical; line-height: 1.6; transition: border-color 0.15s;
  }
  .pa-textarea:focus { border-color: var(--accent); }

  .pa-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 16px; border-radius: 8px; font-size: 13px; font-weight: 700;
    cursor: pointer; border: none; transition: all 0.15s;
    font-family: 'Tajawal', sans-serif;
  }
  .pa-btn.primary { background: var(--accent); color: white; }
  .pa-btn.primary:hover:not(:disabled) { opacity: 0.85; }
  .pa-btn.primary:disabled { opacity: 0.4; cursor: not-allowed; }
  .pa-btn.ghost { background: none; border: 1.5px solid var(--border2); color: var(--text2); }
  .pa-btn.ghost:hover { border-color: var(--accent); color: var(--accent); }
  .pa-btn.sm { padding: 6px 12px; font-size: 12px; }

  .icon-btn {
    background: none; border: 1px solid var(--border); color: var(--text3);
    width: 28px; height: 28px; border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.15s; flex-shrink: 0;
  }
  .icon-btn:hover { border-color: var(--accent); color: var(--accent); }
  .icon-btn.danger:hover { border-color: var(--danger); color: var(--danger); }
  .icon-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .q-list { display: flex; flex-direction: column; gap: 10px; }
  .q-empty { background: var(--surface); border: 1px dashed var(--border2); border-radius: 10px; padding: 28px; text-align: center; color: var(--text3); font-size: 13px; }
  .q-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 15px 16px; display: flex; flex-direction: column; gap: 9px; }
  .q-card-top { display: flex; align-items: center; gap: 8px; }
  .q-num { font-size: 10.5px; font-weight: 700; color: var(--text3); background: var(--surface2); padding: 2px 7px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; }
  .q-type { font-size: 10.5px; font-weight: 700; padding: 2px 8px; border-radius: 5px; }
  .q-actions { margin-right: auto; display: flex; gap: 5px; }
  .q-text { font-size: 14px; color: var(--text); line-height: 1.55; }
  .q-opts { display: flex; flex-wrap: wrap; gap: 6px; }
  .q-opt { font-size: 12px; padding: 3px 10px; border-radius: 6px; background: var(--surface2); border: 1px solid var(--border); color: var(--text2); display: flex; align-items: center; gap: 4px; }
  .q-opt.correct { background: rgba(16,185,129,0.08); border-color: rgba(16,185,129,0.3); color: #10b981; }
  .q-tf { font-size: 12px; color: var(--text2); }
  .q-written { font-size: 11.5px; color: var(--warning); font-style: italic; }

  .add-q-btn {
    display: flex; align-items: center; justify-content: center; gap: 7px;
    background: none; border: 1.5px dashed var(--border2); color: var(--text2);
    padding: 12px; border-radius: 10px; cursor: pointer; font-size: 13px; font-weight: 700;
    transition: all 0.15s; font-family: 'Tajawal', sans-serif; width: 100%;
  }
  .add-q-btn:hover { border-color: var(--accent); color: var(--accent); }

  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 16px; }
  .modal { background: var(--surface); border: 1px solid var(--border2); border-radius: 16px; padding: 22px; width: 100%; max-width: 500px; display: flex; flex-direction: column; gap: 16px; max-height: 90vh; overflow-y: auto; }
  .modal-head { display: flex; align-items: center; justify-content: space-between; }
  .modal-title { font-size: 15px; font-weight: 800; color: var(--text); }
  .modal-field { display: flex; flex-direction: column; gap: 7px; }
  .field-label { font-size: 12px; font-weight: 700; color: var(--text2); }
  .field-hint { font-size: 10.5px; color: var(--text3); font-weight: 400; }

  .type-btns { display: flex; gap: 7px; }
  .type-btn { flex: 1; padding: 8px; border-radius: 7px; font-size: 12.5px; font-weight: 700; cursor: pointer; border: 1.5px solid var(--border); background: var(--surface2); color: var(--text2); transition: all 0.15s; font-family: 'Tajawal', sans-serif; }
  .type-btn.sel { background: color-mix(in srgb, var(--tc) 12%, transparent); border-color: var(--tc); color: var(--tc); }

  .opts-list { display: flex; flex-direction: column; gap: 6px; }
  .opt-row { display: flex; align-items: center; gap: 7px; }
  .correct-radio { width: 20px; height: 20px; border-radius: 50%; border: 2px solid var(--border2); background: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--success); flex-shrink: 0; transition: border-color 0.15s; }
  .correct-radio.sel { border-color: var(--success); background: rgba(16,185,129,0.1); }
  .opt-inp { flex: 1; }
  .add-opt-btn { background: none; border: 1px dashed var(--border2); color: var(--text3); padding: 6px 12px; border-radius: 7px; cursor: pointer; font-size: 12px; font-family: 'Tajawal', sans-serif; transition: all 0.15s; width: fit-content; }
  .add-opt-btn:hover { border-color: var(--accent); color: var(--accent); }

  .tf-btns { display: flex; gap: 10px; }
  .tf-btn { flex: 1; padding: 10px; border-radius: 9px; font-size: 14px; font-weight: 700; cursor: pointer; border: 1.5px solid var(--border); background: var(--surface2); color: var(--text2); transition: all 0.15s; font-family: 'Tajawal', sans-serif; }
  .tf-btn.sel.true { background: rgba(16,185,129,0.1); border-color: #10b981; color: #10b981; }
  .tf-btn.sel.false { background: rgba(239,68,68,0.1); border-color: #ef4444; color: #ef4444; }

  .written-note { background: rgba(245,158,11,0.07); border: 1px solid rgba(245,158,11,0.2); color: #b45309; font-size: 12.5px; padding: 10px 12px; border-radius: 8px; }
  .modal-actions { display: flex; justify-content: flex-end; gap: 8px; padding-top: 4px; }
`;
