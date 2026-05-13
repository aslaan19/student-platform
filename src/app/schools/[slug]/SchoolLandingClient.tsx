"use client";

import { useState } from "react";

/* ─── Types ─── */
interface School {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  language: string;
  admin_name: string | null;
  student_count: number;
  teacher_count: number;
  class_count: number;
}

type Lang = "ar" | "sq";

interface Goal {
  icon: string;
  title: string;
  text: string;
}

interface Maqasid {
  icon: string;
  label: string;
}

interface ProgramStat {
  n: string;
  label: string;
}

interface Service {
  icon: string;
  name: string;
}

interface LangStrings {
  dir: "rtl" | "ltr";
  tagline: string;
  vision: string;
  missionTitle: string;
  missionText: string;
  goalsTitle: string;
  goals: Goal[];
  maqasidTitle: string;
  maqasid: Maqasid[];
  programTitle: string;
  programStats: ProgramStat[];
  measureTitle: string;
  measureText: string;
  students: string;
  teachers: string;
  classes: string;
  loginBtn: string;
  signupBtn: string;
  poweredBy: string;
  servicesTitle: string;
  services: Service[];
  ctaTitle: string;
  ctaSub: string;
  chip75: string;
  chip25: string;
}

/* ─── i18n ─── */
const STRINGS: Record<Lang, LangStrings> = {
  ar: {
    dir: "rtl",
    tagline: "جيل الرواد يحقق",
    vision: "تمكين الإنسان .. بناء المستقبل",
    missionTitle: "رسالتنا",
    missionText:
      "نسعى إلى بناء جيل رائد يتحلى برقي الأخلاق ويدرك قيمة العمل القائم على العلم، مستنيرًا بمقاصد الشريعة الإسلامية بوصفها مرجعية قيمية، ونحن نعمل على تحويل التعلم من التلقين إلى الاستنباط والممارسة وإنتاج المشاريع.",
    goalsTitle: "أهدافنا الأربعة",
    goals: [
      {
        icon: "⚖️",
        title: "التميز الأخلاقي",
        text: "بناء جيل يتمتّع برقي الأخلاق ويدرك قيمة العمل القائم على العلم",
      },
      {
        icon: "🎯",
        title: "رؤية 2030",
        text: "ترسيخ وعي الجيل بدوره ضمن مستهدفات رؤية المملكة 2030",
      },
      {
        icon: "🔬",
        title: "التعلم الفعّال",
        text: "التحول من التعلم بالتلقين إلى التعلم بالاستنباط والممارسة",
      },
      {
        icon: "👑",
        title: "قادة المستقبل",
        text: "إعداد قادة مؤهلين يمتلكون الرؤية والكفاءة والقدرة على القيادة",
      },
    ],
    maqasidTitle: "المقاصد الخمسة",
    maqasid: [
      { icon: "📖", label: "الدين" },
      { icon: "🫀", label: "النفس" },
      { icon: "🧠", label: "العقل" },
      { icon: "👨‍👩‍👦", label: "النسل" },
      { icon: "💰", label: "المال" },
    ],
    programTitle: "البرنامج التأهيلي",
    programStats: [
      { n: "25", label: "محتوى متخصصًا" },
      { n: "5", label: "مراحل متدرّجة" },
      { n: "5", label: "مستويات قياس" },
    ],
    measureTitle: "آلية القياس",
    measureText:
      "يُقاس كل مشارك من خلال 75 نموذج تقييم تغطي المحتويات الـ 25، بما يضمن قياس مستوى الأداء بدقة وإتاحة المقارنة بين النتائج.",
    students: "طالب",
    teachers: "معلم",
    classes: "فصل",
    loginBtn: "تسجيل الدخول",
    signupBtn: "إنشاء حساب",
    poweredBy: "مدعومة من",
    servicesTitle: "خدماتنا المتكاملة",
    services: [
      { icon: "🎓", name: "تدريب ودعم" },
      { icon: "📋", name: "عناصر المشروع" },
      { icon: "🌐", name: "البيئة بمكوناتها" },
      { icon: "🏆", name: "المنتج النهائي" },
    ],
    ctaTitle: "ابدأ رحلتك معنا",
    ctaSub: "انضم إلى أكاديمية الرواد وكن جزءًا من جيل يصنع المستقبل",
    chip75: "نموذج قياس",
    chip25: "محتوى",
  },
  sq: {
    dir: "ltr",
    tagline: "Gjenerata e Pionierëve",
    vision: "Fuqizimi i Njeriut .. Ndërtimi i së Ardhmes",
    missionTitle: "Misioni Ynë",
    missionText:
      "Ne synojmë të ndërtojmë një gjeneratë të cilësuar me vlera të larta morale, e cila kupton vlerën e punës bazuar në dije, duke u udhëhequr nga parimet islame si referencë vlerash.",
    goalsTitle: "Katër Qëllimet Tona",
    goals: [
      {
        icon: "⚖️",
        title: "Shkëlqimi Moral",
        text: "Ndërtimi i një gjenerate me vlera morale dhe kuptim të punës bazuar në dije",
      },
      {
        icon: "🎯",
        title: "Vizioni 2030",
        text: "Konsolidimi i rolit të gjeneratës brenda objektivave të Vizionit 2030",
      },
      {
        icon: "🔬",
        title: "Mësim Efektiv",
        text: "Transformimi nga mësimi pasiv në mësimin me zbulim dhe praktikë",
      },
      {
        icon: "👑",
        title: "Liderë të Ardhshëm",
        text: "Përgatitja e liderëve të kualifikuar me vizion, kompetencë dhe kapacitet",
      },
    ],
    maqasidTitle: "Pesë Objektivat",
    maqasid: [
      { icon: "📖", label: "Feja" },
      { icon: "🫀", label: "Shpirti" },
      { icon: "🧠", label: "Mendja" },
      { icon: "👨‍👩‍👦", label: "Pasardhësit" },
      { icon: "💰", label: "Pasuria" },
    ],
    programTitle: "Programi Kualifikues",
    programStats: [
      { n: "25", label: "Përmbajtje" },
      { n: "5", label: "Faza" },
      { n: "5", label: "Nivele" },
    ],
    measureTitle: "Mekanizmi i Matjes",
    measureText:
      "Çdo pjesëmarrës matet nëpërmjet 75 modeleve vlerësimi që mbulojnë 25 përmbajtjet, duke siguruar matje të saktë dhe krahasim të rezultateve.",
    students: "nxënës",
    teachers: "mësues",
    classes: "klasë",
    loginBtn: "Hyrje",
    signupBtn: "Regjistrohu",
    poweredBy: "E mundësuar nga",
    servicesTitle: "Shërbime të Integruara",
    services: [
      { icon: "🎓", name: "Trajnim dhe Mbështetje" },
      { icon: "📋", name: "Elementet e Projektit" },
      { icon: "🌐", name: "Mjedisi" },
      { icon: "🏆", name: "Produkti" },
    ],
    ctaTitle: "Filloni Udhëtimin Tuaj",
    ctaSub:
      "Bashkohuni me Akademinë Alrowad dhe bëhuni pjesë e gjeneratës që ndërton të ardhmen",
    chip75: "modele vlerësimi",
    chip25: "përmbajtje",
  },
};

