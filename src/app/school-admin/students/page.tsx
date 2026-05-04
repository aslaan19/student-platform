/* eslint-disable react-hooks/set-state-in-effect */
"use client"
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/translations";
import MandalaLoader from "@/components/MandalaLoader";

interface Student {
  id: string;
  onboarding_status: string;
  profile: { full_name: string };
  class: { id: string; name: string } | null;
}
interface ClassItem {
  id: string;
  name: string;
}

const STATUS_META: Record<
  string,
  { color: string; bg: string; border: string }
> = {
  PENDING_INTAKE: {
    color: "#8A7B60",
    bg: "rgba(138,123,96,0.08)",
    border: "rgba(138,123,96,0.18)",
  },
  INTAKE_SUBMITTED: {
    color: "#6B4E18",
    bg: "rgba(200,169,106,0.10)",
    border: "rgba(200,169,106,0.22)",
  },
  SCHOOL_ASSIGNED: {
    color: "#1A4A7A",
    bg: "rgba(26,74,122,0.08)",
    border: "rgba(26,74,122,0.18)",
  },
  SCHOOL_PLACEMENT_SUBMITTED: {
    color: "#4A2080",
    bg: "rgba(74,32,128,0.08)",
    border: "rgba(74,32,128,0.18)",
  },
  CLASS_ASSIGNED: {
    color: "#1a6b3c",
    bg: "rgba(26,107,60,0.07)",
    border: "rgba(26,107,60,0.18)",
  },
};

