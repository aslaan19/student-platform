"use client";

import { useEffect, useState } from "react";

type Student = { id: string; profile: { full_name: string } };
type ClassItem = { id: string; name: string; students: Student[] };
type TeacherData = { classes: ClassItem[] };
type Announcement = {
  id: string;
  content: string;
  created_at: string;
  teacher: { profile: { full_name: string } };
};

export default function TeacherClassesPage() {
  const [data, setData] = useState<TeacherData | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetch("/api/teacher")
      .then((r) => r.json())
      .then((d: TeacherData) => {
        setData(d);
        // eslint-disable-next-line react-hooks/immutability
        if (d.classes?.length > 0) selectClass(d.classes[0]);
      });
  }, []);

  const selectClass = async (cls: ClassItem) => {
    setSelectedClass(cls);
    const res = await fetch(`/api/teacher/announcements?classId=${cls.id}`);
    setAnnouncements(await res.json());
  };

  const handlePostAnnouncement = async () => {
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

  const handleDeleteAnnouncement = async (id: string) => {
    await fetch(`/api/teacher/announcements?id=${id}`, { method: "DELETE" });
    if (selectedClass) {
      const res = await fetch(
        `/api/teacher/announcements?classId=${selectedClass.id}`,
      );
      setAnnouncements(await res.json());
    }
  };

  if (!data)
    return (
      <div className="p-6" dir="rtl">
        جارٍ التحميل...
      </div>
    );

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <h1 className="text-2xl font-bold">فصولي</h1>

      {data.classes.length === 0 ? (
        <p className="text-gray-500">لم يتم تعيينك في أي فصل بعد.</p>
      ) : (
        <>
          {/* Class Tabs */}
          <div className="flex gap-2 flex-wrap">
            {data.classes.map((cls) => (
              <button
                key={cls.id}
                onClick={() => selectClass(cls)}
                className={`px-4 py-2 rounded-lg border text-sm ${selectedClass?.id === cls.id ? "bg-black text-white" : "bg-white"}`}
              >
                {cls.name}
              </button>
            ))}
          </div>

          {selectedClass && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Students */}
              <div className="rounded-xl border p-4 space-y-3">
                <h2 className="font-semibold">
                  الطلاب ({selectedClass.students.length})
                </h2>
                {selectedClass.students.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    لا يوجد طلاب في هذا الفصل
                  </p>
                ) : (
                  selectedClass.students.map((s) => (
                    <div
                      key={s.id}
                      className="text-sm border rounded px-3 py-2"
                    >
                      {s.profile.full_name}
                    </div>
                  ))
                )}
              </div>

              {/* Announcements */}
              <div className="rounded-xl border p-4 space-y-3">
                <h2 className="font-semibold">الإعلانات</h2>

                <div className="flex gap-2">
                  <input
                    className="flex-1 border rounded px-3 py-2 text-sm"
                    placeholder="اكتب إعلاناً..."
                    value={newAnnouncement}
                    onChange={(e) => setNewAnnouncement(e.target.value)}
                  />
                  <button
                    onClick={handlePostAnnouncement}
                    disabled={posting}
                    className="bg-black text-white px-3 py-2 rounded text-sm disabled:opacity-50"
                  >
                    نشر
                  </button>
                </div>

                <div className="space-y-2">
                  {announcements.length === 0 ? (
                    <p className="text-sm text-gray-400">لا توجد إعلانات</p>
                  ) : (
                    announcements.map((a) => (
                      <div
                        key={a.id}
                        className="border rounded px-3 py-2 text-sm space-y-1"
                      >
                        <p>{a.content}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">
                            {new Date(a.created_at).toLocaleDateString("ar")}
                          </span>
                          <button
                            onClick={() => handleDeleteAnnouncement(a.id)}
                            className="text-xs text-red-500"
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
        </>
      )}
    </div>
  );
}
