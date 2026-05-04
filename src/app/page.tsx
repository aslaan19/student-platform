"use client";

import Link from "next/link";
import Image from "next/image";

// ── SSR-safe geometry ─────────────────────────────────────────────────────────
const R = (n: number) => Math.round(n * 10000) / 10000;

// Hero mandala — full brand construction (concentric + axes + star + petals)
const makeSpokes = (
  cx: number,
  cy: number,
  r1: number,
  r2: number,
  n: number,
) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i * (360 / n) * Math.PI) / 180;
    return {
      x1: R(cx + r1 * Math.sin(a)),
      y1: R(cy - r1 * Math.cos(a)),
      x2: R(cx + r2 * Math.sin(a)),
      y2: R(cy - r2 * Math.cos(a)),
    };
  });

const makeStar = (
  cx: number,
  cy: number,
  r1: number,
  r2: number,
  pts: number,
) =>
  Array.from({ length: pts }, (_, i) => {
    const a = (i * (360 / pts) * Math.PI) / 180;
    const r = i % 2 === 0 ? r1 : r2;
    return { x: R(cx + r * Math.sin(a)), y: R(cy - r * Math.cos(a)) };
  });

const makePetals = (cx: number, cy: number, orbit: number, n: number) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i * (360 / n) * Math.PI) / 180;
    return { cx: R(cx + orbit * Math.sin(a)), cy: R(cy - orbit * Math.cos(a)) };
  });

const makeDots = (cx: number, cy: number, orbit: number, n: number) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i * (360 / n) * Math.PI) / 180;
    return { cx: R(cx + orbit * Math.sin(a)), cy: R(cy - orbit * Math.cos(a)) };
  });

// Hero center mandala
const H = { cx: 340, cy: 340 };
const H_SPOKES_24 = makeSpokes(H.cx, H.cy, 28, 295, 24);
const H_SPOKES_8 = makeSpokes(H.cx, H.cy, 0, 295, 8);
const H_STAR_16 = makeStar(H.cx, H.cy, 200, 130, 16);
const H_STAR_8 = makeStar(H.cx, H.cy, 110, 68, 8);
const H_PETALS_12 = makePetals(H.cx, H.cy, 158, 12);
const H_PETALS_8 = makePetals(H.cx, H.cy, 100, 8);
const H_DOTS_16 = makeDots(H.cx, H.cy, 222, 16);
const H_DOTS_8 = makeDots(H.cx, H.cy, 180, 8);

// Small accent mandala (for section backgrounds)
const S = { cx: 100, cy: 100 };
const S_SPOKES = makeSpokes(S.cx, S.cy, 12, 88, 16);
const S_STAR = makeStar(S.cx, S.cy, 72, 44, 12);
const S_PETALS = makePetals(S.cx, S.cy, 56, 8);

// Pipeline left mandala
const P = { cx: 90, cy: 90 };
const P_SPOKES = makeSpokes(P.cx, P.cy, 10, 82, 12);
const P_STAR = makeStar(P.cx, P.cy, 66, 40, 8);
const P_PETALS = makePetals(P.cx, P.cy, 50, 6);

