"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, useRef } from "react";

interface InviteSchool {
  id: string;
  name: string;
}

interface AdminInvite {
  id: string;
  token: string;
  is_active: boolean;
  use_count: number;
  max_uses: number | null;
  expires_at: string | null;
  used_at: string | null;
  created_at: string;
  school: { id: string; name: string } | null;
  creator: { full_name: string } | null;
  usedBy: { full_name: string } | null;
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ar-SA", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function getStatus(inv: AdminInvite): { label: string; color: string; bg: string } {
  if (!inv.is_active && inv.used_at) return { label: "مُستخدمة", color: "#2D8A4A", bg: "rgba(45,138,74,0.09)" };
  if (!inv.is_active)                 return { label: "معطّلة",  color: "#7A1E1E", bg: "rgba(122,30,30,0.09)" };
  if (inv.expires_at && new Date(inv.expires_at) < new Date())
                                       return { label: "منتهية",  color: "#8A7B60", bg: "rgba(138,123,96,0.09)" };
  return { label: "نشطة", color: "#C8A96A", bg: "rgba(200,169,106,0.12)" };
}

export default function OwnerInvitesPage() {
  const [invites, setInvites]     = useState<AdminInvite[]>([]);
  const [schools, setSchools]     = useState<InviteSchool[]>([]);
  const [loading, setLoading]     = useState(true);
  const [creating, setCreating]   = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [newInvite, setNewInvite] = useState<AdminInvite | null>(null);
  const [disabling, setDisabling] = useState<string | null>(null);
  const [error, setError]         = useState("");
  const [copied, setCopied]       = useState<string | null>(null);
  const newInviteTimer            = useRef<ReturnType<typeof setTimeout> | null>(null);

  const siteUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL ?? "";

  useEffect(() => {
    // Load invites and schools list
    Promise.all([
      fetch("/api/owner/invites").then((r) => r.json()),
      fetch("/api/owner/schools").then((r) => r.json()),
    ])
      .then(([invData, schoolData]) => {
        setInvites(invData.invites ?? []);
        setSchools(
          (schoolData.schools ?? []).map((s: { id: string; name: string }) => ({
            id: s.id,
            name: s.name,
          })),
        );
      })
      .catch(() => setError("تعذر تحميل البيانات"))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!selectedSchool) { setError("يرجى اختيار الجهة أولاً"); return; }
    setError("");
    setCreating(true);
    try {
      const r = await fetch("/api/owner/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ school_id: selectedSchool }),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error ?? "حدث خطأ"); return; }
      const invite = d.invite as AdminInvite;
      setInvites((prev) => [invite, ...prev]);
      setNewInvite(invite);
      setShowModal(false);
      setSelectedSchool("");
      if (newInviteTimer.current) clearTimeout(newInviteTimer.current);
      newInviteTimer.current = setTimeout(() => setNewInvite(null), 10_000);
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setCreating(false);
    }
  };

  const handleDisable = async (id: string) => {
    setDisabling(id);
    setError("");
    try {
      const r = await fetch(`/api/owner/invites/${id}`, { method: "PATCH" });
      const d = await r.json();
      if (!r.ok) { setError(d.error ?? "حدث خطأ"); return; }
      setInvites((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, is_active: false } : inv)),
      );
      if (newInvite?.id === id) setNewInvite(null);
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setDisabling(null);
    }
  };

  const copyLink = (token: string) => {
    const link = `${siteUrl}/invite/${token}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(token);
      setTimeout(() => setCopied(null), 2500);
    });
  };

  const activeInvites   = invites.filter((i) => i.is_active && (!i.expires_at || new Date(i.expires_at) > new Date()));
  const historyInvites  = invites.filter((i) => !activeInvites.includes(i));

  return (
    <div className="oi-page" dir="rtl">
      {/* ── Header ── */}
      <div className="oi-header">
        <div>
          <p className="oi-eyebrow">إدارة الوصول</p>
          <h1 className="oi-title">دعوات مدراء الجهات</h1>
          <p className="oi-sub">
            أنشئ رابط دعوة خاص بكل جهة — يُفعَّل عند قبول المدير وتسجيل حسابه
          </p>
        </div>
        <button className="oi-create-btn" onClick={() => setShowModal(true)}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path d="M12 5v14M5 12h14" />
          </svg>
          إنشاء دعوة
        </button>
      </div>

      <div className="oi-rule">
        <div className="oi-rule-line" /><div className="oi-rule-diamond" /><div className="oi-rule-line" />
      </div>

      {/* ── Info box ── */}
      <div className="oi-info">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <circle cx="12" cy="12" r="10" /><path d="M12 16v-4m0-4h.01" />
        </svg>
        <span>
          صلاحية الدعوة <strong>30 يومًا</strong> · استخدام واحد فقط ·
          يمكن إلغاؤها في أي وقت قبل قبولها
        </span>
      </div>

      {error && (
        <div className="oi-error">
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
          </svg>
          {error}
        </div>
      )}

      {/* ── New invite flash card ── */}
      {newInvite && (
        <div className="oi-new-card">
          <div className="oi-new-card-header">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#2D8A4A" strokeWidth={2}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>تم إنشاء رابط الدعوة بنجاح</span>
            <button className="oi-new-card-close" onClick={() => setNewInvite(null)}>×</button>
          </div>
          <div className="oi-new-card-school">{newInvite.school?.name}</div>
          <div className="oi-new-card-link" dir="ltr">
            {siteUrl}/invite/{newInvite.token.slice(0, 12)}…
          </div>
          <button className="oi-copy-btn oi-copy-btn--primary" onClick={() => copyLink(newInvite.token)}>
            {copied === newInvite.token ? (
              <>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                تم النسخ!
              </>
            ) : (
              <>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                نسخ الرابط
              </>
            )}
          </button>
        </div>
      )}

      {loading ? (
        <div className="oi-loading">
          <div className="oi-spin" />
          <span>جارٍ التحميل...</span>
        </div>
      ) : (
        <>
          {/* ── Active invites ── */}
          {activeInvites.length > 0 && (
            <div className="oi-section">
              <div className="oi-section-label">الدعوات النشطة ({activeInvites.length})</div>
              <div className="oi-list">
                {activeInvites.map((inv, i) => {
                  const status = getStatus(inv);
                  return (
                    <div key={inv.id} className="oi-card" style={{ animationDelay: `${i * 40}ms` }}>
                      <div className="oi-card-main">
                        <div className="oi-card-school">{inv.school?.name ?? "—"}</div>
                        <div className="oi-card-token" dir="ltr">
                          /invite/{inv.token.slice(0, 16)}…
                        </div>
                        <div className="oi-card-meta">
                          أُنشئت {fmtDate(inv.created_at)}
                          {inv.expires_at && <> · تنتهي {fmtDate(inv.expires_at)}</>}
                        </div>
                      </div>
                      <div className="oi-card-right">
                        <span className="oi-badge" style={{ color: status.color, background: status.bg }}>
                          {status.label}
                        </span>
                        <div className="oi-card-actions">
                          <button
                            className="oi-action-btn"
                            onClick={() => copyLink(inv.token)}
                            title="نسخ الرابط"
                          >
                            {copied === inv.token ? (
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            ) : (
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                              </svg>
                            )}
                          </button>
                          <button
                            className="oi-action-btn oi-action-btn--danger"
                            onClick={() => handleDisable(inv.id)}
                            disabled={disabling === inv.id}
                            title="تعطيل الدعوة"
                          >
                            {disabling === inv.id
                              ? <span className="oi-spin oi-spin--sm" />
                              : <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <circle cx="12" cy="12" r="10" /><path d="M8 12h8" />
                                </svg>
                            }
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── History ── */}
          {historyInvites.length > 0 && (
            <div className="oi-section" style={{ marginTop: 32 }}>
              <div className="oi-section-label" style={{ color: "var(--graphite-soft)" }}>
                السجل ({historyInvites.length})
              </div>
              <div className="oi-list">
                {historyInvites.map((inv, i) => {
                  const status = getStatus(inv);
                  return (
                    <div key={inv.id} className="oi-card oi-card--history" style={{ animationDelay: `${i * 30}ms` }}>
                      <div className="oi-card-main">
                        <div className="oi-card-school" style={{ opacity: 0.7 }}>{inv.school?.name ?? "—"}</div>
                        {inv.usedBy && (
                          <div className="oi-card-meta">قبلها: {inv.usedBy.full_name}</div>
                        )}
                        <div className="oi-card-meta" style={{ opacity: 0.65 }}>
                          {fmtDate(inv.created_at)}
                          {inv.used_at && <> · استُخدمت {fmtDate(inv.used_at)}</>}
                        </div>
                      </div>
                      <span className="oi-badge" style={{ color: status.color, background: status.bg }}>
                        {status.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {invites.length === 0 && (
            <div className="oi-empty">
              <div className="oi-empty-icon">
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <p>لا توجد دعوات بعد</p>
              <p style={{ fontSize: 13, opacity: 0.7 }}>
                أنشئ دعوة لتعيين مدير لإحدى الجهات
              </p>
            </div>
          )}
        </>
      )}

      {/* ── Create invite modal ── */}
      {showModal && (
        <div className="oi-modal-overlay" onClick={() => { setShowModal(false); setSelectedSchool(""); setError(""); }}>
          <div className="oi-modal" onClick={(e) => e.stopPropagation()}>
            <div className="oi-modal-header">
              <h2 className="oi-modal-title">إنشاء دعوة مدير</h2>
              <button className="oi-modal-close" onClick={() => { setShowModal(false); setSelectedSchool(""); setError(""); }}>×</button>
            </div>

            <p className="oi-modal-desc">
              اختر الجهة التي تريد تعيين مدير لها. سيُرسَل الرابط للشخص المعني.
            </p>

            <div className="oi-modal-field">
              <label className="oi-modal-label">الجهة</label>
              <select
                className="oi-modal-select"
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
              >
                <option value="">— اختر الجهة —</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {error && (
              <div className="oi-error" style={{ marginTop: 0 }}>{error}</div>
            )}

            <div className="oi-modal-actions">
              <button
                className="oi-modal-cancel"
                onClick={() => { setShowModal(false); setSelectedSchool(""); setError(""); }}
              >
                إلغاء
              </button>
              <button
                className="oi-modal-confirm"
                onClick={handleCreate}
                disabled={creating || !selectedSchool}
              >
                {creating ? <><span className="oi-spin oi-spin--sm" /> جارٍ الإنشاء...</> : "إنشاء الرابط"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{css}</style>
    </div>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
  @keyframes oi-spin    { to { transform: rotate(360deg); } }
  @keyframes oi-fadein  { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  @keyframes oi-overlay { from { opacity:0; } to { opacity:1; } }
  @keyframes oi-modal   { from { opacity:0; transform:scale(0.96) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }

  :root {
    --gold: #C8A96A; --gold2: #E5B93C;
    --graphite: #0B0B0C; --graphite-soft: #8A8478;
    --bg-card: #FFFDF8; --border: rgba(8,11,12,0.08);
  }

  .oi-page { font-family: 'Cairo', sans-serif; max-width: 840px; }

  .oi-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
  .oi-eyebrow { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.22em; color: var(--gold); margin-bottom: 4px; }
  .oi-title { font-size: 24px; font-weight: 900; color: var(--graphite); margin: 0 0 4px; }
  .oi-sub { font-size: 13px; color: var(--graphite-soft); }

  .oi-create-btn {
    display: flex; align-items: center; gap: 7px;
    padding: 10px 20px; border-radius: 11px;
    background: var(--graphite); color: var(--gold);
    border: 1px solid rgba(200,169,106,0.25);
    font-family: 'Cairo', sans-serif; font-size: 13px; font-weight: 800;
    cursor: pointer; white-space: nowrap; flex-shrink: 0;
    transition: all 0.18s;
  }
  .oi-create-btn:hover { background: #1a1a1e; border-color: rgba(200,169,106,0.5); color: var(--gold2); }

  .oi-rule { display: flex; align-items: center; gap: 10px; margin: 0 0 20px; }
  .oi-rule-line { flex: 1; height: 1px; background: linear-gradient(90deg, rgba(200,169,106,0.35), transparent); }
  .oi-rule-diamond { width: 5px; height: 5px; background: rgba(200,169,106,0.6); transform: rotate(45deg); flex-shrink: 0; }

  .oi-info {
    display: flex; align-items: center; gap: 8px;
    background: rgba(200,169,106,0.07); border: 1px solid rgba(200,169,106,0.18);
    color: #6B4E18; font-size: 12.5px; padding: 10px 14px; border-radius: 9px;
    font-weight: 600; margin-bottom: 20px;
  }

  .oi-error {
    display: flex; align-items: center; gap: 8px;
    background: rgba(139,26,26,0.06); border: 1px solid rgba(139,26,26,0.18);
    color: #8b1a1a; font-size: 13px; padding: 10px 14px; border-radius: 9px;
    font-weight: 600; margin-bottom: 16px;
  }

  .oi-loading { display: flex; align-items: center; gap: 10px; color: var(--graphite-soft); font-size: 14px; margin: 40px 0; }
  .oi-spin { display: inline-block; width: 18px; height: 18px; border: 2.5px solid rgba(200,169,106,0.2); border-top-color: var(--gold); border-radius: 50%; animation: oi-spin 0.7s linear infinite; flex-shrink: 0; }
  .oi-spin--sm { width: 12px; height: 12px; border-width: 2px; }

  /* New invite flash */
  .oi-new-card {
    background: rgba(45,138,74,0.06); border: 1.5px solid rgba(45,138,74,0.22);
    border-radius: 13px; padding: 14px 18px; margin-bottom: 24px;
    animation: oi-fadein 0.35s ease;
  }
  .oi-new-card-header { display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 13px; color: #2D8A4A; margin-bottom: 6px; }
  .oi-new-card-close { margin-right: auto; background: none; border: none; font-size: 18px; cursor: pointer; color: #2D8A4A; padding: 0 4px; line-height: 1; }
  .oi-new-card-school { font-size: 14px; font-weight: 700; color: var(--graphite); margin-bottom: 4px; }
  .oi-new-card-link { font-size: 12px; color: var(--graphite-soft); font-family: monospace; margin-bottom: 12px; direction: ltr; }
  .oi-copy-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 9px;
    font-family: 'Cairo', sans-serif; font-size: 12.5px; font-weight: 800;
    cursor: pointer; transition: all 0.18s; border: 1px solid;
  }
  .oi-copy-btn--primary {
    background: var(--graphite); color: var(--gold); border-color: rgba(200,169,106,0.25);
  }
  .oi-copy-btn--primary:hover { background: #1a1a1e; }

  .oi-section-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.18em; color: var(--graphite-soft); margin-bottom: 12px; }

  .oi-list { display: flex; flex-direction: column; gap: 8px; }

  .oi-card {
    display: flex; align-items: center; gap: 14px;
    background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px;
    padding: 12px 16px;
    box-shadow: 0 1px 4px rgba(8,11,12,0.04);
    animation: oi-fadein 0.35s ease both;
    transition: border-color 0.18s;
  }
  .oi-card:hover { border-color: rgba(200,169,106,0.25); }
  .oi-card--history { opacity: 0.80; }

  .oi-card-main { flex: 1; min-width: 0; }
  .oi-card-school { font-size: 14px; font-weight: 800; color: var(--graphite); }
  .oi-card-token { font-size: 11.5px; color: var(--graphite-soft); font-family: monospace; margin-top: 2px; }
  .oi-card-meta { font-size: 11.5px; color: var(--graphite-soft); margin-top: 3px; }

  .oi-card-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

  .oi-badge {
    flex-shrink: 0; padding: 3px 10px; border-radius: 999px;
    font-size: 11px; font-weight: 800;
  }

  .oi-card-actions { display: flex; align-items: center; gap: 6px; }
  .oi-action-btn {
    display: flex; align-items: center; justify-content: center;
    width: 32px; height: 32px; border-radius: 9px;
    background: rgba(200,169,106,0.08); border: 1px solid rgba(200,169,106,0.18);
    color: var(--graphite-soft); cursor: pointer; transition: all 0.18s; flex-shrink: 0;
  }
  .oi-action-btn:hover { background: rgba(200,169,106,0.18); color: var(--graphite); border-color: rgba(200,169,106,0.35); }
  .oi-action-btn--danger { background: rgba(139,26,26,0.06); border-color: rgba(139,26,26,0.18); color: #8b1a1a; }
  .oi-action-btn--danger:hover:not(:disabled) { background: rgba(139,26,26,0.14); }
  .oi-action-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .oi-empty { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 0; color: var(--graphite-soft); text-align: center; }
  .oi-empty-icon { width: 64px; height: 64px; border-radius: 20px; background: rgba(200,169,106,0.08); display: flex; align-items: center; justify-content: center; color: rgba(200,169,106,0.5); }

  /* Modal */
  .oi-modal-overlay {
    position: fixed; inset: 0; z-index: 1000;
    background: rgba(8,11,12,0.55); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    animation: oi-overlay 0.22s ease;
  }
  .oi-modal {
    background: #FFFDF8; border-radius: 18px; padding: 28px;
    width: min(480px, calc(100vw - 32px));
    box-shadow: 0 24px 64px rgba(8,11,12,0.25);
    animation: oi-modal 0.28s cubic-bezier(0.34,1.56,0.64,1);
  }
  .oi-modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .oi-modal-title { font-size: 18px; font-weight: 900; color: var(--graphite); margin: 0; }
  .oi-modal-close { background: none; border: none; font-size: 22px; cursor: pointer; color: var(--graphite-soft); line-height: 1; padding: 0; }
  .oi-modal-desc { font-size: 13px; color: var(--graphite-soft); margin: 0 0 20px; line-height: 1.6; }

  .oi-modal-field { display: flex; flex-direction: column; gap: 7px; margin-bottom: 20px; }
  .oi-modal-label { font-size: 12px; font-weight: 700; color: #4a3f2e; text-transform: uppercase; letter-spacing: 0.06em; }
  .oi-modal-select {
    padding: 11px 14px; border-radius: 10px;
    border: 1px solid rgba(8,11,12,0.12); background: #fff;
    font-family: 'Cairo', sans-serif; font-size: 14px; color: var(--graphite);
    outline: none; cursor: pointer;
    transition: border-color 0.18s;
  }
  .oi-modal-select:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(200,169,106,0.12); }

  .oi-modal-actions { display: flex; align-items: center; justify-content: flex-end; gap: 10px; margin-top: 24px; }
  .oi-modal-cancel {
    padding: 9px 20px; border-radius: 10px;
    background: none; border: 1px solid rgba(8,11,12,0.12);
    font-family: 'Cairo', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer;
    color: var(--graphite-soft); transition: all 0.18s;
  }
  .oi-modal-cancel:hover { background: rgba(8,11,12,0.04); }
  .oi-modal-confirm {
    display: flex; align-items: center; gap: 7px;
    padding: 9px 22px; border-radius: 10px;
    background: var(--graphite); color: var(--gold);
    border: 1px solid rgba(200,169,106,0.25);
    font-family: 'Cairo', sans-serif; font-size: 13px; font-weight: 800; cursor: pointer;
    transition: all 0.18s;
  }
  .oi-modal-confirm:hover:not(:disabled) { background: #1a1a1e; }
  .oi-modal-confirm:disabled { opacity: 0.5; cursor: not-allowed; }
`;
