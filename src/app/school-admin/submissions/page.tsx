"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

interface Submission {
  id: string;
  submitted_at: string;
  review_status: "PENDING" | "REVIEWED";
  score: number | null;
  total: number | null;
  student: { profile: { full_name: string }; class: { name: string } | null };
  assessment: { title: string };
  assigned_class: { name: string } | null;
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
      ? `/api/school-admin/submissions?status=${statusFilter}`
      : "/api/school-admin/submissions";
    fetch(url)
      .then((r) => r.json())
      .then((d) => setSubmissions(d.submissions ?? []))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const setFilter = (f: string) => {
    const params = new URLSearchParams();
    if (f) params.set("status", f);
    router.push(`/school-admin/submissions${f ? `?${params}` : ""}`);
  };

  const pending = submissions.filter(
    (s) => s.review_status === "PENDING",
  ).length;

  return (
    <div className="sub-page" dir="rtl">
      <div className="sub-header">
        <div>
          <h1 className="sub-title">????? ?????? ???????</h1>
          <p className="sub-sub">??????? ?????? ?????? ???????? ?? ??????</p>
        </div>
        {pending > 0 && (
          <div className="pending-pill">
            <span className="pending-dot" />
            {pending} ??????? ????????
          </div>
        )}
      </div>

      <div className="filter-row">
        {[
          { val: "", label: "????" },
          { val: "PENDING", label: "??? ????????" },
          { val: "REVIEWED", label: "??? ????????" },
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
          <div className="spin" />
          ???? ???????...
        </div>
      ) : submissions.length === 0 ? (
        <div className="sub-empty">?? ???? ?????.</div>
      ) : (
        <div className="sub-list">
          {submissions.map((s) => (
            <Link
              key={s.id}
              href={`/school-admin/submissions/${s.id}`}
              className="sub-row"
            >
              <div className="sub-avatar">
                {s.student.profile.full_name.charAt(0)}
              </div>
              <div className="sub-body">
                <div className="sub-name">{s.student.profile.full_name}</div>
                <div className="sub-meta">
                  {new Date(s.submitted_at).toLocaleDateString("ar-SA", {
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
                      <span className="sub-score">
                        {s.score}/{s.total}
                      </span>
                    )}
                    <span className="chip reviewed">??? ????????</span>
                    {s.assigned_class && (
                      <span className="chip class-chip">
                        {s.assigned_class.name}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="chip pending">??? ????????</span>
                )}
                <svg
                  width="13"
                  height="13"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  style={{ color: "var(--text3)", transform: "rotate(180deg)" }}
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}

      <style>{`
        .sub-page { display: flex; flex-direction: column; gap: 18px; }
        .sub-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .sub-title { font-size: 21px; font-weight: 800; color: var(--text); }
        .sub-sub { font-size: 13px; color: var(--text2); margin-top: 2px; }
        .pending-pill { display: flex; align-items: center; gap: 7px; background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.25); color: #b45309; font-size: 12.5px; font-weight: 700; padding: 7px 13px; border-radius: 8px; }
        .pending-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.3} }
        .filter-row { display: flex; gap: 6px; flex-wrap: wrap; }
        .filter-btn { background: var(--surface); border: 1px solid var(--border); color: var(--text2); padding: 7px 14px; border-radius: 8px; font-size: 12.5px; font-weight: 500; cursor: pointer; transition: all 0.15s; font-family: 'Tajawal', sans-serif; }
        .filter-btn:hover { border-color: var(--border2); color: var(--text); }
        .filter-btn.active { background: rgba(37,99,235,0.07); border-color: var(--accent); color: var(--accent); font-weight: 700; }
        .sub-loading { display: flex; align-items: center; gap: 10px; height: 140px; justify-content: center; color: var(--text2); font-size: 14px; }
        .spin { width: 18px; height: 18px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: sp 0.7s linear infinite; }
        @keyframes sp { to { transform: rotate(360deg); } }
        .sub-empty { text-align: center; color: var(--text3); padding: 50px; font-size: 13px; }
        .sub-list { display: flex; flex-direction: column; gap: 8px; }
        .sub-row { display: flex; align-items: center; gap: 12px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 13px 16px; text-decoration: none; color: var(--text); transition: border-color 0.15s; }
        .sub-row:hover { border-color: var(--accent); }
        .sub-avatar { width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, var(--accent), var(--accent2)); display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 800; color: white; flex-shrink: 0; }
        .sub-body { flex: 1; min-width: 0; }
        .sub-name { font-size: 14px; font-weight: 700; color: var(--text); }
        .sub-meta { font-size: 11.5px; color: var(--text2); margin-top: 2px; }
        .sub-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .sub-score { font-size: 13px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--accent); }
        .chip { font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 6px; }
        .chip.pending { background: rgba(245,158,11,0.1); color: #b45309; border: 1px solid rgba(245,158,11,0.2); }
        .chip.reviewed { background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
        .chip.class-chip { background: var(--surface2); color: var(--text2); border: 1px solid var(--border); }
      `}</style>
    </div>
  );
}

export default function SchoolAdminSubmissionsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: 40, color: "var(--text2)" }}>
          ???? ???????...
        </div>
      }
    >
      <SubmissionsContent />
    </Suspense>
  );
}
