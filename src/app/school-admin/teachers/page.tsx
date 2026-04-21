"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";

interface Teacher {
  id: string;
  profile: { full_name: string };
  classes: { id: string; name: string }[];
}

export default function SchoolAdminTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/school-admin/teachers")
      .then((r) => r.json())
      .then((d) => setTeachers(d.teachers ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="te-page">
      <div className="te-header">
        <h1 className="te-title">Ø§Ù„Ù…Ø¹Ù„Ù…ÙˆÙ†</h1>
        <p className="te-sub">{teachers.length} Ù…Ø¹Ù„Ù… ÙÙŠ Ù…Ø¯Ø±Ø³ØªÙƒ</p>
      </div>

      {loading ? (
        <div className="te-loading"><div className="spin" />Ø¬Ø§Ø±Ù Ø§Ù„ØªØ­Ù…ÙŠÙ„...</div>
      ) : teachers.length === 0 ? (
        <div className="te-empty">Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ù…Ø¹Ù„Ù…ÙˆÙ† Ø¨Ø¹Ø¯.</div>
      ) : (
        <div className="te-list">
          {teachers.map((t) => (
            <div key={t.id} className="te-row">
              <div className="te-avatar">{t.profile.full_name.charAt(0)}</div>
              <div className="te-body">
                <div className="te-name">{t.profile.full_name}</div>
                <div className="te-classes">
                  {t.classes.length > 0
                    ? t.classes.map((c) => c.name).join("ØŒ ")
                    : "Ù„Ø§ ÙØµÙˆÙ„ Ù…Ø¹ÙŠÙ†Ø©"}
                </div>
              </div>
              <div className="te-count">{t.classes.length} ÙØµÙ„</div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .te-page { display: flex; flex-direction: column; gap: 18px; }
        .te-header { display: flex; flex-direction: column; gap: 3px; }
        .te-title { font-size: 21px; font-weight: 800; color: var(--text); }
        .te-sub { font-size: 13px; color: var(--text2); }
        .te-loading { display: flex; align-items: center; gap: 10px; height: 140px; justify-content: center; color: var(--text2); font-size: 14px; }
        .spin { width: 18px; height: 18px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: sp 0.7s linear infinite; }
        @keyframes sp { to { transform: rotate(360deg); } }
        .te-empty { text-align: center; color: var(--text3); padding: 50px; font-size: 13px; }
        .te-list { display: flex; flex-direction: column; gap: 8px; }
        .te-row { display: flex; align-items: center; gap: 12px; background: var(--surface); border: 1px solid var(--border); border-radius: 11px; padding: 13px 16px; }
        .te-avatar { width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, #10b981, #059669); display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 800; color: white; flex-shrink: 0; }
        .te-body { flex: 1; min-width: 0; }
        .te-name { font-size: 14px; font-weight: 700; color: var(--text); }
        .te-classes { font-size: 12px; color: var(--text2); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .te-count { font-size: 12px; font-weight: 700; color: var(--text2); background: var(--surface2); padding: 3px 10px; border-radius: 6px; white-space: nowrap; font-family: 'JetBrains Mono', monospace; }
      `}</style>
    </div>
  );
}


