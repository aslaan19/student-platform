"use client";

import { useEffect, useState, useCallback } from "react";

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

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-lg bg-gray-100 animate-pulse ${className}`}
      style={{ animation: "pulse 1.5s ease-in-out infinite" }}
    />
  );
}

export default function TeacherPage() {
  const [data, setData] = useState<TeacherData | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const fetchAnnouncements = useCallback(async (classId: string) => {
    setAnnouncementsLoading(true);
    const res = await fetch(`/api/teacher/announcements?classId=${classId}`);
    setAnnouncements(await res.json());
    setAnnouncementsLoading(false);
  }, []);

  const handleSelectClass = useCallback(async (cls: ClassItem) => {
    setSelectedClass(cls);
    await fetchAnnouncements(cls.id);
  }, [fetchAnnouncements]);

  useEffect(() => {
    fetch("/api/teacher")
      .then(r => r.json())
      .then((d: TeacherData) => {
        setData(d);
        if (d.classes?.length > 0) handleSelectClass(d.classes[0]);
        setLoading(false);
        setTimeout(() => setVisible(true), 50);
      });
  }, [handleSelectClass]);

  const handlePost = async () => {
    if (!newAnnouncement.trim() || !selectedClass) return;
    setPosting(true);
    await fetch("/api/teacher/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId: selectedClass.id, content: newAnnouncement }),
    });
    setNewAnnouncement("");
    await fetchAnnouncements(selectedClass.id);
    setPosting(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await fetch(`/api/teacher/announcements?id=${id}`, { method: "DELETE" });
    await new Promise(r => setTimeout(r, 300));
    if (selectedClass) await fetchAnnouncements(selectedClass.id);
    setDeletingId(null);
  };

  if (loading) return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
        <div className="md:col-span-2 space-y-3">
          <Skeleton className="h-28 w-full" />
          {[1, 2].map(i => <Skeleton key={i} className="h-20 w-full" />)}
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
        @keyframes fadeOut { to{opacity:0;transform:scale(0.97)} }
        .announcement-item { animation: fadeSlideIn 0.3s ease forwards; }
        .deleting { animation: fadeOut 0.3s ease forwards; }
      `}</style>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">أهلاً، {data?.profile.full_name}</h1>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>{data?.classes.length} فصل</span>
          <span>{data?.classes.reduce((acc, c) => acc + c.students.length, 0)} طالب</span>
        </div>
      </div>

      {!data?.classes.length ? (
        <div className="rounded-xl border p-8 text-center text-gray-400">لم يتم تعيينك في أي فصل بعد.</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Classes + Students */}
          <div className="md:col-span-1 space-y-3">
            <h2 className="font-semibold text-gray-700 text-sm">فصولي</h2>
            {data?.classes.map((cls, i) => (
              <button
                key={cls.id}
                onClick={() => handleSelectClass(cls)}
                style={{ transitionDelay: `${i * 40}ms` }}
                className={`w-full text-right px-4 py-3 rounded-xl border text-sm transition-all duration-200 ${
                  selectedClass?.id === cls.id
                    ? "bg-black text-white border-black scale-[1.01]"
                    : "bg-white hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                <div className="font-medium">{cls.name}</div>
                <div className={`text-xs mt-0.5 ${selectedClass?.id === cls.id ? "text-gray-300" : "text-gray-400"}`}>
                  {cls.students.length} طالب
                </div>
              </button>
            ))}

            {selectedClass && (
              <div className="rounded-xl border p-4 space-y-2 mt-2">
                <h3 className="font-semibold text-sm text-gray-700">طلاب {selectedClass.name}</h3>
                {selectedClass.students.length === 0 ? (
                  <p className="text-xs text-gray-400">لا يوجد طلاب</p>
                ) : (
                  selectedClass.students.map((s, i) => (
                    <div
                      key={s.id}
                      className="text-sm px-3 py-2 bg-gray-50 rounded-lg"
                      style={{ animation: `fadeSlideIn 0.25s ease ${i * 30}ms both` }}
                    >
                      {s.profile.full_name}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Announcements */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="font-semibold text-gray-700 text-sm">إعلانات {selectedClass?.name}</h2>

            <div className="rounded-xl border p-4 space-y-3">
              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm resize-none outline-none focus:ring-2 focus:ring-black transition-shadow"
                rows={3}
                placeholder="اكتب إعلاناً للفصل..."
                value={newAnnouncement}
                onChange={e => setNewAnnouncement(e.target.value)}
              />
              <button
                onClick={handlePost}
                disabled={posting || !newAnnouncement.trim()}
                className="bg-black text-white px-5 py-2 rounded-lg text-sm disabled:opacity-40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                {posting ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    جارٍ النشر...
                  </span>
                ) : "نشر الإعلان"}
              </button>
            </div>

            <div className="space-y-3">
              {announcementsLoading ? (
                [1, 2].map(i => <Skeleton key={i} className="h-20 w-full" />)
              ) : announcements.length === 0 ? (
                <div className="rounded-xl border p-6 text-center text-gray-400 text-sm">لا توجد إعلانات بعد</div>
              ) : (
                announcements.map(a => (
                  <div
                    key={a.id}
                    className={`rounded-xl border p-4 space-y-2 announcement-item ${deletingId === a.id ? "deleting" : ""}`}
                  >
                    <p className="text-sm leading-relaxed">{a.content}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">
                        {new Date(a.created_at).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
                      </span>
                      <button
                        onClick={() => handleDelete(a.id)}
                        disabled={deletingId === a.id}
                        className="text-xs text-red-500 hover:underline disabled:opacity-40 transition-opacity"
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