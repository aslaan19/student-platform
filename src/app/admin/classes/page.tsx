"use client";

import { useEffect, useState } from "react";

type Teacher = { id: string; profile: { full_name: string } };
type ClassItem = {
  id: string;
  name: string;
  teacher: { id: string; profile: { full_name: string } } | null;
  students: { id: string; profile: { full_name: string } }[];
};

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [newClassName, setNewClassName] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchAll = async () => {
    const [cRes, tRes] = await Promise.all([
      fetch("/api/admin/classes"),
      fetch("/api/admin/teachers"),
    ]);
    setClasses(await cRes.json());
    setTeachers(await tRes.json());
  };

  useEffect(() => {
    (async () => {
      await fetchAll();
    })();
  }, []);

  const handleCreate = async () => {
    if (!newClassName) return alert("أدخل اسم الفصل");
    await fetch("/api/admin/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newClassName }),
    });
    setNewClassName("");
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الفصل؟")) return;
    await fetch(`/api/admin/classes/${id}`, { method: "DELETE" });
    fetchAll();
  };

  const handleAssignTeacher = async (classId: string, teacherId: string) => {
    await fetch("/api/admin/teachers/assign", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, teacherId: teacherId || null }),
    });
    fetchAll();
  };

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <h1 className="text-2xl font-bold">الفصول</h1>

      {/* Create Class */}
      <div className="rounded-xl border p-4 flex gap-3">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="اسم الفصل الجديد"
          value={newClassName}
          onChange={(e) => setNewClassName(e.target.value)}
        />
        <button
          onClick={handleCreate}
          className="bg-black text-white px-4 py-2 rounded"
        >
          إنشاء
        </button>
      </div>

      {/* Classes List */}
      <div className="grid gap-4">
        {classes.map((cls) => (
          <div key={cls.id} className="rounded-xl border p-4 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">{cls.name}</h2>
                <p className="text-sm text-gray-600">
                  عدد الطلاب: {cls.students.length}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setExpanded(expanded === cls.id ? null : cls.id)
                  }
                  className="text-sm border px-3 py-1 rounded"
                >
                  {expanded === cls.id ? "إخفاء الطلاب" : "عرض الطلاب"}
                </button>
                <button
                  onClick={() => handleDelete(cls.id)}
                  className="text-red-500 text-sm border border-red-300 px-3 py-1 rounded hover:bg-red-50"
                >
                  حذف
                </button>
              </div>
            </div>

            {/* Assign Teacher */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">المعلم:</span>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={cls.teacher?.id ?? ""}
                onChange={(e) => handleAssignTeacher(cls.id, e.target.value)}
              >
                <option value="">بدون معلم</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.profile.full_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Students List */}
            {expanded === cls.id && (
              <div className="mt-2 space-y-1">
                <p className="text-sm font-medium">الطلاب:</p>
                {cls.students.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    لا يوجد طلاب في هذا الفصل
                  </p>
                ) : (
                  cls.students.map((s) => (
                    <p
                      key={s.id}
                      className="text-sm text-gray-700 border rounded px-3 py-1"
                    >
                      {s.profile.full_name}
                    </p>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
