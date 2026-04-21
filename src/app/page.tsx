import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&family=IBM+Plex+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --navy: #0a0f1e;
          --navy2: #0f1629;
          --gold: #c9a84c;
          --gold2: #e8c97a;
          --gold-muted: rgba(201,168,76,0.12);
          --white: #f5f3ee;
          --white2: rgba(245,243,238,0.7);
          --white3: rgba(245,243,238,0.35);
          --border: rgba(201,168,76,0.2);
          --border2: rgba(245,243,238,0.08);
        }

        html { scroll-behavior: smooth; }

        body {
          background: var(--navy);
          color: var(--white);
          font-family: 'Tajawal', sans-serif;
          direction: rtl;
          overflow-x: hidden;
        }

        /* ── Noise texture overlay ── */
        body::before {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
          opacity: 0.4;
        }

        /* ── Nav ── */
        nav {
          position: fixed; top: 0; left: 0; right: 0;
          z-index: 100;
          padding: 0 48px;
          height: 68px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid var(--border2);
          background: rgba(10,15,30,0.85);
          backdrop-filter: blur(16px);
        }

        .nav-brand {
          display: flex; align-items: center; gap: 12px;
        }
        .nav-logo {
          width: 36px; height: 36px;
          border: 1.5px solid var(--gold);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 900; color: var(--gold);
          letter-spacing: -1px;
          font-family: 'IBM Plex Mono', monospace;
        }
        .nav-title {
          font-size: 16px; font-weight: 800; color: var(--white);
          letter-spacing: -0.3px;
        }
        .nav-title span { color: var(--gold); }

        .nav-links {
          display: flex; align-items: center; gap: 6px;
        }
        .nav-link {
          font-size: 13.5px; font-weight: 600; color: var(--white2);
          text-decoration: none; padding: 7px 16px; border-radius: 8px;
          transition: all 0.2s;
        }
        .nav-link:hover { color: var(--white); background: var(--border2); }
        .nav-cta {
          font-size: 13.5px; font-weight: 700;
          background: var(--gold); color: var(--navy);
          padding: 8px 22px; border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s;
          letter-spacing: -0.2px;
        }
        .nav-cta:hover { background: var(--gold2); transform: translateY(-1px); }

        /* ── Hero ── */
        .hero {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 100px 48px 80px;
          position: relative;
          overflow: hidden;
        }

        .hero-bg {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 80% 80%, rgba(201,168,76,0.04) 0%, transparent 50%),
            linear-gradient(180deg, var(--navy) 0%, var(--navy2) 100%);
          z-index: 0;
        }

        /* Decorative grid */
        .hero-grid {
          position: absolute; inset: 0; z-index: 0;
          background-image:
            linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%);
        }

        .hero-content {
          position: relative; z-index: 1;
          text-align: center;
          max-width: 820px;
          display: flex; flex-direction: column; align-items: center; gap: 28px;
          animation: heroFade 0.9s ease both;
        }

        @keyframes heroFade {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-tag {
          display: inline-flex; align-items: center; gap: 8px;
          border: 1px solid var(--border);
          background: var(--gold-muted);
          padding: 6px 16px; border-radius: 99px;
          font-size: 12px; font-weight: 700; color: var(--gold);
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .hero-tag-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--gold);
          animation: blink 2s ease infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .hero-title {
          font-size: clamp(44px, 7vw, 80px);
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -2px;
          color: var(--white);
        }
        .hero-title .gold { color: var(--gold); }
        .hero-title .outline {
          -webkit-text-stroke: 1.5px var(--white3);
          color: transparent;
        }

        .hero-sub {
          font-size: clamp(15px, 2vw, 18px);
          font-weight: 400;
          color: var(--white2);
          line-height: 1.8;
          max-width: 560px;
        }

        .hero-actions {
          display: flex; align-items: center; gap: 12px;
          flex-wrap: wrap; justify-content: center;
        }
        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--gold); color: var(--navy);
          padding: 14px 32px; border-radius: 10px;
          font-size: 15px; font-weight: 800;
          text-decoration: none; letter-spacing: -0.3px;
          transition: all 0.2s;
          box-shadow: 0 0 30px rgba(201,168,76,0.2);
        }
        .btn-primary:hover { background: var(--gold2); transform: translateY(-2px); box-shadow: 0 8px 40px rgba(201,168,76,0.3); }
        .btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          border: 1px solid var(--border);
          color: var(--white2);
          padding: 14px 28px; border-radius: 10px;
          font-size: 15px; font-weight: 600;
          text-decoration: none; letter-spacing: -0.3px;
          transition: all 0.2s;
        }
        .btn-ghost:hover { border-color: var(--gold); color: var(--gold); }

        .hero-stats {
          display: flex; align-items: center; gap: 40px;
          padding-top: 12px;
          border-top: 1px solid var(--border2);
          width: 100%;
          justify-content: center;
        }
        .stat {
          display: flex; flex-direction: column; align-items: center; gap: 2px;
        }
        .stat-val {
          font-size: 28px; font-weight: 900; color: var(--white);
          letter-spacing: -1px;
          font-family: 'IBM Plex Mono', monospace;
        }
        .stat-val .accent { color: var(--gold); }
        .stat-label { font-size: 12px; color: var(--white3); font-weight: 500; }
        .stat-sep { width: 1px; height: 40px; background: var(--border2); }

        /* ── Roles section ── */
        .section {
          padding: 100px 48px;
          position: relative; z-index: 1;
          max-width: 1200px; margin: 0 auto;
        }

        .section-label {
          font-size: 11px; font-weight: 700;
          color: var(--gold); letter-spacing: 2px;
          text-transform: uppercase; margin-bottom: 14px;
          font-family: 'IBM Plex Mono', monospace;
        }
        .section-title {
          font-size: clamp(28px, 4vw, 44px);
          font-weight: 900; color: var(--white);
          letter-spacing: -1px; line-height: 1.2;
          margin-bottom: 12px;
        }
        .section-sub {
          font-size: 16px; color: var(--white2); line-height: 1.7;
          max-width: 540px; margin-bottom: 52px;
        }

        /* Role cards */
        .roles-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (max-width: 768px) { .roles-grid { grid-template-columns: 1fr; } }

        .role-card {
          background: var(--navy2);
          border: 1px solid var(--border2);
          border-radius: 18px;
          padding: 32px;
          display: flex; flex-direction: column; gap: 18px;
          transition: all 0.25s;
          position: relative; overflow: hidden;
        }
        .role-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
          opacity: 0;
          transition: opacity 0.25s;
        }
        .role-card:hover { border-color: var(--border); transform: translateY(-3px); box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
        .role-card:hover::before { opacity: 1; }

        .role-icon {
          width: 52px; height: 52px;
          background: var(--gold-muted);
          border: 1px solid var(--border);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 24px;
        }
        .role-title { font-size: 19px; font-weight: 800; color: var(--white); letter-spacing: -0.4px; }
        .role-desc { font-size: 14px; color: var(--white2); line-height: 1.7; }
        .role-features {
          display: flex; flex-direction: column; gap: 8px;
          margin-top: 4px;
        }
        .role-feat {
          display: flex; align-items: center; gap: 10px;
          font-size: 13px; color: var(--white3);
        }
        .role-feat::before {
          content: '';
          width: 16px; height: 1px;
          background: var(--gold); flex-shrink: 0;
        }

        /* ── Pipeline section ── */
        .pipeline-wrap {
          background: var(--navy2);
          border: 1px solid var(--border2);
          border-radius: 22px;
          padding: 48px;
          position: relative; overflow: hidden;
        }
        .pipeline-bg {
          position: absolute; top: -60px; left: -60px;
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        .pipeline-steps {
          display: flex; flex-direction: column; gap: 0;
          position: relative; z-index: 1;
        }
        .pipeline-step {
          display: flex; align-items: flex-start; gap: 24px;
          padding: 24px 0;
          border-bottom: 1px solid var(--border2);
          position: relative;
        }
        .pipeline-step:last-child { border-bottom: none; }
        .step-num {
          width: 40px; height: 40px; flex-shrink: 0;
          background: var(--gold-muted);
          border: 1px solid var(--border);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700;
          color: var(--gold);
          font-family: 'IBM Plex Mono', monospace;
        }
        .step-body { flex: 1; }
        .step-title { font-size: 15px; font-weight: 800; color: var(--white); margin-bottom: 4px; }
        .step-desc { font-size: 13px; color: var(--white2); line-height: 1.6; }
        .step-badge {
          font-size: 11px; font-weight: 700;
          padding: 3px 10px; border-radius: 99px;
          border: 1px solid;
          white-space: nowrap; flex-shrink: 0; align-self: center;
        }
        .badge-auto { color: #10b981; border-color: rgba(16,185,129,0.3); background: rgba(16,185,129,0.08); }
        .badge-manual { color: var(--gold); border-color: var(--border); background: var(--gold-muted); }

        /* ── Footer ── */
        footer {
          border-top: 1px solid var(--border2);
          padding: 40px 48px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; flex-wrap: wrap;
          position: relative; z-index: 1;
        }
        .footer-brand {
          font-size: 16px; font-weight: 800; color: var(--white);
          letter-spacing: -0.3px;
        }
        .footer-brand span { color: var(--gold); }
        .footer-copy { font-size: 12px; color: var(--white3); }

        /* ── Divider line ── */
        .full-divider {
          width: 100%; height: 1px;
          background: linear-gradient(90deg, transparent, var(--border2), transparent);
        }

        @media (max-width: 768px) {
          nav { padding: 0 20px; }
          .hero { padding: 90px 20px 60px; }
          .section { padding: 60px 20px; }
          .pipeline-wrap { padding: 28px; }
          footer { padding: 28px 20px; }
          .hero-stats { gap: 24px; }
          .stat-val { font-size: 22px; }
        }
      `}</style>

      {/* Nav */}
      <nav>
        <div className="nav-brand">
          <div className="nav-logo">رو</div>
          <span className="nav-title">
            منصة <span>الرواد</span>
          </span>
        </div>
        <div className="nav-links">
          <a href="#roles" className="nav-link">
            الأدوار
          </a>
          <a href="#pipeline" className="nav-link">
            مسار القبول
          </a>
          <Link href="/login" className="nav-link">
            تسجيل الدخول
          </Link>
          <Link href="/signup" className="nav-cta">
            ابدأ الآن
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-content">
          <div className="hero-tag">
            <div className="hero-tag-dot" />
            منصة تعليمية متكاملة
          </div>

          <h1 className="hero-title">
            منصة <span className="gold">الرواد</span>
            <br />
            <span className="outline">للتعليم المتميز</span>
          </h1>

          <p className="hero-sub">
            نظام إداري شامل يربط المدارس والمعلمين والطلاب في بيئة واحدة متكاملة
            — من قبول الطلاب حتى تعيينهم في الفصول الدراسية.
          </p>

          <div className="hero-actions">
            <Link href="/signup" className="btn-primary">
              ابدأ رحلتك التعليمية
              <svg
                width="16"
                height="16"
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
            <div className="stat">
              <div className="stat-val">
                ٤<span className="accent">+</span>
              </div>
              <div className="stat-label">أدوار مستقلة</div>
            </div>
            <div className="stat-sep" />
            <div className="stat">
              <div className="stat-val">
                ٥<span className="accent">+</span>
              </div>
              <div className="stat-label">مراحل تأهيل</div>
            </div>
            <div className="stat-sep" />
            <div className="stat">
              <div className="stat-val">
                ١٠٠<span className="accent">٪</span>
              </div>
              <div className="stat-label">آمن ومحمي</div>
            </div>
          </div>
        </div>
      </section>

      <div className="full-divider" />

      {/* Roles */}
      <section className="section" id="roles">
        <div className="section-label"> الأدوار</div>
        <h2 className="section-title">
          نظام متكامل
          <br />
          لكل طرف في العملية التعليمية
        </h2>
        <p className="section-sub">
          كل دور يمتلك لوحة تحكم مستقلة وصلاحيات محددة تضمن الأمان والكفاءة.
        </p>

        <div className="roles-grid">
          <div className="role-card">
            <div className="role-icon">👑</div>
            <div>
              <div className="role-title">المالك</div>
              <div className="role-desc">
                إدارة كاملة للمنصة — من إنشاء اختبار القبول إلى مراجعة الإجابات
                وتعيين الطلاب في المدارس.
              </div>
            </div>
            <div className="role-features">
              <div className="role-feat">إنشاء اختبار القبول وإدارة أسئلته</div>
              <div className="role-feat">
                مراجعة إجابات الطلاب وتصحيح المكتوب
              </div>
              <div className="role-feat">تعيين الطلاب في المدارس المناسبة</div>
              <div className="role-feat">مراقبة جميع المدارس والإحصائيات</div>
            </div>
          </div>

          <div className="role-card">
            <div className="role-icon">🏫</div>
            <div>
              <div className="role-title">مدير المدرسة</div>
              <div className="role-desc">
                إدارة المدرسة بالكامل — من اختبار التصنيف إلى تعيين الطلاب في
                الفصول وإدارة المعلمين.
              </div>
            </div>
            <div className="role-features">
              <div className="role-feat">إنشاء اختبار التصنيف المدرسي</div>
              <div className="role-feat">مراجعة إجابات التصنيف وتقييمها</div>
              <div className="role-feat">تعيين الطلاب في الفصول الدراسية</div>
              <div className="role-feat">إدارة المعلمين والفصول</div>
            </div>
          </div>

          <div className="role-card">
            <div className="role-icon">👨‍🏫</div>
            <div>
              <div className="role-title">المعلم</div>
              <div className="role-desc">
                إدارة الفصول الدراسية وإنشاء الاختبارات ونشر الإعلانات للطلاب
                بسهولة وسرعة.
              </div>
            </div>
            <div className="role-features">
              <div className="role-feat">إنشاء اختبارات MCQ وصح/خطأ</div>
              <div className="role-feat">نشر الإعلانات لفصله</div>
              <div className="role-feat">متابعة نتائج الطلاب</div>
              <div className="role-feat">إدارة قائمة طلاب الفصل</div>
            </div>
          </div>

          <div className="role-card">
            <div className="role-icon">🎓</div>
            <div>
              <div className="role-title">الطالب</div>
              <div className="role-desc">
                رحلة تعليمية واضحة من اختبار القبول حتى الانضمام للفصل وأداء
                الاختبارات.
              </div>
            </div>
            <div className="role-features">
              <div className="role-feat">أداء اختبار القبول عند التسجيل</div>
              <div className="role-feat">أداء اختبار التصنيف بعد القبول</div>
              <div className="role-feat">متابعة إعلانات الفصل والاختبارات</div>
              <div className="role-feat">لوحة بيانات شخصية كاملة</div>
            </div>
          </div>
        </div>
      </section>

      <div className="full-divider" />

      {/* Pipeline */}
      <section className="section" id="pipeline">
        <div className="section-label"> مسار القبول</div>
        <h2 className="section-title">
          خمس مراحل
          <br />
          لتأهيل الطالب بدقة
        </h2>
        <p className="section-sub">
          مسار منظم ومؤتمت يضمن وصول كل طالب إلى الفصل المناسب بكفاءة عالية.
        </p>

        <div className="pipeline-wrap">
          <div className="pipeline-bg" />
          <div className="pipeline-steps">
            {[
              {
                num: "٠١",
                title: "التسجيل في المنصة",
                desc: "يسجل الطالب حسابه ويدخل بياناته الأساسية.",
                badge: null,
              },
              {
                num: "٠٢",
                title: "اختبار القبول",
                desc: "يؤدي الطالب اختبار القبول الذي يحدده مالك المنصة، ويشمل أسئلة MCQ وصح/خطأ وإجابات مكتوبة.",
                badge: { label: "تلقائي + يدوي", cls: "badge-auto" },
              },
              {
                num: "٠٣",
                title: "مراجعة المالك وتعيين المدرسة",
                desc: "يراجع المالك الإجابات ويصحح المكتوب ويحدد المدرسة المناسبة للطالب بناءً على النتيجة.",
                badge: { label: "يدوي", cls: "badge-manual" },
              },
              {
                num: "٠٤",
                title: "اختبار التصنيف المدرسي",
                desc: "يؤدي الطالب اختبار التصنيف الذي تعده المدرسة لتحديد الفصل الدراسي المناسب.",
                badge: { label: "تلقائي + يدوي", cls: "badge-auto" },
              },
              {
                num: "٠٥",
                title: "تعيين الفصل والانطلاق",
                desc: "يراجع مدير المدرسة النتيجة ويعين الطالب في الفصل المناسب — يبدأ الطالب رحلته التعليمية.",
                badge: { label: "مكتمل", cls: "badge-manual" },
              },
            ].map((step) => (
              <div key={step.num} className="pipeline-step">
                <div className="step-num">{step.num}</div>
                <div className="step-body">
                  <div className="step-title">{step.title}</div>
                  <div className="step-desc">{step.desc}</div>
                </div>
                {step.badge && (
                  <div className={`step-badge ${step.badge.cls}`}>
                    {step.badge.label}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="full-divider" />

      {/* CTA */}
      <section
        style={{
          padding: "100px 48px",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            maxWidth: 600,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}
        >
          <div className="hero-tag">
            <div className="hero-tag-dot" />
            انضم اليوم
          </div>
          <h2
            style={{
              fontSize: "clamp(32px, 5vw, 52px)",
              fontWeight: 900,
              color: "var(--white)",
              letterSpacing: -1.5,
              lineHeight: 1.15,
            }}
          >
            ابدأ رحلتك مع
            <br />
            <span style={{ color: "var(--gold)" }}>منصة الرواد</span>
          </h2>
          <p style={{ fontSize: 16, color: "var(--white2)", lineHeight: 1.7 }}>
            سجّل حسابك الآن وانضم إلى منظومة تعليمية متكاملة تضع الطالب في
            المكان المناسب.
          </p>
          <div className="hero-actions">
            <Link href="/signup" className="btn-primary">
              إنشاء حساب طالب
            </Link>
            <Link href="/login" className="btn-ghost">
              لدي حساب بالفعل
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-brand">
          منصة <span>الرواد</span>
        </div>
        <div className="footer-copy">
          جميع الحقوق محفوظة © {new Date().getFullYear()} — منصة الرواد
          التعليمية
        </div>
      </footer>
    </>
  );
}
