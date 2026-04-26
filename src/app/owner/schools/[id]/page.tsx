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
  language: string;
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

const STATUS_LABELS: Record<string, string> = {
  PENDING_INTAKE: "في انتظار الاختبار",
  INTAKE_SUBMITTED: "تم تقديم الاختبار",
  SCHOOL_ASSIGNED: "تم تعيين المدرسة",
  SCHOOL_PLACEMENT_SUBMITTED: "تم تقديم التوزيع",
  CLASS_ASSIGNED: "تم تعيين الفصل",
};
const STATUS_GOLD: Record<string, string> = {
  PENDING_INTAKE: "#C8A96A",
  INTAKE_SUBMITTED: "#E5B93C",
  SCHOOL_ASSIGNED: "#C8A96A",
  SCHOOL_PLACEMENT_SUBMITTED: "#E5B93C",
  CLASS_ASSIGNED: "#C8A96A",
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
      <div className="sd-load">
        <div className="sd-spin" />
        جارٍ تحميل بيانات المدرسة…<style>{css}</style>
      </div>
    );
  if (!school)
    return (
      <div className="sd-load">
        المدرسة غير موجودة.<style>{css}</style>
      </div>
    );

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
        <Link href="/owner/schools" className="sd-back">
          <svg
            width="14"
            height="14"
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
          <div className="sd-icon">🏫</div>
          <div className="sd-title-body">
            <h1 className="sd-title">{school.name}</h1>
            <p className="sd-sub">
              المدير:{" "}
              {school.admin ? (
                <strong>{school.admin.full_name}</strong>
              ) : (
                <span className="sd-no-admin">غير معيَّن</span>
              )}
              <span className="sd-sep"> · </span>
              أُنشئت{" "}
              {new Date(school.created_at).toLocaleDateString("ar-SA", {
                year: "numeric",
                month: "long",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sd-tabs-wrap">
        <div className="sd-tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`sd-tab ${tab === t.id ? "active" : ""}`}
              onClick={() => {
                setTab(t.id);
                setSearch("");
              }}
            >
              {t.label}
              {t.count !== undefined && (
                <span className="sd-tab-badge">{t.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="sd-ov">
          <div className="sd-ov-grid">
            {[
              { label: "المعلمون", value: school.teachers.length, icon: "👨‍🏫" },
              { label: "الطلاب", value: school.students.length, icon: "🎓" },
              { label: "الفصول", value: school.classes.length, icon: "📚" },
              {
                label: "تاريخ الإنشاء",
                value: new Date(school.created_at).toLocaleDateString("ar-SA", {
                  year: "numeric",
                  month: "short",
                }),
                icon: "📅",
              },
            ].map((s) => (
              <div key={s.label} className="sd-ov-card">
                <div className="sd-ov-icon">{s.icon}</div>
                <div className="sd-ov-val">{s.value}</div>
                <div className="sd-ov-lab">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="sd-ov-info-grid">
            {[
              {
                label: "المعلمون بدون فصول",
                val: school.teachers.filter((t) => t.classes.length === 0)
                  .length,
              },
              {
                label: "الطلاب بدون فصل",
                val: school.students.filter((s) => !s.class).length,
              },
              {
                label: "الفصول بدون معلم",
                val: school.classes.filter((c) => !c.teacher).length,
              },
            ].map((item, i) => (
              <div key={i} className="sd-info-card">
                <span className="sd-info-label">{item.label}</span>
                <span className="sd-info-val">{item.val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teachers */}
      {tab === "teachers" && (
        <div className="sd-list">
          {school.teachers.length > 4 && (
            <div className="sd-search-wrap">
              <svg
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                className="sd-search-icon"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                className="sd-search"
                placeholder="ابحث عن معلم…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
          {filteredTeachers.length === 0 ? (
            <div className="sd-empty">لا توجد نتائج مطابقة.</div>
          ) : (
            filteredTeachers.map((t) => (
              <div key={t.id} className="sd-row">
                <div className="sd-av teacher">
                  {t.profile.full_name.charAt(0)}
                </div>
                <div className="sd-row-body">
                  <div className="sd-row-name">{t.profile.full_name}</div>
                  <div className="sd-row-sub">
                    {t.classes.length > 0
                      ? t.classes.map((c) => c.name).join("، ")
                      : "لا توجد فصول مُعيَّنة"}
                  </div>
                </div>
                <div className="sd-tag">
                  {t.classes.length} {t.classes.length === 1 ? "فصل" : "فصول"}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Students */}
      {tab === "students" && (
        <div className="sd-list">
          {school.students.length > 4 && (
            <div className="sd-search-wrap">
              <svg
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                className="sd-search-icon"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                className="sd-search"
                placeholder="ابحث عن طالب…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
          {filteredStudents.length === 0 ? (
            <div className="sd-empty">لا توجد نتائج مطابقة.</div>
          ) : (
            filteredStudents.map((s) => (
              <div key={s.id} className="sd-row">
                <div className="sd-av student">
                  {s.profile.full_name.charAt(0)}
                </div>
                <div className="sd-row-body">
                  <div className="sd-row-name">{s.profile.full_name}</div>
                  <div className="sd-row-sub">
                    {s.class?.name ?? "لم يُعيَّن فصل"}
                  </div>
                </div>
                <div
                  className="sd-status-chip"
                  style={{
                    color: STATUS_GOLD[s.onboarding_status] ?? "#C8A96A",
                    background: `${STATUS_GOLD[s.onboarding_status] ?? "#C8A96A"}15`,
                    border: `1px solid ${STATUS_GOLD[s.onboarding_status] ?? "#C8A96A"}30`,
                  }}
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
        <div className="sd-list">
          {school.classes.length === 0 ? (
            <div className="sd-empty">لا توجد فصول في هذه المدرسة.</div>
          ) : (
            school.classes.map((c) => (
              <div key={c.id} className="sd-row">
                <div className="sd-av class-av">📚</div>
                <div className="sd-row-body">
                  <div className="sd-row-name">{c.name}</div>
                  <div className="sd-row-sub">
                    {c.teacher?.profile.full_name ?? "لم يُعيَّن معلم"}
                  </div>
                </div>
                <div className="sd-tag">{c._count.students} طالب</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Language selector */}
      <div className="sd-lang-card">
        <span className="sd-lang-label">لغة المدرسة</span>
        <select
          className="sd-lang-select"
          defaultValue={school.language ?? "ar"}
          onChange={(e) => updateLanguage(school.id, e.target.value)}
        >
          <option value="ar">🇸🇦 العربية</option>
          <option value="sq">🇦🇱 Shqip (Albanian)</option>
        </select>
      </div>

      <style>{css}</style>
    </div>
  );
}

const css = `
  :root{--gold:#C8A96A;--gold2:#E5B93C;--gold-muted:rgba(200,169,106,0.1);--gold-border:rgba(200,169,106,0.2);--black:#0B0B0C;--off-white:#F5F3EE;--text:#0B0B0C;--text2:#4a3f2f;--text3:#9a8a6a;--surface:#ffffff;--surface2:#faf8f4;--surface3:#f5f0e8;--border:#e8dfd0;--border2:#d8ccb8;--danger:#8b1a1a;--radius:10px;--shadow-sm:0 1px 3px rgba(11,11,12,0.06);--shadow:0 4px 12px rgba(11,11,12,0.08)}
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  @keyframes spin{to{transform:rotate(360deg)}}

  .sd-page{display:flex;flex-direction:column;gap:22px;font-family:'Cairo',sans-serif}
  .sd-load{display:flex;align-items:center;gap:12px;height:220px;justify-content:center;color:var(--text3);font-size:14px;font-family:'Cairo',sans-serif}
  .sd-spin{width:20px;height:20px;border:2px solid var(--gold-border);border-top-color:var(--gold);border-radius:50%;animation:spin 0.8s linear infinite}

  .sd-header{display:flex;flex-direction:column;gap:12px;padding-bottom:20px;border-bottom:1px solid var(--border)}
  .sd-back{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;color:var(--text3);text-decoration:none;font-weight:600;transition:color 0.15s}
  .sd-back:hover{color:var(--gold)}
  .sd-title-row{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
  .sd-icon{width:52px;height:52px;border-radius:14px;flex-shrink:0;background:var(--gold-muted);border:1px solid var(--gold-border);display:flex;align-items:center;justify-content:center;font-size:28px}
  .sd-title-body{flex:1}
  .sd-title{font-size:22px;font-weight:800;color:var(--black);letter-spacing:-0.4px}
  .sd-sub{font-size:13px;color:var(--text3);margin-top:3px}
  .sd-sep{opacity:0.4}
  .sd-no-admin{color:var(--danger);font-style:italic}

  .sd-tabs-wrap{border-bottom:2px solid var(--border)}
  .sd-tabs{display:flex;gap:2px}
  .sd-tab{display:flex;align-items:center;gap:7px;background:none;border:none;cursor:pointer;padding:10px 16px;font-size:13.5px;font-weight:700;color:var(--text3);border-bottom:2px solid transparent;margin-bottom:-2px;transition:all 0.15s;font-family:'Cairo',sans-serif;border-radius:6px 6px 0 0}
  .sd-tab:hover{color:var(--text);background:var(--surface3)}
  .sd-tab.active{color:var(--gold);border-bottom-color:var(--gold)}
  .sd-tab-badge{background:var(--surface3);border-radius:99px;padding:1px 8px;font-size:11px;font-family:'IBM Plex Mono',monospace;color:var(--text3);font-weight:700}
  .sd-tab.active .sd-tab-badge{background:var(--gold-muted);color:var(--gold);border:1px solid var(--gold-border)}

  .sd-ov{display:flex;flex-direction:column;gap:14px}
  .sd-ov-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
  .sd-ov-card{background:var(--surface);border:1px solid var(--border);border-top:2px solid var(--gold);border-radius:var(--radius);padding:20px 16px;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;box-shadow:var(--shadow-sm);transition:box-shadow 0.15s}
  .sd-ov-card:hover{box-shadow:var(--shadow)}
  .sd-ov-icon{font-size:24px}
  .sd-ov-val{font-size:26px;font-weight:900;font-family:'IBM Plex Mono',monospace;color:var(--gold);letter-spacing:-1px}
  .sd-ov-lab{font-size:12px;color:var(--text3);font-weight:700}

  .sd-ov-info-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
  .sd-info-card{background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:14px 16px;display:flex;align-items:center;justify-content:space-between}
  .sd-info-label{font-size:12.5px;color:var(--text2);font-weight:600}
  .sd-info-val{font-size:18px;font-weight:800;color:var(--black);font-family:'IBM Plex Mono',monospace}

  .sd-list{display:flex;flex-direction:column;gap:8px}
  .sd-empty{text-align:center;color:var(--text3);padding:48px;font-size:14px;font-weight:500}
  .sd-search-wrap{position:relative;display:flex;align-items:center}
  .sd-search-icon{position:absolute;right:13px;color:var(--text3);pointer-events:none}
  .sd-search{width:100%;background:var(--surface);border:1px solid var(--border2);border-radius:8px;padding:9px 40px 9px 13px;font-size:13.5px;font-family:'Cairo',sans-serif;color:var(--text);outline:none;transition:border-color 0.15s,box-shadow 0.15s}
  .sd-search:focus{border-color:var(--gold);box-shadow:0 0 0 3px var(--gold-muted)}

  .sd-row{display:flex;align-items:center;gap:13px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:14px 16px;box-shadow:var(--shadow-sm);transition:border-color 0.15s}
  .sd-row:hover{border-color:var(--gold-border)}
  .sd-av{width:38px;height:38px;border-radius:10px;flex-shrink:0;background:var(--black);display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;color:var(--gold)}
  .sd-av.teacher{background:var(--black);color:var(--gold)}
  .sd-av.student{background:rgba(200,169,106,0.15);color:var(--gold);border:1px solid var(--gold-border)}
  .sd-av.class-av{background:var(--surface2);font-size:20px;border:1px solid var(--border)}
  .sd-row-body{flex:1;min-width:0}
  .sd-row-name{font-size:14px;font-weight:700;color:var(--black)}
  .sd-row-sub{font-size:12px;color:var(--text3);margin-top:2px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .sd-tag{font-size:12px;font-weight:700;color:var(--text2);background:var(--surface2);border:1px solid var(--border);padding:4px 12px;border-radius:20px;white-space:nowrap;flex-shrink:0}
  .sd-status-chip{font-size:11px;font-weight:700;white-space:nowrap;padding:4px 11px;border-radius:20px;flex-shrink:0}

  .sd-lang-card{display:flex;align-items:center;gap:12px;padding:14px 18px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);box-shadow:var(--shadow-sm)}
  .sd-lang-label{font-size:13px;font-weight:700;color:var(--text2)}
  .sd-lang-select{padding:7px 13px;border-radius:8px;border:1px solid var(--gold-border);background:var(--surface);font-size:13px;font-family:'Cairo',sans-serif;cursor:pointer;color:var(--text);outline:none;transition:border-color 0.15s}
  .sd-lang-select:focus{border-color:var(--gold)}

  @media(max-width:900px){.sd-ov-grid{grid-template-columns:repeat(2,1fr)}.sd-ov-info-grid{grid-template-columns:1fr}}
  @media(max-width:600px){.sd-tabs{overflow-x:auto}}
`;
