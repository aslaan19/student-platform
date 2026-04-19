// school-admin/classes/page.tsx
"use client";

import { Suspense, use, useState, useTransition } from "react";

interface ClassItem {
  id: string;
  name: string;
  teacher: { profile: { full_name: string } } | null;
  _count: { students: number };
}

interface Teacher {
  id: string;
  profile: { full_name: string };
}

interface ClassesPageData {
  classes: ClassItem[];
  teachers: Teacher[];
}

async function loadClassesData(): Promise<ClassesPageData> {
  const [cRes, tRes] = await Promise.all([
    fetch("/api/school-admin/classes"),
    fetch("/api/school-admin/teachers"),
  ]);
  const cData = await cRes.json();
  const tData = await tRes.json();

  return {
    classes: cData.classes ?? [],
    teachers: tData.teachers ?? [],
  };
}

function ClassesLoading() {
  return (
    <div className="cl-loading">
      <div className="spin" />
      Ø¬Ø§Ø±Ù Ø§Ù„ØªØ­Ù…ÙŠÙ„...
      <style>{`
        .cl-loading { display: flex; align-items: center; gap: 10px; height: 140px; justify-content: center; color: var(--text2); font-size: 14px; }
        .spin { width: 18px; height: 18px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: sp 0.7s linear infinite; }
        @keyframes sp { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function SchoolAdminClassesContent({
  dataPromise,
  refresh,
}: {
  dataPromise: Promise<ClassesPageData>;
  refresh: () => void;
}) {
  const { classes, teachers } = use(dataPromise);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!newName.trim()) {
      setError("Ø£Ø¯Ø®Ù„ Ø§Ø³Ù… Ø§Ù„ÙØµÙ„");
      return;
    }
    setCreating(true);
    setError("");
    try {
      const r = await fetch("/api/school-admin/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!r.ok) {
        const d = await r.json();
        setError(d.error ?? "ÙØ´Ù„ Ø§Ù„Ø¥Ù†Ø´Ø§Ø¡");
        return;
      }
      setNewName("");
      refresh();
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Ø­Ø°Ù Ù‡Ø°Ø§ Ø§Ù„ÙØµÙ„ØŸ")) return;
    await fetch(`/api/school-admin/classes/${id}`, { method: "DELETE" });
    refresh();
  }

  async function handleAssignTeacher(classId: string, teacherId: string) {
    await fetch(`/api/school-admin/classes/${classId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacher_id: teacherId || null }),
    });
    refresh();
  }

  return (
    <div className="cl-page">
      <div className="cl-header">
        <div>
          <h1 className="cl-title">Ø§Ù„ÙØµÙˆÙ„</h1>
          <p className="cl-sub">{classes.length} ÙØµÙ„ ÙÙŠ Ù…Ø¯Ø±Ø³ØªÙƒ</p>
        </div>
      </div>

      <div className="create-row">
        <input
          className="cl-input"
          placeholder="Ø§Ø³Ù… Ø§Ù„ÙØµÙ„ Ø§Ù„Ø¬Ø¯ÙŠØ¯..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          dir="rtl"
        />
        <button className="cl-btn" onClick={handleCreate} disabled={creating}>
          {creating ? "Ø¬Ø§Ø±Ù Ø§Ù„Ø¥Ù†Ø´Ø§Ø¡..." : "+ Ø¥Ù†Ø´Ø§Ø¡ ÙØµÙ„"}
        </button>
      </div>
      {error && <div className="cl-error">{error}</div>}

      {classes.length === 0 ? (
        <div className="cl-empty">Ù„Ø§ ØªÙˆØ¬Ø¯ ÙØµÙˆÙ„ Ø¨Ø¹Ø¯. Ø£Ù†Ø´Ø¦ Ø£ÙˆÙ„ ÙØµÙ„.</div>
      ) : (
        <div className="cl-grid">
          {classes.map((cls) => (
            <div key={cls.id} className="cl-card">
              <div className="cl-card-header">
                <div className="cl-icon">ðŸ“š</div>
                <div className="cl-card-body">
                  <div className="cl-name">{cls.name}</div>
                  <div className="cl-count">{cls._count.students} Ø·Ø§Ù„Ø¨</div>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(cls.id)}
                  title="Ø­Ø°Ù Ø§Ù„ÙØµÙ„"
                >
                  <svg
                    width="13"
                    height="13"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                  </svg>
                </button>
              </div>
              <div className="cl-teacher-row">
                <span className="cl-teacher-label">Ø§Ù„Ù…Ø¹Ù„Ù…:</span>
                <select
                  className="cl-select"
                  value={
                    cls.teacher
                      ? (teachers.find(
                          (t) =>
                            t.profile.full_name ===
                            cls.teacher?.profile.full_name,
                        )?.id ?? "")
                      : ""
                  }
                  onChange={(e) => handleAssignTeacher(cls.id, e.target.value)}
                  dir="rtl"
                >
                  <option value="">Ø¨Ø¯ÙˆÙ† Ù…Ø¹Ù„Ù…</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.profile.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .cl-page { display: flex; flex-direction: column; gap: 18px; }
        .cl-header { display: flex; align-items: flex-start; justify-content: space-between; }
        .cl-title { font-size: 21px; font-weight: 800; color: var(--text); }
        .cl-sub { font-size: 13px; color: var(--text2); margin-top: 2px; }
        .create-row { display: flex; gap: 8px; }
        .cl-input { flex: 1; padding: 9px 13px; background: var(--surface); border: 1.5px solid var(--border); border-radius: 9px; font-size: 13px; font-family: 'Tajawal', sans-serif; color: var(--text); outline: none; }
        .cl-input:focus { border-color: var(--accent); }
        .cl-btn { background: var(--accent); color: white; padding: 9px 18px; border: none; border-radius: 9px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: 'Tajawal', sans-serif; white-space: nowrap; }
        .cl-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .cl-error { font-size: 12.5px; color: var(--danger); }
        .cl-empty { text-align: center; color: var(--text3); padding: 50px; font-size: 13px; }
        .cl-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
        .cl-card { background: var(--surface); border: 1px solid var(--border); border-radius: 13px; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
        .cl-card-header { display: flex; align-items: center; gap: 10px; }
        .cl-icon { font-size: 24px; }
        .cl-card-body { flex: 1; }
        .cl-name { font-size: 15px; font-weight: 800; color: var(--text); }
        .cl-count { font-size: 12px; color: var(--text2); margin-top: 1px; }
        .delete-btn { background: none; border: 1px solid var(--border); color: var(--text3); width: 28px; height: 28px; border-radius: 7px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; flex-shrink: 0; }
        .delete-btn:hover { border-color: var(--danger); color: var(--danger); }
        .cl-teacher-row { display: flex; align-items: center; gap: 8px; }
        .cl-teacher-label { font-size: 12px; color: var(--text2); font-weight: 600; white-space: nowrap; }
        .cl-select { flex: 1; background: var(--surface2); border: 1.5px solid var(--border); color: var(--text); border-radius: 7px; padding: 6px 10px; font-size: 12.5px; font-family: 'Tajawal', sans-serif; outline: none; cursor: pointer; }
        .cl-select:focus { border-color: var(--accent); }
      `}</style>
    </div>
  );
}

export default function SchoolAdminClassesPage() {
  const [dataPromise, setDataPromise] = useState<Promise<ClassesPageData>>(() =>
    loadClassesData(),
  );
  const [, startTransition] = useTransition();

  function refresh() {
    startTransition(() => {
      setDataPromise(loadClassesData());
    });
  }

  return (
    <Suspense fallback={<ClassesLoading />}>
      <SchoolAdminClassesContent dataPromise={dataPromise} refresh={refresh} />
    </Suspense>
  );
}
