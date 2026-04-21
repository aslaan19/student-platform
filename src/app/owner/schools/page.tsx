"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";

interface School {
  id: string;
  name: string;
  created_at: string;
  admin: { id: string; full_name: string } | null;
  _count: { teachers: number; students: number; classes: number };
}

export default function OwnerSchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/owner/schools")
      .then((r) => r.json())
      .then((d) => setSchools(d.schools ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = schools.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.admin?.full_name ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const totalStudents = schools.reduce((acc, s) => acc + s._count.students, 0);
  const totalTeachers = schools.reduce((acc, s) => acc + s._count.teachers, 0);

  return (
    <div className="schools-page" dir="rtl">
      <div className="page-header">
        <div>
          <h1 className="page-title">المدارس المسجَّلة</h1>
          <p className="page-sub">نظرة عامة على جميع المدارس في المنصة</p>
        </div>
        <div className="readonly-badge">
          <svg
            width="12"
            height="12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          للعرض فقط
        </div>
      </div>

      {!loading && schools.length > 0 && (
        <div className="summary-strip">
          <div className="summary-item">
            <span className="summary-num">{schools.length}</span>
            <span className="summary-lab">مدرسة</span>
          </div>
          <div className="summary-divider" />
          <div className="summary-item">
            <span className="summary-num">{totalTeachers}</span>
            <span className="summary-lab">معلم</span>
          </div>
          <div className="summary-divider" />
          <div className="summary-item">
            <span className="summary-num">{totalStudents}</span>
            <span className="summary-lab">طالب</span>
          </div>
        </div>
      )}

      {!loading && schools.length > 0 && (
        <div className="search-wrap">
          <svg
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            className="search-icon"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            className="search-input"
            placeholder="ابحث عن مدرسة أو مدير..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {loading ? (
        <div className="loading-row">
          <div className="spinner" />
          جارٍ تحميل المدارس...
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          {search ? "لا توجد نتائج مطابقة لبحثك." : "لا توجد مدارس مسجّلة."}
        </div>
      ) : (
        <div className="schools-grid">
          {filtered.map((school) => (
            <Link
              key={school.id}
              href={`/owner/schools/${school.id}`}
              className="school-card"
            >
              <div className="school-card-top">
                <div className="school-icon-wrap">🏫</div>
                <div className="school-card-meta">
                  {new Date(school.created_at).toLocaleDateString("ar-SA", {
                    year: "numeric",
                    month: "short",
                  })}
                </div>
              </div>
              <div className="school-name">{school.name}</div>
              <div className="school-admin-row">
                <svg
                  width="13"
                  height="13"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {school.admin ? (
                  <span className="admin-name">{school.admin.full_name}</span>
                ) : (
                  <span className="no-admin">لم يُعيَّن مدير</span>
                )}
              </div>
              <div className="school-divider" />
              <div className="school-stats">
                <div className="s-stat">
                  <span className="s-val">{school._count.teachers}</span>
                  <span className="s-lab">معلم</span>
                </div>
                <div className="s-divider" />
                <div className="s-stat">
                  <span className="s-val">{school._count.students}</span>
                  <span className="s-lab">طالب</span>
                </div>
                <div className="s-divider" />
                <div className="s-stat">
                  <span className="s-val">{school._count.classes}</span>
                  <span className="s-lab">فصل</span>
                </div>
              </div>
              <div className="view-row">
                <span>عرض التفاصيل</span>
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}

      <style>{`
        .schools-page { display:flex; flex-direction:column; gap:22px; }
        .page-header { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; flex-wrap:wrap; padding-bottom:20px; border-bottom:1px solid var(--border); }
        .page-title { font-size:24px; font-weight:800; color:var(--text); letter-spacing:-0.4px; }
        .page-sub { font-size:13.5px; color:var(--text2); margin-top:3px; font-weight:500; }
        .readonly-badge { display:flex; align-items:center; gap:6px; background:var(--accent-muted); border:1px solid var(--accent-muted2); color:var(--accent); font-size:12px; font-weight:700; padding:6px 14px; border-radius:20px; white-space:nowrap; }
        .summary-strip { display:flex; align-items:center; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); overflow:hidden; box-shadow:var(--shadow-sm); }
        .summary-item { flex:1; display:flex; flex-direction:column; align-items:center; padding:16px; gap:3px; }
        .summary-num { font-size:24px; font-weight:800; color:var(--accent); font-family:'IBM Plex Mono',monospace; }
        .summary-lab { font-size:12px; color:var(--text2); font-weight:600; }
        .summary-divider { width:1px; height:44px; background:var(--border); }
        .search-wrap { position:relative; display:flex; align-items:center; }
        .search-icon { position:absolute; right:14px; color:var(--text3); pointer-events:none; }
        .search-input { width:100%; background:var(--surface); border:1px solid var(--border2); border-radius:9px; padding:10px 42px 10px 14px; font-size:13.5px; font-family:'Cairo',sans-serif; color:var(--text); outline:none; transition:border-color 0.15s,box-shadow 0.15s; }
        .search-input:focus { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-muted); }
        .search-input::placeholder { color:var(--text3); }
        .loading-row { display:flex; align-items:center; gap:12px; color:var(--text2); font-size:14px; padding:48px; justify-content:center; }
        .spinner { width:20px; height:20px; border:2px solid var(--border2); border-top-color:var(--accent); border-radius:50%; animation:spin 0.8s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .empty { text-align:center; color:var(--text3); padding:60px; font-size:14px; font-weight:500; }
        .schools-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(290px,1fr)); gap:14px; }
        .school-card { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:22px; text-decoration:none; color:var(--text); display:flex; flex-direction:column; gap:12px; transition:border-color 0.18s,box-shadow 0.18s,transform 0.18s; box-shadow:var(--shadow-sm); }
        .school-card:hover { border-color:var(--accent); box-shadow:var(--shadow-md); transform:translateY(-2px); }
        .school-card-top { display:flex; align-items:center; justify-content:space-between; }
        .school-icon-wrap { width:46px; height:46px; border-radius:12px; background:var(--accent-muted); display:flex; align-items:center; justify-content:center; font-size:24px; border:1px solid var(--accent-muted2); }
        .school-card-meta { font-size:11px; color:var(--text3); font-weight:600; }
        .school-name { font-size:17px; font-weight:800; color:var(--text); line-height:1.3; }
        .school-admin-row { display:flex; align-items:center; gap:7px; color:var(--text2); font-size:13px; }
        .admin-name { font-weight:700; color:var(--text); }
        .no-admin { color:var(--danger); font-style:italic; font-weight:600; }
        .school-divider { height:1px; background:var(--border); margin:0 -4px; }
        .school-stats { display:flex; align-items:center; justify-content:space-between; background:var(--surface2); border-radius:8px; padding:12px 16px; border:1px solid var(--border); }
        .s-stat { display:flex; flex-direction:column; align-items:center; gap:3px; flex:1; }
        .s-val { font-size:20px; font-weight:800; font-family:'IBM Plex Mono',monospace; color:var(--text); }
        .s-lab { font-size:10.5px; color:var(--text3); font-weight:700; text-transform:uppercase; letter-spacing:0.3px; }
        .s-divider { width:1px; height:30px; background:var(--border); }
        .view-row { display:flex; align-items:center; justify-content:space-between; font-size:12.5px; color:var(--accent); font-weight:700; padding-top:4px; }
        @media (max-width:600px) { .schools-grid { grid-template-columns:1fr; } }
      `}</style>
    </div>
  );
}