export function SchoolAdminStudentsPage() {
  const { lang } = useLang();
  const tr = t[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  const STATUS_LABELS: Record<string, string> = {
    PENDING_INTAKE: tr.waitingClass,
    INTAKE_SUBMITTED: tr.waitingReview,
    SCHOOL_ASSIGNED: tr.schoolAssigned,
    SCHOOL_PLACEMENT_SUBMITTED: tr.placementAssessment,
    CLASS_ASSIGNED: tr.classAssigned,
  };

  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function load() {
    const [sRes, cRes] = await Promise.all([
      fetch("/api/school-admin/students"),
      fetch("/api/school-admin/classes"),
    ]);
    const sData = await sRes.json();
    const cData = await cRes.json();
    setStudents(sData.students ?? []);
    setClasses(cData.classes ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAssign(studentId: string, classId: string) {
    await fetch(`/api/school-admin/students/${studentId}/assign-class`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ class_id: classId || null }),
    });
    load();
  }

  const filtered = students.filter((s) =>
    s.profile.full_name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="st-page" dir={dir}>
      {/* Header */}
      <div className="st-header">
        <div>
          <p className="st-eyebrow">
            {lang === "ar" ? "سجل الطلاب" : "Regjistri"}
          </p>
          <h1 className="st-title">{tr.students}</h1>
          <p className="st-sub">
            {students.length} {tr.students}
          </p>
        </div>
        <div className="st-search-wrap">
          <svg
            width="14"
            height="14"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            className="st-search-icon"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            className="st-search"
            placeholder={tr.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            dir={dir}
          />
          {search && (
            <button className="st-search-clear" onClick={() => setSearch("")}>
              <svg
                width="12"
                height="12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Rule */}
      <div className="st-rule">
        <div className="st-rule-line" />
        <div className="st-rule-diamond" />
        <div className="st-rule-line" />
      </div>

      {/* Results count if filtering */}
      {search && (
        <p className="st-results">
          {filtered.length} {lang === "ar" ? "نتيجة" : "rezultate"}{" "}
          <span>&quot;{search}&ldquo;</span>
        </p>
      )}

      {loading ? (
        <MandalaLoader label={tr.loading} />
      ) : filtered.length === 0 ? (
        <div className="st-empty">
          <div className="st-empty-icon">
            <svg
              width="28"
              height="28"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          </div>
          <p>{tr.noStudents}</p>
        </div>
      ) : (
        <div className="st-list">
          {/* Table header */}
          <div className="st-list-header">
            <div className="st-col-name">
              {lang === "ar" ? "الطالب" : "Studenti"}
            </div>
            <div className="st-col-status">
              {lang === "ar" ? "الحالة" : "Statusi"}
            </div>
            <div className="st-col-class">
              {lang === "ar" ? "تعيين الفصل" : "Klasa"}
            </div>
          </div>

          {filtered.map((s, i) => {
            const meta =
              STATUS_META[s.onboarding_status] ?? STATUS_META.PENDING_INTAKE;
            return (
              <div
                key={s.id}
                className="st-row"
                style={{ animationDelay: `${i * 35}ms` }}
              >
                {/* Avatar */}
                <div className="st-av">{s.profile.full_name.charAt(0)}</div>

                {/* Name & current class */}
                <div className="st-body">
                  <div className="st-name">{s.profile.full_name}</div>
                  <div className="st-current-class">
                    {s.class?.name ? (
                      <>
                        <svg
                          width="10"
                          height="10"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                        </svg>
                        {s.class.name}
                      </>
                    ) : (
                      <span className="st-no-class">{tr.noClass}</span>
                    )}
                  </div>
                </div>

                {/* Status chip */}
                <div className="st-col-status-cell">
                  <span
                    className="st-status"
                    style={{
                      color: meta.color,
                      background: meta.bg,
                      borderColor: meta.border,
                    }}
                  >
                    {STATUS_LABELS[s.onboarding_status] ?? s.onboarding_status}
                  </span>
                </div>

                {/* Class assign */}
                <div className="st-col-class-cell">
                  <select
                    className="st-select"
                    value={s.class?.id ?? ""}
                    onChange={(e) => handleAssign(s.id, e.target.value)}
                    dir={dir}
                  >
                    <option value="">{tr.noClass}</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)} }

        :root {
          --gold: #C8A96A;
          --gold-pale: rgba(200,169,106,0.07);
          --gold-border: rgba(200,169,106,0.18);
          --black: #0B0B0C;
          --off-white: #F5F3EE;
          --text: #0B0B0C;
          --text2: #3D3526;
          --text3: #8A7B60;
          --surface: #FFFFFF;
          --border: #E4DDD0;
          --font: 'Cairo', sans-serif;
        }

        .st-page {
          display: flex; flex-direction: column; gap: 20px;
          font-family: var(--font);
          animation: fadeUp 0.3s ease;
        }

        .st-header {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 14px; flex-wrap: wrap;
        }
        .st-eyebrow { font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--gold); margin-bottom: 4px; }
        .st-title { font-size: 24px; font-weight: 900; color: var(--black); letter-spacing: -0.4px; }
        .st-sub { font-size: 12.5px; color: var(--text3); margin-top: 3px; font-weight: 500; }

        /* Search */
        .st-search-wrap {
          position: relative;
          display: flex; align-items: center;
        }
        .st-search-icon {
          position: absolute;
          inset-inline-start: 12px;
          color: var(--text3);
          pointer-events: none;
        }
        .st-search {
          padding: 9px 14px 9px 36px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 7px;
          font-size: 13px;
          font-family: var(--font);
          color: var(--text);
          outline: none;
          width: 230px;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .st-search:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px rgba(200,169,106,0.1);
        }
        .st-search-clear {
          position: absolute;
          inset-inline-end: 10px;
          background: none; border: none;
          color: var(--text3); cursor: pointer;
          display: flex; align-items: center;
          padding: 3px; border-radius: 4px;
          transition: color 0.15s;
        }
        .st-search-clear:hover { color: var(--text); }

        .st-rule { display: flex; align-items: center; gap: 10px; }
        .st-rule-line { flex: 1; height: 1px; background: var(--border); }
        .st-rule-diamond { width: 5px; height: 5px; background: var(--gold); transform: rotate(45deg); opacity: 0.45; flex-shrink: 0; }

        .st-results { font-size: 12px; color: var(--text3); font-weight: 500; }
        .st-results span { color: var(--text2); font-weight: 700; }

        .st-empty {
          display: flex; flex-direction: column; align-items: center; gap: 12px;
          padding: 64px 20px; color: var(--text3); font-size: 13px; font-weight: 500;
        }
        .st-empty-icon {
          width: 60px; height: 60px; border-radius: 13px;
          background: var(--surface); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          color: var(--gold); opacity: 0.6;
        }

        /* List */
        .st-list { display: flex; flex-direction: column; gap: 1px; }

        .st-list-header {
          display: grid;
          grid-template-columns: 1fr 160px 180px;
          gap: 12px;
          padding: 0 18px 8px;
          font-size: 10px;
          font-weight: 700;
          color: var(--text3);
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .st-row {
          display: grid;
          grid-template-columns: 40px 1fr 160px 180px;
          gap: 12px;
          align-items: center;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 12px 18px;
          margin-bottom: 5px;
          transition: border-color 0.15s, box-shadow 0.15s;
          animation: fadeUp 0.35s ease both;
          position: relative;
          overflow: hidden;
        }
        .st-row::before {
          content: '';
          position: absolute;
          top: 0; bottom: 0;
          inset-inline-start: 0;
          width: 2px;
          background: var(--gold);
          opacity: 0;
          transition: opacity 0.15s;
        }
        .st-row:hover { border-color: rgba(200,169,106,0.3); box-shadow: 0 2px 10px rgba(200,169,106,0.06); }
        .st-row:hover::before { opacity: 0.6; }

        .st-av {
          width: 36px; height: 36px; border-radius: 7px;
          background: var(--black);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 900;
          color: var(--gold); flex-shrink: 0;
        }
        .st-body { min-width: 0; }
        .st-name { font-size: 13.5px; font-weight: 700; color: var(--text); }
        .st-current-class {
          display: flex; align-items: center; gap: 4px;
          font-size: 11.5px; color: var(--text3); margin-top: 2px; font-weight: 500;
        }
        .st-no-class { font-style: italic; }

        .st-col-status-cell { display: flex; align-items: center; }
        .st-status {
          font-size: 10.5px; font-weight: 700;
          padding: 3px 10px; border-radius: 5px;
          border: 1px solid;
          letter-spacing: 0.2px;
          white-space: nowrap;
        }

        .st-col-class-cell { display: flex; align-items: center; }
        .st-select {
          width: 100%;
          background: var(--off-white);
          border: 1px solid var(--border);
          color: var(--text);
          border-radius: 6px;
          padding: 7px 10px;
          font-size: 12px;
          font-family: var(--font);
          outline: none;
          cursor: pointer;
          transition: border-color 0.15s;
        }
        .st-select:focus { border-color: var(--gold); }

        @media (max-width: 768px) {
          .st-list-header { display: none; }
          .st-row { grid-template-columns: 36px 1fr; grid-template-rows: auto auto; gap: 8px; padding: 12px 14px; }
          .st-col-status-cell { grid-column: 2; }
          .st-col-class-cell { grid-column: 1 / -1; }
          .st-search { width: 180px; }
        }
      `}</style>
    </div>
  );
}

export default SchoolAdminStudentsPage;
