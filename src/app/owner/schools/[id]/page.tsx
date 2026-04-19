"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface SchoolDetail {
  id: string;
  name: string;
  created_at: string;
  admin: { id: string; full_name: string } | null;
  teachers: {
    id: string;
    profile: { full_name: string };
    classes: { id: string; name: string }[];
  }[];
  students: {
    id: string;
    onboarding_status: string;
    profile: { full_name: string };
    class: { id: string; name: string } | null;
  }[];
  classes: {
    id: string;
    name: string;
    teacher: { profile: { full_name: string } } | null;
    _count: { students: number };
  }[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING_INTAKE: "#4f8ef7",
  INTAKE_SUBMITTED: "#fbbf24",
  SCHOOL_ASSIGNED: "#34d399",
  SCHOOL_PLACEMENT_SUBMITTED: "#a78bfa",
  CLASS_ASSIGNED: "#6ee7b7",
};
const STATUS_LABELS: Record<string, string> = {
  PENDING_INTAKE: "Pending Intake",
  INTAKE_SUBMITTED: "Intake Submitted",
  SCHOOL_ASSIGNED: "School Assigned",
  SCHOOL_PLACEMENT_SUBMITTED: "Placement Submitted",
  CLASS_ASSIGNED: "Class Assigned",
};

type Tab = "overview" | "teachers" | "students" | "classes";

