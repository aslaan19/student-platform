/* eslint-disable react-hooks/set-state-in-effect */
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
  student: { profile: { full_name: string }; school: { name: string } | null };
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
  const reviewed = submissions.filter(
    (s) => s.review_status === "REVIEWED",
  ).length;

  return (
    <div className="s-page" dir="rtl">
      <div className="s-header">
        <div>
          <div className="s-eyebrow">الطلبات المقدمة</div>
          <h1 className="s-title">مراجعة إجابات الطلاب</h1>
        </div>
        {pending > 0 && (
          <div className="s-pending-badge">
            <div className="s-pending-dot" />
            {pending} في الانتظار
          </div>
        )}
      </div>

      <div className="s-summary">
        {[
          { num: submissions.length, lab: "إجمالي الإجابات", cls: "" },
          { num: pending, lab: "في انتظار المراجعة", cls: "warn" },
          { num: reviewed, lab: "تمت المراجعة", cls: "done" },
        ].map((item, i) => (
          <div key={i} className="s-sum-item">
            <span className={`s-sum-num ${item.cls}`}>{item.num}</span>
            <span className="s-sum-lab">{item.lab}</span>
          </div>
        ))}
      </div>

      <div className="s-filters">
        {[
          { val: "", label: "جميع الإجابات" },
          { val: "PENDING", label: "في الانتظار" },
          { val: "REVIEWED", label: "تمت المراجعة" },
        ].map((f) => (
          <button
            key={f.val}
            className={`s-filter-btn ${statusFilter === f.val ? "active" : ""}`}
            onClick={() => setFilter(f.val)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="s-loading">
          <div className="s-spinner" />
          جارٍ تحميل الإجابات...
        </div>
      ) : submissions.length === 0 ? (
        <div className="s-empty">
          <svg
            width="44"
            height="44"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
            style={{ color: "var(--gold-border)", marginBottom: 12 }}
          >
            <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
            <path d="M12 11v6M9 14l3 3 3-3" />
          </svg>
          <p>لا توجد إجابات مطابقة.</p>
        </div>
      ) : (
        <div className="s-list">
          {submissions.map((s) => (
            <Link
              key={s.id}
              href={`/owner/submissions/${s.id}`}
              className="s-row"
            >
              <div className="s-avatar">
                {s.student.profile.full_name.charAt(0)}
              </div>
              <div className="s-body">
                <div className="s-name">{s.student.profile.full_name}</div>
                <div className="s-meta">
                  <span>
                    {new Date(s.submitted_at).toLocaleDateString("ar-SA", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="s-dot">·</span>
                  <span>{s.assessment.title}</span>
                  {s.assigned_school && (
                    <>
                      <span className="s-dot">·</span>
                      <span className="s-school">{s.assigned_school.name}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="s-right">
                {s.review_status === "REVIEWED" &&
                  s.score !== null &&
                  s.total !== null && (
                    <div className="s-score-wrap">
                      <span className="s-score">
                        {s.score}/{s.total}
                      </span>
                      <span className="s-pct">
                        {s.total ? Math.round((s.score / s.total) * 100) : 0}%
                      </span>
                    </div>
                  )}
                <div
                  className={`s-chip ${s.review_status === "REVIEWED" ? "done" : "pending"}`}
                >
                  {s.review_status === "REVIEWED"
                    ? "تمت المراجعة"
                    : "في الانتظار"}
                </div>
                <svg
                  width="13"
                  height="13"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  style={{ color: "var(--text3)", flexShrink: 0 }}
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}

      <style>{css}</style>
    </div>
  );
}

export default function OwnerSubmissionsPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            padding: 40,
            color: "var(--text3)",
            fontFamily: "Cairo, sans-serif",
          }}
        >
          جارٍ التحميل...
        </div>
      }
    >
      <SubmissionsContent />
    </Suspense>
  );
}

const css = `
  :root{--gold:#C8A96A;--gold2:#E5B93C;--gold-muted:rgba(200,169,106,0.1);--gold-border:rgba(200,169,106,0.2);--black:#0B0B0C;--off-white:#F5F3EE;--text:#0B0B0C;--text2:#4a3f2f;--text3:#9a8a6a;--surface:#ffffff;--surface2:#faf8f4;--surface3:#f5f0e8;--border:#e8dfd0;--border2:#d8ccb8;--success:#1a6b3c;--success-bg:rgba(26,107,60,0.08);--warning:#9a6200;--warning-bg:rgba(154,98,0,0.08);--radius:10px;--shadow-sm:0 1px 3px rgba(11,11,12,0.06);--shadow:0 4px 12px rgba(11,11,12,0.08);--shadow-md:0 8px 24px rgba(11,11,12,0.10)}
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0.35}}

  .s-page{display:flex;flex-direction:column;gap:20px;font-family:'Cairo',sans-serif}
  .s-header{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;padding-bottom:20px;border-bottom:1px solid var(--border)}
  .s-eyebrow{font-size:10.5px;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:5px}
  .s-title{font-size:22px;font-weight:900;color:var(--black);letter-spacing:-0.4px}
  .s-pending-badge{display:flex;align-items:center;gap:7px;background:var(--warning-bg);border:1px solid rgba(154,98,0,0.2);color:var(--warning);font-size:12.5px;font-weight:800;padding:8px 16px;border-radius:20px}
  .s-pending-dot{width:7px;height:7px;border-radius:50%;background:currentColor;animation:blink 2s infinite}

  .s-summary{display:flex;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow-sm)}
  .s-sum-item{flex:1;display:flex;flex-direction:column;align-items:center;padding:16px 12px;gap:4px;border-left:1px solid var(--border)}
  .s-sum-item:last-child{border-left:none}
  .s-sum-num{font-size:22px;font-weight:900;color:var(--black);font-family:'IBM Plex Mono',monospace}
  .s-sum-num.warn{color:var(--warning)}
  .s-sum-num.done{color:var(--success)}
  .s-sum-lab{font-size:11.5px;color:var(--text3);font-weight:600}

  .s-filters{display:flex;gap:6px;flex-wrap:wrap}
  .s-filter-btn{background:var(--surface);border:1px solid var(--border);color:var(--text2);padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.15s;font-family:'Cairo',sans-serif;box-shadow:var(--shadow-sm)}
  .s-filter-btn:hover{border-color:var(--gold-border);color:var(--text)}
  .s-filter-btn.active{background:var(--gold-muted);border-color:var(--gold);color:var(--gold)}

  .s-loading{display:flex;align-items:center;gap:12px;height:160px;justify-content:center;color:var(--text3);font-size:14px}
  .s-spinner{width:20px;height:20px;border:2px solid var(--gold-border);border-top-color:var(--gold);border-radius:50%;animation:spin 0.8s linear infinite}
  .s-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:var(--text3);padding:60px;font-size:14px}

  .s-list{display:flex;flex-direction:column;gap:8px}
  .s-row{display:flex;align-items:center;gap:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:15px 18px;text-decoration:none;color:var(--text);transition:all 0.18s;box-shadow:var(--shadow-sm)}
  .s-row:hover{border-color:var(--gold-border);box-shadow:var(--shadow)}
  .s-avatar{width:40px;height:40px;border-radius:10px;flex-shrink:0;background:var(--black);display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;color:var(--gold)}
  .s-body{flex:1;min-width:0}
  .s-name{font-size:14px;font-weight:700;color:var(--black)}
  .s-meta{font-size:12px;color:var(--text3);margin-top:3px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
  .s-dot{opacity:0.4}
  .s-school{color:var(--gold);font-weight:600}
  .s-right{display:flex;align-items:center;gap:10px;flex-shrink:0}
  .s-score-wrap{display:flex;flex-direction:column;align-items:center;gap:1px}
  .s-score{font-size:13.5px;font-weight:800;font-family:'IBM Plex Mono',monospace;color:var(--gold)}
  .s-pct{font-size:10px;color:var(--text3);font-weight:600}
  .s-chip{font-size:11px;font-weight:700;padding:4px 11px;border-radius:20px;border:1px solid;white-space:nowrap}
  .s-chip.pending{background:var(--warning-bg);color:var(--warning);border-color:rgba(154,98,0,0.2)}
  .s-chip.done{background:rgba(26,107,60,0.08);color:var(--success);border-color:rgba(26,107,60,0.2)}
`;
