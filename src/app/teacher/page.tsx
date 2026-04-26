"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/translations";

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
type TeacherData = { profile: { full_name: string }; classes: ClassItem[] };

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`td-skeleton ${className}`} />;
}

export default function TeacherPage() {
  const { lang } = useLang();
  const tr = t[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

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

  const handleSelectClass = useCallback(
    async (cls: ClassItem) => {
      setSelectedClass(cls);
      await fetchAnnouncements(cls.id);
    },
    [fetchAnnouncements],
  );

  useEffect(() => {
    fetch("/api/teacher")
      .then((r) => r.json())
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
      body: JSON.stringify({
        classId: selectedClass.id,
        content: newAnnouncement,
      }),
    });
    setNewAnnouncement("");
    await fetchAnnouncements(selectedClass.id);
    setPosting(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await fetch(`/api/teacher/announcements?id=${id}`, { method: "DELETE" });
    await new Promise((r) => setTimeout(r, 300));
    if (selectedClass) await fetchAnnouncements(selectedClass.id);
    setDeletingId(null);
  };

  const initials = data?.profile.full_name
    ? data.profile.full_name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
    : "م";

  const totalStudents = data?.classes.reduce(
    (acc, c) => acc + c.students.length,
    0,
  );

  if (loading)
    return (
      <div className="td-page" dir={dir}>
        <div className="td-inner">
          <Skeleton className="td-sk-banner" />
          <div className="td-grid">
            <div className="td-sk-col">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="td-sk-cls" />
              ))}
            </div>
            <div className="td-sk-col">
              <Skeleton className="td-sk-compose" />
              {[1, 2].map((i) => (
                <Skeleton key={i} className="td-sk-ann" />
              ))}
            </div>
          </div>
        </div>
        <style>{styles}</style>
      </div>
    );

  return (
    <div
      className="td-page"
      dir={dir}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(14px)",
        transition: "opacity 0.45s ease, transform 0.45s ease",
      }}
    >
      <div className="td-inner">
        {/* Banner */}
        <div className="td-banner">
          <div className="td-banner-left">
            <p className="td-banner-greeting">{tr.greetingPrefix}</p>
            <h1 className="td-banner-name">{data?.profile.full_name} 👋</h1>
            <p className="td-banner-sub">
              {tr.teacherBannerSub}{" "}
              <strong>
                {data?.classes.length} {tr.classWord}
              </strong>{" "}
              {tr.outOf}{" "}
              <strong>
                {totalStudents} {tr.studentWord}
              </strong>
            </p>
          </div>
          <div className="td-banner-stats">
            <div className="td-stat">
              <span className="td-stat-val">{data?.classes.length}</span>
              <span className="td-stat-label">{tr.classWord}</span>
            </div>
            <div className="td-stat-sep" />
            <div className="td-stat">
              <span className="td-stat-val">{totalStudents}</span>
              <span className="td-stat-label">{tr.studentWord}</span>
            </div>
          </div>
        </div>

        {!data?.classes.length ? (
          <div className="td-empty-state">
            <div className="td-empty-icon">📋</div>
            <h2>{tr.notAssignedToClass}</h2>
            <p>{tr.contactSchoolAdmin}</p>
          </div>
        ) : (
          <div className="td-grid">
            {/* Sidebar */}
            <aside className="td-sidebar">
              <p className="td-col-label">{tr.classesLabel}</p>
              <div className="td-classes-list">
                {data?.classes.map((cls, i) => (
                  <button
                    key={cls.id}
                    onClick={() => handleSelectClass(cls)}
                    style={{ animationDelay: `${i * 50}ms` }}
                    className={`td-class-btn ${
                      selectedClass?.id === cls.id ? "active" : ""
                    }`}
                  >
                    <div className="td-class-icon">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                      </svg>
                    </div>
                    <div className="td-class-info">
                      <span className="td-class-name">{cls.name}</span>
                      <span className="td-class-count">
                        {cls.students.length} {tr.studentWord}
                      </span>
                    </div>
                    {selectedClass?.id === cls.id && (
                      <span className="td-class-dot" />
                    )}
                  </button>
                ))}
              </div>

              {selectedClass && (
                <div className="td-students-card">
                  <div className="td-card-header">
                    <span className="td-card-icon">👥</span>
                    <span className="td-card-title">
                      {tr.studentsOfClass} {selectedClass.name}
                    </span>
                    <span className="td-badge">
                      {selectedClass.students.length}
                    </span>
                  </div>
                  <div className="td-students-list">
                    {selectedClass.students.length === 0 ? (
                      <p className="td-no-students">{tr.noEnrolledStudents}</p>
                    ) : (
                      selectedClass.students.map((s, i) => (
                        <div
                          key={s.id}
                          className="td-student-row"
                          style={{ animationDelay: `${i * 35}ms` }}
                        >
                          <div className="td-student-av">
                            {s.profile.full_name.charAt(0)}
                          </div>
                          <span className="td-student-name">
                            {s.profile.full_name}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </aside>

            {/* Announcements */}
            <section className="td-content">
              <p className="td-col-label">
                {tr.announcementsOf}{" "}
                {selectedClass && (
                  <span className="td-col-label-accent">
                    {selectedClass.name}
                  </span>
                )}
              </p>

              <div className="td-compose">
                <div className="td-compose-head">
                  <div className="td-compose-av">{initials}</div>
                  <span className="td-compose-label">
                    {tr.newAnnouncementLabel}
                  </span>
                </div>
                <textarea
                  className="td-textarea"
                  rows={3}
                  placeholder={tr.announcementPlaceholder}
                  value={newAnnouncement}
                  onChange={(e) => setNewAnnouncement(e.target.value)}
                />
                <div className="td-compose-foot">
                  <span className="td-char-count">
                    {newAnnouncement.length} {tr.charCount}
                  </span>
                  <button
                    onClick={handlePost}
                    disabled={posting || !newAnnouncement.trim()}
                    className="td-post-btn"
                  >
                    {posting ? (
                      <>
                        <span className="td-spin" />
                        {tr.publishing}
                      </>
                    ) : (
                      <>
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                        {tr.publishAnnouncement}
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="td-ann-list">
                {announcementsLoading ? (
                  [1, 2, 3].map((i) => (
                    <Skeleton key={i} className="td-sk-ann" />
                  ))
                ) : announcements.length === 0 ? (
                  <div className="td-ann-empty">
                    <span className="td-ann-empty-icon">📣</span>
                    <p>{tr.noAnnouncementsYet}</p>
                    <span>{tr.startWritingHint}</span>
                  </div>
                ) : (
                  announcements.map((a) => (
                    <div
                      key={a.id}
                      className={`td-ann-item ${
                        deletingId === a.id ? "deleting" : ""
                      }`}
                    >
                      <div className="td-ann-body">
                        <div className="td-ann-meta-row">
                          <div className="td-ann-av">{initials}</div>
                          <span className="td-ann-author">
                            {a.teacher.profile.full_name}
                          </span>
                          <span className="td-ann-sep">·</span>
                          <span className="td-ann-date">
                            {new Date(a.created_at).toLocaleDateString(
                              lang === "ar" ? "ar-SA" : "sq",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </span>
                        </div>
                        <p className="td-ann-content">{a.content}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(a.id)}
                        disabled={deletingId === a.id}
                        className="td-del-btn"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                          <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                        </svg>
                        {tr.delete}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </div>
      <style>{styles}</style>
    </div>
  );
}

const styles = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeOut{to{opacity:0;transform:scale(0.97)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.45}}

  .td-page{min-height:100%;background:#f4f5f7;font-family:Tajawal,sans-serif;color:#111827}
  .td-inner{padding:28px 28px 52px;display:flex;flex-direction:column;gap:24px}

  .td-banner{background:#111827;border-radius:20px;padding:28px 32px;display:flex;align-items:center;justify-content:space-between;gap:16px;animation:fadeUp 0.4s ease both;position:relative;overflow:hidden}
  .td-banner::before{content:'';position:absolute;top:-40px;left:-40px;width:200px;height:200px;border-radius:50%;background:rgba(255,255,255,0.025);pointer-events:none}
  .td-banner-left{position:relative;z-index:1}
  .td-banner-greeting{font-size:13px;color:rgba(255,255,255,0.45);font-weight:500;margin-bottom:4px}
  .td-banner-name{font-size:24px;font-weight:900;color:white;letter-spacing:-0.5px}
  .td-banner-sub{font-size:13px;color:rgba(255,255,255,0.55);margin-top:6px}
  .td-banner-sub strong{color:rgba(255,255,255,0.85);font-weight:700}
  .td-banner-stats{display:flex;align-items:center;gap:18px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:14px 20px;position:relative;z-index:1}
  .td-stat{display:flex;flex-direction:column;align-items:center;gap:2px}
  .td-stat-val{font-size:22px;font-weight:900;color:white;letter-spacing:-0.5px;line-height:1}
  .td-stat-label{font-size:11px;color:rgba(255,255,255,0.45);font-weight:500}
  .td-stat-sep{width:1px;height:30px;background:rgba(255,255,255,0.1)}

  .td-grid{display:grid;grid-template-columns:272px 1fr;gap:20px;align-items:start}
  @media(max-width:800px){.td-grid{grid-template-columns:1fr}}

  .td-col-label{font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:10px}
  .td-col-label-accent{color:#111827;text-transform:none;letter-spacing:0}

  .td-sidebar{display:flex;flex-direction:column;gap:14px}
  .td-classes-list{display:flex;flex-direction:column;gap:5px}
  .td-class-btn{width:100%;display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:12px;border:1px solid #e5e7eb;background:white;cursor:pointer;text-align:right;transition:all 0.18s ease;animation:fadeUp 0.3s ease both}
  .td-class-btn:hover{border-color:#d1d5db;background:#fafafa;transform:translateX(-2px)}
  .td-class-btn.active{background:#111827;border-color:#111827;transform:translateX(-2px);box-shadow:0 4px 14px rgba(17,24,39,0.2)}
  .td-class-icon{width:32px;height:32px;border-radius:8px;flex-shrink:0;background:#f4f5f7;display:flex;align-items:center;justify-content:center;color:#6b7280;transition:all 0.18s}
  .td-class-btn.active .td-class-icon{background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.75)}
  .td-class-info{flex:1;display:flex;flex-direction:column;gap:1px}
  .td-class-name{font-size:13px;font-weight:700;color:#111827}
  .td-class-btn.active .td-class-name{color:white}
  .td-class-count{font-size:11px;color:#9ca3af}
  .td-class-btn.active .td-class-count{color:rgba(255,255,255,0.45)}
  .td-class-dot{width:6px;height:6px;border-radius:50%;background:white;opacity:0.5;flex-shrink:0}

  .td-students-card{background:white;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;animation:fadeUp 0.35s ease both}
  .td-card-header{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid #f1f3f6}
  .td-card-icon{font-size:15px}
  .td-card-title{flex:1;font-size:13px;font-weight:800;color:#111827}
  .td-badge{font-size:10.5px;font-weight:700;color:#6b7280;background:#f4f5f7;padding:2px 8px;border-radius:99px;border:1px solid #e5e7eb}
  .td-students-list{padding:8px 10px;display:flex;flex-direction:column;gap:2px;max-height:300px;overflow-y:auto}
  .td-no-students{font-size:12px;color:#9ca3af;padding:10px;text-align:center}
  .td-student-row{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:8px;transition:background 0.15s;animation:fadeUp 0.25s ease both}
  .td-student-row:hover{background:#f7f8fa}
  .td-student-av{width:26px;height:26px;border-radius:6px;flex-shrink:0;background:#f4f5f7;border:1px solid #e5e7eb;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#374151}
  .td-student-name{font-size:12.5px;font-weight:600;color:#374151}

  .td-content{display:flex;flex-direction:column;gap:14px}
  .td-compose{background:white;border:1px solid #e5e7eb;border-radius:16px;padding:16px 18px;display:flex;flex-direction:column;gap:12px;animation:fadeUp 0.35s ease both}
  .td-compose-head{display:flex;align-items:center;gap:10px}
  .td-compose-av{width:32px;height:32px;border-radius:8px;flex-shrink:0;background:#111827;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;color:white}
  .td-compose-label{font-size:12.5px;font-weight:700;color:#6b7280}
  .td-textarea{width:100%;border:1.5px solid #e5e7eb;border-radius:10px;padding:10px 13px;font-size:14px;font-family:Tajawal,sans-serif;resize:none;outline:none;color:#111827;background:#fafafa;transition:border-color 0.18s,box-shadow 0.18s;line-height:1.6}
  .td-textarea:focus{border-color:#111827;background:white;box-shadow:0 0 0 3px rgba(17,24,39,0.07)}
  .td-textarea::placeholder{color:#9ca3af}
  .td-compose-foot{display:flex;align-items:center;justify-content:space-between}
  .td-char-count{font-size:11px;color:#9ca3af}
  .td-post-btn{display:flex;align-items:center;gap:7px;background:#111827;color:white;padding:8px 18px;border-radius:9px;font-size:13px;font-weight:700;font-family:Tajawal,sans-serif;border:none;cursor:pointer;transition:all 0.18s}
  .td-post-btn:hover:not(:disabled){background:#1f2937;transform:translateY(-1px);box-shadow:0 4px 14px rgba(17,24,39,0.22)}
  .td-post-btn:disabled{opacity:0.4;cursor:not-allowed}
  .td-spin{width:12px;height:12px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:spin 0.6s linear infinite}

  .td-ann-list{display:flex;flex-direction:column;gap:10px}
  .td-ann-empty{background:white;border:1px solid #e5e7eb;border-radius:16px;padding:44px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px;animation:fadeUp 0.35s ease both}
  .td-ann-empty-icon{font-size:30px}
  .td-ann-empty p{font-size:14px;font-weight:700;color:#374151}
  .td-ann-empty span{font-size:12px;color:#9ca3af}
  .td-ann-item{background:white;border:1px solid #e5e7eb;border-radius:14px;padding:15px 16px;display:flex;align-items:flex-start;gap:12px;animation:fadeUp 0.3s ease both;transition:border-color 0.15s,box-shadow 0.15s}
  .td-ann-item:hover{border-color:#d1d5db;box-shadow:0 2px 10px rgba(0,0,0,0.05)}
  .td-ann-item.deleting{animation:fadeOut 0.3s ease forwards}
  .td-ann-body{flex:1;display:flex;flex-direction:column;gap:7px}
  .td-ann-meta-row{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
  .td-ann-av{width:24px;height:24px;border-radius:6px;flex-shrink:0;background:#111827;display:flex;align-items:center;justify-content:center;font-size:8.5px;font-weight:900;color:white}
  .td-ann-author{font-size:12px;font-weight:700;color:#111827}
  .td-ann-sep{color:#d1d5db;font-size:10px}
  .td-ann-date{font-size:11px;color:#9ca3af}
  .td-ann-content{font-size:14px;color:#374151;line-height:1.65}
  .td-del-btn{display:flex;align-items:center;gap:4px;background:none;border:1px solid #fecaca;color:#ef4444;padding:5px 9px;border-radius:7px;font-size:11.5px;font-weight:700;font-family:Tajawal,sans-serif;cursor:pointer;flex-shrink:0;transition:all 0.15s;white-space:nowrap;margin-top:1px}
  .td-del-btn:hover:not(:disabled){background:#fef2f2;border-color:#ef4444}
  .td-del-btn:disabled{opacity:0.4;cursor:not-allowed}

  .td-empty-state{background:white;border:1px solid #e5e7eb;border-radius:20px;padding:60px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px;animation:fadeUp 0.4s ease both}
  .td-empty-icon{font-size:40px}
  .td-empty-state h2{font-size:17px;font-weight:800;color:#111827}
  .td-empty-state p{font-size:13px;color:#6b7280}

  .td-skeleton{background:#e9eaec;border-radius:10px;animation:pulse 1.6s ease-in-out infinite}
  .td-sk-banner{height:108px;border-radius:20px}
  .td-sk-cls{height:54px;border-radius:12px}
  .td-sk-compose{height:116px;border-radius:16px}
  .td-sk-ann{height:76px;border-radius:14px}
  .td-sk-col{display:flex;flex-direction:column;gap:10px}

  @media(max-width:600px){
    .td-inner{padding:16px 16px 40px;gap:18px}
    .td-banner{padding:20px}
    .td-banner-name{font-size:20px}
    .td-banner-stats{display:none}
  }
`;
