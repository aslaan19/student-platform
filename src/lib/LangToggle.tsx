"use client";

import { useLang } from "@/lib/language-context";

export default function LangToggle({ dark = false }: { dark?: boolean }) {
  const { lang, setLang } = useLang();

  const activeStyle = dark
    ? {
        background: "white",
        color: "#111827",
        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
      }
    : {
        background: "#111827",
        color: "white",
        boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
      };

  const inactiveStyle = dark
    ? { background: "transparent", color: "rgba(255,255,255,0.45)" }
    : { background: "transparent", color: "#6b7280" };

  const containerStyle = dark
    ? {
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.12)",
      }
    : {
        background: "white",
        border: "1.5px solid #e5e7eb",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      };

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: "99px",
        padding: "3px",
        gap: "2px",
        width: "100%",
        justifyContent: "center",
        ...containerStyle,
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
          ...(lang === "ar" ? activeStyle : inactiveStyle),
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
          ...(lang === "sq" ? activeStyle : inactiveStyle),
        }}
      >
        Shqip
      </button>
    </div>
  );
}
