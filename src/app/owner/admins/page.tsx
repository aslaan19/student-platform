"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

interface AdminProfile {
  id: string;
  full_name: string;
  email: string | null;
  is_active: boolean;
  created_at: string;
}

interface SchoolWithAdmin {
  id: string;
  name: string;
  slug: string;
  language: string;
  admin: AdminProfile | null;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("ar-SA", {
    year: "numeric", month: "short", day: "numeric",
  });
}

export default function OwnerAdminsPage() {
  const [schools, setSchools] = useState<SchoolWithAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/owner/admins")
      .then((r) => r.json())
      .then((d) => setSchools(d.schools ?? []))
      .catch(() => setError("تعذر تحميل البيانات"))
      .finally(() => setLoading(false));
  }, []);

  const toggleAdmin = async (profileId: string, currentActive: boolean) => {
    setToggling(profileId);
    setError("");
    try {
      const r = await fetch(`/api/owner/admins/${profileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentActive }),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error ?? "حدث خطأ"); return; }
      // Update local state
      setSchools((prev) =>
        prev.map((school) =>
          school.admin?.id === profileId
            ? { ...school, admin: { ...school.admin!, is_active: !currentActive } }
            : school,
        ),
      );
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setToggling(null);
    }
  };

  const schoolsWithAdmin    = schools.filter((s) => s.admin);
  const schoolsWithoutAdmin = schools.filter((s) => !s.admin);
  const activeCount          = schoolsWithAdmin.filter((s) => s.admin!.is_active).length;
  const deactivatedCount     = schoolsWithAdmin.filter((s) => !s.admin!.is_active).length;

  return (
    <div className="ad-page" dir="rtl">
      {/* ── Header ── */}
      <div className="ad-header">
        <div>
          <p className="ad-eyebrow">إدارة الصلاحيات</p>
          <h1 className="ad-title">مدراء الجهات</h1>
          <p className="ad-sub">
            {schoolsWithAdmin.length} مدير ·{" "}
            <span style={{ color: "#2D8A4A" }}>{activeCount} نشط</span>
            {deactivatedCount > 0 && (
              <> · <span style={{ color: "#8b1a1a" }}>{deactivatedCount} معطّل</span></>
            )}
          </p>
        </div>
      </div>

      <div className="ad-rule">
        <div className="ad-rule-line" />
        <div className="ad-rule-diamond" />
        <div className="ad-rule-line" />
      </div>

      {error && (
        <div className="ad-error">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
          </svg>
          {error}
        </div>
      )}

      {loading ? (
        <div className="ad-loading">
          <div className="ad-spin" />
          <span>جارٍ التحميل...</span>
        </div>
      ) : (
        <>
          {/* ── Schools with admin ── */}
          {schoolsWithAdmin.length > 0 && (
            <div className="ad-section">
              <div className="ad-section-title">جهات لديها مدير</div>
              <div className="ad-list">
                {schoolsWithAdmin.map((school) => {
                  const admin = school.admin!;
                  const active = admin.is_active;
                  const isToggling = toggling === admin.id;
                  return (
                    <div key={school.id} className={`ad-card ${active ? "" : "ad-card--inactive"}`}>
                      {/* School badge */}
                      <div className="ad-school-badge">{school.name.charAt(0)}</div>

                      {/* Info */}
                      <div className="ad-card-info">
                        <div className="ad-card-name">{admin.full_name}</div>
                        <div className="ad-card-school">{school.name}</div>
                        {admin.email && (
                          <div className="ad-card-email" dir="ltr">{admin.email}</div>
                        )}
                        <div className="ad-card-meta">
                          انضم {fmtDate(admin.created_at)}
                        </div>
                      </div>

                      {/* Status badge */}
                      <div className={`ad-status-badge ${active ? "ad-status-badge--active" : "ad-status-badge--inactive"}`}>
                        {active ? "نشط" : "معطّل"}
                      </div>

                      {/* Toggle button */}
                      <button
                        className={`ad-toggle-btn ${active ? "ad-toggle-btn--deactivate" : "ad-toggle-btn--activate"}`}
                        onClick={() => toggleAdmin(admin.id, active)}
                        disabled={isToggling}
                      >
                        {isToggling ? (
                          <span className="ad-spin ad-spin--sm" />
                        ) : active ? (
                          <>
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <circle cx="12" cy="12" r="10" /><path d="M8 12h8" />
                            </svg>
                            تعطيل
                          </>
                        ) : (
                          <>
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <circle cx="12" cy="12" r="10" /><path d="M12 8v8m-4-4h8" />
                            </svg>
                            تفعيل
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Schools without admin ── */}
          {schoolsWithoutAdmin.length > 0 && (
            <div className="ad-section" style={{ marginTop: 32 }}>
              <div className="ad-section-title" style={{ color: "var(--graphite-soft)" }}>
                جهات بدون مدير ({schoolsWithoutAdmin.length})
              </div>
              <div className="ad-list">
                {schoolsWithoutAdmin.map((school) => (
                  <div key={school.id} className="ad-card ad-card--no-admin">
                    <div className="ad-school-badge ad-school-badge--muted">
                      {school.name.charAt(0)}
                    </div>
                    <div className="ad-card-info">
                      <div className="ad-card-name">{school.name}</div>
                      <div className="ad-card-school" style={{ color: "var(--graphite-soft)" }}>
                        لا يوجد مدير معيّن
                      </div>
                    </div>
                    <div className="ad-status-badge ad-status-badge--none">
                      لا يوجد
                    </div>
                    <a
                      href="/owner/invites"
                      className="ad-toggle-btn ad-toggle-btn--activate"
                      style={{ textDecoration: "none" }}
                    >
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      دعوة مدير
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {schools.length === 0 && (
            <div className="ad-empty">
              <div className="ad-empty-icon">
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </div>
              <p>لا توجد جهات مسجّلة بعد</p>
            </div>
          )}
        </>
      )}

      <style>{css}</style>
    </div>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
  @keyframes ad-spin { to { transform: rotate(360deg); } }
  @keyframes ad-fadein { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

  :root {
    --gold: #C8A96A; --gold2: #E5B93C;
    --graphite: #0B0B0C; --graphite-soft: #8A8478;
    --bg-card: #FFFDF8; --border: rgba(8,11,12,0.08);
  }

  .ad-page { font-family: 'Cairo', sans-serif; max-width: 900px; }
  .ad-header { margin-bottom: 20px; }
  .ad-eyebrow { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.22em; color: var(--gold); margin-bottom: 4px; }
  .ad-title { font-size: 26px; font-weight: 900; color: var(--graphite); margin: 0 0 4px; }
  .ad-sub { font-size: 13px; color: var(--graphite-soft); }

  .ad-rule { display: flex; align-items: center; gap: 10px; margin: 0 0 28px; }
  .ad-rule-line { flex: 1; height: 1px; background: linear-gradient(90deg, rgba(200,169,106,0.35), transparent); }
  .ad-rule-diamond { width: 5px; height: 5px; background: rgba(200,169,106,0.6); transform: rotate(45deg); flex-shrink: 0; }

  .ad-error {
    display: flex; align-items: center; gap: 8px;
    background: rgba(139,26,26,0.06); border: 1px solid rgba(139,26,26,0.18);
    color: #8b1a1a; font-size: 13px; padding: 10px 14px; border-radius: 9px;
    font-weight: 600; margin-bottom: 20px;
  }

  .ad-loading { display: flex; align-items: center; gap: 10px; color: var(--graphite-soft); font-size: 14px; }
  .ad-spin { display: inline-block; width: 18px; height: 18px; border: 2.5px solid rgba(200,169,106,0.2); border-top-color: var(--gold); border-radius: 50%; animation: ad-spin 0.7s linear infinite; flex-shrink: 0; }
  .ad-spin--sm { width: 12px; height: 12px; border-width: 2px; }

  .ad-section-title { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.18em; color: var(--graphite-soft); margin-bottom: 12px; }

  .ad-list { display: flex; flex-direction: column; gap: 10px; }

  .ad-card {
    display: flex; align-items: center; gap: 14px;
    background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px;
    padding: 14px 16px;
    box-shadow: 0 1px 4px rgba(8,11,12,0.04);
    animation: ad-fadein 0.35s ease both;
    transition: border-color 0.18s;
  }
  .ad-card:hover { border-color: rgba(200,169,106,0.25); }
  .ad-card--inactive { opacity: 0.75; background: rgba(139,26,26,0.02); border-color: rgba(139,26,26,0.10); }
  .ad-card--no-admin { opacity: 0.7; }

  .ad-school-badge {
    width: 46px; height: 46px; border-radius: 13px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #C8A96A, #E5B93C);
    font-size: 20px; font-weight: 900; color: var(--graphite);
    font-family: 'Cairo', sans-serif;
  }
  .ad-school-badge--muted { background: rgba(200,169,106,0.12); color: var(--gold); border: 1.5px dashed rgba(200,169,106,0.35); }

  .ad-card-info { flex: 1; min-width: 0; }
  .ad-card-name { font-size: 14px; font-weight: 800; color: var(--graphite); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ad-card-school { font-size: 12px; color: var(--gold); font-weight: 600; margin-top: 1px; }
  .ad-card-email { font-size: 11.5px; color: var(--graphite-soft); margin-top: 2px; }
  .ad-card-meta { font-size: 11px; color: var(--graphite-soft); margin-top: 3px; opacity: 0.75; }

  .ad-status-badge {
    flex-shrink: 0; padding: 3px 10px; border-radius: 999px;
    font-size: 11px; font-weight: 800; letter-spacing: 0.05em;
  }
  .ad-status-badge--active   { background: rgba(45,138,74,0.10);  color: #2D8A4A; border: 1px solid rgba(45,138,74,0.20); }
  .ad-status-badge--inactive { background: rgba(139,26,26,0.08);  color: #8b1a1a; border: 1px solid rgba(139,26,26,0.18); }
  .ad-status-badge--none     { background: rgba(138,132,120,0.08); color: var(--graphite-soft); border: 1px solid rgba(138,132,120,0.18); }

  .ad-toggle-btn {
    flex-shrink: 0; display: flex; align-items: center; gap: 5px;
    padding: 7px 14px; border-radius: 9px;
    font-size: 12px; font-weight: 800; cursor: pointer;
    font-family: 'Cairo', sans-serif; border: 1px solid;
    transition: all 0.18s;
  }
  .ad-toggle-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .ad-toggle-btn--deactivate {
    background: rgba(139,26,26,0.07); color: #8b1a1a;
    border-color: rgba(139,26,26,0.22);
  }
  .ad-toggle-btn--deactivate:hover:not(:disabled) {
    background: rgba(139,26,26,0.14); border-color: rgba(139,26,26,0.38);
  }
  .ad-toggle-btn--activate {
    background: rgba(45,138,74,0.08); color: #2D8A4A;
    border-color: rgba(45,138,74,0.22);
  }
  .ad-toggle-btn--activate:hover:not(:disabled) {
    background: rgba(45,138,74,0.15); border-color: rgba(45,138,74,0.38);
  }

  .ad-empty { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 0; color: var(--graphite-soft); }
  .ad-empty-icon { width: 64px; height: 64px; border-radius: 20px; background: rgba(200,169,106,0.08); display: flex; align-items: center; justify-content: center; color: rgba(200,169,106,0.5); }
`;
