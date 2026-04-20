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

  const pending = submissions.filter((s) => s.review_status === "PENDING").length;
  const reviewed = submissions.filter((s) => s.review_status === "REVIEWED").length;

  return (
    <div className="sub-page" dir="rtl">
      <div className="sub-header">
        <div className="sub-header-text">
          <h1 className="sub-title">الإجابات المُقدَّمة</h1>
          <p className="sub-sub">إجابات اختبار القبول بانتظار المراجعة أو التي تمت مراجعتها</p>
        </div>
        {pending > 0 && (
          <div className="pending-alert">
            <div className="pending-dot" />
            {pending} في الانتظار
          </div>
        )}
      </div>

      {/* Summary strip */}
      <div className="summary-strip">
        <div className="summary-item">
          <span className="summary-num">{submissions.length}</span>
          <span className="summary-lab">إجمالي الإجابات</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-item">
          <span className="summary-num warning">{pending}</span>
          <span className="summary-lab">في انتظار المراجعة</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-item">
          <span className="summary-num success">{reviewed}</span>
          <span className="summary-lab">تمت المراجعة</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="filter-row">
        {[
          { val: "", label: "جميع الإجابات" },
          { val: "PENDING", label: "في الانتظار" },
          { val: "REVIEWED", label: "تمت المراجعة" },
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
          جارٍ تحميل الإجابات…
        </div>
      ) : submissions.length === 0 ? (
        <div className="sub-empty">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} style={{color:"var(--text3)",marginBottom:12}}>
            <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"/>
            <path d="M12 11v6M9 14l3 3 3-3"/>
          </svg>
          <p>لا توجد إجابات مطابقة.</p>
        </div>
      ) : (
        <div className="sub-list">
          {submissions.map((s) => (
            <Link key={s.id} href={`/owner/submissions/${s.id}`} className="sub-row">
              <div className="sub-avatar">
                {s.student.profile.full_name.charAt(0)}
              </div>
              <div className="sub-body">
                <div className="sub-name">{s.student.profile.full_name}</div>
                <div className="sub-meta">
                  <span>
                    {new Date(s.submitted_at).toLocaleDateString("ar-SA", {
                      month: "long", day: "numeric", year: "numeric",
                    })}
                  </span>
                  <span className="meta-dot">·</span>
                  <span>{s.assessment.title}</span>
                  {s.assigned_school && (
                    <>
                      <span className="meta-dot">·</span>
                      <span className="meta-school">{s.assigned_school.name}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="sub-right">
                {s.review_status === "REVIEWED" && s.score !== null && s.total !== null && (
                  <div className="sub-score-wrap">
                    <span className="sub-score">{s.score}/{s.total}</span>
                    <span className="sub-pct">
                      {s.total ? Math.round((s.score / s.total) * 100) : 0}%
                    </span>
                  </div>
                )}
                <div className={`status-chip ${s.review_status === "REVIEWED" ? "reviewed" : "pending"}`}>
                  {s.review_status === "REVIEWED" ? "تمت المراجعة" : "في الانتظار"}
                </div>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{color:"var(--text3)",flexShrink:0}}>
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}

      <style>{`
        .sub-page { display:flex; flex-direction:column; gap:20px; }
        .sub-header { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; flex-wrap:wrap;
          padding-bottom:20px; border-bottom:1px solid var(--border); }
        .sub-title { font-size:24px; font-weight:800; color:var(--text); letter-spacing:-0.4px; }
        .sub-sub { font-size:13.5px; color:var(--text2); margin-top:3px; font-weight:500; }
        .pending-alert {
          display:flex; align-items:center; gap:7px;
          background:var(--warning-bg); border:1px solid rgba(180,83,9,0.2);
          color:var(--warning); font-size:12.5px; font-weight:800;
          padding:8px 16px; border-radius:20px;
        }
        .pending-dot { width:7px; height:7px; border-radius:50%; background:currentColor; animation:blink 2s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.35} }

        .summary-strip {
          display:flex; align-items:center; gap:0;
          background:var(--surface); border:1px solid var(--border);
          border-radius:var(--radius); overflow:hidden; box-shadow:var(--shadow-sm);
        }
        .summary-item { flex:1; display:flex; flex-direction:column; align-items:center; padding:16px 12px; gap:3px; }
        .summary-num { font-size:22px; font-weight:800; color:var(--text); font-family:'IBM Plex Mono',monospace; }
        .summary-num.warning { color:var(--warning); }
        .summary-num.success { color:var(--success); }
        .summary-lab { font-size:11.5px; color:var(--text2); font-weight:600; }
        .summary-divider { width:1px; height:40px; background:var(--border); }

        .filter-row { display:flex; gap:6px; flex-wrap:wrap; }
        .filter-btn {
          background:var(--surface); border:1px solid var(--border); color:var(--text2);
          padding:8px 16px; border-radius:8px; font-size:13px; font-weight:600;
          cursor:pointer; transition:all 0.15s; font-family:'Cairo',sans-serif;
          box-shadow:var(--shadow-sm);
        }
        .filter-btn:hover { border-color:var(--border2); color:var(--text); }
        .filter-btn.active { background:var(--accent-muted2); border-color:var(--accent); color:var(--accent); }

        .sub-loading { display:flex; align-items:center; gap:12px; height:160px; justify-content:center; color:var(--text2); font-size:14px; }
        .spinner { width:20px; height:20px; border:2px solid var(--border2); border-top-color:var(--accent); border-radius:50%; animation:spin 0.8s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .sub-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; color:var(--text3); padding:60px; font-size:14px; }

        .sub-list { display:flex; flex-direction:column; gap:8px; }
        .sub-row {
          display:flex; align-items:center; gap:14px;
          background:var(--surface); border:1px solid var(--border);
          border-radius:var(--radius); padding:15px 18px;
          text-decoration:none; color:var(--text);
          transition:border-color 0.15s, box-shadow 0.15s;
          box-shadow:var(--shadow-sm);
        }
        .sub-row:hover { border-color:var(--accent); box-shadow:var(--shadow); }
        .sub-avatar {
          width:40px; height:40px; border-radius:10px; flex-shrink:0;
          background:linear-gradient(145deg,var(--accent),#2563c4);
          display:flex; align-items:center; justify-content:center;
          font-size:16px; font-weight:800; color:white;
        }
        .sub-body { flex:1; min-width:0; }
        .sub-name { font-size:14px; font-weight:700; color:var(--text); }
        .sub-meta { font-size:12px; color:var(--text2); margin-top:3px; display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
        .meta-dot { opacity:0.4; }
        .meta-school { color:var(--accent); font-weight:600; }
        .sub-right { display:flex; align-items:center; gap:10px; flex-shrink:0; }
        .sub-score-wrap { display:flex; flex-direction:column; align-items:center; gap:1px; }
        .sub-score { font-size:13.5px; font-weight:800; font-family:'IBM Plex Mono',monospace; color:var(--accent); }
        .sub-pct { font-size:10px; color:var(--text3); font-weight:600; }
        .status-chip { font-size:11px; font-weight:700; padding:4px 11px; border-radius:20px; border:1px solid; }
        .status-chip.pending { background:var(--warning-bg); color:var(--warning); border-color:rgba(180,83,9,0.2); }
        .status-chip.reviewed { background:var(--success-bg); color:var(--success); border-color:rgba(13,124,79,0.2); }
      `}</style>
    </div>
  );
}

export default function OwnerSubmissionsPage() {
  return (
    <Suspense fallback={<div style={{padding:40,color:"var(--text2)"}}>جارٍ التحميل…</div>}>
      <SubmissionsContent />
    </Suspense>
  );
}