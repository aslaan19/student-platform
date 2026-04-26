"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/translations";

interface Stats {
  school: { name: string };
  teacherCount: number;
  studentCount: number;
  classCount: number;
  pendingPlacements: number;
  hasPlacementAssessment: boolean;
  studentsByStatus: { status: string; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING_INTAKE: "#c8a96a",
  INTAKE_SUBMITTED: "#b8935a",
  SCHOOL_ASSIGNED: "#a07840",
  SCHOOL_PLACEMENT_SUBMITTED: "#6b4f28",
  CLASS_ASSIGNED: "#3d2e18",
};

export default function SchoolAdminDashboard() {
  const { lang } = useLang();
  const tr = t[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  const STATUS_LABELS: Record<string, string> = {
    PENDING_INTAKE: tr.waitingClass,
    INTAKE_SUBMITTED: tr.waitingReview,
    SCHOOL_ASSIGNED: tr.schoolAssigned,
    SCHOOL_PLACEMENT_SUBMITTED: tr.placementAssessment,
    CLASS_ASSIGNED: tr.classAssigned,
  };

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/school-admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <>
        <div className="dash-loading">
          <div className="spin" />
          {tr.loading}
        </div>
        <style>{css}</style>
      </>
    );

  if (!stats)
    return (
      <>
        <div className="dash-loading">{tr.failedLoad}</div>
        <style>{css}</style>
      </>
    );

  const statCards = [
    {
      label: tr.teachers,
      value: stats.teacherCount,
      icon: (
        <svg
          width="22"
          height="22"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.6}
        >
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
      href: "/school-admin/teachers",
    },
    {
      label: tr.students,
      value: stats.studentCount,
      icon: (
        <svg
          width="22"
          height="22"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.6}
        >
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      ),
      href: "/school-admin/students",
    },
    {
      label: tr.classes,
      value: stats.classCount,
      icon: (
        <svg
          width="22"
          height="22"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.6}
        >
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        </svg>
      ),
      href: "/school-admin/classes",
    },
    {
      label: tr.awaitingPlacement,
      value: stats.pendingPlacements,
      icon: (
        <svg
          width="22"
          height="22"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.6}
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
      href: "/school-admin/submissions",
      alert: stats.pendingPlacements > 0,
    },
  ];

  return (
    <div className="dash" dir={dir}>
      {/* Header */}
      <div className="dash-header">
        <div>
          <p className="dash-eyebrow">{tr.schoolAdminDashboard}</p>
          <h1 className="dash-title">{stats.school.name}</h1>
        </div>
        {!stats.hasPlacementAssessment && (
          <Link href="/school-admin/placement-assessment" className="dash-cta">
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            {tr.createAssessment}
          </Link>
        )}
      </div>

      {/* Alert banners */}
      {!stats.hasPlacementAssessment && (
        <div className="alert-banner red">
          <svg
            width="14"
            height="14"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <path d="M12 9v4M12 17h.01" />
          </svg>
          <span>{tr.noAssessmentWarning}</span>
          <Link
            href="/school-admin/placement-assessment"
            className="alert-link"
          >
            {tr.createNow} ←
          </Link>
        </div>
      )}

      {stats.pendingPlacements > 0 && (
        <div className="alert-banner gold">
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
          <span>
            {stats.pendingPlacements} {tr.pendingPlacementsWarning}
          </span>
          <Link
            href="/school-admin/submissions?status=PENDING"
            className="alert-link"
          >
            {tr.reviewNow} ←
          </Link>
        </div>
      )}

      {/* Stat Cards */}
      <div className="stat-grid">
        {statCards.map((card, i) => (
          <Link key={i} href={card.href} className="stat-card">
            <div className="stat-icon-wrap">{card.icon}</div>
            <div className="stat-body">
              <div className="stat-val">{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </div>
            {card.alert && <div className="stat-alert-dot" />}
          </Link>
        ))}
      </div>

      {/* Pipeline */}
      {stats.studentsByStatus.length > 0 && (
        <div className="section">
          <h2 className="section-title">{tr.studentsByStatus}</h2>
          <div className="pipeline">
            {stats.studentsByStatus.map((s) => (
              <div key={s.status} className="pipe-row">
                <div
                  className="pipe-dot"
                  style={{ background: STATUS_COLORS[s.status] ?? "#c8a96a" }}
                />
                <div className="pipe-label">
                  {STATUS_LABELS[s.status] ?? s.status}
                </div>
                <div className="pipe-bar-wrap">
                  <div
                    className="pipe-bar"
                    style={{
                      width: stats.studentCount
                        ? `${(s.count / stats.studentCount) * 100}%`
                        : "0%",
                      background: STATUS_COLORS[s.status] ?? "#c8a96a",
                    }}
                  />
                </div>
                <div className="pipe-count">{s.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{css}</style>
    </div>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');

.dash {
  font-family: 'Cairo', sans-serif;
  display: flex;
  flex-direction: column;
  gap: 22px;
  color: #0B0B0C;
}

/* Loading */
.dash-loading {
  display: flex; align-items: center; gap: 10px;
  height: 180px; justify-content: center;
  color: #6b6455; font-size: 14px;
  font-family: 'Cairo', sans-serif;
}
.spin {
  width: 18px; height: 18px;
  border: 2px solid #e8e2d8;
  border-top-color: #C8A96A;
  border-radius: 50%;
  animation: sp 0.7s linear infinite;
}
@keyframes sp { to { transform: rotate(360deg); } }

/* Header */
.dash-header {
  display: flex; align-items: flex-start;
  justify-content: space-between; gap: 16px; flex-wrap: wrap;
}
.dash-eyebrow {
  font-size: 11.5px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: #C8A96A; margin-bottom: 4px;
}
.dash-title {
  font-size: 24px; font-weight: 800;
  color: #0B0B0C; letter-spacing: -0.4px; line-height: 1.2;
}
.dash-cta {
  display: inline-flex; align-items: center; gap: 7px;
  background: #0B0B0C; color: #C8A96A;
  padding: 10px 18px; border-radius: 10px;
  text-decoration: none; font-size: 13px; font-weight: 700;
  transition: background 0.15s; white-space: nowrap;
  font-family: 'Cairo', sans-serif;
}
.dash-cta:hover { background: #1e1e20; }

/* Alert banners */
.alert-banner {
  display: flex; align-items: center; gap: 10px;
  font-size: 13px; padding: 11px 15px;
  border-radius: 10px; font-weight: 600;
}
.alert-banner.red {
  background: rgba(200, 60, 60, 0.07);
  border: 1px solid rgba(200, 60, 60, 0.18);
  color: #9b2020;
}
.alert-banner.gold {
  background: rgba(200, 169, 106, 0.1);
  border: 1px solid rgba(200, 169, 106, 0.3);
  color: #7a5e20;
}
.alert-link {
  margin-inline-start: auto; color: inherit;
  font-weight: 800; text-decoration: none; white-space: nowrap;
}
.alert-link:hover { text-decoration: underline; }

/* Stat Cards */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.stat-card {
  background: #F5F3EE;
  border: 1px solid #e2ddd4;
  border-radius: 14px;
  padding: 18px 16px;
  text-decoration: none;
  display: flex; align-items: center; gap: 14px;
  position: relative; overflow: hidden;
  transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;
}
.stat-card::after {
  content: '';
  position: absolute; bottom: 0; inset-inline-start: 0; inset-inline-end: 0;
  height: 2.5px;
  background: linear-gradient(90deg, #C8A96A, #e0c080);
  opacity: 0; transition: opacity 0.15s;
}
.stat-card:hover {
  border-color: #C8A96A;
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(200,169,106,0.13);
}
.stat-card:hover::after { opacity: 1; }

.stat-icon-wrap {
  width: 46px; height: 46px; border-radius: 12px;
  background: #0B0B0C; color: #C8A96A;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.stat-val {
  font-size: 26px; font-weight: 800; color: #0B0B0C;
  line-height: 1; letter-spacing: -0.5px;
}
.stat-label {
  font-size: 12px; color: #7a6e5e; font-weight: 600; margin-top: 3px;
}
.stat-alert-dot {
  position: absolute; top: 12px; inset-inline-end: 12px;
  width: 9px; height: 9px; border-radius: 50%;
  background: #C8A96A;
  box-shadow: 0 0 0 2px #F5F3EE;
  animation: pulse 2s infinite;
}
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

/* Pipeline */
.section { display: flex; flex-direction: column; gap: 12px; }
.section-title {
  font-size: 13px; font-weight: 800; color: #0B0B0C;
  letter-spacing: 0.05em; text-transform: uppercase;
}
.pipeline {
  background: #F5F3EE;
  border: 1px solid #e2ddd4;
  border-radius: 14px;
  padding: 18px 20px;
  display: flex; flex-direction: column; gap: 12px;
}
.pipe-row { display: flex; align-items: center; gap: 11px; }
.pipe-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.pipe-label { font-size: 12.5px; color: #4a4035; width: 200px; flex-shrink: 0; font-weight: 500; }
.pipe-bar-wrap {
  flex: 1; height: 5px; background: #e2ddd4;
  border-radius: 99px; overflow: hidden;
}
.pipe-bar { height: 100%; border-radius: 99px; transition: width 0.6s ease; }
.pipe-count {
  font-size: 12.5px; font-weight: 800; color: #0B0B0C;
  width: 26px; text-align: start;
}

@media (max-width: 800px) {
  .stat-grid { grid-template-columns: repeat(2, 1fr); }
}
`;
