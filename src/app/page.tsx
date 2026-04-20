// student/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Announcement = {
  id: string;
  content: string;
  created_at: string;
  teacher: { profile: { full_name: string } };
};

type StudentData = {
  profile: { full_name: string };
  school: { name: string } | null;
  class: {
    id: string;
    name: string;
    teacher: { profile: { full_name: string } } | null;
    students: { id: string; profile: { full_name: string } }[];
  } | null;
};

export default function StudentPage() {
  const router = useRouter();
  const [data, setData] = useState<StudentData | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetch("/api/student")
      .then((r) => r.json())
      .then(async (d: StudentData) => {
        setData(d);
        if (d.class) {
          const ann = await fetch(`/api/student/announcements?classId=${d.class.id}`).then((r) => r.json());
          setAnnouncements(Array.isArray(ann) ? ann : []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) return (
    <div className="sd-shell">
      <div className="sd-spinner" />
      <style>{styles}</style>
    </div>
  );

  const initials = data?.profile.full_name
    ? data.profile.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("")
    : "ط";

  return (
    <div className="sd-shell" dir="rtl">
      {/* Top nav */}
      <header className="sd-nav">
        <div className="sd-nav-inner">
          <div className="sd-nav-brand">
            <div className="sd-nav-logo">🎓</div>
            <div className="sd-nav-titles">
              <span className="sd-nav-platform">المنصة التعليمية</span>
              {data?.school && <span className="sd-nav-school">{data.school.name}</span>}
            </div>
          </div>

          <div className="sd-nav-right">
            <Link href="/student/quizzes" className="sd-nav-link">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <path d="M9 12h6M9 16h4" />
              </svg>
              الاختبارات
            </Link>
            <div className="sd-user-pill">
              <div className="sd-avatar">{initials}</div>
              <span className="sd-user-name">{data?.profile.full_name}</span>
            </div>
            <button className="sd-logout-btn" onClick={handleLogout} disabled={loggingOut}>
              {loggingOut ? (
                <div className="sd-btn-spin" />
              ) : (
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              )}
              {loggingOut ? "..." : "خروج"}
            </button>
          </div>
        </div>
      </header>

      <main className="sd-main">
        {/* Welcome banner */}
        <div className="sd-welcome">
          <div className="sd-welcome-text">
            <div className="sd-welcome-greeting">مرحباً،</div>
            <h1 className="sd-welcome-name">{data?.profile.full_name} 👋</h1>
            {data?.class ? (
              <p className="sd-welcome-class">
                أنت في فصل <strong>{data.class.name}</strong>
                {data.class.teacher && <> · معلمك <strong>{data.class.teacher.profile.full_name}</strong></>}
              </p>
            ) : (
              <p className="sd-welcome-class">لم يتم تعيينك في فصل بعد</p>
            )}
          </div>
          <div className="sd-welcome-avatar">{initials}</div>
        </div>

        {!data?.class ? (
          <div className="sd-no-class">
            <div className="sd-no-class-icon">📚</div>
            <h2>لم يتم تعيينك في فصل بعد</h2>
            <p>تواصل مع مدير المدرسة لإضافتك إلى فصل دراسي</p>
          </div>
        ) : (
          <div className="sd-grid">
            {/* Announcements */}
            <div className="sd-card sd-announcements">
              <div className="sd-card-header">
                <div className="sd-card-icon">📢</div>
                <h2 className="sd-card-title">إعلانات الفصل</h2>
                <span className="sd-card-count">{announcements.length}</span>
              </div>
              <div className="sd-ann-list">
                {announcements.length === 0 ? (
                  <div className="sd-empty">
                    <div className="sd-empty-icon">🔔</div>
                    <p>لا توجد إعلانات حتى الآن</p>
                  </div>
                ) : (
                  announcements.map((a, i) => (
                    <div key={a.id} className="sd-ann-item" style={{ animationDelay: `${i * 60}ms` }}>
                      <div className="sd-ann-content">{a.content}</div>
                      <div className="sd-ann-meta">
                        <span className="sd-ann-teacher">
                          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                          </svg>
                          {a.teacher.profile.full_name}
                        </span>
                        <span className="sd-ann-date">
                          {new Date(a.created_at).toLocaleDateString("ar-SA", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Classmates */}
            <div className="sd-card sd-classmates">
              <div className="sd-card-header">
                <div className="sd-card-icon">👥</div>
                <h2 className="sd-card-title">زملائي</h2>
                <span className="sd-card-count">{data.class.students.length}</span>
              </div>
              <div className="sd-students-list">
                {data.class.students.map((s, i) => {
                  const isMe = s.profile.full_name === data.profile.full_name;
                  return (
                    <div key={s.id} className={`sd-student-row ${isMe ? "me" : ""}`} style={{ animationDelay: `${i * 40}ms` }}>
                      <div className="sd-student-avatar">
                        {s.profile.full_name.charAt(0)}
                      </div>
                      <span className="sd-student-name">{s.profile.full_name}</span>
                      {isMe && <span className="sd-me-badge">أنت</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="sd-actions">
          <Link href="/student/quizzes" className="sd-action-card">
            <div className="sd-action-icon">📝</div>
            <div className="sd-action-body">
              <div className="sd-action-title">الاختبارات</div>
              <div className="sd-action-sub">أداء الاختبارات المتاحة</div>
            </div>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ transform: "rotate(180deg)" }}>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
          <Link href="/student/classes" className="sd-action-card">
            <div className="sd-action-icon">📚</div>
            <div className="sd-action-body">
              <div className="sd-action-title">فصلي</div>
              <div className="sd-action-sub">تفاصيل فصلك الدراسي</div>
            </div>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ transform: "rotate(180deg)" }}>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        </div>
      </main>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .sd-shell {
    min-height: 100vh; background: #f7f8fa;
    font-family: Tajawal, sans-serif;
    display: flex; flex-direction: column;
  }
  .sd-shell:not(:has(.sd-nav)) {
    align-items: center; justify-content: center;
  }
  .sd-spinner {
    width: 32px; height: 32px;
    border: 3px solid #e5e7eb; border-top-color: #2563eb;
    border-radius: 50%; animation: spin 0.7s linear infinite;
    margin: auto;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  /* Nav */
  .sd-nav {
    background: white; border-bottom: 1px solid #e5e7eb;
    position: sticky; top: 0; z-index: 40;
  }
  .sd-nav-inner {
    max-width: 1100px; margin: 0 auto;
    padding: 0 24px; height: 58px;
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
  }
  .sd-nav-brand { display: flex; align-items: center; gap: 10px; }
  .sd-nav-logo { font-size: 24px; }
  .sd-nav-titles { display: flex; flex-direction: column; }
  .sd-nav-platform { font-size: 13px; font-weight: 800; color: #111827; }
  .sd-nav-school { font-size: 11px; color: #2563eb; font-weight: 600; }
  .sd-nav-right { display: flex; align-items: center; gap: 10px; }
  .sd-nav-link {
    display: flex; align-items: center; gap: 6px;
    font-size: 13px; font-weight: 600; color: #6b7280;
    text-decoration: none; padding: 6px 12px; border-radius: 8px;
    transition: all 0.15s;
  }
  .sd-nav-link:hover { background: #f1f3f6; color: #111827; }
  .sd-user-pill {
    display: flex; align-items: center; gap: 8px;
    background: #f1f3f6; border-radius: 99px; padding: 4px 12px 4px 4px;
  }
  .sd-avatar {
    width: 28px; height: 28px; border-radius: 50%;
    background: linear-gradient(135deg, #2563eb, #7c3aed);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 800; color: white;
  }
  .sd-user-name { font-size: 12.5px; font-weight: 700; color: #111827; max-width: 120px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sd-logout-btn {
    display: flex; align-items: center; gap: 6px;
    background: none; border: 1.5px solid #e5e7eb;
    color: #6b7280; padding: 6px 12px; border-radius: 8px;
    font-size: 13px; font-weight: 700; cursor: pointer;
    transition: all 0.15s; font-family: Tajawal, sans-serif;
  }
  .sd-logout-btn:hover:not(:disabled) { border-color: #ef4444; color: #ef4444; }
  .sd-logout-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .sd-btn-spin { width: 14px; height: 14px; border: 2px solid #d1d5db; border-top-color: #6b7280; border-radius: 50%; animation: spin 0.7s linear infinite; }

  /* Main */
  .sd-main { max-width: 1100px; margin: 0 auto; padding: 28px 24px; width: 100%; display: flex; flex-direction: column; gap: 22px; }

  /* Welcome */
  .sd-welcome {
    background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
    border-radius: 18px; padding: 28px 32px;
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    animation: fadeUp 0.4s ease both;
  }
  .sd-welcome-greeting { font-size: 13px; color: rgba(255,255,255,0.75); font-weight: 500; margin-bottom: 4px; }
  .sd-welcome-name { font-size: 26px; font-weight: 800; color: white; letter-spacing: -0.5px; }
  .sd-welcome-class { font-size: 13.5px; color: rgba(255,255,255,0.8); margin-top: 6px; }
  .sd-welcome-class strong { color: white; }
  .sd-welcome-avatar {
    width: 64px; height: 64px; border-radius: 50%; flex-shrink: 0;
    background: rgba(255,255,255,0.2); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; font-weight: 800; color: white;
    border: 2px solid rgba(255,255,255,0.3);
  }

  /* No class */
  .sd-no-class {
    background: white; border: 1px solid #e5e7eb; border-radius: 16px;
    padding: 48px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px;
  }
  .sd-no-class-icon { font-size: 40px; }
  .sd-no-class h2 { font-size: 17px; font-weight: 800; color: #111827; }
  .sd-no-class p { font-size: 13px; color: #6b7280; }

  /* Grid */
  .sd-grid { display: grid; grid-template-columns: 1fr 280px; gap: 16px; align-items: start; }
  @media (max-width: 768px) { .sd-grid { grid-template-columns: 1fr; } }

  /* Cards */
  .sd-card { background: white; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; animation: fadeUp 0.4s ease both; }
  .sd-card-header {
    display: flex; align-items: center; gap: 10px;
    padding: 16px 20px; border-bottom: 1px solid #f1f3f6;
  }
  .sd-card-icon { font-size: 20px; }
  .sd-card-title { font-size: 15px; font-weight: 800; color: #111827; flex: 1; }
  .sd-card-count {
    font-size: 11px; font-weight: 700; color: #6b7280;
    background: #f1f3f6; padding: 2px 8px; border-radius: 99px;
  }

  /* Announcements */
  .sd-ann-list { padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; max-height: 420px; overflow-y: auto; }
  .sd-ann-item {
    padding: 14px 16px; border-radius: 12px; border: 1px solid #f1f3f6;
    background: #fafafa; animation: fadeUp 0.3s ease both;
    transition: border-color 0.15s;
  }
  .sd-ann-item:hover { border-color: #e5e7eb; }
  .sd-ann-content { font-size: 14px; color: #111827; line-height: 1.6; margin-bottom: 10px; }
  .sd-ann-meta { display: flex; align-items: center; justify-content: space-between; }
  .sd-ann-teacher { display: flex; align-items: center; gap: 5px; font-size: 11.5px; color: #6b7280; font-weight: 600; }
  .sd-ann-date { font-size: 11px; color: #9ca3af; }

  /* Empty */
  .sd-empty { padding: 36px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .sd-empty-icon { font-size: 32px; }
  .sd-empty p { font-size: 13px; color: #9ca3af; }

  /* Classmates */
  .sd-students-list { padding: 10px 14px; display: flex; flex-direction: column; gap: 4px; max-height: 360px; overflow-y: auto; }
  .sd-student-row {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 10px; border-radius: 9px;
    animation: fadeUp 0.25s ease both; transition: background 0.15s;
  }
  .sd-student-row:hover { background: #f7f8fa; }
  .sd-student-row.me { background: #111827; }
  .sd-student-row.me:hover { background: #1f2937; }
  .sd-student-avatar {
    width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
    background: linear-gradient(135deg, #2563eb, #7c3aed);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 800; color: white;
  }
  .sd-student-row.me .sd-student-avatar { background: rgba(255,255,255,0.2); }
  .sd-student-name { flex: 1; font-size: 13px; font-weight: 600; color: #374151; }
  .sd-student-row.me .sd-student-name { color: white; }
  .sd-me-badge {
    font-size: 10px; font-weight: 700; color: #2563eb;
    background: rgba(37,99,235,0.15); padding: 2px 8px; border-radius: 99px;
  }
  .sd-student-row.me .sd-me-badge { color: white; background: rgba(255,255,255,0.2); }

  /* Actions */
  .sd-actions { display: flex; gap: 12px; flex-wrap: wrap; }
  .sd-action-card {
    display: flex; align-items: center; gap: 14px;
    background: white; border: 1px solid #e5e7eb; border-radius: 14px;
    padding: 16px 20px; text-decoration: none; color: #111827;
    flex: 1; min-width: 200px;
    transition: border-color 0.15s, transform 0.15s;
    animation: fadeUp 0.4s ease both;
  }
  .sd-action-card:hover { border-color: #2563eb; transform: translateY(-1px); }
  .sd-action-icon { font-size: 26px; }
  .sd-action-body { flex: 1; }
  .sd-action-title { font-size: 14px; font-weight: 800; color: #111827; }
  .sd-action-sub { font-size: 12px; color: #6b7280; margin-top: 2px; }

  @media (max-width: 600px) {
    .sd-welcome { padding: 20px; }
    .sd-welcome-name { font-size: 20px; }
    .sd-welcome-avatar { width: 48px; height: 48px; font-size: 16px; }
    .sd-user-name { display: none; }
    .sd-main { padding: 16px; }
  }
`;