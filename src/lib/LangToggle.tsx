"use client";

import { useLang } from "@/lib/language-context";

export default function LangToggle() {
  const { lang, setLang } = useLang();

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "99px",
        padding: "3px",
        gap: "2px",
        width: "100%",
        justifyContent: "center",
      }}
    >
      <button
        onClick={() => setLang("ar")}
        style={{
          flex: 1,
          padding: "6px 14px",
          borderRadius: "99px",
          border: "none",
          fontSize: "12.5px",
          fontWeight: 700,
          cursor: "pointer",
          transition: "all 0.2s",
          fontFamily: "Tajawal, sans-serif",
          background: lang === "ar" ? "white" : "transparent",
          color: lang === "ar" ? "#111827" : "rgba(255,255,255,0.45)",
          boxShadow: lang === "ar" ? "0 1px 4px rgba(0,0,0,0.15)" : "none",
        }}
      >
        عربي
      </button>
      <button
        onClick={() => setLang("sq")}
        style={{
          flex: 1,
          padding: "6px 14px",
          borderRadius: "99px",
          border: "none",
          fontSize: "12.5px",
          fontWeight: 700,
          cursor: "pointer",
          transition: "all 0.2s",
          fontFamily: "Tajawal, sans-serif",
          background: lang === "sq" ? "white" : "transparent",
          color: lang === "sq" ? "#111827" : "rgba(255,255,255,0.45)",
          boxShadow: lang === "sq" ? "0 1px 4px rgba(0,0,0,0.15)" : "none",
        }}
      >
        Shqip
      </button>
    </div>
  );
}
