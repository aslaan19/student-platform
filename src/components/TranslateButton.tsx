"use client";

export default function TranslateButton() {
  function handleClick() {
    const current =
      "https://rowadplatform.vercel.app" +
      window.location.pathname +
      window.location.search;
    const url =
      "https://translate.google.com/translate?sl=ar&tl=sq&u=" +
      encodeURIComponent(current);
    window.open(url, "_blank");
  }

  return (
    <button
      onClick={handleClick}
      style={{
        position: "fixed",
        bottom: "24px",
        left: "24px",
        zIndex: 9999,
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "99px",
        padding: "9px 18px",
        fontSize: "13px",
        fontWeight: 600,
        color: "#374151",
        cursor: "pointer",
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        fontFamily: "Tajawal, sans-serif",
      }}
    >
      🌐 Shqip
    </button>
  );
}
