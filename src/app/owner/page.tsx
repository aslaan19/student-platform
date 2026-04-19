"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  schoolCount: number;
  teacherCount: number;
  studentCount: number;
  pendingSubmissions: number;
  totalSubmissions: number;
  hasIntakeAssessment: boolean;
  studentsByStatus: { status: string; count: number }[];
}

const STATUS_LABELS: Record<string, string> = {
  PENDING_INTAKE: "Pending Intake",
  INTAKE_SUBMITTED: "Intake Submitted",
  SCHOOL_ASSIGNED: "School Assigned",
  SCHOOL_PLACEMENT_SUBMITTED: "Placement Submitted",
  CLASS_ASSIGNED: "Class Assigned",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING_INTAKE: "#4f8ef7",
  INTAKE_SUBMITTED: "#fbbf24",
  SCHOOL_ASSIGNED: "#34d399",
  SCHOOL_PLACEMENT_SUBMITTED: "#a78bfa",
  CLASS_ASSIGNED: "#6ee7b7",
};

export default function OwnerDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/owner/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="dash-loading">
        <div className="spinner" />
        <span>Loading dashboard…</span>
      </div>
    );
  }

  if (!stats) return <div className="dash-error">Failed to load stats.</div>;

  const statCards = [
    {
      label: "Schools",
      value: stats.schoolCount,
      icon: "🏫",
      href: "/owner/schools",
      accent: "#4f8ef7",
    },
    {
      label: "Teachers",
      value: stats.teacherCount,
      icon: "👨‍🏫",
      href: "/owner/schools",
      accent: "#34d399",
    },
    {
      label: "Students",
      value: stats.studentCount,
      icon: "🎓",
      href: "/owner/submissions",
      accent: "#a78bfa",
    },
    {
      label: "Pending Reviews",
      value: stats.pendingSubmissions,
      icon: "⏳",
      href: "/owner/submissions?status=PENDING",
      accent: stats.pendingSubmissions > 0 ? "#fbbf24" : "#34d399",
      alert: stats.pendingSubmissions > 0,
    },
  ];

  return (
    <div className="dash">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Owner Dashboard</h1>
          <p className="dash-subtitle">Platform-wide overview and controls</p>
        </div>
        {!stats.hasIntakeAssessment && (
          <Link href="/owner/intake-assessment" className="dash-cta-btn">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M12 5v14M5 12h14" />
            </svg>
            Create Intake Assessment
          </Link>
        )}
      </div>

      {/* Alert banner */}
      {!stats.hasIntakeAssessment && (
        <div className="alert-banner">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          No intake assessment created yet. Students cannot take their first assessment.
          <Link href="/owner/intake-assessment" className="alert-link">Create one →</Link>
        </div>
      )}

      {stats.pendingSubmissions > 0 && (
        <div className="alert-banner warning">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
          </svg>
          {stats.pendingSubmissions} student submission{stats.pendingSubmissions > 1 ? "s" : ""} awaiting your review.
          <Link href="/owner/submissions?status=PENDING" className="alert-link">Review now →</Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="stat-grid">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href} className="stat-card" style={{ "--card-accent": card.accent } as never}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-body">
              <div className="stat-value">{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </div>
            {card.alert && <div className="stat-alert-dot" />}
          </Link>
        ))}
      </div>

      {/* Student pipeline */}
      <div className="section">
        <h2 className="section-title">Student Onboarding Pipeline</h2>
        <div className="pipeline">
          {stats.studentsByStatus.length === 0 ? (
            <div className="empty-state">No students yet.</div>
          ) : (
            stats.studentsByStatus.map((s) => (
              <div key={s.status} className="pipeline-item">
                <div
                  className="pipeline-dot"
                  style={{ background: STATUS_COLORS[s.status] ?? "#4a5568" }}
                />
                <div className="pipeline-label">{STATUS_LABELS[s.status] ?? s.status}</div>
                <div className="pipeline-bar-wrap">
                  <div
                    className="pipeline-bar"
                    style={{
                      width: `${Math.min(100, (s.count / stats.studentCount) * 100)}%`,
                      background: STATUS_COLORS[s.status] ?? "#4a5568",
                    }}
                  />
                </div>
                <div className="pipeline-count">{s.count}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-links">
          <Link href="/owner/intake-assessment" className="quick-link">
            <div className="ql-icon">📋</div>
            <div className="ql-body">
              <div className="ql-title">Intake Assessment</div>
              <div className="ql-sub">{stats.hasIntakeAssessment ? "View & edit" : "Create now"}</div>
            </div>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
          <Link href="/owner/submissions" className="quick-link">
            <div className="ql-icon">📝</div>
            <div className="ql-body">
              <div className="ql-title">Submissions</div>
              <div className="ql-sub">{stats.totalSubmissions} total, {stats.pendingSubmissions} pending</div>
            </div>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
          <Link href="/owner/schools" className="quick-link">
            <div className="ql-icon">🏫</div>
            <div className="ql-body">
              <div className="ql-title">Schools</div>
              <div className="ql-sub">{stats.schoolCount} schools registered</div>
            </div>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        </div>
      </div>

      <style>{`
        .dash { display: flex; flex-direction: column; gap: 28px; }
        .dash-loading, .dash-error {
          display: flex; align-items: center; justify-content: center;
          gap: 12px; height: 200px; color: var(--text2); font-size: 14px;
        }
        .spinner {
          width: 20px; height: 20px;
          border: 2px solid var(--border2);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .dash-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          flex-wrap: wrap; gap: 12px;
        }
        .dash-title { font-size: 24px; font-weight: 700; color: var(--text); letter-spacing: -0.5px; }
        .dash-subtitle { font-size: 13px; color: var(--text2); margin-top: 2px; }
        .dash-cta-btn {
          display: flex; align-items: center; gap: 7px;
          background: var(--accent); color: white;
          padding: 9px 16px; border-radius: 9px;
          text-decoration: none; font-size: 13px; font-weight: 600;
          transition: opacity 0.15s;
        }
        .dash-cta-btn:hover { opacity: 0.85; }

        .alert-banner {
          display: flex; align-items: center; gap: 10px;
          background: rgba(248,113,113,0.08);
          border: 1px solid rgba(248,113,113,0.25);
          border-radius: 10px;
          padding: 11px 16px;
          font-size: 13px; color: #f87171;
        }
        .alert-banner.warning { background: rgba(251,191,36,0.08); border-color: rgba(251,191,36,0.25); color: #fbbf24; }
        .alert-link { margin-left: auto; color: inherit; font-weight: 600; text-decoration: none; white-space: nowrap; }
        .alert-link:hover { text-decoration: underline; }

        .stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }
        .stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 18px;
          text-decoration: none;
          display: flex; align-items: center; gap: 14px;
          position: relative;
          transition: border-color 0.15s, transform 0.15s;
          overflow: hidden;
        }
        .stat-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: var(--card-accent, var(--accent));
        }
        .stat-card:hover { border-color: var(--card-accent, var(--border2)); transform: translateY(-1px); }
        .stat-icon { font-size: 28px; line-height: 1; }
        .stat-body { flex: 1; }
        .stat-value { font-size: 26px; font-weight: 700; color: var(--text); letter-spacing: -1px; font-family: 'JetBrains Mono', monospace; }
        .stat-label { font-size: 12px; color: var(--text2); margin-top: 1px; font-weight: 500; }
        .stat-alert-dot {
          position: absolute; top: 12px; right: 12px;
          width: 8px; height: 8px; border-radius: 50%;
          background: #fbbf24;
          box-shadow: 0 0 8px #fbbf24;
          animation: pulse 2s infinite;
        }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }

        .section { display: flex; flex-direction: column; gap: 14px; }
        .section-title { font-size: 15px; font-weight: 700; color: var(--text); }

        .pipeline { display: flex; flex-direction: column; gap: 10px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 18px; }
        .pipeline-item { display: flex; align-items: center; gap: 12px; }
        .pipeline-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .pipeline-label { font-size: 12.5px; color: var(--text2); width: 170px; flex-shrink: 0; }
        .pipeline-bar-wrap { flex: 1; height: 6px; background: var(--border); border-radius: 99px; overflow: hidden; }
        .pipeline-bar { height: 100%; border-radius: 99px; transition: width 0.6s ease; }
        .pipeline-count { font-size: 12px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; width: 24px; text-align: right; }

        .empty-state { font-size: 13px; color: var(--text3); text-align: center; padding: 16px 0; }

        .quick-links { display: flex; flex-direction: column; gap: 8px; }
        .quick-link {
          display: flex; align-items: center; gap: 14px;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 10px; padding: 14px 16px;
          text-decoration: none; color: var(--text);
          transition: border-color 0.15s, background 0.15s;
        }
        .quick-link:hover { border-color: var(--border2); background: var(--surface2); }
        .ql-icon { font-size: 22px; }
        .ql-body { flex: 1; }
        .ql-title { font-size: 13.5px; font-weight: 600; color: var(--text); }
        .ql-sub { font-size: 11.5px; color: var(--text2); margin-top: 1px; }

        @media (max-width: 900px) {
          .stat-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 500px) {
          .stat-grid { grid-template-columns: 1fr 1fr; }
          .pipeline-label { width: 130px; }
        }
      `}</style>
    </div>
  );
}