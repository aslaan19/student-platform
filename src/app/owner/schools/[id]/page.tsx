"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

async function updateLanguage(schoolId: string, lang: string) {
  await fetch(`/api/owner/schools/${schoolId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language: lang }),
  });
}
interface SchoolDetail {
  id: string;
  name: string;
  language: string; // ← add this line

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
  PENDING_INTAKE: "#1a4fa0",
  INTAKE_SUBMITTED: "#b45309",
  SCHOOL_ASSIGNED: "#0d7c4f",
  SCHOOL_PLACEMENT_SUBMITTED: "#6d28d9",
  CLASS_ASSIGNED: "#0e7490",
};
const STATUS_LABELS: Record<string, string> = {
  PENDING_INTAKE: "في انتظار الاختبار",
  INTAKE_SUBMITTED: "تم تقديم الاختبار",
  SCHOOL_ASSIGNED: "تم تعيين المدرسة",
  SCHOOL_PLACEMENT_SUBMITTED: "تم تقديم التوزيع",
  CLASS_ASSIGNED: "تم تعيين الفصل",
};

type Tab = "overview" | "teachers" | "students" | "classes";

export default function OwnerSchoolDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [school, setSchool] = useState<SchoolDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/owner/schools/${id}`)
      .then((r) => r.json())
      .then((d) => setSchool(d.school))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="sd-loading">
        <div className="spinner" />
        جارٍ تحميل بيانات المدرسة…
      </div>
    );
  if (!school) return <div className="sd-loading">المدرسة غير موجودة.</div>;

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "overview", label: "نظرة عامة" },
    { id: "teachers", label: "المعلمون", count: school.teachers.length },
    { id: "students", label: "الطلاب", count: school.students.length },
    { id: "classes", label: "الفصول", count: school.classes.length },
  ];

  const filteredStudents = school.students.filter((s) =>
    s.profile.full_name.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredTeachers = school.teachers.filter((t) =>
    t.profile.full_name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="sd-page" dir="rtl">
      {/* Header */}
      <div className="sd-header">
        <Link href="/owner/schools" className="back-link">
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
          جميع المدارس
        </Link>
        <div className="sd-title-row">
          <div className="sd-icon-wrap">🏫</div>
          <div className="sd-title-body">
            <h1 className="sd-title">{school.name}</h1>
            <p className="sd-sub">
              المدير:{" "}
              {school.admin ? (
                <strong>{school.admin.full_name}</strong>
              ) : (
                <span className="no-admin">غير معيَّن</span>
              )}
              <span className="meta-sep"> · </span>
              أُنشئت{" "}
              {new Date(school.created_at).toLocaleDateString("ar-SA", {
                year: "numeric",
                month: "long",
              })}
            </p>
          </div>
          <div className="readonly-badge"></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-wrap">
        <div className="tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`tab ${tab === t.id ? "active" : ""}`}
              onClick={() => {
                setTab(t.id);
                setSearch("");
              }}
            >
              {t.label}
              {t.count !== undefined && (
                <span className="tab-badge">{t.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="overview-section">
          <div className="overview-grid">
            {[
              {
                label: "المعلمون",
                value: school.teachers.length,
                icon: "👨‍🏫",
                color: "#0d7c4f",
              },
              {
                label: "الطلاب",
                value: school.students.length,
                icon: "🎓",
                color: "#1a4fa0",
              },
              {
                label: "الفصول",
                value: school.classes.length,
                icon: "📚",
                color: "#6d28d9",
              },
              {
                label: "تاريخ الإنشاء",
                value: new Date(school.created_at).toLocaleDateString("ar-SA", {
                  year: "numeric",
                  month: "short",
                }),
                icon: "📅",
                color: "#b45309",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="ov-card"
                style={{ "--card-color": s.color } as React.CSSProperties}
              >
                <div className="ov-icon-wrap">
                  <span className="ov-icon">{s.icon}</span>
                </div>
                <div className="ov-val">{s.value}</div>
                <div className="ov-lab">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Quick stats about unassigned */}
          <div className="ov-info-cards">
            <div className="ov-info-card">
              <div className="ov-info-title">المعلمون بدون فصول</div>
              <div className="ov-info-val">
                {school.teachers.filter((t) => t.classes.length === 0).length}
              </div>
            </div>
            <div className="ov-info-card">
              <div className="ov-info-title">الطلاب بدون فصل</div>
              <div className="ov-info-val">
                {school.students.filter((s) => !s.class).length}
              </div>
            </div>
            <div className="ov-info-card">
              <div className="ov-info-title">الفصول بدون معلم</div>
              <div className="ov-info-val">
                {school.classes.filter((c) => !c.teacher).length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Teachers */}
      {tab === "teachers" && (
        <div className="list-section">
          {school.teachers.length > 4 && (
            <div className="list-search-wrap">
              <svg
                width="15"
                height="15"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                className="ls-icon"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                className="list-search"
                placeholder="ابحث عن معلم…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
          {filteredTeachers.length === 0 ? (
            <div className="empty">لا توجد نتائج مطابقة.</div>
          ) : (
            filteredTeachers.map((t) => (
              <div key={t.id} className="list-row">
                <div className="list-avatar teacher">
                  {t.profile.full_name.charAt(0)}
                </div>
                <div className="list-body">
                  <div className="list-name">{t.profile.full_name}</div>
                  <div className="list-sub">
                    {t.classes.length > 0
                      ? t.classes.map((c) => c.name).join("، ")
                      : "لا توجد فصول مُعيَّنة"}
                  </div>
                </div>
                <div className="list-tag">
                  {t.classes.length} {t.classes.length === 1 ? "فصل" : "فصول"}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Students */}
      {tab === "students" && (
        <div className="list-section">
          {school.students.length > 4 && (
            <div className="list-search-wrap">
              <svg
                width="15"
                height="15"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                className="ls-icon"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                className="list-search"
                placeholder="ابحث عن طالب…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
          {filteredStudents.length === 0 ? (
            <div className="empty">لا توجد نتائج مطابقة.</div>
          ) : (
            filteredStudents.map((s) => (
              <div key={s.id} className="list-row">
                <div className="list-avatar student">
                  {s.profile.full_name.charAt(0)}
                </div>
                <div className="list-body">
                  <div className="list-name">{s.profile.full_name}</div>
                  <div className="list-sub">
                    {s.class?.name ?? "لم يُعيَّن فصل"}
                  </div>
                </div>
                <div
                  className="status-chip-sm"
                  style={
                    {
                      "--chip-color":
                        STATUS_COLORS[s.onboarding_status] ?? "#4a5568",
                    } as React.CSSProperties
                  }
                >
                  {STATUS_LABELS[s.onboarding_status] ?? s.onboarding_status}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Classes */}
      {tab === "classes" && (
        <div className="list-section">
          {school.classes.length === 0 ? (
            <div className="empty">لا توجد فصول في هذه المدرسة.</div>
          ) : (
            school.classes.map((c) => (
              <div key={c.id} className="list-row">
                <div className="list-avatar class">📚</div>
                <div className="list-body">
                  <div className="list-name">{c.name}</div>
                  <div className="list-sub">
                    {c.teacher?.profile.full_name ?? "لم يُعيَّن معلم"}
                  </div>
                </div>
                <div className="list-tag">{c._count.students} طالب</div>
              </div>
            ))
          )}
        </div>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 16px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 10,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text2)" }}>
          لغة المدرسة
        </span>
        <select
          defaultValue={school.language ?? "ar"}
          onChange={(e) => updateLanguage(school.id, e.target.value)}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            fontSize: 13,
            fontFamily: "Tajawal, sans-serif",
            cursor: "pointer",
          }}
        >
          <option value="ar">🇸🇦 العربية</option>
          <option value="sq">🇦🇱 Shqip (Albanian)</option>
        </select>
      </div>
      <style>{`
        .sd-page { display:flex; flex-direction:column; gap:22px; }
        .sd-loading { display:flex; align-items:center; gap:12px; height:220px; justify-content:center; color:var(--text2); font-size:14px; }
        .spinner { width:20px; height:20px; border:2px solid var(--border2); border-top-color:var(--accent); border-radius:50%; animation:spin 0.8s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg)} }

        .back-link { display:inline-flex; align-items:center; gap:6px; font-size:13px; color:var(--text2); text-decoration:none; font-weight:600; }
        .back-link:hover { color:var(--accent); }
        .sd-header { display:flex; flex-direction:column; gap:12px; padding-bottom:20px; border-bottom:1px solid var(--border); }
        .sd-title-row { display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .sd-icon-wrap {
          width:52px; height:52px; border-radius:14px; flex-shrink:0;
          background:var(--accent-muted); border:1px solid var(--accent-muted2);
          display:flex; align-items:center; justify-content:center; font-size:28px;
        }
        .sd-title-body { flex:1; }
        .sd-title { font-size:22px; font-weight:800; color:var(--text); letter-spacing:-0.4px; }
        .sd-sub { font-size:13px; color:var(--text2); margin-top:3px; }
        .meta-sep { opacity:0.4; }
        .no-admin { color:var(--danger); font-style:italic; }
        .readonly-badge {
          display:flex; align-items:center; gap:6px;
          background:var(--accent-muted); border:1px solid var(--accent-muted2);
          color:var(--accent); font-size:11.5px; font-weight:700;
          padding:6px 14px; border-radius:20px; white-space:nowrap;
        }

        /* Tabs */
        .tabs-wrap { border-bottom:2px solid var(--border); }
        .tabs { display:flex; gap:2px; }
        .tab {
          display:flex; align-items:center; gap:7px;
          background:none; border:none; cursor:pointer;
          padding:10px 16px; font-size:13.5px; font-weight:700;
          color:var(--text2); border-bottom:2px solid transparent;
          margin-bottom:-2px; transition:all 0.15s;
          font-family:'Cairo',sans-serif; border-radius:6px 6px 0 0;
        }
        .tab:hover { color:var(--text); background:var(--surface3); }
        .tab.active { color:var(--accent); border-bottom-color:var(--accent); }
        .tab-badge {
          background:var(--surface3); border-radius:99px;
          padding:1px 8px; font-size:11px; font-family:'IBM Plex Mono',monospace;
          color:var(--text3); font-weight:700;
        }
        .tab.active .tab-badge { background:var(--accent-muted2); color:var(--accent); }

        /* Overview */
        .overview-section { display:flex; flex-direction:column; gap:16px; }
        .overview-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
        .ov-card {
          background:var(--surface); border:1px solid var(--border);
          border-top:3px solid var(--card-color,var(--accent));
          border-radius:var(--radius); padding:20px 16px;
          display:flex; flex-direction:column; align-items:center; gap:8px; text-align:center;
          box-shadow:var(--shadow-sm); transition:box-shadow 0.15s;
        }
        .ov-card:hover { box-shadow:var(--shadow); }
        .ov-icon-wrap {
          width:46px; height:46px; border-radius:12px;
          background:color-mix(in srgb,var(--card-color,var(--accent)) 10%,transparent);
          display:flex; align-items:center; justify-content:center;
        }
        .ov-icon { font-size:24px; }
        .ov-val { font-size:26px; font-weight:900; font-family:'IBM Plex Mono',monospace; color:var(--text); letter-spacing:-1px; }
        .ov-lab { font-size:12px; color:var(--text2); font-weight:700; }

        .ov-info-cards { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
        .ov-info-card {
          background:var(--surface2); border:1px solid var(--border);
          border-radius:var(--radius); padding:14px 16px;
          display:flex; align-items:center; justify-content:space-between;
        }
        .ov-info-title { font-size:12.5px; color:var(--text2); font-weight:600; }
        .ov-info-val { font-size:18px; font-weight:800; color:var(--text); font-family:'IBM Plex Mono',monospace; }

        /* Lists */
        .list-section { display:flex; flex-direction:column; gap:8px; }
        .empty { text-align:center; color:var(--text3); padding:48px; font-size:14px; font-weight:500; }

        .list-search-wrap { position:relative; display:flex; align-items:center; }
        .ls-icon { position:absolute; right:13px; color:var(--text3); pointer-events:none; }
        .list-search {
          width:100%; background:var(--surface); border:1px solid var(--border2);
          border-radius:8px; padding:9px 40px 9px 13px;
          font-size:13.5px; font-family:'Cairo',sans-serif; color:var(--text); outline:none;
          transition:border-color 0.15s, box-shadow 0.15s;
        }
        .list-search:focus { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-muted); }

        .list-row {
          display:flex; align-items:center; gap:13px;
          background:var(--surface); border:1px solid var(--border);
          border-radius:var(--radius); padding:14px 16px;
          box-shadow:var(--shadow-sm);
        }
        .list-avatar {
          width:38px; height:38px; border-radius:10px; flex-shrink:0;
          background:linear-gradient(145deg,var(--accent),#2563c4);
          display:flex; align-items:center; justify-content:center;
          font-size:15px; font-weight:800; color:white;
        }
        .list-avatar.teacher { background:linear-gradient(145deg,#0d7c4f,#059669); }
        .list-avatar.student { background:linear-gradient(145deg,#6d28d9,#7c3aed); }
        .list-avatar.class { background:var(--surface2); font-size:20px; border:1px solid var(--border); }
        .list-body { flex:1; min-width:0; }
        .list-name { font-size:14px; font-weight:700; color:var(--text); }
        .list-sub { font-size:12px; color:var(--text2); margin-top:2px; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .list-tag {
          font-size:12px; font-weight:700; color:var(--text2);
          background:var(--surface2); border:1px solid var(--border);
          padding:4px 12px; border-radius:20px; white-space:nowrap; flex-shrink:0;
        }
        .status-chip-sm {
          font-size:11px; font-weight:700; white-space:nowrap;
          color:var(--chip-color,var(--accent));
          background:color-mix(in srgb,var(--chip-color,var(--accent)) 10%,transparent);
          border:1px solid color-mix(in srgb,var(--chip-color,var(--accent)) 25%,transparent);
          padding:4px 11px; border-radius:20px; flex-shrink:0;
        }

        @media (max-width:900px) {
          .overview-grid { grid-template-columns:repeat(2,1fr); }
          .ov-info-cards { grid-template-columns:1fr; }
        }
        @media (max-width:600px) {
          .overview-grid { grid-template-columns:1fr 1fr; }
          .tabs { overflow-x:auto; }
        }
      `}</style>
    </div>
  );
}
