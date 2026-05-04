"use client";
import { useLang } from "@/lib/language-context";
import type { Lang } from "@/lib/language-context";

const LANG_LABELS: Record<string, string> = {
  ar: "عربي",
  sq: "Shqip",
  en: "EN",
};

interface Props {
  dark?: boolean;
  secondaryLang?: string;
}

export default function LangToggle({ dark, secondaryLang = "sq" }: Props) {
  const { lang, setLang } = useLang();

  const options: Lang[] = ["ar", secondaryLang as Lang];

  return (
    <div className={`lt-wrap ${dark ? "dark" : ""}`}>
      {options.map((l) => (
        <button
          key={l}
          className={`lt-btn ${lang === l ? "active" : ""}`}
          onClick={() => setLang(l)}
        >
          {LANG_LABELS[l] ?? l}
        </button>
      ))}
      <style>{css}</style>
    </div>
  );
}

const css = `
  .lt-wrap {
    display: inline-flex;
    align-items: center;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(200,169,106,0.15);
    border-radius: 99px;
    padding: 3px;
    gap: 2px;
  }
  .lt-btn {
    padding: 5px 13px;
    border-radius: 99px;
    border: none;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Cairo', sans-serif;
    background: transparent;
    color: rgba(200,169,106,0.4);
  }
  .lt-btn.active {
    background: #C8A96A;
    color: #0B0B0C;
  }
  .lt-wrap.dark .lt-btn { color: rgba(200,169,106,0.4); }
  .lt-wrap:not(.dark) .lt-btn { color: #8A7A5A; }
  .lt-wrap:not(.dark) .lt-btn.active { background: #C8A96A; color: #0B0B0C; }
`;
