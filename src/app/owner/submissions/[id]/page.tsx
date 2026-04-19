// owner/submissions/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface Option { id: string; text: string; order: number; }
interface Question { id: string; type: "MCQ" | "TF" | "WRITTEN"; text: string; correct_answer: string | null; order: number; options: Option[]; }
interface Answer { id: string; question_id: string; answer: string; is_correct: boolean | null; question: Question; }
interface Student { id: string; profile: { full_name: string }; school: { name: string } | null; }
interface School { id: string; name: string; }
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

  // Review state
  const [writtenGrades, setWrittenGrades] = useState<Record<string, boolean>>({});
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [assignedSchoolId, setAssignedSchoolId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/owner/submissions/${id}`).then((r) => r.json()),
      fetch("/api/owner/schools").then((r) => r.json()),
    ]).then(([attemptData, schoolData]) => {
      const a: Attempt = attemptData.attempt;
      setAttempt(a);
      setSchools(schoolData.schools ?? []);

      // Pre-populate written grades if already reviewed
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
    }).finally(() => setLoading(false));
  }, [id]);

  async function handleSubmitReview() {
    if (!assignedSchoolId) { setSubmitError("Please select a school to assign."); return; }
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
        setSubmitError(d.error ?? "Failed to submit review.");
        return;
      }
      router.push("/owner/submissions");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="sr-loading"><div className="spinner" />Loading submission…</div>;
  if (!attempt) return <div className="sr-loading">Submission not found.</div>;

  const isReviewed = attempt.review_status === "REVIEWED";
  const writtenAnswers = attempt.answers.filter((a) => a.question.type === "WRITTEN");
  const autoAnswers = attempt.answers.filter((a) => a.question.type !== "WRITTEN");

  // Calculate live score preview
  const autoCorrect = autoAnswers.filter((a) => a.is_correct === true).length;
  const writtenCorrect = Object.values(writtenGrades).filter(Boolean).length;
  const totalGraded = autoAnswers.length + Object.keys(writtenGrades).length;
  const liveScore = autoCorrect + writtenCorrect;

  return (
    <div className="sr-page">
      {/* Header */}
      <div className="sr-header">
        <Link href="/owner/submissions" className="back-link">
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M15 18l-6-6 6-6" /></svg>
          All Submissions
        </Link>
        <div className="sr-title-row">
          <div className="sr-avatar">{attempt.student.profile.full_name.charAt(0)}</div>
          <div>
            <h1 className="sr-title">{attempt.student.profile.full_name}</h1>
            <p className="sr-sub">
              {attempt.assessment.title}
              {" · "}Submitted {new Date(attempt.submitted_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <div className={`status-chip ${isReviewed ? "reviewed" : "pending"}`}>
            {isReviewed ? "Reviewed" : "Pending Review"}
          </div>
        </div>
      </div>

      {/* Score summary (if reviewed) */}
      {isReviewed && attempt.score !== null && (
        <div className="score-banner">
          <div className="score-big">
            <span className="score-num">{attempt.score}</span>
            <span className="score-div">/</span>
            <span className="score-total">{attempt.total}</span>
          </div>
          <div className="score-info">
            <div className="score-label">Final Score</div>
            <div className="score-pct">{attempt.total ? Math.round((attempt.score / attempt.total) * 100) : 0}%</div>
          </div>
          {attempt.assigned_school && (
            <div className="score-school">
              <div className="school-label">Assigned to</div>
              <div className="school-name">{attempt.assigned_school.name}</div>
            </div>
          )}
          {attempt.reviewer && (
            <div className="score-reviewer">
              Reviewed by <strong>{attempt.reviewer.full_name}</strong>
              {attempt.reviewed_at && ` on ${new Date(attempt.reviewed_at).toLocaleDateString()}`}
            </div>
          )}
        </div>
      )}

      <div className="sr-body">
        {/* Left: answers */}
        <div className="answers-col">
          <h2 className="col-title">Answers</h2>

          {attempt.answers.length === 0 && (
            <div className="empty-answers">No answers submitted.</div>
          )}

          {attempt.assessment.questions.map((q, idx) => {
            const answer = attempt.answers.find((a) => a.question_id === q.id);
            if (!answer) return null;
            return (
              <div key={q.id} className="answer-card">
                <div className="answer-header">
                  <div className="q-num">Q{idx + 1}</div>
                  <div className={`q-type-badge type-${q.type.toLowerCase()}`}>{q.type}</div>
                  {q.type !== "WRITTEN" && answer.is_correct !== null && (
                    <div className={`auto-result ${answer.is_correct ? "correct" : "wrong"}`}>
                      {answer.is_correct ? (
                        <><svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12" /></svg> Correct</>
                      ) : (
                        <><svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M18 6L6 18M6 6l12 12" /></svg> Wrong</>
                      )}
                    </div>
                  )}
                </div>

                <div className="q-text">{q.text}</div>

                {/* MCQ: show all options, highlight answer and correct */}
                {q.type === "MCQ" && (
                  <div className="mcq-options">
                    {q.options.map((opt) => {
                      const isStudentAnswer = answer.answer === opt.text;
                      const isCorrect = q.correct_answer === opt.text;
                      return (
                        <div
                          key={opt.id}
                          className={`mcq-opt ${isStudentAnswer ? "student-pick" : ""} ${isCorrect ? "correct-opt" : ""}`}
                        >
                          <div className="opt-indicator">
                            {isCorrect && <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12" /></svg>}
                            {isStudentAnswer && !isCorrect && <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M18 6L6 18M6 6l12 12" /></svg>}
                          </div>
                          <span>{opt.text}</span>
                          {isStudentAnswer && <span className="opt-student-tag">student&apos;s answer</span>}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* T/F */}
                {q.type === "TF" && (
                  <div className="tf-answer-row">
                    <div className={`tf-pill student ${answer.answer === q.correct_answer ? "correct" : "wrong"}`}>
                      Student: {answer.answer === "true" ? "True" : "False"}
                    </div>
                    <div className="tf-pill correct-ans">
                      Correct: {q.correct_answer === "true" ? "True" : "False"}
                    </div>
                  </div>
                )}

                {/* Written: show answer + grade controls */}
                {q.type === "WRITTEN" && (
                  <div className="written-section">
                    <div className="written-answer-box">{answer.answer}</div>
                    {!isReviewed && (
                      <div className="written-grade-row">
                        <span className="grade-label">Your grade:</span>
                        <button
                          className={`grade-btn correct-btn ${writtenGrades[answer.id] === true ? "selected" : ""}`}
                          onClick={() => setWrittenGrades((g) => ({ ...g, [answer.id]: true }))}
                        >
                          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12" /></svg>
                          Correct
                        </button>
                        <button
                          className={`grade-btn wrong-btn ${writtenGrades[answer.id] === false ? "selected" : ""}`}
                          onClick={() => setWrittenGrades((g) => ({ ...g, [answer.id]: false }))}
                        >
                          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M18 6L6 18M6 6l12 12" /></svg>
                          Wrong
                        </button>
                      </div>
                    )}
                    {isReviewed && answer.is_correct !== null && (
                      <div className={`auto-result ${answer.is_correct ? "correct" : "wrong"}`} style={{ marginTop: 6, width: "fit-content" }}>
                        {answer.is_correct ? "✓ Marked Correct" : "✗ Marked Wrong"}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: review panel */}
        <div className="review-col">
          {!isReviewed ? (
            <div className="review-panel">
              <h2 className="col-title">Review & Assign</h2>

              {/* Live score preview */}
              <div className="score-preview">
                <div className="sp-label">Score Preview</div>
                <div className="sp-val">{liveScore} / {attempt.answers.length}</div>
                <div className="sp-bar-wrap">
                  <div
                    className="sp-bar"
                    style={{ width: attempt.answers.length ? `${(liveScore / attempt.answers.length) * 100}%` : "0%" }}
                  />
                </div>
                {writtenAnswers.length > 0 && (
                  <div className="sp-note">
                    {Object.keys(writtenGrades).length}/{writtenAnswers.length} written questions graded
                  </div>
                )}
              </div>

              {/* Assign school */}
              <div className="review-field">
                <label className="review-label">Assign to School <span className="req">*</span></label>
                <select
                  className="review-select"
                  value={assignedSchoolId}
                  onChange={(e) => setAssignedSchoolId(e.target.value)}
                >
                  <option value="">Select a school…</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Reviewer notes */}
              <div className="review-field">
                <label className="review-label">Notes <span className="opt-label">(optional)</span></label>
                <textarea
                  className="review-textarea"
                  placeholder="Add any notes about this student's performance…"
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  rows={4}
                />
              </div>

              {submitError && (
                <div className="submit-error">{submitError}</div>
              )}

              <button
                className="submit-review-btn"
                onClick={handleSubmitReview}
                disabled={submitting || !assignedSchoolId}
              >
                {submitting ? (
                  <><div className="btn-spinner" />Submitting…</>
                ) : (
                  <><svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="20 6 9 17 4 12" /></svg>Submit Review & Assign School</>
                )}
              </button>
            </div>
          ) : (
            <div className="review-panel done">
              <h2 className="col-title">Review Complete</h2>
              <div className="done-icon">✅</div>
              <div className="done-info">
                <div className="done-row">
                  <span className="done-label">Assigned School</span>
                  <span className="done-val">{attempt.assigned_school?.name ?? "—"}</span>
                </div>
                <div className="done-row">
                  <span className="done-label">Reviewed by</span>
                  <span className="done-val">{attempt.reviewer?.full_name ?? "—"}</span>
                </div>
                {attempt.reviewed_at && (
                  <div className="done-row">
                    <span className="done-label">Reviewed on</span>
                    <span className="done-val">{new Date(attempt.reviewed_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                  </div>
                )}
                {attempt.reviewer_notes && (
                  <div className="done-notes">
                    <div className="done-label">Notes</div>
                    <div className="notes-text">{attempt.reviewer_notes}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .sr-page { display: flex; flex-direction: column; gap: 22px; }
        .sr-loading { display: flex; align-items: center; gap: 12px; height: 200px; justify-content: center; color: var(--text2); font-size: 14px; }
        .spinner { width: 18px; height: 18px; border: 2px solid var(--border2); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .back-link { display: inline-flex; align-items: center; gap: 5px; font-size: 12.5px; color: var(--text2); text-decoration: none; font-weight: 500; }
        .back-link:hover { color: var(--accent); }

        .sr-header { display: flex; flex-direction: column; gap: 10px; }
        .sr-title-row { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
        .sr-avatar {
          width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; font-weight: 700; color: white;
        }
        .sr-title { font-size: 20px; font-weight: 700; color: var(--text); letter-spacing: -0.3px; }
        .sr-sub { font-size: 12.5px; color: var(--text2); margin-top: 2px; }
        .status-chip { font-size: 11.5px; font-weight: 700; padding: 4px 12px; border-radius: 7px; margin-left: auto; }
        .status-chip.pending { background: rgba(251,191,36,0.1); color: #fbbf24; border: 1px solid rgba(251,191,36,0.25); }
        .status-chip.reviewed { background: rgba(52,211,153,0.1); color: #34d399; border: 1px solid rgba(52,211,153,0.25); }

        /* Score banner */
        .score-banner {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 14px; padding: 18px 22px;
          display: flex; align-items: center; gap: 20px; flex-wrap: wrap;
        }
        .score-big { display: flex; align-items: baseline; gap: 4px; }
        .score-num { font-size: 42px; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: var(--accent); letter-spacing: -2px; }
        .score-div { font-size: 28px; color: var(--text3); font-weight: 300; }
        .score-total { font-size: 28px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text2); }
        .score-info { display: flex; flex-direction: column; gap: 2px; }
        .score-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text3); font-weight: 600; }
        .score-pct { font-size: 20px; font-weight: 700; color: var(--text); }
        .score-school { margin-left: 20px; border-left: 1px solid var(--border); padding-left: 20px; }
        .school-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text3); font-weight: 600; }
        .school-name { font-size: 15px; font-weight: 700; color: var(--success); margin-top: 2px; }
        .score-reviewer { font-size: 11.5px; color: var(--text2); margin-left: auto; font-style: italic; }

        /* Layout */
        .sr-body { display: grid; grid-template-columns: 1fr 320px; gap: 20px; align-items: start; }
        @media (max-width: 900px) { .sr-body { grid-template-columns: 1fr; } }

        .answers-col, .review-col { display: flex; flex-direction: column; gap: 12px; }
        .col-title { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 2px; }

        /* Answer cards */
        .empty-answers { color: var(--text3); font-size: 13px; text-align: center; padding: 32px; }
        .answer-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 10px;
        }
        .answer-header { display: flex; align-items: center; gap: 8px; }
        .q-num { font-size: 10.5px; font-weight: 700; color: var(--text3); font-family: 'JetBrains Mono', monospace; background: var(--surface2); padding: 2px 7px; border-radius: 4px; }
        .q-type-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 5px; letter-spacing: 0.3px; }
        .q-type-badge.type-mcq { background: rgba(79,142,247,0.1); color: #4f8ef7; }
        .q-type-badge.type-tf { background: rgba(52,211,153,0.1); color: #34d399; }
        .q-type-badge.type-written { background: rgba(251,191,36,0.1); color: #fbbf24; }
        .auto-result { display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 5px; }
        .auto-result.correct { background: rgba(52,211,153,0.1); color: #34d399; }
        .auto-result.wrong { background: rgba(248,113,113,0.1); color: #f87171; }
        .q-text { font-size: 13.5px; color: var(--text); line-height: 1.55; }

        /* MCQ options */
        .mcq-options { display: flex; flex-direction: column; gap: 6px; }
        .mcq-opt {
          display: flex; align-items: center; gap: 9px;
          padding: 8px 12px; border-radius: 8px; font-size: 12.5px;
          background: var(--surface2); border: 1px solid var(--border); color: var(--text2);
        }
        .mcq-opt.student-pick { border-color: rgba(248,113,113,0.4); background: rgba(248,113,113,0.06); color: var(--text); }
        .mcq-opt.correct-opt { border-color: rgba(52,211,153,0.4); background: rgba(52,211,153,0.06); color: #34d399; }
        .mcq-opt.student-pick.correct-opt { border-color: rgba(52,211,153,0.5); background: rgba(52,211,153,0.1); }
        .opt-indicator { width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .opt-student-tag { margin-left: auto; font-size: 9.5px; color: var(--text3); font-style: italic; }

        /* T/F */
        .tf-answer-row { display: flex; gap: 8px; }
        .tf-pill { font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: 7px; }
        .tf-pill.student.correct { background: rgba(52,211,153,0.1); color: #34d399; }
        .tf-pill.student.wrong { background: rgba(248,113,113,0.1); color: #f87171; }
        .tf-pill.correct-ans { background: rgba(52,211,153,0.08); color: #34d399; border: 1px dashed rgba(52,211,153,0.3); }

        /* Written */
        .written-section { display: flex; flex-direction: column; gap: 10px; }
        .written-answer-box {
          background: var(--surface2); border: 1px solid var(--border); border-radius: 8px;
          padding: 12px 14px; font-size: 13px; color: var(--text); line-height: 1.6;
          white-space: pre-wrap; min-height: 60px;
        }
        .written-grade-row { display: flex; align-items: center; gap: 10px; }
        .grade-label { font-size: 12px; color: var(--text2); font-weight: 500; }
        .grade-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 7px; font-size: 12px; font-weight: 600;
          cursor: pointer; border: 1px solid var(--border2); background: var(--surface2); color: var(--text2);
          transition: all 0.15s; font-family: 'Sora', sans-serif;
        }
        .grade-btn.correct-btn.selected { background: rgba(52,211,153,0.12); border-color: #34d399; color: #34d399; }
        .grade-btn.wrong-btn.selected { background: rgba(248,113,113,0.12); border-color: #f87171; color: #f87171; }
        .grade-btn:hover { border-color: var(--border); }

        /* Review panel */
        .review-panel {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 14px; padding: 20px;
          display: flex; flex-direction: column; gap: 16px;
          position: sticky; top: 76px;
        }
        .review-panel.done { border-color: rgba(52,211,153,0.3); }

        .score-preview {
          background: var(--surface2); border-radius: 10px; padding: 14px;
          display: flex; flex-direction: column; gap: 7px;
        }
        .sp-label { font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text3); font-weight: 600; }
        .sp-val { font-size: 22px; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: var(--accent); }
        .sp-bar-wrap { height: 5px; background: var(--border); border-radius: 99px; overflow: hidden; }
        .sp-bar { height: 100%; background: var(--accent); border-radius: 99px; transition: width 0.4s ease; }
        .sp-note { font-size: 11px; color: var(--text3); }

        .review-field { display: flex; flex-direction: column; gap: 7px; }
        .review-label { font-size: 12px; font-weight: 600; color: var(--text2); }
        .req { color: var(--danger); }
        .opt-label { color: var(--text3); font-weight: 400; }

        .review-select {
          background: var(--surface2); border: 1px solid var(--border2);
          color: var(--text); border-radius: 8px; padding: 9px 12px;
          font-size: 13px; font-family: 'Sora', sans-serif; outline: none; width: 100%;
          cursor: pointer; transition: border-color 0.15s;
        }
        .review-select:focus { border-color: var(--accent); }

        .review-textarea {
          background: var(--surface2); border: 1px solid var(--border2);
          color: var(--text); border-radius: 8px; padding: 10px 12px;
          font-size: 12.5px; font-family: 'Sora', sans-serif; outline: none; width: 100%;
          resize: vertical; line-height: 1.5; transition: border-color 0.15s;
        }
        .review-textarea:focus { border-color: var(--accent); }

        .submit-error {
          background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.25);
          color: #f87171; font-size: 12px; padding: 9px 12px; border-radius: 8px;
        }

        .submit-review-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: var(--accent); color: white;
          padding: 11px 16px; border-radius: 9px;
          font-size: 13px; font-weight: 700; cursor: pointer; border: none;
          transition: opacity 0.15s; font-family: 'Sora', sans-serif; width: 100%;
        }
        .submit-review-btn:hover:not(:disabled) { opacity: 0.85; }
        .submit-review-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; }

        /* Done state */
        .done-icon { font-size: 36px; text-align: center; }
        .done-info { display: flex; flex-direction: column; gap: 10px; }
        .done-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
        .done-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text3); font-weight: 600; }
        .done-val { font-size: 13px; font-weight: 600; color: var(--text); }
        .done-notes { display: flex; flex-direction: column; gap: 6px; }
        .notes-text { font-size: 12.5px; color: var(--text2); line-height: 1.55; font-style: italic; background: var(--surface2); border-radius: 7px; padding: 10px; }
      `}</style>
    </div>
  );
}