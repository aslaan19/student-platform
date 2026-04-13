"use client";

import { useEffect, useState } from "react";

type Student = {
  id: string;
  profile: { full_name: string };
  class: { id: string; name: string } | null;
};

type Class = { id: string; name: string };

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);

  const fetchAll = async () => {
    const [sRes, cRes] = await Promise.all([
      fetch("/api/admin/students"),
      fetch("/api/admin/classes"),
    ]);
    setStudents(await sRes.json());
    setClasses(await cRes.json());
  };

  useEffect(() => { 
    (async () => {
      await fetchAll();
    })();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الطالب؟")) return;
    await fetch(`/api/admin/students/${id}`, { method: "DELETE" });
    fetchAll();
  };

  const handleAssign = async (studentId: string, classId: string) => {
    await fetch("/api/admin/students/assign", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, classId: classId || null }),
    });
    fetchAll();
  };

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <h1 className="text-2xl font-bold">الطلاب</h1>

      <div className="grid gap-4">
        {students.map(student => (
          <div key={student.id} className="rounded-xl border p-4 flex justify-between items-center">
            <div>
              <h2 className="font-semibold">{student.profile.full_name}</h2>
              <p className="text-sm text-gray-600">الفصل: {student.class?.name ?? "غير مضاف"}</p>
            </div>
            <div className="flex gap-2 items-center">
              <select
                className="border rounded px-2 py-1 text-sm"
                value={student.class?.id ?? ""}
                onChange={e => handleAssign(student.id, e.target.value)}
              >
                <option value="">بدون فصل</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button onClick={() => handleDelete(student.id)} className="text-red-500 text-sm border border-red-300 px-3 py-1 rounded hover:bg-red-50">
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}