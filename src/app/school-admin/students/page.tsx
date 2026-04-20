// school-admin/students/page.tsx
"use client";

import { useEffect, useState } from "react";

interface Student {
  id: string;
  onboarding_status: string;
  profile: { full_name: string };
  class: { id: string; name: string } | null;
}
interface ClassItem { id: string; name: string; }

const STATUS_LABELS: Record<string, string> = {
  PENDING_INTAKE: "انتظار القبول",
  INTAKE_SUBMITTED: "قيد المراجعة",
  SCHOOL_ASSIGNED: "انتظار التصنيف",
  SCHOOL_PLACEMENT_SUBMITTED: "قيد التصنيف",
  CLASS_ASSIGNED: "في الفصل",
};
const STATUS_COLORS: Record<string, string> = {
  PENDING_INTAKE: "#9ca3af", INTAKE_SUBMITTED: "#f59e0b",
  SCHOOL_ASSIGNED: "#2563eb", SCHOOL_PLACEMENT_SUBMITTED: "#7c3aed", CLASS_ASSIGNED: "#10b981",
};

export default function SchoolAdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function load() {
    const [sRes, cRes] = await Promise.all([
      fetch("/api/school-admin/students"),
      fetch("/api/school-admin/classes"),
    ]);
    const sData = await sRes.json();
    const cData = await cRes.json();
    setStudents(sData.students ?? []);
    setClasses(cData.classes ?? []);
    setLoading(false);
  }

  useEffect(() => { async function fetchData() { await load(); } }, []);

  async function handleAssign(studentId: string, classId: string) {
    await fetch(`/api/school-admin/students/${studentId}/assign-class`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ class_id: classId || null }),
    });
    load();
  }

  const filtered = students.filter((s) =>
    s.profile.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="st-page">
      <div className="st-header">
        <div>
          <h1 className="st-title">الطلاب</h1>
          <p className="st-sub">{students.length} طالب في مدرستك</p>
        </div>
        <input
          className="st-search"
          placeholder="بحث باسم الطالب..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          dir="rtl"
        />
      </div>

      {loading ? (
        <div className="st-loading"><div className="spin" />جارٍ التحميل...</div>
      ) : filtered.length === 0 ? (
        <div className="st-empty">{search ? "لا نتائج لهذا البحث." : "لا يوجد طلاب بعد."}</div>
      ) : (
        <div className="st-list">
          {filtered.map((s) => (
            <div key={s.id} className="st-row">
              <div className="st-avatar">{s.profile.full_name.charAt(0)}</div>
              <div className="st-body">
                <div className="st-name">{s.profile.full_name}</div>
                <div className="st-class">{s.class?.name ?? "لا فصل"}</div>
              </div>
              <div className="st-status" style={{ color: STATUS_COLORS[s.onboarding_status], background: `${STATUS_COLORS[s.onboarding_status]}15` }}>
                {STATUS_LABELS[s.onboarding_status] ?? s.onboarding_status}
              </div>
              <select className="st-select" value={s.class?.id ?? ""} onChange={(e) => handleAssign(s.id, e.target.value)} dir="rtl">
                <option value="">بدون فصل</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .st-page { display: flex; flex-direction: column; gap: 18px; }
        .st-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .st-title { font-size: 21px; font-weight: 800; color: var(--text); }
        .st-sub { font-size: 13px; color: var(--text2); margin-top: 2px; }
        .st-search { padding: 8px 14px; background: var(--surface); border: 1.5px solid var(--border); border-radius: 9px; font-size: 13px; font-family: Tajawal, sans-serif; color: var(--text); outline: none; width: 220px; }
        .st-search:focus { border-color: var(--accent); }
        .st-loading { display: flex; align-items: center; gap: 10px; height: 140px; justify-content: center; color: var(--text2); font-size: 14px; }
        .spin { width: 18px; height: 18px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: sp 0.7s linear infinite; }
        @keyframes sp { to { transform: rotate(360deg); } }
        .st-empty { text-align: center; color: var(--text3); padding: 50px; font-size: 13px; }
        .st-list { display: flex; flex-direction: column; gap: 8px; }
        .st-row { display: flex; align-items: center; gap: 12px; background: var(--surface); border: 1px solid var(--border); border-radius: 11px; padding: 12px 15px; }
        .st-avatar { width: 36px; height: 36px; border-radius: 9px; background: linear-gradient(135deg, var(--accent), var(--accent2)); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: white; flex-shrink: 0; }
        .st-body { flex: 1; min-width: 0; }
        .st-name { font-size: 13.5px; font-weight: 700; color: var(--text); }
        .st-class { font-size: 11.5px; color: var(--text2); margin-top: 1px; }
        .st-status { font-size: 10.5px; font-weight: 700; padding: 3px 9px; border-radius: 6px; white-space: nowrap; flex-shrink: 0; }
        .st-select { background: var(--surface2); border: 1.5px solid var(--border); color: var(--text); border-radius: 8px; padding: 6px 10px; font-size: 12.5px; font-family: Tajawal, sans-serif; outline: none; cursor: pointer; flex-shrink: 0; }
      `}</style>
    </div>
  );
}
