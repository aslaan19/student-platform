"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  schoolCount: number;
  teacherCount: number;
  studentCount: number;
  pendingSubmissions: number;
  totalSubmissions: number;
  hasIntakeAssessment: boolean;
  studentsByStatus: { status: string; count: number }[];
}

const STATUS_LABELS: Record<string, string> = {
  PENDING_INTAKE: "في انتظار الاختبار",
  INTAKE_SUBMITTED: "تم تقديم الاختبار",
  SCHOOL_ASSIGNED: "تم تعيين المدرسة",
  SCHOOL_PLACEMENT_SUBMITTED: "تم تقديم التوزيع",
  CLASS_ASSIGNED: "تم تعيين الفصل",
};

const STATUS_GOLD: Record<string, string> = {
  PENDING_INTAKE: "#C8A96A",
  INTAKE_SUBMITTED: "#E5B93C",
  SCHOOL_ASSIGNED: "#C8A96A",
  SCHOOL_PLACEMENT_SUBMITTED: "#E5B93C",
  CLASS_ASSIGNED: "#C8A96A",
};

export default function OwnerDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/owner/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="d-loading">
        <div className="d-spinner" />
        <span>جارٍ تحميل البيانات...</span>
        <style>{css}</style>
      </div>
    );

  if (!stats)
    return (
      <div className="d-loading">
        تعذّر تحميل البيانات.<style>{css}</style>
      </div>
    );

  const cards = [
    {
      label: "المدارس",
      value: stats.schoolCount,
      sub: "مدرسة مسجّلة",
      href: "/owner/schools",
      icon: "🏫",
    },
    {
      label: "المعلمون",
      value: stats.teacherCount,
      sub: "معلم نشط",
      href: "/owner/schools",
      icon: "👨‍🏫",
    },
    {
      label: "الطلاب",
      value: stats.studentCount,
      sub: "طالب مسجّل",
      href: "/owner/submissions",
      icon: "🎓",
    },
    {
      label: "بانتظار المراجعة",
      value: stats.pendingSubmissions,
      sub: "إجابة معلّقة",
      href: "/owner/submissions?status=PENDING",
      icon: "⏳",
      alert: stats.pendingSubmissions > 0,
    },
  ];

  return (
    <div className="d-page" dir="rtl">
      {/* Header */}
      <div className="d-header">
        <div>
          <div className="d-header-eyebrow">لوحة التحكم</div>
          <h1 className="d-title">نظرة عامة على المنصة</h1>
        </div>
        {!stats.hasIntakeAssessment && (
          <Link href="/owner/intake-assessment" className="d-cta">
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.2}
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            إنشاء اختبار القبول
          </Link>
        )}
      </div>

      {/* Alerts */}
      {!stats.hasIntakeAssessment && (
        <div className="d-alert danger">
          <div className="d-alert-bar" />
          <div className="d-alert-icon">
            <svg
              width="15"
              height="15"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <path d="M12 9v4m0 4h.01" />
            </svg>
          </div>
          <div className="d-alert-body">
            <span className="d-alert-title">
              لم يتم إنشاء اختبار القبول بعد
            </span>
            <span className="d-alert-desc">
              لن يتمكن الطلاب الجدد من إجراء الاختبار الأوّلي.
            </span>
          </div>
          <Link href="/owner/intake-assessment" className="d-alert-action">
            إنشاء الآن ←
          </Link>
        </div>
      )}

      {stats.pendingSubmissions > 0 && (
        <div className="d-alert warning">
          <div className="d-alert-bar" />
          <div className="d-alert-icon">
            <svg
              width="15"
              height="15"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4m0 4h.01" />
            </svg>
          </div>
          <div className="d-alert-body">
            <span className="d-alert-title">إجابات تنتظر المراجعة</span>
            <span className="d-alert-desc">
              يوجد {stats.pendingSubmissions} إجابة معلّقة تحتاج إلى اتخاذ قرار.
            </span>
          </div>
          <Link
            href="/owner/submissions?status=PENDING"
            className="d-alert-action"
          >
            مراجعة الآن ←
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="d-stat-grid">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`d-stat-card ${c.alert ? "alert" : ""}`}
          >
            <div className="d-stat-top">
              <div className="d-stat-icon-wrap">{c.icon}</div>
              {c.alert && <div className="d-stat-pulse" />}
            </div>
            <div className="d-stat-val">{c.value.toLocaleString("ar-SA")}</div>
            <div className="d-stat-label">{c.label}</div>
            <div className="d-stat-sub">{c.sub}</div>
            <div className="d-stat-arrow">
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

      {/* Two columns */}
      <div className="d-two-col">
        {/* Pipeline */}
        <div className="d-card">
          <div className="d-card-head">
            <h2 className="d-card-title">مسار تأهيل الطلاب</h2>
            <span className="d-card-badge">{stats.studentCount} طالب</span>
          </div>
          <div className="d-pipeline">
            {stats.studentsByStatus.length === 0 ? (
              <div className="d-empty">لا يوجد طلاب مسجّلون بعد.</div>
            ) : (
              stats.studentsByStatus.map((s) => {
                const pct = stats.studentCount
                  ? Math.min(100, (s.count / stats.studentCount) * 100)
                  : 0;
                const color = STATUS_GOLD[s.status] ?? "#C8A96A";
                return (
                  <div key={s.status} className="d-pipe-item">
                    <div className="d-pipe-label-row">
                      <div
                        className="d-pipe-dot"
                        style={{ background: color }}
                      />
                      <span className="d-pipe-label">
                        {STATUS_LABELS[s.status] ?? s.status}
                      </span>
                      <span className="d-pipe-count">{s.count}</span>
                    </div>
                    <div className="d-pipe-track">
                      <div
                        className="d-pipe-fill"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="d-card">
          <div className="d-card-head">
            <h2 className="d-card-title">الوصول السريع</h2>
          </div>
          <div className="d-quick-list">
            {[
              {
                href: "/owner/intake-assessment",
                icon: "📋",
                title: "اختبار القبول",
                sub: stats.hasIntakeAssessment
                  ? "عرض وتعديل الاختبار"
                  : "إنشاء اختبار جديد",
              },
              {
                href: "/owner/submissions",
                icon: "📝",
                title: "الإجابات المقدَّمة",
                sub: `${stats.totalSubmissions} إجمالي · ${stats.pendingSubmissions} معلّق`,
              },
              {
                href: "/owner/schools",
                icon: "🏫",
                title: "المدارس المسجّلة",
                sub: `${stats.schoolCount} مدارس في النظام`,
              },
            ].map((q) => (
              <Link key={q.href} href={q.href} className="d-quick-item">
                <div className="d-quick-icon">{q.icon}</div>
                <div className="d-quick-body">
                  <div className="d-quick-title">{q.title}</div>
                  <div className="d-quick-sub">{q.sub}</div>
                </div>
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  style={{ color: "var(--text3)", flexShrink: 0 }}
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{css}</style>
    </div>
  );
}

const css = `
  :root{
    --gold:#C8A96A;--gold2:#E5B93C;--gold-muted:rgba(200,169,106,0.1);--gold-border:rgba(200,169,106,0.2);
    --black:#0B0B0C;--off-white:#F5F3EE;
    --text:#0B0B0C;--text2:#4a3f2f;--text3:#9a8a6a;
    --surface:#ffffff;--surface2:#faf8f4;--surface3:#f5f0e8;
    --border:#e8dfd0;--border2:#d8ccb8;
    --success:#1a6b3c;--success-bg:rgba(26,107,60,0.08);
    --warning:#9a6200;--warning-bg:rgba(154,98,0,0.08);
    --danger:#8b1a1a;--danger-bg:rgba(139,26,26,0.08);
    --radius:10px;
    --shadow-sm:0 1px 3px rgba(11,11,12,0.06),0 1px 2px rgba(11,11,12,0.04);
    --shadow:0 4px 12px rgba(11,11,12,0.08);
    --shadow-md:0 8px 24px rgba(11,11,12,0.10);
  }
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0.35}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

  .d-page{display:flex;flex-direction:column;gap:22px;font-family:'Cairo',sans-serif}
  .d-loading{display:flex;align-items:center;justify-content:center;gap:12px;height:220px;color:var(--text3);font-size:14px;font-family:'Cairo',sans-serif}
  .d-spinner{width:20px;height:20px;border:2px solid var(--gold-border);border-top-color:var(--gold);border-radius:50%;animation:spin 0.8s linear infinite}

  .d-header{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;padding-bottom:22px;border-bottom:1px solid var(--border)}
  .d-header-eyebrow{font-size:10.5px;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:5px}
  .d-title{font-size:24px;font-weight:900;color:var(--black);letter-spacing:-0.5px}
  .d-cta{display:flex;align-items:center;gap:8px;background:var(--black);color:var(--gold);padding:10px 18px;border-radius:var(--radius);text-decoration:none;font-size:13px;font-weight:700;transition:all 0.18s;border:1px solid rgba(200,169,106,0.3)}
  .d-cta:hover{background:rgba(200,169,106,0.1);color:var(--gold)}

  .d-alert{display:flex;align-items:center;gap:13px;border-radius:var(--radius);padding:13px 16px;border:1px solid;position:relative;overflow:hidden;animation:fadeUp 0.3s ease}
  .d-alert.danger{background:var(--danger-bg);border-color:rgba(139,26,26,0.2);color:var(--danger)}
  .d-alert.warning{background:var(--warning-bg);border-color:rgba(154,98,0,0.2);color:var(--warning)}
  .d-alert-bar{position:absolute;right:0;top:0;bottom:0;width:3px}
  .d-alert.danger .d-alert-bar{background:var(--danger)}
  .d-alert.warning .d-alert-bar{background:var(--warning)}
  .d-alert-icon{flex-shrink:0}
  .d-alert-body{flex:1;display:flex;flex-direction:column;gap:1px}
  .d-alert-title{font-size:13px;font-weight:700}
  .d-alert-desc{font-size:12px;opacity:0.8}
  .d-alert-action{white-space:nowrap;color:inherit;font-weight:700;text-decoration:none;font-size:12.5px;border:1px solid currentColor;padding:5px 12px;border-radius:6px;opacity:0.85;transition:opacity 0.15s}
  .d-alert-action:hover{opacity:1}

  .d-stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
  .d-stat-card{
    background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);
    padding:20px 18px;text-decoration:none;display:flex;flex-direction:column;gap:3px;
    position:relative;transition:all 0.2s;box-shadow:var(--shadow-sm);
    border-top:2px solid transparent;
  }
  .d-stat-card:hover{border-color:var(--gold-border);border-top-color:var(--gold);box-shadow:var(--shadow-md);transform:translateY(-2px)}
  .d-stat-card.alert{border-top-color:var(--warning)}
  .d-stat-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px}
  .d-stat-icon-wrap{width:40px;height:40px;border-radius:10px;background:var(--gold-muted);border:1px solid var(--gold-border);display:flex;align-items:center;justify-content:center;font-size:20px}
  .d-stat-pulse{width:8px;height:8px;border-radius:50%;background:var(--warning);animation:blink 2s infinite}
  .d-stat-val{font-size:30px;font-weight:900;color:var(--gold);letter-spacing:-1px;line-height:1;font-family:'IBM Plex Mono',monospace}
  .d-stat-label{font-size:13px;font-weight:700;color:var(--black);margin-top:4px}
  .d-stat-sub{font-size:11px;color:var(--text3);font-weight:500}
  .d-stat-arrow{position:absolute;bottom:16px;left:16px;color:var(--gold-border);transition:color 0.18s}
  .d-stat-card:hover .d-stat-arrow{color:var(--gold)}

  .d-two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .d-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:22px;box-shadow:var(--shadow-sm)}
  .d-card-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid var(--border)}
  .d-card-title{font-size:14px;font-weight:800;color:var(--black)}
  .d-card-badge{font-size:11px;font-weight:700;background:var(--gold-muted);color:var(--gold);padding:3px 10px;border-radius:20px;border:1px solid var(--gold-border)}

  .d-pipeline{display:flex;flex-direction:column;gap:14px}
  .d-pipe-item{display:flex;flex-direction:column;gap:6px}
  .d-pipe-label-row{display:flex;align-items:center;gap:8px}
  .d-pipe-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
  .d-pipe-label{font-size:12.5px;color:var(--text2);font-weight:600;flex:1}
  .d-pipe-count{font-size:12px;font-weight:700;color:var(--black);font-family:'IBM Plex Mono',monospace}
  .d-pipe-track{height:5px;background:var(--surface3);border-radius:99px;overflow:hidden}
  .d-pipe-fill{height:100%;border-radius:99px;transition:width 0.7s cubic-bezier(0.4,0,0.2,1)}
  .d-empty{font-size:13px;color:var(--text3);text-align:center;padding:24px 0}

  .d-quick-list{display:flex;flex-direction:column;gap:8px}
  .d-quick-item{display:flex;align-items:center;gap:12px;border:1px solid var(--border);border-radius:9px;padding:13px 14px;text-decoration:none;color:var(--text);transition:all 0.18s;background:var(--surface2)}
  .d-quick-item:hover{border-color:var(--gold-border);background:var(--gold-muted)}
  .d-quick-icon{font-size:21px;flex-shrink:0}
  .d-quick-body{flex:1}
  .d-quick-title{font-size:13px;font-weight:700;color:var(--black)}
  .d-quick-sub{font-size:11.5px;color:var(--text3);margin-top:1px;font-weight:500}

  @media(max-width:1024px){.d-stat-grid{grid-template-columns:repeat(2,1fr)}.d-two-col{grid-template-columns:1fr}}
  @media(max-width:600px){.d-stat-grid{grid-template-columns:1fr 1fr}.d-title{font-size:20px}}
`;
