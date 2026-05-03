/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
export const dynamic = "force-dynamic";
interface Props {
  params: Promise<{ slug: string }>;
}

export default async function SchoolLandingPage({ params }: Props) {
  const { slug } = await params;

  const school = await prisma.school.findUnique({
    where: { slug },
    include: {
      admin: { select: { full_name: true } },
      _count: { select: { teachers: true, students: true, classes: true } },
    },
  });

  if (!school) notFound();

  const isAlbanian = school.language === "sq";
  const dir = isAlbanian ? "ltr" : "rtl";

  // Custom colors with fallbacks
  const primary = (school as any).color_primary || "#C8A96A";
  const secondary = (school as any).color_secondary || "#E5B93C";
  const bg = (school as any).color_bg || "#0B0B0C";

  // Generate rgba versions from hex
  function hexToRgb(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
  }
  const primaryRgb = hexToRgb(primary.startsWith("#") ? primary : "#C8A96A");
  const bgRgb = hexToRgb(bg.startsWith("#") ? bg : "#0B0B0C");

  const L = isAlbanian
    ? {
        tagline: "Platforma Arsimore",
        welcomeTitle: `Mirë se vini në ${school.name}`,
        loginBtn: "Hyrje",
        signupBtn: "Regjistrohu",
        adminLabel: "Drejtor",
        poweredBy: "E mundësuar nga",
        studentsLabel: "Nxënës",
        teachersLabel: "Mësues",
        classesLabel: "Klasa",
        langBadge: "🇦🇱 Shqip",
      }
    : {
        tagline: "المنصة التعليمية",
        welcomeTitle: `أهلاً بك في ${school.name}`,
        loginBtn: "تسجيل الدخول",
        signupBtn: "إنشاء حساب",
        adminLabel: "المدير",
        poweredBy: "مدعومة من",
        studentsLabel: "طالب",
        teachersLabel: "معلم",
        classesLabel: "فصل",
        langBadge: "🇸🇦 العربية",
      };

  const stats = [
    { num: school._count.students, lab: L.studentsLabel },
    { num: school._count.teachers, lab: L.teachersLabel },
    { num: school._count.classes, lab: L.classesLabel },
  ];

  return (
    <>
      <main
        dir={dir}
        style={{
          minHeight: "100vh",
          background: bg,
          fontFamily: "'Cairo', sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glows using custom colors */}
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -200,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(${primaryRgb},0.1) 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -300,
            left: -200,
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(${primaryRgb},0.06) 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
        {/* Grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(rgba(${primaryRgb},0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(${primaryRgb},0.03) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
            pointerEvents: "none",
          }}
        />

        {/* Header */}
        <header
          style={{
            borderBottom: `1px solid rgba(${primaryRgb},0.12)`,
            padding: "0 32px", // ← was "16px 32px"
            height: 64, // ← fixed height
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 10,
            overflow: "hidden", // ← clips the logo to header bounds
          }}
        >
          <Image
            src="/ahlia3.png"
            alt="بناء الأهلية"
            width={200}
            height={64}
            style={{ objectFit: "cover", borderRadius: 12 }}
            priority
          />
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: `rgba(${primaryRgb},0.3)` }}>
              {L.langBadge}
            </span>
            <Link
              href={`/schools/${slug}/login`}
              style={{
                padding: "8px 20px",
                borderRadius: 8,
                border: `1px solid rgba(${primaryRgb},0.22)`,
                color: primary,
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              {L.loginBtn}
            </Link>
            <Link
              href="/signup"
              style={{
                padding: "8px 20px",
                borderRadius: 8,
                background: primary,
                color: bg,
                fontSize: 13,
                fontWeight: 800,
                textDecoration: "none",
              }}
            >
              {L.signupBtn}
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "72px 24px 56px",
            position: "relative",
            zIndex: 5,
          }}
        >
          {/* Geometric ring with custom color */}
          <div style={{ position: "relative", marginBottom: 28 }}>
            <svg
              width="130"
              height="130"
              viewBox="0 0 130 130"
              fill="none"
              style={{ opacity: 0.65 }}
            >
              <circle
                cx="65"
                cy="65"
                r="60"
                stroke={primary}
                strokeWidth="0.4"
                strokeDasharray="4 5"
              />
              <circle
                cx="65"
                cy="65"
                r="48"
                stroke={primary}
                strokeWidth="0.5"
              />
              <circle
                cx="65"
                cy="65"
                r="35"
                stroke={secondary}
                strokeWidth="0.7"
              />
              <circle cx="65" cy="65" r="22" stroke={primary} strokeWidth="1" />
              <circle cx="65" cy="65" r="6" fill={primary} opacity="0.8" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
                const rad = (a * Math.PI) / 180;
                return (
                  <line
                    key={a}
                    x1={65 + 8 * Math.cos(rad)}
                    y1={65 + 8 * Math.sin(rad)}
                    x2={65 + 32 * Math.cos(rad)}
                    y2={65 + 32 * Math.sin(rad)}
                    stroke={primary}
                    strokeWidth="0.4"
                    opacity="0.5"
                  />
                );
              })}
              {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map(
                (a) => {
                  const rad = (a * Math.PI) / 180;
                  return (
                    <circle
                      key={a}
                      cx={65 + 48 * Math.cos(rad)}
                      cy={65 + 48 * Math.sin(rad)}
                      r="1.5"
                      fill={primary}
                      opacity="0.4"
                    />
                  );
                },
              )}
            </svg>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                width: 40,
                height: 40,
                background: primary,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 17,
                fontWeight: 900,
                color: bg,
                boxShadow: `0 0 24px rgba(${primaryRgb},0.4)`,
              }}
            >
              {school.name.charAt(0)}
            </div>
          </div>

          <div
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              color: primary,
              textTransform: "uppercase",
              letterSpacing: "2.5px",
              marginBottom: 14,
              opacity: 0.65,
            }}
          >
            بناء الأهلية — {L.tagline}
          </div>

          <h1
            style={{
              fontSize: 44,
              fontWeight: 900,
              color: "white",
              letterSpacing: "-1.5px",
              marginBottom: 14,
              lineHeight: 1.1,
              maxWidth: 640,
            }}
          >
            {school.name}
          </h1>

          <div
            style={{
              width: 48,
              height: 1.5,
              background: `linear-gradient(90deg, transparent, ${primary}, transparent)`,
              marginBottom: 20,
            }}
          />

          {school.description && (
            <p
              style={{
                fontSize: 15,
                color: `rgba(${primaryRgb},0.55)`,
                maxWidth: 500,
                lineHeight: 1.8,
                marginBottom: 12,
              }}
            >
              {school.description}
            </p>
          )}

          {school.admin && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: `rgba(${primaryRgb},0.4)`,
                fontSize: 13,
                marginBottom: 36,
              }}
            >
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
              <span style={{ fontWeight: 500 }}>{L.adminLabel}:</span>
              <span
                style={{ fontWeight: 700, color: `rgba(${primaryRgb},0.65)` }}
              >
                {school.admin.full_name}
              </span>
            </div>
          )}

          {school._count.students > 0 && (
            <div
              style={{
                display: "flex",
                border: `1px solid rgba(${primaryRgb},0.12)`,
                borderRadius: 14,
                overflow: "hidden",
                marginBottom: 40,
              }}
            >
              {stats.map((s, i) => (
                <div
                  key={i}
                  style={{
                    padding: "16px 28px",
                    borderLeft:
                      i > 0 ? `1px solid rgba(${primaryRgb},0.1)` : "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 24,
                      fontWeight: 900,
                      color: primary,
                      fontFamily: "monospace",
                    }}
                  >
                    {s.num}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: `rgba(${primaryRgb},0.38)`,
                      fontWeight: 600,
                    }}
                  >
                    {s.lab}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* CTAs */}
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Link
              href={`/schools/${slug}/login`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 38px",
                background: primary,
                color: bg,
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 800,
                textDecoration: "none",
                letterSpacing: "-0.2px",
                boxShadow: `0 6px 28px rgba(${primaryRgb},0.3)`,
              }}
            >
              {L.loginBtn}
              <svg
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/signup"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "14px 38px",
                border: `1px solid rgba(${primaryRgb},0.22)`,
                color: primary,
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              {L.signupBtn}
            </Link>
          </div>
        </section>

        {/* Feature strip */}
        <section
          style={{
            position: "relative",
            zIndex: 5,
            margin: "0 32px 40px",
            padding: "28px 32px",
            border: `1px solid rgba(${primaryRgb},0.1)`,
            borderRadius: 16,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 0,
          }}
        >
          {[
            {
              icon: "🎓",
              titleAr: "تعلّم متميز",
              titleSq: "Mësim i shkëlqyer",
              subAr: "محتوى تعليمي منظم ومتكامل",
              subSq: "Përmbajtje e organizuar arsimore",
            },
            {
              icon: "📊",
              titleAr: "بنك الأسئلة",
              titleSq: "Banka e Pyetjeve",
              subAr: "تقييمات مرحلية متتالية",
              subSq: "Vlerësime progresive dhe sistematike",
            },
            {
              icon: "🏆",
              titleAr: "تقدّم واضح",
              titleSq: "Progres i qartë",
              subAr: "تتبع مستمر لمستوى الطالب",
              subSq: "Ndjekje e vazhdueshme e progresit",
            },
          ].map((f, i) => (
            <div
              key={i}
              style={{
                padding: "18px 24px",
                borderLeft:
                  i > 0 ? `1px solid rgba(${primaryRgb},0.08)` : "none",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 22 }}>{f.icon}</span>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: `rgba(${primaryRgb},0.8)`,
                }}
              >
                {isAlbanian ? f.titleSq : f.titleAr}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: `rgba(${primaryRgb},0.35)`,
                  lineHeight: 1.6,
                }}
              >
                {isAlbanian ? f.subSq : f.subAr}
              </div>
            </div>
          ))}
        </section>

        {/* Footer */}
        <footer
          style={{
            position: "relative",
            zIndex: 5,
            borderTop: `1px solid rgba(${primaryRgb},0.08)`,
            padding: "18px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 5,
                background: primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill={bg} />
              </svg>
            </div>
            <span
              style={{
                fontSize: 11,
                color: `rgba(${primaryRgb},0.35)`,
                fontWeight: 500,
              }}
            >
              {L.poweredBy}{" "}
              <span
                style={{ color: `rgba(${primaryRgb},0.6)`, fontWeight: 700 }}
              >
                بناء الأهلية
              </span>
            </span>
          </div>
          <Link
            href={`/schools/${slug}/login`}
            style={{
              fontSize: 11.5,
              color: `rgba(${primaryRgb},0.3)`,
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            {L.loginBtn}
          </Link>
        </footer>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{background:${bg}}
      `}</style>
    </>
  );
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const school = await prisma.school.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });
  if (!school) return { title: "School Not Found" };
  return { title: school.name, description: school.description ?? school.name };
}
