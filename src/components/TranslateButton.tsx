"use client";

import { useEffect, useState } from "react";

export default function TranslateButton() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Inject Google Translate script silently
    if ((window as any).googleTranslateLoaded) return;
    (window as any).googleTranslateLoaded = true;

    (window as any).googleTranslateElementInit = function () {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "ar",
          includedLanguages: "sq",
          autoDisplay: false,
        },
        "gt-hidden-container",
      );
    };

    const script = document.createElement("script");
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  function activateAlbanian() {
    // Click the hidden Google Translate select to trigger sq translation
    const tryTranslate = (attempts = 0) => {
      const select = document.querySelector(
        ".goog-te-combo",
      ) as HTMLSelectElement;
      if (select) {
        select.value = "sq";
        select.dispatchEvent(new Event("change"));
        setActive(true);
      } else if (attempts < 20) {
        setTimeout(() => tryTranslate(attempts + 1), 200);
      }
    };
    tryTranslate();
  }

  function deactivate() {
    const select = document.querySelector(
      ".goog-te-combo",
    ) as HTMLSelectElement;
    if (select) {
      select.value = "ar";
      select.dispatchEvent(new Event("change"));
    }
    // Google Translate adds a cookie — clearing it resets
    document.cookie =
      "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" +
      window.location.hostname;
    setActive(false);
    window.location.reload();
  }

  return (
    <>
      {/* Hidden Google Translate mount point */}
      <div
        id="gt-hidden-container"
        style={{
          position: "absolute",
          top: -9999,
          left: -9999,
          visibility: "hidden",
        }}
      />

      {/* Our custom beautiful button */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          left: "24px",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: active ? "#111827" : "white",
          border: `1.5px solid ${active ? "#374151" : "#e5e7eb"}`,
          borderRadius: "99px",
          padding: "8px 6px 8px 14px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
          fontFamily: "Tajawal, sans-serif",
          transition: "all 0.2s",
        }}
      >
        {/* Language pills */}
        <button
          onClick={active ? deactivate : undefined}
          style={{
            background: active ? "transparent" : "#f1f3f6",
            border: "none",
            borderRadius: "99px",
            padding: "5px 12px",
            fontSize: "12.5px",
            fontWeight: 700,
            color: active ? "rgba(255,255,255,0.4)" : "#111827",
            cursor: active ? "pointer" : "default",
            transition: "all 0.2s",
            fontFamily: "Tajawal, sans-serif",
          }}
        >
          عربي
        </button>

        <button
          onClick={active ? undefined : activateAlbanian}
          style={{
            background: active ? "white" : "transparent",
            border: "none",
            borderRadius: "99px",
            padding: "5px 12px",
            fontSize: "12.5px",
            fontWeight: 700,
            color: active ? "#111827" : "#9ca3af",
            cursor: active ? "default" : "pointer",
            transition: "all 0.2s",
            fontFamily: "Tajawal, sans-serif",
          }}
        >
          Shqip
        </button>

        {/* Globe icon */}
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: active ? "rgba(255,255,255,0.1)" : "#f1f3f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            width="14"
            height="14"
            fill="none"
            viewBox="0 0 24 24"
            stroke={active ? "rgba(255,255,255,0.5)" : "#6b7280"}
            strokeWidth={2}
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
          </svg>
        </div>
      </div>
    </>
  );
}
