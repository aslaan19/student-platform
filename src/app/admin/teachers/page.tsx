"use client";

import { useEffect, useState } from "react";

type Teacher = {
  id: string;
  profile: { full_name: string };
  classes: { id: string; name: string }[];
};

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchTeachers = async () => {
    const res = await fetch("/api/admin/teachers");
    const data = await res.json();
    setTeachers(data);
  };

  useEffect(() => {
    (async () => {
      await fetchTeachers();
    })();
  }, []);

  const handleAdd = async () => {
    if (!fullName || !email || !password) return alert("أكمل جميع الحقول");
    setLoading(true);
    const res = await fetch("/api/admin/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const err = await res.json();
      return alert("فشل: " + err.error);
    }
    setFullName("");
    setEmail("");
    setPassword("");
    fetchTeachers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المعلم؟")) return;
    await fetch(`/api/admin/teachers/${id}`, { method: "DELETE" });
    fetchTeachers();
  };

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <h1 className="text-2xl font-bold">المعلمون</h1>

      {/* Add Teacher Form */}
      <div className="rounded-xl border p-4 space-y-3">
        <h2 className="font-semibold">إضافة معلم جديد</h2>
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="الاسم الكامل"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full border rounded px-3 py-2"
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleAdd}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "جارٍ الإضافة..." : "إضافة"}
        </button>
      </div>

      {/* Teachers List */}
      <div className="grid gap-4">
        {teachers.map((teacher) => (
          <div
            key={teacher.id}
            className="rounded-xl border p-4 flex justify-between items-center"
          >
            <div>
              <h2 className="font-semibold">{teacher.profile.full_name}</h2>
              <p className="text-sm text-gray-600">
                الفصول:{" "}
                {teacher.classes.length > 0
                  ? teacher.classes.map((c) => c.name).join("، ")
                  : "لا يوجد فصل"}
              </p>
            </div>
            <button
              onClick={() => handleDelete(teacher.id)}
              className="text-red-500 text-sm border border-red-300 px-3 py-1 rounded hover:bg-red-50"
            >
              حذف
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
