// school-admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  school: { name: string };
  teacherCount: number;
  studentCount: number;
  classCount: number;
  pendingPlacements: number;
  hasPlacementAssessment: boolean;
  studentsByStatus: { status: string; count: number }[];
}

const STATUS_LABELS: Record<string, string> = {
  PENDING_INTAKE: "انتظار اختبار القبول",
  INTAKE_SUBMITTED: "قيد مراجعة المسؤول",
  SCHOOL_ASSIGNED: "في انتظار اختبار التصنيف",
  SCHOOL_PLACEMENT_SUBMITTED: "قيد المراجعة",
  CLASS_ASSIGNED: "في الفصل",
};
const STATUS_COLORS: Record<string, string> = {
  PENDING_INTAKE: "#9ca3af",
  INTAKE_SUBMITTED: "#f59e0b",
  SCHOOL_ASSIGNED: "#2563eb",
  SCHOOL_PLACEMENT_SUBMITTED: "#7c3aed",
  CLASS_ASSIGNED: "#10b981",
};

export default function SchoolAdminDashboard() {
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
      <div className="dash-loading">
        <div className="spin" />
        جارٍ التحميل...
      </div>
    );

  if (!stats) return <div className="dash-loading">فشل تحميل البيانات</div>;

  const statCards = [
    {
      label: "المعلمون",
      value: stats.teacherCount,
      icon: "👨‍🏫",
      href: "/school-admin/teachers",
      color: "#2563eb",
    },
    {
      label: "الطلاب",
      value: stats.studentCount,
      icon: "🎓",
      href: "/school-admin/students",
      color: "#7c3aed",
    },
    {
      label: "الفصول",
      value: stats.classCount,
      icon: "📚",
      href: "/school-admin/classes",
      color: "#10b981",
    },
    {
      label: "بانتظار التصنيف",
      value: stats.pendingPlacements,
      icon: "⏳",
      href: "/school-admin/submissions",
      color: stats.pendingPlacements > 0 ? "#f59e0b" : "#10b981",
      alert: stats.pendingPlacements > 0,
    },
  ];

  return (
    <div className="dash">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">{stats.school.name}</h1>
          <p className="dash-sub">لوحة تحكم مدير المدرسة</p>
        </div>
        {!stats.hasPlacementAssessment && (
          <Link href="/school-admin/placement-assessment" className="dash-cta">
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
            إنشاء اختبار التصنيف
          </Link>
        )}
      </div>

      {!stats.hasPlacementAssessment && (
        <div className="alert-banner">
          <svg
            width="14"
            height="14"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          لم يتم إنشاء اختبار التصنيف بعد. لن يتمكن الطلاب من إجراء الاختبار.
          <Link
            href="/school-admin/placement-assessment"
            className="alert-link"
          >
            إنشاء الآن ←
          </Link>
        </div>
      )}

      {stats.pendingPlacements > 0 && (
        <div className="alert-banner warning">
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
          {stats.pendingPlacements} طالب في انتظار مراجعة اختبار التصنيف وتعيين
          الفصل.
          <Link
            href="/school-admin/submissions?status=PENDING"
            className="alert-link"
          >
            مراجعة ←
          </Link>
        </div>
      )}

      <div className="stat-grid">
        {statCards.map((card) => (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <Link
            key={card.label}
            href={card.href}
            className="stat-card"
            style={{ "--c": card.color } as never}
          >
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-body">
              <div className="stat-val">{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </div>
            {card.alert && <div className="stat-alert" />}
          </Link>
        ))}
      </div>

      {stats.studentsByStatus.length > 0 && (
        <div className="section">
          <h2 className="section-title">توزيع الطلاب حسب الحالة</h2>
          <div className="pipeline">
            {stats.studentsByStatus.map((s) => (
              <div key={s.status} className="pipe-row">
                <div
                  className="pipe-dot"
                  style={{ background: STATUS_COLORS[s.status] ?? "#9ca3af" }}
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
                      background: STATUS_COLORS[s.status] ?? "#9ca3af",
                    }}
                  />
                </div>
                <div className="pipe-count">{s.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .dash { display: flex; flex-direction: column; gap: 22px; }
        .dash-loading { display: flex; align-items: center; gap: 10px; height: 180px; justify-content: center; color: var(--text2); font-size: 14px; }
        .spin { width: 18px; height: 18px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: sp 0.7s linear infinite; }
        @keyframes sp { to { transform: rotate(360deg); } }

        .dash-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .dash-title { font-size: 22px; font-weight: 800; color: var(--text); }
        .dash-sub { font-size: 13px; color: var(--text2); margin-top: 2px; }
        .dash-cta {
          display: flex; align-items: center; gap: 7px;
          background: var(--accent); color: white;
          padding: 9px 16px; border-radius: 9px; text-decoration: none;
          font-size: 13px; font-weight: 700; transition: opacity 0.15s;
        }
        .dash-cta:hover { opacity: 0.85; }

        .alert-banner {
          display: flex; align-items: center; gap: 10px;
          background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.2);
          color: #dc2626; font-size: 13px; padding: 11px 14px; border-radius: 10px;
        }
        .alert-banner.warning { background: rgba(245,158,11,0.07); border-color: rgba(245,158,11,0.2); color: #b45309; }
        .alert-link { margin-right: auto; color: inherit; font-weight: 700; text-decoration: none; }
        .alert-link:hover { text-decoration: underline; }

        .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .stat-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 12px; padding: 16px;
          text-decoration: none; display: flex; align-items: center; gap: 12px;
          position: relative; overflow: hidden;
          transition: border-color 0.15s, transform 0.15s;
        }
        .stat-card::before {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
          background: var(--c);
        }
        .stat-card:hover { border-color: var(--c); transform: translateY(-1px); }
        .stat-icon { font-size: 26px; }
        .stat-val { font-size: 24px; font-weight: 800; color: var(--text); font-family: 'JetBrains Mono', monospace; letter-spacing: -1px; }
        .stat-label { font-size: 11.5px; color: var(--text2); font-weight: 500; margin-top: 1px; }
        .stat-alert {
          position: absolute; top: 10px; left: 10px;
          width: 8px; height: 8px; border-radius: 50%; background: #f59e0b;
          box-shadow: 0 0 6px #f59e0b; animation: pulse 2s infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.3} }

        .section { display: flex; flex-direction: column; gap: 12px; }
        .section-title { font-size: 14px; font-weight: 700; color: var(--text); }
        .pipeline { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
        .pipe-row { display: flex; align-items: center; gap: 10px; }
        .pipe-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .pipe-label { font-size: 12px; color: var(--text2); width: 200px; flex-shrink: 0; }
        .pipe-bar-wrap { flex: 1; height: 6px; background: var(--border); border-radius: 99px; overflow: hidden; }
        .pipe-bar { height: 100%; border-radius: 99px; transition: width 0.5s ease; }
        .pipe-count { font-size: 12px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text); width: 24px; text-align: left; }

        @media (max-width: 800px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </div>
  );
}
