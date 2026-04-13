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

export default function StudentPage() {
  const [data, setData] = useState<StudentData | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      });
  }, []);

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
      <div className="rounded-xl border p-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            أهلاً، {data.profile.full_name}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {data.class
              ? `أنت في ${data.class.name}`
              : "لم يتم إضافتك إلى فصل بعد"}
          </p>
        </div>
        {data.class?.teacher && (
          <div className="text-left text-sm text-gray-500">
            <p className="text-xs text-gray-400">المعلم</p>
            <p className="font-medium text-gray-700">
              {data.class.teacher.profile.full_name}
            </p>
          </div>
        )}
      </div>

      {!data.class ? (
        <div className="rounded-xl border p-8 text-center text-gray-400">
          تواصل مع المدير لإضافتك إلى فصل
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Classmates */}
          <div className="md:col-span-1 rounded-xl border p-4 space-y-3">
            <h2 className="font-semibold text-gray-700">
              زملائي ({data.class.students.length})
            </h2>
            {data.class.students.length === 0 ? (
              <p className="text-sm text-gray-400">لا يوجد زملاء بعد</p>
            ) : (
              data.class.students.map((s) => (
                <div
                  key={s.id}
                  className={`text-sm px-3 py-2 rounded-lg ${
                    s.profile.full_name === data.profile.full_name
                      ? "bg-black text-white"
                      : "bg-gray-50"
                  }`}
                >
                  {s.profile.full_name}
                  {s.profile.full_name === data.profile.full_name && " (أنت)"}
                </div>
              ))
            )}
          </div>

          {/* Announcements */}
          <div className="md:col-span-2 space-y-3">
            <h2 className="font-semibold text-gray-700">إعلانات الفصل</h2>
            {announcements.length === 0 ? (
              <div className="rounded-xl border p-8 text-center text-gray-400 text-sm">
                لا توجد إعلانات حتى الآن
              </div>
            ) : (
              announcements.map((a) => (
                <div key={a.id} className="rounded-xl border p-4 space-y-2">
                  <p className="text-sm leading-relaxed">{a.content}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-500">
                      {a.teacher.profile.full_name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(a.created_at).toLocaleDateString("ar-SA", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
