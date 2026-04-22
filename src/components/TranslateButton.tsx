"use client";

export default function TranslateButton() {
  function openAlbanian() {
    const path = window.location.pathname + window.location.search;
    window.open(
      `https://rowadplatform-vercel-app.translate.goog${path}?_x_tr_sl=ar&_x_tr_tl=sq&_x_tr_hl=sq&_x_tr_pto=wapp`,
      "_blank",
    );
  }

  return (
    <button
      onClick={openAlbanian}
      style={{
        position: "fixed",
        bottom: "24px",
        left: "24px",
        zIndex: 9999,
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        background: "#0a0f1e",
        border: "1.5px solid rgba(201,168,76,0.4)",
        borderRadius: "99px",
        padding: "10px 20px",
        fontSize: "13px",
        fontWeight: 700,
        color: "#c9a84c",
        cursor: "pointer",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        fontFamily: "Tajawal, sans-serif",
      }}
    >
      🌐 Shqip
    </button>
  );
}