/* ─── Decorative geometric SVG background ─── */
function GeoBg() {
  const angles = [0, 60, 120, 180, 240, 300];
  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1200 700"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="rg1" cx="70%" cy="30%">
          <stop offset="0%" stopColor="#C8A96A" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#C8A96A" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="rg2" cx="20%" cy="80%">
          <stop offset="0%" stopColor="#E5B93C" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#E5B93C" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="700" fill="url(#rg1)" />
      <rect width="1200" height="700" fill="url(#rg2)" />
      {angles.map((a, i) => (
        <line
          key={i}
          x1={600}
          y1={350}
          x2={600 + 700 * Math.cos((a * Math.PI) / 180)}
          y2={350 + 700 * Math.sin((a * Math.PI) / 180)}
          stroke="#C8A96A"
          strokeWidth="0.4"
          strokeOpacity="0.07"
        />
      ))}
      <circle
        cx="600"
        cy="350"
        r="200"
        fill="none"
        stroke="#C8A96A"
        strokeWidth="0.5"
        strokeOpacity="0.07"
      />
      <circle
        cx="600"
        cy="350"
        r="320"
        fill="none"
        stroke="#C8A96A"
        strokeWidth="0.5"
        strokeOpacity="0.05"
      />
      <circle
        cx="600"
        cy="350"
        r="450"
        fill="none"
        stroke="#C8A96A"
        strokeWidth="0.3"
        strokeOpacity="0.04"
      />
      <path
        d="M0,0 L80,0 M0,0 L0,80"
        stroke="#C8A96A"
        strokeWidth="1"
        strokeOpacity="0.15"
        fill="none"
      />
      <path
        d="M1200,700 L1120,700 M1200,700 L1200,620"
        stroke="#C8A96A"
        strokeWidth="1"
        strokeOpacity="0.15"
        fill="none"
      />
      <polygon
        points="600,290 614,304 600,318 586,304"
        fill="#C8A96A"
        fillOpacity="0.12"
      />
    </svg>
  );
}

