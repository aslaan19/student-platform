// owner/submissions/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

interface Submission {
  id: string;
  submitted_at: string;
  review_status: "PENDING" | "REVIEWED";
  score: number | null;
  total: number | null;
  student: {
    profile: { full_name: string };
    school: { name: string } | null;
  };
  assessment: { title: string };
  assigned_school: { name: string } | null;
  reviewer: { full_name: string } | null;
}

function SubmissionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const statusFilter = searchParams.get("status") ?? "";
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const url = statusFilter
      ? `/api/owner/submissions?status=${statusFilter}`
      : "/api/owner/submissions";
    fetch(url)
      .then((r) => r.json())
      .then((d) => setSubmissions(d.submissions ?? []))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const setFilter = (f: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (f) params.set("status", f);
    else params.delete("status");
    router.push(`/owner/submissions?${params.toString()}`);
  };

  const pending = submissions.filter(
    (s) => s.review_status === "PENDING",
  ).length;

  return (
    <div className="sub-page">
      <div className="sub-header">
        <div>
          <h1 className="sub-title">Student Submissions</h1>
          <p className="sub-sub">
            Intake assessment responses awaiting review or already reviewed
          </p>
        </div>
        {pending > 0 && (
          <div className="pending-alert">
            <div className="pending-dot" />
            {pending} pending
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="filter-row">
        {[
          { val: "", label: "All" },
          { val: "PENDING", label: "Pending Review" },
          { val: "REVIEWED", label: "Reviewed" },
        ].map((f) => (
          <button
            key={f.val}
            className={`filter-btn ${statusFilter === f.val ? "active" : ""}`}
            onClick={() => setFilter(f.val)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="sub-loading">
          <div className="spinner" />
          Loading submissions…
        </div>
      ) : submissions.length === 0 ? (
        <div className="sub-empty">No submissions found.</div>
      ) : (
        <div className="sub-list">
          {submissions.map((s) => (
            <Link
              key={s.id}
              href={`/owner/submissions/${s.id}`}
              className="sub-row"
            >
              <div className="sub-avatar">
                {s.student.profile.full_name.charAt(0)}
              </div>
              <div className="sub-body">
                <div className="sub-name">{s.student.profile.full_name}</div>
                <div className="sub-meta">
                  Submitted{" "}
                  {new Date(s.submitted_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {" · "}
                  {s.assessment.title}
                </div>
              </div>
              <div className="sub-right">
                {s.review_status === "REVIEWED" ? (
                  <>
                    {s.score !== null && s.total !== null && (
                      <div className="sub-score">
                        {s.score}/{s.total}
                      </div>
                    )}
                    <div className="status-chip reviewed">Reviewed</div>
                    {s.assigned_school && (
                      <div className="assigned-school">
                        {s.assigned_school.name}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="status-chip pending">Pending</div>
                )}
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  style={{ color: "var(--text3)", flexShrink: 0 }}
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}

      <style>{`
        .sub-page { display: flex; flex-direction: column; gap: 20px; }
        .sub-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .sub-title { font-size: 22px; font-weight: 700; color: var(--text); letter-spacing: -0.4px; }
        .sub-sub { font-size: 13px; color: var(--text2); margin-top: 2px; }
        .pending-alert {
          display: flex; align-items: center; gap: 7px;
          background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.25);
          color: #fbbf24; font-size: 12.5px; font-weight: 700;
          padding: 7px 14px; border-radius: 8px;
        }
        .pending-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }

        .filter-row { display: flex; gap: 6px; flex-wrap: wrap; }
        .filter-btn {
          background: var(--surface); border: 1px solid var(--border);
          color: var(--text2); padding: 7px 14px; border-radius: 8px;
          font-size: 12.5px; font-weight: 500; cursor: pointer;
          transition: all 0.15s; font-family: 'Sora', sans-serif;
        }
        .filter-btn:hover { border-color: var(--border2); color: var(--text); }
        .filter-btn.active { background: var(--accent-glow); border-color: var(--accent); color: var(--accent); font-weight: 600; }

        .sub-loading { display: flex; align-items: center; gap: 12px; height: 160px; justify-content: center; color: var(--text2); font-size: 14px; }
        .spinner { width: 18px; height: 18px; border: 2px solid var(--border2); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .sub-empty { text-align: center; color: var(--text3); padding: 60px; font-size: 13px; }

        .sub-list { display: flex; flex-direction: column; gap: 8px; }
        .sub-row {
          display: flex; align-items: center; gap: 14px;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 12px; padding: 14px 18px;
          text-decoration: none; color: var(--text);
          transition: border-color 0.15s, background 0.15s;
        }
        .sub-row:hover { border-color: var(--accent); background: var(--surface2); }
        .sub-avatar {
          width: 38px; height: 38px; border-radius: 10px;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; font-weight: 700; color: white; flex-shrink: 0;
        }
        .sub-body { flex: 1; min-width: 0; }
        .sub-name { font-size: 14px; font-weight: 600; color: var(--text); }
        .sub-meta { font-size: 11.5px; color: var(--text2); margin-top: 2px; }
        .sub-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .sub-score { font-size: 13px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--accent); }
        .status-chip { font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 6px; }
        .status-chip.pending { background: rgba(251,191,36,0.1); color: #fbbf24; border: 1px solid rgba(251,191,36,0.25); }
        .status-chip.reviewed { background: rgba(52,211,153,0.1); color: #34d399; border: 1px solid rgba(52,211,153,0.25); }
        .assigned-school { font-size: 11px; color: var(--text2); background: var(--surface2); padding: 2px 8px; border-radius: 5px; }
      `}</style>
    </div>
  );
}

export default function OwnerSubmissionsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: 40, color: "var(--text2)" }}>Loading…</div>
      }
    >
      <SubmissionsContent />
    </Suspense>
  );
}
