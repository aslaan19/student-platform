"use client";

import { useEffect, useState } from "react";

type Announcement = {
  id: string;
  content: string;
  created_at: string;
  teacher: { profile: { full_name: string } };
};

type StudentData = {
  profile: { full_name: string };
  class: {
    id: string;
    name: string;
    teacher: { profile: { full_name: string } } | null;
    students: { id: string; profile: { full_name: string } }[];
  } | null;
};

export default function StudentClassPage() {
  const [data, setData] = useState<StudentData | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    fetch("/api/student")
      .then((r) => r.json())
      .then(async (d: StudentData) => {
        setData(d);
        if (d.class) {
          const res = await fetch(
            `/api/student/announcements?classId=${d.class.id}`,
          );
          setAnnouncements(await res.json());
        }
      });
  }, []);

  if (!data)
    return (
      <div className="p-6" dir="rtl">
        جارٍ التحميل...
      </div>
    );

  if (!data.class) {
    return (
      <div className="p-6" dir="rtl">
        <p className="text-gray-500">
          لم يتم إضافتك إلى فصل بعد. تواصل مع المدير.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <h1 className="text-2xl font-bold">{data.class.name}</h1>
      <p className="text-gray-600">
        المعلم: {data.class.teacher?.profile.full_name ?? "لا يوجد معلم"}
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Classmates */}
        <div className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold">
            زملائي في الفصل ({data.class.students.length})
          </h2>
          {data.class.students.map((s) => (
            <div
              key={s.id}
              className={`text-sm border rounded px-3 py-2 ${s.profile.full_name === data.profile.full_name ? "bg-gray-50 font-medium" : ""}`}
            >
              {s.profile.full_name}
              {s.profile.full_name === data.profile.full_name && " (أنت)"}
            </div>
          ))}
        </div>

        {/* Announcements */}
        <div className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold">إعلانات الفصل</h2>
          {announcements.length === 0 ? (
            <p className="text-sm text-gray-400">لا توجد إعلانات</p>
          ) : (
            announcements.map((a) => (
              <div
                key={a.id}
                className="border rounded px-3 py-2 text-sm space-y-1"
              >
                <p>{a.content}</p>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">
                    {a.teacher.profile.full_name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(a.created_at).toLocaleDateString("ar")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
