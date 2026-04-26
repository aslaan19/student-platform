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
  const totalStudents = schools.reduce((a, s) => a + s._count.students, 0);
  const totalTeachers = schools.reduce((a, s) => a + s._count.teachers, 0);

  return (
    <div className="sc-page" dir="rtl">
      <div className="sc-header">
        <div>
          <div className="sc-eyebrow">المدارس</div>
          <h1 className="sc-title">المدارس المسجَّلة</h1>
        </div>
      </div>

      {!loading && schools.length > 0 && (
        <div className="sc-summary">
          {[
            { num: schools.length, lab: "مدرسة" },
            { num: totalTeachers, lab: "معلم" },
            { num: totalStudents, lab: "طالب" },
          ].map((item, i) => (
            <div key={i} className="sc-sum-item">
              <span className="sc-sum-num">{item.num}</span>
              <span className="sc-sum-lab">{item.lab}</span>
            </div>
          ))}
        </div>
      )}

      {!loading && schools.length > 0 && (
        <div className="sc-search-wrap">
          <svg
            width="15"
            height="15"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            className="sc-search-icon"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            className="sc-search"
            placeholder="ابحث عن مدرسة أو مدير..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {loading ? (
        <div className="sc-loading">
          <div className="sc-spinner" />
          جارٍ تحميل المدارس...
        </div>
      ) : filtered.length === 0 ? (
        <div className="sc-empty">
          {search ? "لا توجد نتائج مطابقة لبحثك." : "لا توجد مدارس مسجّلة."}
        </div>
      ) : (
        <div className="sc-grid">
          {filtered.map((school) => (
            <Link
              key={school.id}
              href={`/owner/schools/${school.id}`}
              className="sc-card"
            >
              <div className="sc-card-top">
                <div className="sc-card-icon">🏫</div>
                <div className="sc-card-date">
                  {new Date(school.created_at).toLocaleDateString("ar-SA", {
                    year: "numeric",
                    month: "short",
                  })}
                </div>
              </div>
              <div className="sc-card-name">{school.name}</div>
              <div className="sc-card-admin">
                <svg
                  width="12"
                  height="12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {school.admin ? (
                  <span className="sc-admin-name">
                    {school.admin.full_name}
                  </span>
                ) : (
                  <span className="sc-no-admin">لم يُعيَّن مدير</span>
                )}
              </div>
              <div className="sc-card-divider" />
              <div className="sc-card-stats">
                {[
                  { val: school._count.teachers, lab: "معلم" },
                  { val: school._count.students, lab: "طالب" },
                  { val: school._count.classes, lab: "فصل" },
                ].map((s, i) => (
                  <div key={i} className="sc-stat">
                    <span className="sc-stat-val">{s.val}</span>
                    <span className="sc-stat-lab">{s.lab}</span>
                  </div>
                ))}
              </div>
              <div className="sc-card-footer">
                <span>عرض التفاصيل</span>
                <svg
                  width="13"
                  height="13"
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

      <style>{css}</style>
    </div>
  );
}

const css = `
  :root{--gold:#C8A96A;--gold2:#E5B93C;--gold-muted:rgba(200,169,106,0.1);--gold-border:rgba(200,169,106,0.2);--black:#0B0B0C;--off-white:#F5F3EE;--text:#0B0B0C;--text2:#4a3f2f;--text3:#9a8a6a;--surface:#ffffff;--surface2:#faf8f4;--surface3:#f5f0e8;--border:#e8dfd0;--border2:#d8ccb8;--danger:#8b1a1a;--radius:10px;--shadow-sm:0 1px 3px rgba(11,11,12,0.06);--shadow:0 4px 12px rgba(11,11,12,0.08);--shadow-md:0 8px 24px rgba(11,11,12,0.10)}
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  @keyframes spin{to{transform:rotate(360deg)}}

  .sc-page{display:flex;flex-direction:column;gap:22px;font-family:'Cairo',sans-serif}
  .sc-header{padding-bottom:20px;border-bottom:1px solid var(--border)}
  .sc-eyebrow{font-size:10.5px;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:5px}
  .sc-title{font-size:22px;font-weight:900;color:var(--black);letter-spacing:-0.4px}

  .sc-summary{display:flex;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow-sm)}
  .sc-sum-item{flex:1;display:flex;flex-direction:column;align-items:center;padding:16px;gap:4px;border-left:1px solid var(--border)}
  .sc-sum-item:last-child{border-left:none}
  .sc-sum-num{font-size:24px;font-weight:900;color:var(--gold);font-family:'IBM Plex Mono',monospace}
  .sc-sum-lab{font-size:12px;color:var(--text3);font-weight:600}

  .sc-search-wrap{position:relative;display:flex;align-items:center}
  .sc-search-icon{position:absolute;right:14px;color:var(--text3);pointer-events:none}
  .sc-search{width:100%;background:var(--surface);border:1px solid var(--border2);border-radius:9px;padding:10px 42px 10px 14px;font-size:13.5px;font-family:'Cairo',sans-serif;color:var(--text);outline:none;transition:border-color 0.15s,box-shadow 0.15s}
  .sc-search:focus{border-color:var(--gold);box-shadow:0 0 0 3px var(--gold-muted)}
  .sc-search::placeholder{color:var(--text3)}

  .sc-loading{display:flex;align-items:center;gap:12px;color:var(--text3);font-size:14px;padding:48px;justify-content:center}
  .sc-spinner{width:20px;height:20px;border:2px solid var(--gold-border);border-top-color:var(--gold);border-radius:50%;animation:spin 0.8s linear infinite}
  .sc-empty{text-align:center;color:var(--text3);padding:60px;font-size:14px;font-weight:500}

  .sc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:14px}
  .sc-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:22px;text-decoration:none;color:var(--text);display:flex;flex-direction:column;gap:12px;transition:all 0.2s;box-shadow:var(--shadow-sm)}
  .sc-card:hover{border-color:var(--gold-border);box-shadow:var(--shadow-md);transform:translateY(-2px)}
  .sc-card-top{display:flex;align-items:center;justify-content:space-between}
  .sc-card-icon{width:46px;height:46px;border-radius:12px;background:var(--gold-muted);border:1px solid var(--gold-border);display:flex;align-items:center;justify-content:center;font-size:24px}
  .sc-card-date{font-size:11px;color:var(--text3);font-weight:600}
  .sc-card-name{font-size:17px;font-weight:800;color:var(--black);line-height:1.3}
  .sc-card-admin{display:flex;align-items:center;gap:7px;color:var(--text3);font-size:13px}
  .sc-admin-name{font-weight:700;color:var(--text2)}
  .sc-no-admin{color:var(--danger);font-style:italic;font-weight:600}
  .sc-card-divider{height:1px;background:var(--border)}
  .sc-card-stats{display:flex;align-items:center;justify-content:space-between;background:var(--surface2);border-radius:8px;padding:12px 16px;border:1px solid var(--border)}
  .sc-stat{display:flex;flex-direction:column;align-items:center;gap:3px;flex:1}
  .sc-stat-val{font-size:20px;font-weight:800;font-family:'IBM Plex Mono',monospace;color:var(--black)}
  .sc-stat-lab{font-size:10.5px;color:var(--text3);font-weight:700;text-transform:uppercase;letter-spacing:0.3px}
  .sc-card-footer{display:flex;align-items:center;justify-content:space-between;font-size:12.5px;color:var(--gold);font-weight:700;padding-top:2px}
  .sc-card:hover .sc-card-footer{color:var(--gold2)}

  @media(max-width:600px){.sc-grid{grid-template-columns:1fr}}
`;
