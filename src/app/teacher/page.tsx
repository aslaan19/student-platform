"use client";

import { useEffect, useState } from "react";

type Announcement = {
  id: string;
  content: string;
  created_at: string;
  teacher: { profile: { full_name: string } };
};

type ClassItem = {
  id: string;
  name: string;
  students: { id: string; profile: { full_name: string } }[];
};

type TeacherData = {
  profile: { full_name: string };
  classes: ClassItem[];
};

export default function TeacherPage() {
  const [data, setData] = useState<TeacherData | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleSelectClass = async (cls: ClassItem) => {
    setSelectedClass(cls);
    const res = await fetch(`/api/teacher/announcements?classId=${cls.id}`);
    setAnnouncements(await res.json());
  };

  useEffect(() => {
    fetch("/api/teacher")
      .then((r) => r.json())
      .then((d: TeacherData) => {
        setData(d);
        if (d.classes?.length > 0) handleSelectClass(d.classes[0]);
        setLoading(false);
      });
  }, []);

  const handlePost = async () => {
    if (!newAnnouncement.trim() || !selectedClass) return;
    setPosting(true);
    await fetch("/api/teacher/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classId: selectedClass.id,
        content: newAnnouncement,
      }),
    });
    setNewAnnouncement("");
    const res = await fetch(
      `/api/teacher/announcements?classId=${selectedClass.id}`,
    );
    setAnnouncements(await res.json());
    setPosting(false);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/teacher/announcements?id=${id}`, { method: "DELETE" });
    if (selectedClass) {
      const res = await fetch(
        `/api/teacher/announcements?classId=${selectedClass.id}`,
      );
      setAnnouncements(await res.json());
    }
  };

  if (loading)
    return (
      <div
        className="flex items-center justify-center h-64 text-gray-400"
        dir="rtl"
      >
        جارٍ التحميل...
      </div>
    );

  if (!data)
    return (
      <div
        className="flex items-center justify-center h-64 text-gray-400"
        dir="rtl"
      >
        حدث خطأ في تحميل البيانات
      </div>
    );

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">أهلاً، {data.profile.full_name}</h1>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>{data.classes.length} فصل</span>
          <span>
            {data.classes.reduce((acc, c) => acc + c.students.length, 0)} طالب
          </span>
        </div>
      </div>

      {data.classes.length === 0 ? (
        <div className="rounded-xl border p-8 text-center text-gray-400">
          لم يتم تعيينك في أي فصل بعد. تواصل مع المدير.
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: Class tabs + students */}
          <div className="md:col-span-1 space-y-3">
            <h2 className="font-semibold text-gray-700">فصولي</h2>
            {data.classes.map((cls) => (
              <button
                key={cls.id}
                onClick={() => handleSelectClass(cls)}
                className={`w-full text-right px-4 py-3 rounded-xl border text-sm transition ${
                  selectedClass?.id === cls.id
                    ? "bg-black text-white border-black"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <div className="font-medium">{cls.name}</div>
                <div
                  className={`text-xs mt-0.5 ${selectedClass?.id === cls.id ? "text-gray-300" : "text-gray-400"}`}
                >
                  {cls.students.length} طالب
                </div>
              </button>
            ))}

            {/* Students in selected class */}
            {selectedClass && (
              <div className="rounded-xl border p-4 space-y-2 mt-4">
                <h3 className="font-semibold text-sm text-gray-700">
                  طلاب {selectedClass.name}
                </h3>
                {selectedClass.students.length === 0 ? (
                  <p className="text-xs text-gray-400">لا يوجد طلاب</p>
                ) : (
                  selectedClass.students.map((s) => (
                    <div
                      key={s.id}
                      className="text-sm px-3 py-2 bg-gray-50 rounded-lg"
                    >
                      {s.profile.full_name}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Right: Announcements */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="font-semibold text-gray-700">
              إعلانات {selectedClass?.name ?? ""}
            </h2>

            {/* Post box */}
            <div className="rounded-xl border p-4 space-y-3">
              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm resize-none outline-none focus:ring-2 focus:ring-black"
                rows={3}
                placeholder="اكتب إعلاناً للفصل..."
                value={newAnnouncement}
                onChange={(e) => setNewAnnouncement(e.target.value)}
              />
              <button
                onClick={handlePost}
                disabled={posting || !newAnnouncement.trim()}
                className="bg-black text-white px-5 py-2 rounded-lg text-sm disabled:opacity-40"
              >
                {posting ? "جارٍ النشر..." : "نشر الإعلان"}
              </button>
            </div>

            {/* Announcements list */}
            <div className="space-y-3">
              {announcements.length === 0 ? (
                <div className="rounded-xl border p-6 text-center text-gray-400 text-sm">
                  لا توجد إعلانات لهذا الفصل بعد
                </div>
              ) : (
                announcements.map((a) => (
                  <div key={a.id} className="rounded-xl border p-4 space-y-2">
                    <p className="text-sm leading-relaxed">{a.content}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">
                        {new Date(a.created_at).toLocaleDateString("ar-SA", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