/* ─── Logo Mark ─── */
function LogoMark({ size = 80 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
    >
      <rect
        width="80"
        height="80"
        rx="18"
        fill="rgba(200,169,106,0.1)"
        stroke="#C8A96A"
        strokeWidth="0.8"
        strokeOpacity="0.4"
      />
      <polygon
        points="40,10 68,24 68,56 40,70 12,56 12,24"
        fill="none"
        stroke="#C8A96A"
        strokeWidth="1"
        strokeOpacity="0.6"
      />
      <polygon
        points="40,20 58,29 58,51 40,60 22,51 22,29"
        fill="none"
        stroke="#E5B93C"
        strokeWidth="0.7"
        strokeOpacity="0.4"
      />
      <circle
        cx="40"
        cy="40"
        r="10"
        fill="none"
        stroke="#C8A96A"
        strokeWidth="1"
        strokeOpacity="0.7"
      />
      <circle cx="40" cy="40" r="4" fill="#E5B93C" fillOpacity="0.8" />
    </svg>
  );
}

/* ─── Gold divider ─── */
function GoldDivider({ centered = false }: { centered?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: centered ? "auto" : "100%",
        justifyContent: centered ? "center" : "flex-start",
      }}
    >
      <div
        style={{
          flex: centered ? "none" : 1,
          width: centered ? 60 : undefined,
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(200,169,106,0.5), transparent)",
        }}
      />
      <div
        style={{
          width: 6,
          height: 6,
          background: "#C8A96A",
          transform: "rotate(45deg)",
          opacity: 0.7,
          flexShrink: 0,
        }}
      />
      <div
        style={{
          flex: centered ? "none" : 1,
          width: centered ? 60 : undefined,
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(200,169,106,0.5), transparent)",
        }}
      />
    </div>
  );
}

/* ─── Section label ─── */
function SectionLabel({
  text,
  dark = false,
}: {
  text: string;
  dark?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        marginBottom: 52,
      }}
    >
      <GoldDivider centered />
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: dark ? "rgba(120,90,40,0.8)" : "#C8A96A",
          fontFamily: "'Cairo', sans-serif",
        }}
      >
        {text}
      </span>
      <GoldDivider centered />
    </div>
  );
}

