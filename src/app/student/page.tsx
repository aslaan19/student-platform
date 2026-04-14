"use client";

import { useEffect, useState, useCallback } from "react";

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

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-lg bg-gray-100 ${className}`}
      style={{ animation: "pulse 1.5s ease-in-out infinite" }}
    />
  );
}

export default function StudentPage() {
  const [data, setData] = useState<StudentData | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const d: StudentData = await fetch("/api/student").then((r) => r.json());
      setData(d);
      if (d.class) {
        const ann = await fetch(
          `/api/student/announcements?classId=${d.class.id}`,
        ).then((r) => r.json());
        setAnnouncements(ann);
      }
      setLoading(false);
      setTimeout(() => setVisible(true), 50);
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="space-y-6 p-6" dir="rtl">
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
        <Skeleton className="h-24 w-full" />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full" />
          <div className="md:col-span-2 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    );

  return (
    <div
      dir="rtl"
      className="space-y-6 p-6"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}
    >
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Header */}
      <div className="rounded-xl border p-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            أهلاً، {data?.profile.full_name}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {data?.class
              ? `أنت في ${data.class.name}`
              : "لم يتم إضافتك إلى فصل بعد"}
          </p>
        </div>
        {data?.class?.teacher && (
          <div className="text-left text-sm">
            <p className="text-xs text-gray-400">المعلم</p>
            <p className="font-medium text-gray-700">
              {data.class.teacher.profile.full_name}
            </p>
          </div>
        )}
      </div>

      {!data?.class ? (
        <div className="rounded-xl border p-8 text-center text-gray-400">
          تواصل مع المدير لإضافتك إلى فصل
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Classmates */}
          <div className="md:col-span-1 rounded-xl border p-4 space-y-2">
            <h2 className="font-semibold text-gray-700 text-sm mb-3">
              زملائي ({data.class.students.length})
            </h2>
            {data.class.students.length === 0 ? (
              <p className="text-sm text-gray-400">لا يوجد زملاء بعد</p>
            ) : (
              data.class.students.map((s, i) => (
                <div
                  key={s.id}
                  className={`text-sm px-3 py-2 rounded-lg transition-all ${
                    s.profile.full_name === data.profile.full_name
                      ? "bg-black text-white"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                  style={{
                    animation: `fadeSlideIn 0.25s ease ${i * 25}ms both`,
                  }}
                >
                  {s.profile.full_name}
                  {s.profile.full_name === data.profile.full_name && " (أنت)"}
                </div>
              ))
            )}
          </div>

          {/* Announcements */}
          <div className="md:col-span-2 space-y-3">
            <h2 className="font-semibold text-gray-700 text-sm">
              إعلانات الفصل
            </h2>
            {announcements.length === 0 ? (
              <div className="rounded-xl border p-8 text-center text-gray-400 text-sm">
                لا توجد إعلانات حتى الآن
              </div>
            ) : (
              announcements.map((a, i) => (
                <div
                  key={a.id}
                  className="rounded-xl border p-4 space-y-2 hover:border-gray-300 transition-colors"
                  style={{
                    animation: `fadeSlideIn 0.3s ease ${i * 50}ms both`,
                  }}
                >
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
