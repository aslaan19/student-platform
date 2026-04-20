"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface Option {
  id: string;
  text: string;
  order: number;
}
interface Question {
  id: string;
  type: "MCQ" | "TF" | "WRITTEN";
  text: string;
  correct_answer: string | null;
  order: number;
  options: Option[];
}
interface Answer {
  id: string;
  question_id: string;
  answer: string;
  is_correct: boolean | null;
  question: Question;
}
interface Student {
  id: string;
  profile: { full_name: string };
  school: { name: string } | null;
}
interface School {
  id: string;
  name: string;
}
interface Attempt {
  id: string;
  review_status: "PENDING" | "REVIEWED";
  score: number | null;
  total: number | null;
  reviewer_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  student: Student;
  assessment: { title: string; questions: Question[] };
  answers: Answer[];
  assigned_school: { id: string; name: string } | null;
  reviewer: { full_name: string } | null;
}

export default function OwnerSubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  const [writtenGrades, setWrittenGrades] = useState<Record<string, boolean>>(
    {},
  );
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [assignedSchoolId, setAssignedSchoolId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/owner/submissions/${id}`).then((r) => r.json()),
      fetch("/api/owner/schools").then((r) => r.json()),
    ])
      .then(([attemptData, schoolData]) => {
        const a: Attempt = attemptData.attempt;
        setAttempt(a);
        setSchools(schoolData.schools ?? []);
        if (a) {
          const grades: Record<string, boolean> = {};
          a.answers.forEach((ans) => {
            if (ans.question.type === "WRITTEN" && ans.is_correct !== null) {
              grades[ans.id] = ans.is_correct;
            }
          });
          setWrittenGrades(grades);
          setReviewerNotes(a.reviewer_notes ?? "");
          setAssignedSchoolId(a.assigned_school?.id ?? "");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmitReview() {
    if (!assignedSchoolId) {
      setSubmitError("يرجى تحديد المدرسة المراد التعيين إليها.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const r = await fetch(`/api/owner/submissions/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          written_grades: writtenGrades,
          reviewer_notes: reviewerNotes,
          assigned_school_id: assignedSchoolId,
        }),
      });
      if (!r.ok) {
        const d = await r.json();
        setSubmitError(d.error ?? "فشل إرسال المراجعة.");
        return;
      }
      router.push("/owner/submissions");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading)
    return (
      <div className="sr-loading">
        <div className="spinner" />
        جارٍ تحميل الإجابة…
      </div>
    );
  if (!attempt) return <div className="sr-loading">الإجابة غير موجودة.</div>;

  const isReviewed = attempt.review_status === "REVIEWED";
  const writtenAnswers = attempt.answers.filter(
    (a) => a.question.type === "WRITTEN",
  );
  const autoAnswers = attempt.answers.filter(
    (a) => a.question.type !== "WRITTEN",
  );
  const autoCorrect = autoAnswers.filter((a) => a.is_correct === true).length;
  const writtenCorrect = Object.values(writtenGrades).filter(Boolean).length;
  const liveScore = autoCorrect + writtenCorrect;
  const pct = attempt.answers.length
    ? Math.round((liveScore / attempt.answers.length) * 100)
    : 0;

  return (
    <div className="sr-page" dir="rtl">
      {/* Breadcrumb + Header */}
      <div className="sr-header">
        <Link href="/owner/submissions" className="back-link">
          <svg
            width="15"
            height="15"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
          العودة إلى الإجابات
        </Link>
        <div className="sr-title-row">
          <div className="sr-avatar">
            {attempt.student.profile.full_name.charAt(0)}
          </div>
          <div className="sr-title-body">
            <h1 className="sr-title">{attempt.student.profile.full_name}</h1>
            <p className="sr-sub">
              {attempt.assessment.title}
              <span className="meta-dot"> · </span>
              {new Date(attempt.submitted_at).toLocaleDateString("ar-SA", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <div className={`status-chip ${isReviewed ? "reviewed" : "pending"}`}>
            {isReviewed ? "تمت المراجعة" : "في انتظار المراجعة"}
          </div>
        </div>
      </div>

      {/* Score banner (if reviewed) */}
      {isReviewed && attempt.score !== null && (
        <div className="score-banner">
          <div className="score-main">
            <div className="score-big">
              <span className="score-num">{attempt.score}</span>
              <span className="score-sep">/</span>
              <span className="score-total">{attempt.total}</span>
            </div>
            <div className="score-pct-badge">
              {attempt.total
                ? Math.round((attempt.score / attempt.total) * 100)
                : 0}
              %
            </div>
          </div>
          {attempt.assigned_school && (
            <div className="score-school-wrap">
              <span className="score-section-label">المدرسة المعيّنة</span>
              <span className="score-school-name">
                {attempt.assigned_school.name}
              </span>
            </div>
          )}
          {attempt.reviewer && (
            <div className="score-reviewer-wrap">
              <span className="score-section-label">المراجِع</span>
              <span className="score-reviewer-name">
                {attempt.reviewer.full_name}
              </span>
              {attempt.reviewed_at && (
                <span className="score-reviewer-date">
                  {new Date(attempt.reviewed_at).toLocaleDateString("ar-SA", {
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="sr-body">
        {/* Answers column */}
        <div className="answers-col">
          <h2 className="col-title">إجابات الطالب</h2>
          {attempt.answers.length === 0 && (
            <div className="empty-answers">لم يتم تقديم أي إجابات.</div>
          )}
          {attempt.assessment.questions.map((q, idx) => {
            const answer = attempt.answers.find((a) => a.question_id === q.id);
            if (!answer) return null;
            return (
              <div key={q.id} className="answer-card">
                <div className="answer-header">
                  <div className="q-num">س{idx + 1}</div>
                  <div className={`q-type-badge type-${q.type.toLowerCase()}`}>
                    {q.type === "MCQ"
                      ? "اختيار"
                      : q.type === "TF"
                        ? "صح/خطأ"
                        : "مكتوب"}
                  </div>
                  {q.type !== "WRITTEN" && answer.is_correct !== null && (
                    <div
                      className={`auto-result ${answer.is_correct ? "correct" : "wrong"}`}
                    >
                      {answer.is_correct ? (
                        <>
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
                          صحيح
                        </>
                      ) : (
                        <>
                          <svg
                            width="10"
                            height="10"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                          خطأ
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div className="q-text">{q.text}</div>

                {/* MCQ */}
                {q.type === "MCQ" && (
                  <div className="mcq-options">
                    {q.options.map((opt) => {
                      const isStudent = answer.answer === opt.text;
                      const isCorrect = q.correct_answer === opt.text;
                      return (
                        <div
                          key={opt.id}
                          className={`mcq-opt ${isStudent ? "student-pick" : ""} ${isCorrect ? "correct-opt" : ""}`}
                        >
                          <div className="opt-indicator">
                            {isCorrect && (
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
                            {isStudent && !isCorrect && (
                              <svg
                                width="9"
                                height="9"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path d="M18 6L6 18M6 6l12 12" />
                              </svg>
                            )}
                          </div>
                          <span>{opt.text}</span>
                          {isStudent && (
                            <span className="opt-tag">إجابة الطالب</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* T/F */}
                {q.type === "TF" && (
                  <div className="tf-row">
                    <div
                      className={`tf-pill student-ans ${answer.answer === q.correct_answer ? "correct" : "wrong"}`}
                    >
                      الطالب: {answer.answer === "true" ? "صح" : "خطأ"}
                    </div>
                    <div className="tf-pill correct-ans">
                      الصحيح: {q.correct_answer === "true" ? "صح" : "خطأ"}
                    </div>
                  </div>
                )}

                {/* Written */}
                {q.type === "WRITTEN" && (
                  <div className="written-section">
                    <div className="written-label">إجابة الطالب</div>
                    <div className="written-answer-box">{answer.answer}</div>
                    {!isReviewed && (
                      <div className="written-grade-row">
                        <span className="grade-label">تقييمك:</span>
                        <button
                          className={`grade-btn correct-btn ${writtenGrades[answer.id] === true ? "selected" : ""}`}
                          onClick={() =>
                            setWrittenGrades((g) => ({
                              ...g,
                              [answer.id]: true,
                            }))
                          }
                        >
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
                          صحيح
                        </button>
                        <button
                          className={`grade-btn wrong-btn ${writtenGrades[answer.id] === false ? "selected" : ""}`}
                          onClick={() =>
                            setWrittenGrades((g) => ({
                              ...g,
                              [answer.id]: false,
                            }))
                          }
                        >
                          <svg
                            width="12"
                            height="12"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                          خطأ
                        </button>
                      </div>
                    )}
                    {isReviewed && answer.is_correct !== null && (
                      <div
                        className={`auto-result ${answer.is_correct ? "correct" : "wrong"}`}
                        style={{ width: "fit-content", marginTop: 6 }}
                      >
                        {answer.is_correct ? "✓ صحيح" : "✗ خطأ"}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Review panel */}
        <div className="review-col">
          {!isReviewed ? (
            <div className="review-panel">
              <h2 className="col-title">المراجعة والتعيين</h2>

              {/* Live score */}
              <div className="score-preview">
                <div className="sp-header">
                  <span className="sp-label">الدرجة الحالية</span>
                  <span className="sp-val">
                    {liveScore} / {attempt.answers.length}
                  </span>
                </div>
                <div className="sp-bar-wrap">
                  <div className="sp-bar" style={{ width: `${pct}%` }} />
                </div>
                <div className="sp-footer">
                  <span className="sp-pct">{pct}%</span>
                  {writtenAnswers.length > 0 && (
                    <span className="sp-note">
                      {Object.keys(writtenGrades).length}/
                      {writtenAnswers.length} مكتوب تم تقييمه
                    </span>
                  )}
                </div>
              </div>

              {/* School assignment */}
              <div className="review-field">
                <label className="review-label">
                  تعيين المدرسة <span className="req">*</span>
                </label>
                <select
                  className="review-select"
                  value={assignedSchoolId}
                  onChange={(e) => setAssignedSchoolId(e.target.value)}
                >
                  <option value="">اختر المدرسة…</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div className="review-field">
                <label className="review-label">
                  ملاحظات <span className="opt-tag-label">(اختياري)</span>
                </label>
                <textarea
                  className="review-textarea"
                  placeholder="أضف ملاحظاتك حول أداء الطالب…"
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  rows={4}
                />
              </div>

              {submitError && <div className="submit-error">{submitError}</div>}

              <button
                className="submit-review-btn"
                onClick={handleSubmitReview}
                disabled={submitting || !assignedSchoolId}
              >
                {submitting ? (
                  <>
                    <div className="btn-spinner" />
                    جارٍ الإرسال…
                  </>
                ) : (
                  <>
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    إرسال المراجعة وتعيين المدرسة
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="review-panel done">
              <div className="done-header">
                <div className="done-check">
                  <svg
                    width="22"
                    height="22"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 className="col-title" style={{ marginBottom: 0 }}>
                  اكتملت المراجعة
                </h2>
              </div>
              <div className="done-rows">
                <div className="done-row">
                  <span className="done-label">المدرسة المعيّنة</span>
                  <span className="done-val">
                    {attempt.assigned_school?.name ?? "—"}
                  </span>
                </div>
                <div className="done-row">
                  <span className="done-label">المراجِع</span>
                  <span className="done-val">
                    {attempt.reviewer?.full_name ?? "—"}
                  </span>
                </div>
                {attempt.reviewed_at && (
                  <div className="done-row">
                    <span className="done-label">تاريخ المراجعة</span>
                    <span className="done-val">
                      {new Date(attempt.reviewed_at).toLocaleDateString(
                        "ar-SA",
                        { month: "long", day: "numeric", year: "numeric" },
                      )}
                    </span>
                  </div>
                )}
                {attempt.reviewer_notes && (
                  <div className="done-notes-wrap">
                    <span className="done-label">الملاحظات</span>
                    <div className="done-notes">{attempt.reviewer_notes}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .sr-page { display:flex; flex-direction:column; gap:22px; }
        .sr-loading { display:flex; align-items:center; gap:12px; height:220px; justify-content:center; color:var(--text2); font-size:14px; }
        .spinner { width:20px; height:20px; border:2px solid var(--border2); border-top-color:var(--accent); border-radius:50%; animation:spin 0.8s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg)} }

        .back-link { display:inline-flex; align-items:center; gap:6px; font-size:13px; color:var(--text2); text-decoration:none; font-weight:600; }
        .back-link:hover { color:var(--accent); }
        .sr-header { display:flex; flex-direction:column; gap:12px; padding-bottom:20px; border-bottom:1px solid var(--border); }
        .sr-title-row { display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .sr-avatar {
          width:46px; height:46px; border-radius:12px; flex-shrink:0;
          background:linear-gradient(145deg,var(--accent),#2563c4);
          display:flex; align-items:center; justify-content:center;
          font-size:18px; font-weight:800; color:white;
        }
        .sr-title-body { flex:1; }
        .sr-title { font-size:20px; font-weight:800; color:var(--text); letter-spacing:-0.3px; }
        .sr-sub { font-size:13px; color:var(--text2); margin-top:3px; display:flex; align-items:center; gap:4px; }
        .meta-dot { opacity:0.4; }
        .status-chip { font-size:11.5px; font-weight:700; padding:5px 14px; border-radius:20px; border:1px solid; white-space:nowrap; }
        .status-chip.pending { background:var(--warning-bg); color:var(--warning); border-color:rgba(180,83,9,0.2); }
        .status-chip.reviewed { background:var(--success-bg); color:var(--success); border-color:rgba(13,124,79,0.2); }

        /* Score banner */
        .score-banner {
          background:var(--surface); border:1px solid var(--border); border-right:4px solid var(--success);
          border-radius:var(--radius); padding:20px 24px;
          display:flex; align-items:center; gap:24px; flex-wrap:wrap;
          box-shadow:var(--shadow-sm);
        }
        .score-main { display:flex; align-items:center; gap:12px; }
        .score-big { display:flex; align-items:baseline; gap:3px; }
        .score-num { font-size:44px; font-weight:900; font-family:'IBM Plex Mono',monospace; color:var(--accent); letter-spacing:-2px; line-height:1; }
        .score-sep { font-size:30px; color:var(--text3); font-weight:300; }
        .score-total { font-size:28px; font-weight:700; font-family:'IBM Plex Mono',monospace; color:var(--text2); }
        .score-pct-badge { font-size:18px; font-weight:800; color:var(--text); background:var(--surface3); padding:6px 14px; border-radius:8px; }
        .score-school-wrap, .score-reviewer-wrap {
          display:flex; flex-direction:column; gap:3px; padding-right:24px; border-right:1px solid var(--border);
        }
        .score-section-label { font-size:10px; text-transform:uppercase; letter-spacing:0.5px; color:var(--text3); font-weight:700; }
        .score-school-name { font-size:15px; font-weight:800; color:var(--success); }
        .score-reviewer-name { font-size:14px; font-weight:700; color:var(--text); }
        .score-reviewer-date { font-size:11px; color:var(--text2); }

        /* Layout */
        .sr-body { display:grid; grid-template-columns:1fr 320px; gap:20px; align-items:start; }
        @media (max-width:900px) { .sr-body { grid-template-columns:1fr; } }
        .answers-col, .review-col { display:flex; flex-direction:column; gap:12px; }
        .col-title { font-size:15px; font-weight:800; color:var(--text); margin-bottom:2px; }

        /* Answer cards */
        .empty-answers { color:var(--text3); font-size:13px; text-align:center; padding:32px; }
        .answer-card {
          background:var(--surface); border:1px solid var(--border); border-radius:10px;
          padding:18px; display:flex; flex-direction:column; gap:12px;
          box-shadow:var(--shadow-sm);
        }
        .answer-header { display:flex; align-items:center; gap:8px; }
        .q-num {
          font-size:11px; font-weight:800; color:var(--accent);
          font-family:'IBM Plex Mono',monospace; background:var(--accent-muted);
          padding:3px 8px; border-radius:5px; border:1px solid var(--accent-muted2);
        }
        .q-type-badge { font-size:10px; font-weight:700; padding:2px 9px; border-radius:5px; }
        .q-type-badge.type-mcq { background:rgba(26,79,160,0.08); color:var(--accent); }
        .q-type-badge.type-tf { background:var(--success-bg); color:var(--success); }
        .q-type-badge.type-written { background:var(--warning-bg); color:var(--warning); }
        .auto-result { display:flex; align-items:center; gap:4px; font-size:11.5px; font-weight:700; padding:3px 9px; border-radius:5px; }
        .auto-result.correct { background:var(--success-bg); color:var(--success); }
        .auto-result.wrong { background:var(--danger-bg); color:var(--danger); }
        .q-text { font-size:14px; color:var(--text); line-height:1.65; font-weight:500; }

        .mcq-options { display:flex; flex-direction:column; gap:6px; }
        .mcq-opt {
          display:flex; align-items:center; gap:9px;
          padding:9px 13px; border-radius:8px; font-size:13px;
          background:var(--surface3); border:1px solid var(--border); color:var(--text2);
        }
        .mcq-opt.student-pick { border-color:rgba(192,57,43,0.3); background:var(--danger-bg); color:var(--text); }
        .mcq-opt.correct-opt { border-color:rgba(13,124,79,0.3); background:var(--success-bg); color:var(--success); font-weight:700; }
        .mcq-opt.student-pick.correct-opt { border-color:rgba(13,124,79,0.5); }
        .opt-indicator { width:16px; height:16px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .opt-tag { margin-right:auto; font-size:10px; color:var(--text3); font-style:italic; background:var(--surface); border:1px solid var(--border); padding:1px 7px; border-radius:4px; }

        .tf-row { display:flex; gap:9px; }
        .tf-pill { font-size:13px; font-weight:700; padding:6px 14px; border-radius:7px; border:1px solid; }
        .tf-pill.student-ans.correct { background:var(--success-bg); color:var(--success); border-color:rgba(13,124,79,0.3); }
        .tf-pill.student-ans.wrong { background:var(--danger-bg); color:var(--danger); border-color:rgba(192,57,43,0.3); }
        .tf-pill.correct-ans { background:var(--success-bg); color:var(--success); border-color:rgba(13,124,79,0.2); opacity:0.8; }

        .written-section { display:flex; flex-direction:column; gap:9px; }
        .written-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.4px; color:var(--text3); }
        .written-answer-box {
          background:var(--surface2); border:1px solid var(--border); border-right:3px solid var(--warning);
          border-radius:8px; padding:13px 16px; font-size:13.5px; color:var(--text);
          line-height:1.7; white-space:pre-wrap; min-height:64px; font-weight:500;
        }
        .written-grade-row { display:flex; align-items:center; gap:10px; }
        .grade-label { font-size:12.5px; color:var(--text2); font-weight:700; }
        .grade-btn {
          display:flex; align-items:center; gap:6px;
          padding:7px 16px; border-radius:7px; font-size:13px; font-weight:700;
          cursor:pointer; border:1px solid var(--border2); background:var(--surface3); color:var(--text2);
          transition:all 0.15s; font-family:'Cairo',sans-serif;
        }
        .grade-btn.correct-btn.selected { background:var(--success-bg); border-color:rgba(13,124,79,0.4); color:var(--success); }
        .grade-btn.wrong-btn.selected { background:var(--danger-bg); border-color:rgba(192,57,43,0.4); color:var(--danger); }

        /* Review panel */
        .review-panel {
          background:var(--surface); border:1px solid var(--border);
          border-radius:12px; padding:22px;
          display:flex; flex-direction:column; gap:18px;
          position:sticky; top:76px; box-shadow:var(--shadow);
        }
        .review-panel.done { border-top:3px solid var(--success); }

        .score-preview {
          background:var(--surface2); border:1px solid var(--border);
          border-radius:9px; padding:14px 16px; display:flex; flex-direction:column; gap:8px;
        }
        .sp-header { display:flex; justify-content:space-between; align-items:center; }
        .sp-label { font-size:11px; text-transform:uppercase; letter-spacing:0.5px; color:var(--text3); font-weight:700; }
        .sp-val { font-size:20px; font-weight:800; font-family:'IBM Plex Mono',monospace; color:var(--accent); }
        .sp-bar-wrap { height:6px; background:var(--border2); border-radius:99px; overflow:hidden; }
        .sp-bar { height:100%; background:var(--accent); border-radius:99px; transition:width 0.4s ease; }
        .sp-footer { display:flex; justify-content:space-between; align-items:center; }
        .sp-pct { font-size:12px; font-weight:700; color:var(--accent); }
        .sp-note { font-size:11px; color:var(--text3); font-weight:500; }

        .review-field { display:flex; flex-direction:column; gap:7px; }
        .review-label { font-size:12px; font-weight:700; color:var(--text2); }
        .req { color:var(--danger); }
        .opt-tag-label { color:var(--text3); font-weight:500; font-size:11px; }
        .review-select {
          background:var(--surface); border:1px solid var(--border2);
          color:var(--text); border-radius:8px; padding:10px 13px;
          font-size:13.5px; font-family:'Cairo',sans-serif; outline:none; width:100%;
          cursor:pointer; transition:border-color 0.15s, box-shadow 0.15s;
        }
        .review-select:focus { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-muted); }
        .review-textarea {
          background:var(--surface); border:1px solid var(--border2);
          color:var(--text); border-radius:8px; padding:11px 13px;
          font-size:13px; font-family:'Cairo',sans-serif; outline:none; width:100%;
          resize:vertical; line-height:1.6; transition:border-color 0.15s, box-shadow 0.15s;
        }
        .review-textarea:focus { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-muted); }
        .submit-error {
          background:var(--danger-bg); border:1px solid rgba(192,57,43,0.2);
          color:var(--danger); font-size:12.5px; padding:10px 13px; border-radius:8px; font-weight:600;
        }
        .submit-review-btn {
          display:flex; align-items:center; justify-content:center; gap:8px;
          background:var(--accent); color:white; padding:12px 18px; border-radius:9px;
          font-size:13.5px; font-weight:800; cursor:pointer; border:none;
          transition:opacity 0.15s; font-family:'Cairo',sans-serif; width:100%;
          box-shadow:0 2px 8px rgba(26,79,160,0.25);
        }
        .submit-review-btn:hover:not(:disabled) { opacity:0.88; }
        .submit-review-btn:disabled { opacity:0.4; cursor:not-allowed; }
        .btn-spinner { width:14px; height:14px; border:2px solid rgba(255,255,255,0.3); border-top-color:white; border-radius:50%; animation:spin 0.8s linear infinite; }

        .done-header { display:flex; align-items:center; gap:12px; }
        .done-check {
          width:38px; height:38px; border-radius:10px; flex-shrink:0;
          background:var(--success-bg); color:var(--success);
          display:flex; align-items:center; justify-content:center;
          border:1px solid rgba(13,124,79,0.25);
        }
        .done-rows { display:flex; flex-direction:column; gap:12px; }
        .done-row { display:flex; justify-content:space-between; align-items:center; gap:8px; padding-bottom:12px; border-bottom:1px solid var(--border); }
        .done-row:last-child { border-bottom:none; padding-bottom:0; }
        .done-label { font-size:11px; text-transform:uppercase; letter-spacing:0.4px; color:var(--text3); font-weight:700; }
        .done-val { font-size:13.5px; font-weight:700; color:var(--text); }
        .done-notes-wrap { display:flex; flex-direction:column; gap:8px; }
        .done-notes { font-size:13px; color:var(--text2); line-height:1.65; background:var(--surface2); border-radius:7px; padding:11px 13px; border:1px solid var(--border); }
      `}</style>
    </div>
  );
}