/* ─── Main export ─── */
export default function SchoolLandingClient({ school }: { school: School }) {
  const initialLang: Lang = school.language === "sq" ? "sq" : "ar";
  const [lang, setLang] = useState<Lang>(initialLang);
  const T = STRINGS[lang];

  const statItems = [
    { n: school.student_count, l: T.students },
    { n: school.teacher_count, l: T.teachers },
    { n: school.class_count, l: T.classes },
  ];

  const chipItems: Array<{ n: string; l: string }> = [
    { n: "75", l: T.chip75 },
    { n: "25", l: T.chip25 },
  ];

  const measureDots = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{
          --gold:#C8A96A;--gold2:#E5B93C;--black:#08090A;--dark:#0F1012;
          --teal:#152F2D;--off-white:#F7F4EE;--cream:#EDE8DF;
          --text:#18140C;--text2:#4A3F2E;--text3:#8A7A5A;--border:#DDD5C4;
        }
        html{scroll-behavior:smooth;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes scaleIn{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}
        @keyframes shimmer{0%,100%{opacity:0.6}50%{opacity:1}}
        .fade-1{animation:fadeUp 0.7s 0.05s both ease;}
        .fade-2{animation:fadeUp 0.7s 0.18s both ease;}
        .fade-3{animation:fadeUp 0.7s 0.32s both ease;}
        .fade-4{animation:fadeUp 0.7s 0.48s both ease;}
        .scale-in{animation:scaleIn 0.9s 0.1s both ease;}
        .shimmer{animation:shimmer 3s infinite ease-in-out;}
        @media(max-width:900px){
          .goals-grid{grid-template-columns:1fr!important;}
          .services-grid{grid-template-columns:repeat(2,1fr)!important;}
          .measure-layout{flex-direction:column!important;gap:32px!important;}
          .measure-diagram{display:none!important;}
        }
        @media(max-width:600px){
          .services-grid{grid-template-columns:1fr 1fr!important;}
          .program-row{flex-direction:column!important;max-width:280px!important;}
        }
      `}</style>

      <div
        dir={T.dir}
        style={{
          fontFamily: "'Cairo', sans-serif",
          background: "var(--black)",
          color: "white",
          overflowX: "hidden",
        }}
      >
        {/* ── NAVBAR ── */}
        <nav
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            background: "rgba(8,9,10,0.92)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(200,169,106,0.1)",
            padding: "0 40px",
            height: 68,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <LogoMark size={40} />
            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: "var(--gold)",
                  lineHeight: 1.2,
                }}
              >
                {school.name}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(200,169,106,0.4)",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                }}
              >
                ACADEMY
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              dir="ltr"
              style={{
                display: "flex",
                background: "rgba(200,169,106,0.06)",
                border: "1px solid rgba(200,169,106,0.15)",
                borderRadius: 8,
                padding: 3,
                gap: 2,
              }}
            >
              {(["ar", "sq"] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 6,
                    border: "none",
                    background:
                      lang === l ? "rgba(200,169,106,0.2)" : "transparent",
                    color:
                      lang === l ? "var(--gold)" : "rgba(200,169,106,0.35)",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "'Cairo', sans-serif",
                    transition: "all 0.15s",
                  }}
                >
                  {l === "ar" ? "🇸🇦 AR" : "🇦🇱 SQ"}
                </button>
              ))}
            </div>
            <button
              style={{
                padding: "8px 20px",
                border: "1px solid rgba(200,169,106,0.25)",
                borderRadius: 8,
                background: "transparent",
                color: "var(--gold)",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Cairo', sans-serif",
              }}
            >
              {T.loginBtn}
            </button>
            <button
              style={{
                padding: "8px 20px",
                background: "var(--gold)",
                borderRadius: 8,
                border: "none",
                color: "var(--black)",
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
                fontFamily: "'Cairo', sans-serif",
              }}
            >
              {T.signupBtn}
            </button>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section
          style={{
            position: "relative",
            minHeight: "92vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            background: "var(--black)",
          }}
        >
          <GeoBg />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background:
                "linear-gradient(90deg, transparent, #C8A96A, transparent)",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "80px 40px 60px",
              maxWidth: 900,
              margin: "0 auto",
            }}
          >
            <div
              className="fade-1"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 40,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 1,
                  background: "rgba(200,169,106,0.4)",
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: "0.3em",
                  color: "rgba(200,169,106,0.6)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                بناء الأهلية
              </span>
              <div
                style={{
                  width: 40,
                  height: 1,
                  background: "rgba(200,169,106,0.4)",
                }}
              />
            </div>

            {/* Large logo */}
            <div
              className="scale-in"
              style={{ marginBottom: 44, position: "relative" }}
            >
              <div
                style={{
                  width: 180,
                  height: 180,
                  borderRadius: 32,
                  border: "1px solid rgba(200,169,106,0.2)",
                  background: "rgba(200,169,106,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <LogoMark size={120} />
                <div
                  className="shimmer"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(135deg, transparent 40%, rgba(200,169,106,0.08) 50%, transparent 60%)",
                  }}
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  inset: -12,
                  borderRadius: 44,
                  border: "1px solid rgba(200,169,106,0.1)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: -24,
                  borderRadius: 56,
                  border: "1px solid rgba(200,169,106,0.06)",
                }}
              />
            </div>

            <div className="fade-2" style={{ marginBottom: 16 }}>
              <h1
                style={{
                  fontSize: "clamp(38px, 6vw, 72px)",
                  fontWeight: 900,
                  color: "white",
                  letterSpacing: "-1px",
                  lineHeight: 1.05,
                }}
              >
                {school.name}
              </h1>
            </div>

            <div className="fade-2" style={{ width: 280, marginBottom: 20 }}>
              <GoldDivider />
            </div>

            <p
              className="fade-3"
              style={{
                fontSize: "clamp(15px, 2.2vw, 19px)",
                color: "rgba(200,169,106,0.65)",
                fontWeight: 500,
                marginBottom: 48,
                lineHeight: 1.8,
                maxWidth: 560,
              }}
            >
              {T.vision}
            </p>

            <div
              className="fade-3"
              style={{
                display: "flex",
                gap: 0,
                border: "1px solid rgba(200,169,106,0.14)",
                borderRadius: 16,
                overflow: "hidden",
                marginBottom: 48,
                background: "rgba(200,169,106,0.04)",
              }}
            >
              {statItems.map(({ n, l }, i) => (
                <div
                  key={i}
                  style={{
                    padding: "22px 40px",
                    borderRight:
                      i < 2 ? "1px solid rgba(200,169,106,0.12)" : "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 36,
                      fontWeight: 900,
                      color: "var(--gold)",
                      lineHeight: 1,
                    }}
                  >
                    {n}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "rgba(200,169,106,0.4)",
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {l}
                  </span>
                </div>
              ))}
            </div>

            <div
              className="fade-4"
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <button
                style={{
                  padding: "15px 40px",
                  border: "1px solid rgba(200,169,106,0.35)",
                  borderRadius: 12,
                  background: "transparent",
                  color: "var(--gold)",
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: "pointer",
                  fontFamily: "'Cairo', sans-serif",
                }}
              >
                {T.loginBtn}
              </button>
              <button
                style={{
                  padding: "15px 40px",
                  background: "var(--gold)",
                  borderRadius: 12,
                  border: "none",
                  color: "var(--black)",
                  fontSize: 15,
                  fontWeight: 900,
                  cursor: "pointer",
                  fontFamily: "'Cairo', sans-serif",
                  boxShadow: "0 8px 32px rgba(200,169,106,0.25)",
                }}
              >
                {T.signupBtn}
              </button>
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 80,
              background: "linear-gradient(transparent, var(--black))",
              pointerEvents: "none",
            }}
          />
        </section>

        {/* ── MISSION ── */}
        <section
          style={{ background: "var(--off-white)", padding: "100px 40px" }}
        >
          <div style={{ maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
            <SectionLabel text={T.missionTitle} dark />
            <p
              style={{
                fontSize: 18,
                color: "var(--text2)",
                lineHeight: 2,
                fontWeight: 400,
              }}
            >
              {T.missionText}
            </p>
            {school.description && (
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text3)",
                  lineHeight: 1.8,
                  maxWidth: 600,
                  margin: "24px auto 0",
                  padding: "16px 24px",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  background: "rgba(200,169,106,0.04)",
                }}
              >
                {school.description}
              </p>
            )}
          </div>
        </section>

        {/* ── GOALS ── */}
        <section
          style={{
            background: "var(--dark)",
            padding: "100px 40px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(rgba(200,169,106,0.04) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              pointerEvents: "none",
            }}
          />
          <div
            style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}
          >
            <SectionLabel text={T.goalsTitle} />
            <div
              className="goals-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 20,
              }}
            >
              {T.goals.map((g, i) => (
                <div
                  key={i}
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(200,169,106,0.12)",
                    borderRadius: 18,
                    padding: "36px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 20,
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: "rgba(200,169,106,0.08)",
                      border: "1px solid rgba(200,169,106,0.18)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      flexShrink: 0,
                    }}
                  >
                    {g.icon}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: "var(--gold)",
                        marginBottom: 8,
                      }}
                    >
                      {g.title}
                    </div>
                    <p
                      style={{
                        fontSize: 14,
                        color: "rgba(255,255,255,0.6)",
                        lineHeight: 1.75,
                        fontWeight: 400,
                      }}
                    >
                      {g.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MAQASID ── */}
        <section
          style={{
            background: "var(--teal)",
            padding: "90px 40px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(200,169,106,0.07) 0%, transparent 60%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              maxWidth: 900,
              margin: "0 auto",
              textAlign: "center",
              position: "relative",
            }}
          >
            <SectionLabel text={T.maqasidTitle} />
            <div
              style={{
                display: "flex",
                gap: 16,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {T.maqasid.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 12,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(200,169,106,0.18)",
                    borderRadius: 18,
                    padding: "32px 40px",
                    minWidth: 130,
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      background: "rgba(200,169,106,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 26,
                    }}
                  >
                    {m.icon}
                  </div>
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: "rgba(255,255,255,0.9)",
                    }}
                  >
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PROGRAM ── */}
        <section style={{ background: "var(--cream)", padding: "100px 40px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
            <SectionLabel text={T.programTitle} dark />
            <div
              className="program-row"
              style={{
                display: "flex",
                borderRadius: 20,
                overflow: "hidden",
                border: "1px solid var(--border)",
                background: "white",
                maxWidth: 680,
                margin: "0 auto",
              }}
            >
              {T.programStats.map(({ n, label }, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    padding: "52px 24px",
                    borderRight: i < 2 ? "1px solid var(--border)" : "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: 64,
                      fontWeight: 900,
                      color: "var(--teal)",
                      lineHeight: 1,
                    }}
                  >
                    {n}
                  </span>
                  <div
                    style={{
                      width: 40,
                      height: 2,
                      background:
                        "linear-gradient(90deg, var(--gold), var(--gold2))",
                      borderRadius: 2,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 14,
                      color: "var(--text3)",
                      fontWeight: 600,
                    }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MEASURE ── */}
        <section style={{ background: "var(--black)", padding: "100px 40px" }}>
          <div
            className="measure-layout"
            style={{
              maxWidth: 1100,
              margin: "0 auto",
              display: "flex",
              gap: 80,
              alignItems: "center",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <SectionLabel text={T.measureTitle} />
              <p
                style={{
                  fontSize: 16,
                  color: "rgba(255,255,255,0.6)",
                  lineHeight: 2,
                  marginBottom: 36,
                }}
              >
                {T.measureText}
              </p>
              <div style={{ display: "flex", gap: 16 }}>
                {chipItems.map(({ n, l }) => (
                  <div
                    key={n}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      background: "rgba(200,169,106,0.08)",
                      border: "1px solid rgba(200,169,106,0.2)",
                      borderRadius: 14,
                      padding: "20px 28px",
                      minWidth: 100,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 36,
                        fontWeight: 900,
                        color: "var(--gold)",
                        lineHeight: 1,
                      }}
                    >
                      {n}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "rgba(200,169,106,0.5)",
                        fontWeight: 600,
                        textAlign: "center",
                      }}
                    >
                      {l}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="measure-diagram"
              style={{ flexShrink: 0, width: 240, height: 240 }}
            >
              <svg
                viewBox="0 0 240 240"
                width="240"
                height="240"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="120"
                  cy="120"
                  r="110"
                  stroke="#C8A96A"
                  strokeWidth="0.5"
                  strokeOpacity="0.15"
                />
                <circle
                  cx="120"
                  cy="120"
                  r="88"
                  stroke="#E5B93C"
                  strokeWidth="0.5"
                  strokeOpacity="0.2"
                  strokeDasharray="4 6"
                />
                <circle
                  cx="120"
                  cy="120"
                  r="64"
                  stroke="#C8A96A"
                  strokeWidth="0.8"
                  strokeOpacity="0.25"
                />
                <circle
                  cx="120"
                  cy="120"
                  r="40"
                  stroke="#E5B93C"
                  strokeWidth="0.8"
                  strokeOpacity="0.35"
                  strokeDasharray="3 4"
                />
                {measureDots.map((deg, i) => {
                  const r = 88;
                  const x = 120 + r * Math.cos((deg * Math.PI) / 180);
                  const y = 120 + r * Math.sin((deg * Math.PI) / 180);
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="5"
                      fill="#C8A96A"
                      fillOpacity="0.4"
                    />
                  );
                })}
                <circle
                  cx="120"
                  cy="120"
                  r="16"
                  fill="#C8A96A"
                  fillOpacity="0.15"
                />
                <circle
                  cx="120"
                  cy="120"
                  r="8"
                  fill="#E5B93C"
                  fillOpacity="0.6"
                />
                <text
                  x="120"
                  y="126"
                  textAnchor="middle"
                  fill="#C8A96A"
                  fontSize="10"
                  fontFamily="Cairo"
                  fontWeight="700"
                  fillOpacity="0.8"
                >
                  75
                </text>
              </svg>
            </div>
          </div>
        </section>

        {/* ── SERVICES ── */}
        <section
          style={{ background: "var(--off-white)", padding: "100px 40px" }}
        >
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <SectionLabel text={T.servicesTitle} dark />
            <div
              className="services-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 20,
              }}
            >
              {T.services.map((s, i) => (
                <div
                  key={i}
                  style={{
                    background: "white",
                    border: "1px solid var(--border)",
                    borderRadius: 18,
                    padding: "40px 24px",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 14,
                    boxShadow: "0 2px 12px rgba(11,11,12,0.06)",
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 18,
                      background:
                        "linear-gradient(135deg, rgba(200,169,106,0.1), rgba(229,185,60,0.05))",
                      border: "1px solid rgba(200,169,106,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 28,
                    }}
                  >
                    {s.icon}
                  </div>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "var(--teal)",
                      color: "var(--gold)",
                      fontSize: 12,
                      fontWeight: 900,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {i + 1}
                  </div>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--text)",
                      lineHeight: 1.5,
                    }}
                  >
                    {s.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FOOTER ── */}
        <section
          style={{
            background: "var(--dark)",
            padding: "120px 40px",
            position: "relative",
            overflow: "hidden",
            textAlign: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 50% 50%, rgba(200,169,106,0.06) 0%, transparent 65%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 1,
              background:
                "linear-gradient(90deg, transparent, rgba(200,169,106,0.3), transparent)",
            }}
          />
          <div
            style={{ maxWidth: 700, margin: "0 auto", position: "relative" }}
          >
            <div style={{ marginBottom: 28 }}>
              <LogoMark size={72} />
            </div>
            <h2
              style={{
                fontSize: "clamp(28px, 5vw, 48px)",
                fontWeight: 900,
                color: "var(--gold)",
                marginBottom: 16,
                lineHeight: 1.2,
              }}
            >
              {T.ctaTitle}
            </h2>
            <p
              style={{
                fontSize: 16,
                color: "rgba(200,169,106,0.45)",
                marginBottom: 44,
                lineHeight: 1.8,
              }}
            >
              {T.ctaSub}
            </p>
            <div
              style={{
                display: "flex",
                gap: 14,
                justifyContent: "center",
                flexWrap: "wrap",
                marginBottom: 48,
              }}
            >
              <button
                style={{
                  padding: "16px 44px",
                  border: "1px solid rgba(200,169,106,0.35)",
                  borderRadius: 12,
                  background: "transparent",
                  color: "var(--gold)",
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: "pointer",
                  fontFamily: "'Cairo', sans-serif",
                }}
              >
                {T.loginBtn}
              </button>
              <button
                style={{
                  padding: "16px 44px",
                  background: "var(--gold)",
                  borderRadius: 12,
                  border: "none",
                  color: "var(--black)",
                  fontSize: 15,
                  fontWeight: 900,
                  cursor: "pointer",
                  fontFamily: "'Cairo', sans-serif",
                  boxShadow: "0 8px 32px rgba(200,169,106,0.25)",
                }}
              >
                {T.signupBtn}
              </button>
            </div>
            <div
              style={{
                borderTop: "1px solid rgba(200,169,106,0.08)",
                paddingTop: 28,
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: "rgba(200,169,106,0.2)",
                  fontWeight: 500,
                }}
              >
                {T.poweredBy}{" "}
                <span
                  style={{ color: "rgba(200,169,106,0.5)", fontWeight: 700 }}
                >
                  بناء الأهلية
                </span>
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
