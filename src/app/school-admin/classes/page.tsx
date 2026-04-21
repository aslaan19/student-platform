"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

interface ClassItem {
  id: string;
  name: string;
  teacher: { profile: { full_name: string } } | null;
  _count: { students: number };
}
interface Teacher { id: string; profile: { full_name: string }; }

export default function SchoolAdminClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const [cRes, tRes] = await Promise.all([
      fetch("/api/school-admin/classes"),
      fetch("/api/school-admin/teachers"),
    ]);
    const cData = await cRes.json();
    const tData = await tRes.json();
    setClasses(cData.classes ?? []);
    setTeachers(tData.teachers ?? []);
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []);

  async function handleCreate() {
    if (!newName.trim()) { setError("أدخل اسم الفصل"); return; }
    setCreating(true); setError("");
    const r = await fetch("/api/school-admin/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    if (!r.ok) { const d = await r.json(); setError(d.error ?? "فشل الإنشاء"); }
    else { setNewName(""); load(); }
    setCreating(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("حذف هذا الفصل؟")) return;
    await fetch(`/api/school-admin/classes/${id}`, { method: "DELETE" });
    load();
  }

  async function handleAssignTeacher(classId: string, teacherId: string) {
    await fetch(`/api/school-admin/classes/${classId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacher_id: teacherId || null }),
    });
    load();
  }

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "#6b7280", fontFamily: "Tajawal, sans-serif" }}>
      <div style={{ width: 18, height: 18, border: "2px solid #e5e7eb", borderTopColor: "#2563eb", borderRadius: "50%", animation: "sp 0.7s linear infinite" }} />
      جارٍ التحميل...
      <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div className="cl-page" dir="rtl">
      <div className="cl-header">
        <div>
          <h1 className="cl-title">الفصول</h1>
          <p className="cl-sub">{classes.length} فصل في مدرستك</p>
        </div>
      </div>

      <div className="create-row">
        <input className="cl-input" placeholder="اسم الفصل الجديد..." value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCreate()} dir="rtl" />
        <button className="cl-btn" onClick={handleCreate} disabled={creating}>{creating ? "جارٍ الإنشاء..." : "+ إنشاء فصل"}</button>
      </div>
      {error && <div className="cl-error">{error}</div>}

      {classes.length === 0 ? (
        <div className="cl-empty">لا توجد فصول بعد. أنشئ أول فصل.</div>
      ) : (
        <div className="cl-grid">
          {classes.map((cls) => (
            <div key={cls.id} className="cl-card">
              <div className="cl-card-header">
                <div className="cl-icon">📚</div>
                <div className="cl-card-body">
                  <div className="cl-name">{cls.name}</div>
                  <div className="cl-count">{cls._count.students} طالب</div>
                </div>
                <button className="delete-btn" onClick={() => handleDelete(cls.id)}>
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                </button>
              </div>
              <div className="cl-teacher-row">
                <span className="cl-teacher-label">المعلم:</span>
                <select className="cl-select"
                  value={cls.teacher ? teachers.find((t) => t.profile.full_name === cls.teacher?.profile.full_name)?.id ?? "" : ""}
                  onChange={(e) => handleAssignTeacher(cls.id, e.target.value)} dir="rtl">
                  <option value="">بدون معلم</option>
                  {teachers.map((t) => <option key={t.id} value={t.id}>{t.profile.full_name}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .cl-page{display:flex;flex-direction:column;gap:18px;font-family:Tajawal,sans-serif}
        .cl-header{display:flex;align-items:flex-start;justify-content:space-between}
        .cl-title{font-size:21px;font-weight:800;color:#111827}
        .cl-sub{font-size:13px;color:#6b7280;margin-top:2px}
        .create-row{display:flex;gap:8px}
        .cl-input{flex:1;padding:9px 13px;background:#fff;border:1.5px solid #e5e7eb;border-radius:9px;font-size:13px;font-family:Tajawal,sans-serif;color:#111827;outline:none}
        .cl-input:focus{border-color:#2563eb}
        .cl-btn{background:#2563eb;color:white;padding:9px 18px;border:none;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;font-family:Tajawal,sans-serif;white-space:nowrap}
        .cl-btn:disabled{opacity:0.5;cursor:not-allowed}
        .cl-error{font-size:12.5px;color:#ef4444}
        .cl-empty{text-align:center;color:#9ca3af;padding:50px;font-size:13px}
        .cl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
        .cl-card{background:#fff;border:1px solid #e5e7eb;border-radius:13px;padding:16px;display:flex;flex-direction:column;gap:12px}
        .cl-card-header{display:flex;align-items:center;gap:10px}
        .cl-icon{font-size:24px}
        .cl-card-body{flex:1}
        .cl-name{font-size:15px;font-weight:800;color:#111827}
        .cl-count{font-size:12px;color:#6b7280;margin-top:1px}
        .delete-btn{background:none;border:1px solid #e5e7eb;color:#9ca3af;width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.15s;flex-shrink:0}
        .delete-btn:hover{border-color:#ef4444;color:#ef4444}
        .cl-teacher-row{display:flex;align-items:center;gap:8px}
        .cl-teacher-label{font-size:12px;color:#6b7280;font-weight:600;white-space:nowrap}
        .cl-select{flex:1;background:#f7f8fa;border:1.5px solid #e5e7eb;color:#111827;border-radius:7px;padding:6px 10px;font-size:12.5px;font-family:Tajawal,sans-serif;outline:none;cursor:pointer}
        .cl-select:focus{border-color:#2563eb}
      `}</style>
    </div>
  );
}