export default function OwnerSchoolDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [school, setSchool] = useState<SchoolDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/owner/schools/${id}`)
      .then((r) => r.json())
      .then((d) => setSchool(d.school))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="sd-loading"><div className="spinner" />Loading school…</div>;
  if (!school) return <div className="sd-error">School not found.</div>;

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "teachers", label: "Teachers", count: school.teachers.length },
    { id: "students", label: "Students", count: school.students.length },
    { id: "classes", label: "Classes", count: school.classes.length },
  ];

  return (
    <div className="sd-page">
      <div className="sd-header">
        <Link href="/owner/schools" className="back-link">
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
          All Schools
        </Link>
        <div className="sd-title-row">
          <div className="sd-icon">🏫</div>
          <div>
            <h1 className="sd-title">{school.name}</h1>
            <p className="sd-sub">
              Admin: {school.admin?.full_name ?? <span className="no-admin">Unassigned</span>}
            </p>
          </div>
          <div className="readonly-badge">
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            View Only
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.count !== undefined && <span className="tab-badge">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === "overview" && (
        <div className="overview-grid">
          {[
            { label: "Teachers", value: school.teachers.length, icon: "👨‍🏫" },
            { label: "Students", value: school.students.length, icon: "🎓" },
            { label: "Classes", value: school.classes.length, icon: "📚" },
            { label: "Created", value: new Date(school.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short" }), icon: "📅" },
          ].map((s) => (
            <div key={s.label} className="ov-card">
              <div className="ov-icon">{s.icon}</div>
              <div className="ov-val">{s.value}</div>
              <div className="ov-lab">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Teachers Tab */}
      {tab === "teachers" && (
        <div className="list-section">
          {school.teachers.length === 0 ? (
            <div className="empty">No teachers in this school.</div>
          ) : (
            school.teachers.map((t) => (
              <div key={t.id} className="list-row">
                <div className="list-avatar">{t.profile.full_name.charAt(0)}</div>
                <div className="list-body">
                  <div className="list-name">{t.profile.full_name}</div>
                  <div className="list-sub">
                    {t.classes.length > 0
                      ? t.classes.map((c) => c.name).join(", ")
                      : "No classes assigned"}
                  </div>
                </div>
                <div className="list-tag">{t.classes.length} class{t.classes.length !== 1 ? "es" : ""}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Students Tab */}
      {tab === "students" && (
        <div className="list-section">
          {school.students.length === 0 ? (
            <div className="empty">No students in this school.</div>
          ) : (
            school.students.map((s) => (
              <div key={s.id} className="list-row">
                <div className="list-avatar student">{s.profile.full_name.charAt(0)}</div>
                <div className="list-body">
                  <div className="list-name">{s.profile.full_name}</div>
                  <div className="list-sub">{s.class?.name ?? "No class assigned"}</div>
                </div>
                <div
                  className="status-chip"
                  style={{ "--chip-color": STATUS_COLORS[s.onboarding_status] ?? "#4a5568" } as never}
                >
                  {STATUS_LABELS[s.onboarding_status] ?? s.onboarding_status}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Classes Tab */}
      {tab === "classes" && (
        <div className="list-section">
          {school.classes.length === 0 ? (
            <div className="empty">No classes in this school.</div>
          ) : (
            school.classes.map((c) => (
              <div key={c.id} className="list-row">
                <div className="list-avatar class">📚</div>
                <div className="list-body">
                  <div className="list-name">{c.name}</div>
                  <div className="list-sub">
                    {c.teacher?.profile.full_name ?? "No teacher assigned"}
                  </div>
                </div>
                <div className="list-tag">{c._count.students} students</div>
              </div>
            ))
          )}
        </div>
      )}

      <style>{`
        .sd-page { display: flex; flex-direction: column; gap: 22px; }
        .sd-loading, .sd-error { display: flex; align-items: center; gap: 12px; height: 200px; justify-content: center; color: var(--text2); font-size: 14px; }
        .spinner { width: 18px; height: 18px; border: 2px solid var(--border2); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .back-link { display: inline-flex; align-items: center; gap: 5px; font-size: 12.5px; color: var(--text2); text-decoration: none; font-weight: 500; }
        .back-link:hover { color: var(--accent); }
        .sd-header { display: flex; flex-direction: column; gap: 10px; }
        .sd-title-row { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
        .sd-icon { font-size: 32px; }
        .sd-title { font-size: 22px; font-weight: 700; color: var(--text); letter-spacing: -0.4px; }
        .sd-sub { font-size: 13px; color: var(--text2); margin-top: 2px; }
        .no-admin { color: var(--danger); }
        .readonly-badge {
          display: flex; align-items: center; gap: 6px;
          background: rgba(79,142,247,0.08); border: 1px solid rgba(79,142,247,0.2);
          color: var(--accent); font-size: 11px; font-weight: 600;
          padding: 5px 10px; border-radius: 7px; margin-left: auto;
        }

        .tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--border); padding-bottom: 0; }
        .tab {
          display: flex; align-items: center; gap: 6px;
          background: none; border: none; cursor: pointer;
          padding: 8px 14px; font-size: 13px; font-weight: 500;
          color: var(--text2); border-bottom: 2px solid transparent;
          margin-bottom: -1px; transition: all 0.15s; border-radius: 6px 6px 0 0;
        }
        .tab:hover { color: var(--text); }
        .tab.active { color: var(--accent); border-bottom-color: var(--accent); }
        .tab-badge {
          background: var(--surface2); border-radius: 99px;
          padding: 1px 7px; font-size: 10.5px; font-family: 'JetBrains Mono', monospace;
          color: var(--text2);
        }
        .tab.active .tab-badge { background: rgba(79,142,247,0.12); color: var(--accent); }

        .overview-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .ov-card {
          background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
          padding: 18px; display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center;
        }
        .ov-icon { font-size: 24px; }
        .ov-val { font-size: 22px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text); }
        .ov-lab { font-size: 11px; color: var(--text2); font-weight: 500; text-transform: uppercase; letter-spacing: 0.3px; }

        .list-section { display: flex; flex-direction: column; gap: 8px; }
        .empty { text-align: center; color: var(--text3); padding: 40px; font-size: 13px; }
        .list-row {
          display: flex; align-items: center; gap: 12px;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 10px; padding: 13px 16px;
        }
        .list-avatar {
          width: 36px; height: 36px; border-radius: 9px;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 700; color: white; flex-shrink: 0;
        }
        .list-avatar.student { background: linear-gradient(135deg, #34d399, #059669); }
        .list-avatar.class { background: var(--surface2); font-size: 18px; border: 1px solid var(--border); }
        .list-body { flex: 1; min-width: 0; }
        .list-name { font-size: 13.5px; font-weight: 600; color: var(--text); }
        .list-sub { font-size: 11.5px; color: var(--text2); margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .list-tag { font-size: 11.5px; font-weight: 600; color: var(--text2); background: var(--surface2); padding: 3px 10px; border-radius: 6px; white-space: nowrap; }
        .status-chip {
          font-size: 10.5px; font-weight: 600;
          color: var(--chip-color, var(--accent));
          background: color-mix(in srgb, var(--chip-color, var(--accent)) 12%, transparent);
          border: 1px solid color-mix(in srgb, var(--chip-color, var(--accent)) 30%, transparent);
          padding: 3px 9px; border-radius: 6px; white-space: nowrap;
        }
        @media (max-width: 700px) {
          .overview-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
}