export default function HomePage() {
  return (
    <>
      <style>{globalCSS}</style>

      {/* ── Navbar ── */}
      <nav className="nav" dir="rtl">
        <Image
          src="/ahlia3.png"
          alt="بناء الأهلية"
          width={200}
          height={64}
          style={{ objectFit: "cover", borderRadius: 12 }}
          priority
        />
        <div className="nav-center">
          <a href="#roles" className="nav-link">
            الأدوار
          </a>
          <a href="#pipeline" className="nav-link">
            مسار القبول
          </a>
        </div>
        <div className="nav-right">
          <Link href="/login" className="nav-link">
            تسجيل الدخول
          </Link>
          <Link href="/signup" className="nav-cta">
            ابدأ الآن
          </Link>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════
          HERO — centered, full-width, mandala bg
      ══════════════════════════════════════════════ */}
      <section className="hero">
        {/* Grid lines */}
        <div className="hero-grid" aria-hidden="true" />

        {/* Large central mandala — behind content */}
        <div className="hero-mandala" aria-hidden="true">
          <svg width="680" height="680" viewBox="0 0 680 680" fill="none">
            <defs>
              <radialGradient id="hg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#C8A96A" stopOpacity="0.12" />
                <stop offset="55%" stopColor="#C8A96A" stopOpacity="0.04" />
                <stop offset="100%" stopColor="#C8A96A" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="340" cy="340" r="330" fill="url(#hg)" />
            {/* Concentric rings — الدائرة الأساسية */}
            {[295, 265, 235, 205, 178, 152, 128, 105, 84, 65, 48, 33, 20].map(
              (r, i) => (
                <circle
                  key={i}
                  cx={H.cx}
                  cy={H.cy}
                  r={r}
                  fill="none"
                  stroke="#C8A96A"
                  strokeWidth={i === 0 ? 1 : i < 3 ? 0.7 : 0.45}
                  opacity={0.05 + i * 0.052}
                  strokeDasharray={
                    i % 3 === 0
                      ? "none"
                      : i % 3 === 1
                        ? `${r * 0.22} ${r * 0.16}`
                        : `2 6`
                  }
                />
              ),
            )}
            {/* Axes — شبكة المحاور */}
            {H_SPOKES_8.map((s, i) => (
              <line
                key={i}
                x1={s.x1}
                y1={s.y1}
                x2={s.x2}
                y2={s.y2}
                stroke="#C8A96A"
                strokeWidth="0.9"
                opacity="0.16"
              />
            ))}
            {H_SPOKES_24.map((s, i) => (
              <line
                key={i}
                x1={s.x1}
                y1={s.y1}
                x2={s.x2}
                y2={s.y2}
                stroke="#C8A96A"
                strokeWidth="0.35"
                opacity="0.07"
              />
            ))}
            {/* 16-point star — الشكل الهندسي */}
            <polygon
              points={H_STAR_16.map((p) => `${p.x},${p.y}`).join(" ")}
              stroke="#C8A96A"
              strokeWidth="0.7"
              fill="none"
              opacity="0.22"
            />
            {/* 8-point inner star */}
            <polygon
              points={H_STAR_8.map((p) => `${p.x},${p.y}`).join(" ")}
              stroke="#E5B93C"
              strokeWidth="0.8"
              fill="rgba(229,185,60,0.025)"
              opacity="0.28"
            />
            {/* 12 outer petals */}
            {H_PETALS_12.map((p, i) => (
              <circle
                key={i}
                cx={p.cx}
                cy={p.cy}
                r="48"
                fill="none"
                stroke="#C8A96A"
                strokeWidth="0.5"
                opacity="0.11"
              />
            ))}
            {/* 8 inner petals */}
            {H_PETALS_8.map((p, i) => (
              <circle
                key={i}
                cx={p.cx}
                cy={p.cy}
                r="30"
                fill="none"
                stroke="#E5B93C"
                strokeWidth="0.5"
                opacity="0.11"
              />
            ))}
            {/* Outer dot ring */}
            {H_DOTS_16.map((d, i) => (
              <circle
                key={i}
                cx={d.cx}
                cy={d.cy}
                r={i % 4 === 0 ? 3 : 1.8}
                fill="#C8A96A"
                opacity={i % 4 === 0 ? 0.38 : 0.18}
              />
            ))}
            {/* Mid dot ring */}
            {H_DOTS_8.map((d, i) => (
              <circle
                key={i}
                cx={d.cx}
                cy={d.cy}
                r="2.2"
                fill="#E5B93C"
                opacity="0.22"
              />
            ))}
            {/* Center focal — الرمز النهائي */}
            <circle
              cx={H.cx}
              cy={H.cy}
              r="16"
              fill="none"
              stroke="#C8A96A"
              strokeWidth="0.7"
              opacity="0.35"
            />
            <circle
              cx={H.cx}
              cy={H.cy}
              r="9"
              fill="none"
              stroke="#E5B93C"
              strokeWidth="0.8"
              opacity="0.4"
            />
            <circle cx={H.cx} cy={H.cy} r="4" fill="#C8A96A" opacity="0.6" />
            <circle cx={H.cx} cy={H.cy} r="1.8" fill="#E5B93C" opacity="0.85" />
          </svg>
        </div>

        {/* Content — perfectly centered */}
        <div className="hero-content" dir="rtl">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-gem" />
            <span>المنصة التعليمية المتكاملة</span>
            <span className="hero-eyebrow-gem" />
          </div>

          <h1 className="hero-h1">
            <span className="h1-normal">منصة </span>
            <span className="h1-gold">بناء الأهلية</span>
            <br />
            <span className="h1-outline">للتعليم المتميز</span>
          </h1>

          <p className="hero-p">
            نظام إداري شامل يربط المدارس والمعلمين والطلاب في بيئة واحدة متكاملة
            — من قبول الطلاب حتى تعيينهم في الفصول الدراسية
          </p>

          <div className="hero-btns">
            <Link href="/signup" className="btn-gold">
              ابدأ رحلتك التعليمية
              <svg
                width="15"
                height="15"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </Link>
            <Link href="/login" className="btn-ghost">
              تسجيل الدخول
            </Link>
          </div>

          <div className="hero-stats">
            {[
              { val: "4+", lab: "أدوار مستقلة" },
              { val: "5+", lab: "مراحل تأهيل" },
              { val: "100%", lab: "آمن ومحمي" },
            ].map((s, i) => (
              <div key={i} className="h-stat">
                <span className="h-stat-val">{s.val}</span>
                <span className="h-stat-lab">{s.lab}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ornamental rule ── */}
      <div className="ornament-rule" aria-hidden="true">
        <div className="or-line" />
        <svg width="100" height="22" viewBox="0 0 100 22" fill="none">
          <polygon
            points="50,2 58,11 50,20 42,11"
            stroke="#C8A96A"
            strokeWidth="0.8"
            fill="rgba(200,169,106,0.1)"
            opacity="0.6"
          />
          <circle cx="50" cy="11" r="2.5" fill="#C8A96A" opacity="0.55" />
          <line
            x1="0"
            y1="11"
            x2="34"
            y2="11"
            stroke="#C8A96A"
            strokeWidth="0.5"
            opacity="0.3"
          />
          <line
            x1="66"
            y1="11"
            x2="100"
            y2="11"
            stroke="#C8A96A"
            strokeWidth="0.5"
            opacity="0.3"
          />
        </svg>
        <div className="or-line" />
      </div>

      {/* ══════════════════════════════════════════════
          ROLES SECTION
      ══════════════════════════════════════════════ */}
      <section className="section roles-section" id="roles" dir="rtl">
        {/* Background accent mandala top-right */}
        <div className="section-bg-mandala top-left" aria-hidden="true">
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
            {[88, 75, 62, 50, 39, 29, 19, 10].map((r, i) => (
              <circle
                key={i}
                cx={S.cx}
                cy={S.cy}
                r={r}
                fill="none"
                stroke="#C8A96A"
                strokeWidth="0.4"
                opacity={0.04 + i * 0.04}
                strokeDasharray={i % 2 === 0 ? "none" : "2 4"}
              />
            ))}
            {S_SPOKES.map((s, i) => (
              <line
                key={i}
                x1={s.x1}
                y1={s.y1}
                x2={s.x2}
                y2={s.y2}
                stroke="#C8A96A"
                strokeWidth="0.3"
                opacity="0.07"
              />
            ))}
            <polygon
              points={S_STAR.map((p) => `${p.x},${p.y}`).join(" ")}
              stroke="#C8A96A"
              strokeWidth="0.4"
              fill="none"
              opacity="0.12"
            />
            {S_PETALS.map((p, i) => (
              <circle
                key={i}
                cx={p.cx}
                cy={p.cy}
                r="22"
                fill="none"
                stroke="#C8A96A"
                strokeWidth="0.35"
                opacity="0.08"
              />
            ))}
            <circle cx={S.cx} cy={S.cy} r="3" fill="#C8A96A" opacity="0.3" />
          </svg>
        </div>

        <div className="section-header" dir="rtl">
          <div className="sh-tag">
            <div className="sh-gem" />
            الأدوار
          </div>
          <h2 className="sh-title">
            نظام متكامل لكل طرف
            <br />
            في العملية التعليمية
          </h2>
          <p className="sh-sub">
            كل دور يمتلك لوحة تحكم مستقلة وصلاحيات محددة تضمن الأمان والكفاءة.
          </p>
        </div>

        <div className="roles-grid">
          {[
            {
              icon: "👑",
              n: "01",
              title: "المالك",
              desc: "إدارة كاملة للمنصة — من إنشاء اختبار القبول إلى مراجعة الإجابات وتعيين الطلاب في المدارس.",
              feats: [
                "إنشاء اختبار القبول وإدارة أسئلته",
                "مراجعة إجابات الطلاب وتصحيح المكتوب",
                "تعيين الطلاب في المدارس المناسبة",
                "مراقبة جميع المدارس والإحصائيات",
              ],
            },
            {
              icon: "🏫",
              n: "02",
              title: "مدير المدرسة",
              desc: "إدارة المدرسة بالكامل — من اختبار التصنيف إلى تعيين الطلاب في الفصول وإدارة المعلمين.",
              feats: [
                "إنشاء اختبار التصنيف المدرسي",
                "مراجعة إجابات التصنيف وتقييمها",
                "تعيين الطلاب في الفصول الدراسية",
                "إدارة المعلمين والفصول",
              ],
            },
            {
              icon: "👨‍🏫",
              n: "03",
              title: "المعلم",
              desc: "إدارة الفصول الدراسية وإنشاء الاختبارات ونشر الإعلانات للطلاب بسهولة وسرعة.",
              feats: [
                "إنشاء اختبارات MCQ وصح/خطأ",
                "نشر الإعلانات لفصله",
                "متابعة نتائج الطلاب",
                "إدارة قائمة طلاب الفصل",
              ],
            },
            {
              icon: "🎓",
              n: "04",
              title: "الطالب",
              desc: "رحلة تعليمية واضحة من اختبار القبول حتى الانضمام للفصل وأداء الاختبارات.",
              feats: [
                "أداء اختبار القبول عند التسجيل",
                "أداء اختبار التصنيف بعد القبول",
                "متابعة إعلانات الفصل والاختبارات",
                "لوحة بيانات شخصية كاملة",
              ],
            },
          ].map((role, i) => (
            <div
              key={role.n}
              className="role-card"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="rc-top">
                <span className="rc-n">{role.n}</span>
                <div className="rc-icon">{role.icon}</div>
              </div>
              <h3 className="rc-title">{role.title}</h3>
              <p className="rc-desc">{role.desc}</p>
              <div className="rc-divider" />
              <ul className="rc-feats">
                {role.feats.map((f, j) => (
                  <li key={j} className="rc-feat">
                    <span className="rc-gem" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Ornamental rule ── */}
      <div className="ornament-rule" aria-hidden="true">
        <div className="or-line" />
        <svg width="60" height="20" viewBox="0 0 60 20" fill="none">
          <circle
            cx="30"
            cy="10"
            r="7"
            stroke="#C8A96A"
            strokeWidth="0.7"
            opacity="0.35"
            fill="none"
          />
          <circle cx="30" cy="10" r="2.8" fill="#C8A96A" opacity="0.45" />
        </svg>
        <div className="or-line" />
      </div>

      {/* ══════════════════════════════════════════════
          PIPELINE SECTION
      ══════════════════════════════════════════════ */}
      <section className="section pipeline-section" id="pipeline" dir="rtl">
        <div className="section-header centered" dir="rtl">
          <div className="sh-tag">
            <div className="sh-gem" />
            مسار القبول
          </div>
          <h2 className="sh-title">5 مراحل لتأهيل الطالب بدقة</h2>
          <p className="sh-sub">
            مسار منظم ومؤتمت يضمن وصول كل طالب إلى الفصل المناسب بكفاءة عالية.
          </p>
        </div>

        <div className="pipeline-card">
          {/* Mandala watermark bottom-left */}
          <div className="pl-bg-mandala" aria-hidden="true">
            <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
              {[82, 70, 58, 47, 37, 27, 18, 10].map((r, i) => (
                <circle
                  key={i}
                  cx={P.cx}
                  cy={P.cy}
                  r={r}
                  fill="none"
                  stroke="#C8A96A"
                  strokeWidth="0.4"
                  opacity={0.03 + i * 0.04}
                  strokeDasharray={i % 2 ? "2 4" : "none"}
                />
              ))}
              {P_SPOKES.map((s, i) => (
                <line
                  key={i}
                  x1={s.x1}
                  y1={s.y1}
                  x2={s.x2}
                  y2={s.y2}
                  stroke="#C8A96A"
                  strokeWidth="0.3"
                  opacity="0.07"
                />
              ))}
              <polygon
                points={P_STAR.map((p) => `${p.x},${p.y}`).join(" ")}
                stroke="#C8A96A"
                strokeWidth="0.4"
                fill="none"
                opacity="0.1"
              />
              {P_PETALS.map((p, i) => (
                <circle
                  key={i}
                  cx={p.cx}
                  cy={p.cy}
                  r="18"
                  fill="none"
                  stroke="#C8A96A"
                  strokeWidth="0.3"
                  opacity="0.07"
                />
              ))}
              <circle
                cx={P.cx}
                cy={P.cy}
                r="2.5"
                fill="#C8A96A"
                opacity="0.25"
              />
            </svg>
          </div>

          {[
            {
              n: "01",
              t: "التسجيل في المنصة",
              d: "يسجل الطالب حسابه ويدخل بياناته الأساسية.",
              badge: null,
            },
            {
              n: "02",
              t: "اختبار القبول",
              d: "يؤدي الطالب اختبار القبول الذي يحدده مالك المنصة، ويشمل أسئلة MCQ وصح/خطأ وإجابات مكتوبة.",
              badge: { l: "تلقائي + يدوي", g: true },
            },
            {
              n: "03",
              t: "مراجعة المالك وتعيين المدرسة",
              d: "يراجع المالك الإجابات ويصحح المكتوب ويحدد المدرسة المناسبة للطالب بناءً على النتيجة.",
              badge: { l: "يدوي", g: false },
            },
            {
              n: "04",
              t: "اختبار التصنيف المدرسي",
              d: "يؤدي الطالب اختبار التصنيف الذي تعده المدرسة لتحديد الفصل الدراسي المناسب.",
              badge: { l: "تلقائي + يدوي", g: true },
            },
            {
              n: "05",
              t: "تعيين الفصل والانطلاق",
              d: "يراجع مدير المدرسة النتيجة ويعين الطالب في الفصل المناسب — يبدأ الطالب رحلته التعليمية.",
              badge: { l: "مكتمل ✓", g: false },
            },
          ].map((step, i) => (
            <div
              key={step.n}
              className="pipe-row"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="pr-left">
                <div className="pr-num">{step.n}</div>
                {i < 4 && <div className="pr-line" />}
              </div>
              <div className="pr-body">
                <div className="pr-title">{step.t}</div>
                <div className="pr-desc">{step.d}</div>
              </div>
              {step.badge && (
                <span
                  className={`pr-badge ${step.badge.g ? "badge-g" : "badge-n"}`}
                >
                  {step.badge.l}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Ornamental rule ── */}
      <div className="ornament-rule" aria-hidden="true">
        <div className="or-line" />
        <svg width="100" height="22" viewBox="0 0 100 22" fill="none">
          <polygon
            points="50,2 58,11 50,20 42,11"
            stroke="#C8A96A"
            strokeWidth="0.8"
            fill="rgba(200,169,106,0.1)"
            opacity="0.6"
          />
          <circle cx="50" cy="11" r="2.5" fill="#C8A96A" opacity="0.55" />
          <line
            x1="0"
            y1="11"
            x2="34"
            y2="11"
            stroke="#C8A96A"
            strokeWidth="0.5"
            opacity="0.3"
          />
          <line
            x1="66"
            y1="11"
            x2="100"
            y2="11"
            stroke="#C8A96A"
            strokeWidth="0.5"
            opacity="0.3"
          />
        </svg>
        <div className="or-line" />
      </div>

      {/* ══════════════════════════════════════════════
          CTA SECTION
      ══════════════════════════════════════════════ */}
      <section className="cta-section" dir="rtl">
        {/* Full mandala centered behind */}
        <div className="cta-mandala" aria-hidden="true">
          <svg width="560" height="560" viewBox="0 0 560 560" fill="none">
            {[260, 228, 198, 170, 144, 120, 98, 78, 60, 44, 30, 18].map(
              (r, i) => (
                <circle
                  key={i}
                  cx="280"
                  cy="280"
                  r={r}
                  fill="none"
                  stroke="#C8A96A"
                  strokeWidth={i < 2 ? 0.8 : 0.4}
                  opacity={0.04 + i * 0.048}
                  strokeDasharray={
                    i % 3 === 0
                      ? "none"
                      : i % 3 === 1
                        ? `${r * 0.22} ${r * 0.16}`
                        : "2 6"
                  }
                />
              ),
            )}
            {makeSpokes(280, 280, 0, 260, 8).map((s, i) => (
              <line
                key={i}
                x1={s.x1}
                y1={s.y1}
                x2={s.x2}
                y2={s.y2}
                stroke="#C8A96A"
                strokeWidth="0.7"
                opacity="0.14"
              />
            ))}
            {makeSpokes(280, 280, 24, 260, 24).map((s, i) => (
              <line
                key={i}
                x1={s.x1}
                y1={s.y1}
                x2={s.x2}
                y2={s.y2}
                stroke="#C8A96A"
                strokeWidth="0.3"
                opacity="0.06"
              />
            ))}
            <polygon
              points={makeStar(280, 280, 188, 120, 16)
                .map((p) => `${p.x},${p.y}`)
                .join(" ")}
              stroke="#C8A96A"
              strokeWidth="0.6"
              fill="none"
              opacity="0.2"
            />
            <polygon
              points={makeStar(280, 280, 104, 64, 8)
                .map((p) => `${p.x},${p.y}`)
                .join(" ")}
              stroke="#E5B93C"
              strokeWidth="0.7"
              fill="rgba(229,185,60,0.02)"
              opacity="0.26"
            />
            {makePetals(280, 280, 148, 12).map((p, i) => (
              <circle
                key={i}
                cx={p.cx}
                cy={p.cy}
                r="44"
                fill="none"
                stroke="#C8A96A"
                strokeWidth="0.4"
                opacity="0.1"
              />
            ))}
            {makeDots(280, 280, 210, 16).map((d, i) => (
              <circle
                key={i}
                cx={d.cx}
                cy={d.cy}
                r={i % 4 === 0 ? 2.8 : 1.6}
                fill="#C8A96A"
                opacity={i % 4 === 0 ? 0.35 : 0.18}
              />
            ))}
            <circle
              cx="280"
              cy="280"
              r="14"
              fill="none"
              stroke="#C8A96A"
              strokeWidth="0.7"
              opacity="0.3"
            />
            <circle
              cx="280"
              cy="280"
              r="7"
              fill="none"
              stroke="#E5B93C"
              strokeWidth="0.8"
              opacity="0.38"
            />
            <circle cx="280" cy="280" r="3.5" fill="#C8A96A" opacity="0.55" />
            <circle cx="280" cy="280" r="1.5" fill="#E5B93C" opacity="0.8" />
          </svg>
        </div>

        <div className="cta-content">
          <div className="cta-orn">
            <div className="cta-orn-line" />
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <polygon
                points="12,1 15,9 23,9 17,14 19,22 12,17 5,22 7,14 1,9 9,9"
                stroke="#C8A96A"
                strokeWidth="0.8"
                fill="rgba(200,169,106,0.12)"
                opacity="0.7"
              />
              <circle cx="12" cy="12" r="2" fill="#C8A96A" opacity="0.6" />
            </svg>
            <div className="cta-orn-line" />
          </div>
          <div className="cta-tag">انضم اليوم</div>
          <h2 className="cta-title">
            ابدأ رحلتك مع
            <br />
            <span className="cta-gold">منصة بناء الأهلية</span>
          </h2>
          <p className="cta-sub">
            سجّل حسابك الآن وانضم إلى منظومة تعليمية متكاملة
            <br />
            تضع الطالب في المكان المناسب.
          </p>
          <div className="cta-btns">
            <Link href="/signup" className="btn-gold">
              إنشاء حساب طالب
            </Link>
            <Link href="/login" className="btn-ghost">
              لدي حساب بالفعل
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer" dir="rtl">
        <div className="footer-inner">
          <Image
            src="/ahlia.png"
            alt="بناء الأهلية"
            width={120}
            height={48}
            style={{
              objectFit: "contain",
              height: 38,
              width: "auto",
              opacity: 0.75,
            }}
          />
          <p className="footer-copy">
            جميع الحقوق محفوظة © {new Date().getFullYear()} — بناء الأهلية
            التعليمية
          </p>
          <div className="footer-links">
            <Link href="/login" className="footer-link">
              تسجيل الدخول
            </Link>
            <Link href="/signup" className="footer-link">
              إنشاء حساب
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}

// ── Global CSS ────────────────────────────────────────────────────────────────
const globalCSS = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}

@keyframes heroIn    {from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeUp    {from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeRight {from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}
@keyframes floatSlow {0%,100%{transform:rotate(0deg) scale(1)} 50%{transform:rotate(0.4deg) scale(1.004)}}
@keyframes pulse2    {0%,100%{opacity:0.55} 50%{opacity:0.9}}

:root {
  --gold:       #C8A96A;
  --gold2:      #E5B93C;
  --gold-deep:  #A8893A;
  --gm:         rgba(200,169,106,0.09);
  --gm2:        rgba(200,169,106,0.16);
  --gbdr:       rgba(200,169,106,0.22);
  --black:      #0B0B0C;
  --ow:         #F5F3EE;
  --cream:      #EDE9E0;
  --cream2:     #E5DECE;
  --txt:        #0B0B0C;
  --txt2:       #3E3526;
  --txt3:       #8A7A5A;
  --sur:        #FFFFFF;
  --bdr:        #DDD5C4;
  --bdr2:       #CEC2AC;
  --r:          12px;
  --shsm:       0 1px 4px rgba(11,11,12,0.05);
  --sh:         0 4px 20px rgba(11,11,12,0.07);
  --shlg:       0 12px 48px rgba(11,11,12,0.10);
  --shg:        0 6px 28px rgba(200,169,106,0.18);
}

body{
  background:var(--ow);
  color:var(--txt);
  font-family:'Cairo',sans-serif;
  overflow-x:hidden;
  direction:rtl;
}
/* Subtle paper grain */
body::before{
  content:'';position:fixed;inset:0;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.022'/%3E%3C/svg%3E");
  pointer-events:none;z-index:0;
}

/* ── Navbar ── */
.nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  height:68px;padding:0 52px;
  display:flex;align-items:center;justify-content:space-between;
  background:rgba(245,243,238,0.94);
  backdrop-filter:blur(18px);
  border-bottom:1px solid var(--bdr);
  box-shadow:0 1px 0 var(--bdr), 0 2px 12px rgba(11,11,12,0.04);
}
.nav::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,transparent 0%,rgba(200,169,106,0.45) 20%,var(--gold2) 50%,rgba(200,169,106,0.45) 80%,transparent 100%);
}
.nav-center{display:flex;gap:4px;align-items:center}
.nav-right{display:flex;gap:8px;align-items:center}
.nav-link{font-size:13.5px;font-weight:600;color:var(--txt3);text-decoration:none;padding:7px 15px;border-radius:8px;transition:all 0.18s}
.nav-link:hover{color:var(--txt2);background:var(--gm)}
.nav-cta{
  font-size:13px;font-weight:800;
  background:var(--black);color:var(--gold);
  padding:9px 22px;border-radius:9px;text-decoration:none;
  border:1px solid rgba(200,169,106,0.2);
  transition:all 0.18s;letter-spacing:0.2px;
}
.nav-cta:hover{background:#1a1208;border-color:var(--gold);box-shadow:var(--shg)}

/* ── Hero ── */
.hero{
  min-height:100vh;
  display:flex;align-items:center;justify-content:center;
  padding:110px 24px 80px;
  position:relative;overflow:hidden;
  background:
    radial-gradient(ellipse 80% 70% at 50% 40%, rgba(200,169,106,0.07) 0%,transparent 65%),
    linear-gradient(170deg, var(--ow) 55%, var(--cream) 100%);
  text-align:center;
}

/* Fine grid */
.hero-grid{
  position:absolute;inset:0;pointer-events:none;
  background-image:
    linear-gradient(rgba(200,169,106,0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(200,169,106,0.045) 1px, transparent 1px);
  background-size:72px 72px;
  mask-image:radial-gradient(ellipse 85% 85% at 50% 50%, black 20%, transparent 75%);
}

.hero-mandala{
  position:absolute;top:50%;left:50%;
  transform:translate(-50%,-50%);
  pointer-events:none;
  animation:floatSlow 10s ease-in-out infinite;
  opacity:0.85;
}

.hero-content{
  position:relative;z-index:2;
  max-width:720px;
  display:flex;flex-direction:column;align-items:center;gap:26px;
  animation:heroIn 1s cubic-bezier(0.22,1,0.36,1) both;
}

.hero-eyebrow{
  display:flex;align-items:center;gap:10px;
  font-size:11px;font-weight:700;color:var(--gold);
  text-transform:uppercase;letter-spacing:2.5px;
  font-family:'IBM Plex Mono',monospace;
}
.hero-eyebrow-gem{
  width:5px;height:5px;border-radius:1px;
  background:var(--gold);transform:rotate(45deg);
  box-shadow:0 0 6px rgba(200,169,106,0.5);
}

.hero-h1{
  font-size:clamp(44px,6vw,76px);
  font-weight:900;line-height:1.1;
  letter-spacing:-2.5px;
}
.h1-normal{color:var(--txt2)}
.h1-gold{color:var(--gold)}
.h1-outline{
  -webkit-text-stroke:1.5px rgba(200,169,106,0.4);
  color:transparent;
}

.hero-p{
  font-size:clamp(15px,1.8vw,17.5px);
  color:var(--txt3);line-height:1.9;
  max-width:560px;font-weight:400;
}

.hero-btns{display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:center}

.btn-gold{
  display:inline-flex;align-items:center;gap:9px;
  background:var(--black);color:var(--gold);
  padding:14px 32px;border-radius:10px;
  font-size:15px;font-weight:800;text-decoration:none;
  border:1px solid rgba(200,169,106,0.22);
  transition:all 0.2s;
  box-shadow:0 4px 20px rgba(11,11,12,0.14);
}
.btn-gold:hover{background:#1a1208;border-color:var(--gold);box-shadow:var(--shg);transform:translateY(-1px)}

.btn-ghost{
  display:inline-flex;align-items:center;gap:9px;
  background:transparent;color:var(--txt2);
  padding:14px 28px;border-radius:10px;
  font-size:15px;font-weight:700;text-decoration:none;
  border:1.5px solid var(--bdr2);
  transition:all 0.2s;
}
.btn-ghost:hover{border-color:var(--gold);color:var(--gold);background:var(--gm)}

.hero-stats{
  display:flex;align-items:center;gap:40px;
  padding-top:18px;border-top:1px solid var(--bdr);
  width:100%;justify-content:center;
}
.h-stat{display:flex;flex-direction:column;align-items:center;gap:2px}
.h-stat-val{
  font-size:30px;font-weight:900;color:var(--black);
  font-family:'IBM Plex Mono',monospace;letter-spacing:-1px;line-height:1;
}
.h-stat-lab{font-size:11.5px;color:var(--txt3);font-weight:600}

/* ── Ornament rule ── */
.ornament-rule{display:flex;align-items:center;gap:0;padding:0 52px}
.or-line{flex:1;height:1px;background:linear-gradient(90deg,transparent,var(--bdr),transparent)}

/* ── Sections ── */
.section{padding:96px 52px;max-width:1200px;margin:0 auto;position:relative;z-index:1}

.section-bg-mandala{position:absolute;pointer-events:none;opacity:0.7}
.section-bg-mandala.top-left{top:-20px;right:-20px}

.section-header{margin-bottom:52px}
.section-header.centered{text-align:center;display:flex;flex-direction:column;align-items:center}
.sh-tag{
  display:inline-flex;align-items:center;gap:8px;
  font-size:10px;font-weight:700;color:var(--gold);
  text-transform:uppercase;letter-spacing:2.5px;
  font-family:'IBM Plex Mono',monospace;
  margin-bottom:14px;
}
.sh-gem{width:5px;height:5px;border-radius:1px;background:var(--gold);transform:rotate(45deg)}
.sh-title{
  font-size:clamp(27px,3.5vw,42px);
  font-weight:900;color:var(--black);
  letter-spacing:-1.2px;line-height:1.2;margin-bottom:12px;
}
.sh-sub{font-size:16px;color:var(--txt3);line-height:1.8;max-width:500px}

/* Roles */
.roles-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:18px}

.role-card{
  background:var(--sur);border:1px solid var(--bdr);border-radius:16px;
  padding:30px;display:flex;flex-direction:column;gap:15px;
  box-shadow:var(--shsm);transition:all 0.24s;
  animation:fadeUp 0.5s ease both;position:relative;overflow:hidden;
}
.role-card::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,transparent,var(--gold),var(--gold2),transparent);
  opacity:0;transition:opacity 0.24s;
}
.role-card:hover{border-color:var(--gbdr);box-shadow:var(--shlg);transform:translateY(-3px)}
.role-card:hover::before{opacity:1}

.rc-top{display:flex;align-items:center;justify-content:space-between}
.rc-n{
  font-size:11px;font-weight:700;color:var(--gold);
  font-family:'IBM Plex Mono',monospace;letter-spacing:1px;
  background:var(--gm);border:1px solid var(--gbdr);
  padding:3px 9px;border-radius:6px;
}
.rc-icon{
  width:46px;height:46px;border-radius:12px;
  background:var(--cream);border:1px solid var(--bdr);
  display:flex;align-items:center;justify-content:center;font-size:22px;
}
.rc-title{font-size:19px;font-weight:900;color:var(--black);letter-spacing:-0.4px}
.rc-desc{font-size:13.5px;color:var(--txt3);line-height:1.75}
.rc-divider{height:1px;background:var(--bdr)}
.rc-feats{display:flex;flex-direction:column;gap:8px;list-style:none}
.rc-feat{display:flex;align-items:center;gap:10px;font-size:13px;color:var(--txt2);font-weight:500}
.rc-gem{width:5px;height:5px;border-radius:1px;background:var(--gold);transform:rotate(45deg);flex-shrink:0;opacity:0.7}

/* Pipeline */
.pipeline-section{}
.pipeline-card{
  background:var(--sur);border:1px solid var(--bdr);
  border-radius:18px;padding:44px 50px;
  box-shadow:var(--sh);position:relative;overflow:hidden;
}
.pl-bg-mandala{position:absolute;left:-20px;bottom:-20px;pointer-events:none;opacity:0.55}

.pipe-row{
  display:flex;align-items:flex-start;gap:26px;
  padding:22px 0;border-bottom:1px solid var(--bdr);
  animation:fadeRight 0.5s ease both;transition:background 0.18s;
  position:relative;z-index:1;
  border-radius:8px;padding-right:8px;padding-left:8px;
  margin:0 -8px;
}
.pipe-row:last-child{border-bottom:none}
.pipe-row:hover{background:rgba(200,169,106,0.03)}
.pipe-row:hover .pr-title{color:var(--gold)}

.pr-left{display:flex;flex-direction:column;align-items:center;flex-shrink:0}
.pr-num{
  width:44px;height:44px;
  border:1.5px solid var(--gbdr);border-radius:11px;
  background:var(--cream);
  display:flex;align-items:center;justify-content:center;
  font-size:12px;font-weight:700;color:var(--gold);
  font-family:'IBM Plex Mono',monospace;
  transition:all 0.2s;flex-shrink:0;
}
.pipe-row:hover .pr-num{background:var(--gold);color:var(--black);border-color:var(--gold)}
.pr-line{width:1.5px;flex:1;min-height:28px;background:linear-gradient(180deg,var(--gbdr),transparent);margin-top:6px}
.pr-body{flex:1;padding-top:5px}
.pr-title{font-size:15px;font-weight:800;color:var(--black);margin-bottom:4px;transition:color 0.18s}
.pr-desc{font-size:13px;color:var(--txt3);line-height:1.7}
.pr-badge{
  align-self:center;flex-shrink:0;
  font-size:11px;font-weight:700;
  padding:5px 12px;border-radius:99px;border:1px solid;white-space:nowrap;
}
.badge-g{color:var(--gold-deep);border-color:var(--gbdr);background:var(--gm)}
.badge-n{color:var(--txt3);border-color:var(--bdr);background:var(--cream)}

/* CTA */
.cta-section{
  position:relative;overflow:hidden;
  padding:120px 52px;
  display:flex;align-items:center;justify-content:center;
  text-align:center;
  border-top:1px solid var(--bdr);
  background:
    radial-gradient(ellipse 70% 70% at 50% 50%, rgba(200,169,106,0.065) 0%,transparent 70%),
    linear-gradient(170deg,var(--cream) 0%,var(--ow) 100%);
}
.cta-mandala{
  position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
  pointer-events:none;opacity:0.55;
  animation:floatSlow 12s ease-in-out infinite;
}
.cta-content{
  position:relative;z-index:2;
  display:flex;flex-direction:column;align-items:center;gap:20px;
  max-width:580px;
}
.cta-orn{display:flex;align-items:center;gap:14px;width:100%;justify-content:center}
.cta-orn-line{width:50px;height:1px;background:var(--gbdr)}
.cta-tag{font-size:10px;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:2.5px;font-family:'IBM Plex Mono',monospace}
.cta-title{font-size:clamp(32px,4.5vw,54px);font-weight:900;color:var(--black);letter-spacing:-1.5px;line-height:1.15}
.cta-gold{color:var(--gold)}
.cta-sub{font-size:16px;color:var(--txt3);line-height:1.85;font-weight:400}
.cta-btns{display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:center}

/* Footer */
.footer{background:var(--black);border-top:1px solid rgba(200,169,106,0.15);padding:30px 52px;position:relative}
.footer::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(200,169,106,0.4),transparent)}
.footer-inner{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
.footer-copy{font-size:12px;color:rgba(200,169,106,0.35);font-weight:500}
.footer-links{display:flex;gap:18px}
.footer-link{font-size:12.5px;color:rgba(200,169,106,0.42);text-decoration:none;font-weight:600;transition:color 0.15s}
.footer-link:hover{color:var(--gold)}

/* Responsive */
@media(max-width:900px){.roles-grid{grid-template-columns:1fr}}
@media(max-width:768px){
  .nav{padding:0 20px}
  .nav-center{display:none}
  .hero{padding:90px 20px 60px}
  .section{padding:60px 20px}
  .pipeline-card{padding:28px 22px}
  .cta-section{padding:80px 20px}
  .footer{padding:24px 20px}
  .ornament-rule{padding:0 20px}
  .hero-stats{gap:24px}
  .h-stat-val{font-size:24px}
}
`;
