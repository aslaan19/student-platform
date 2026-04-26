/* eslint-disable react-hooks/purity */
"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";

interface Option {
  id: string;
  text: string;
}
interface Question {
  id: string;
  type: "MCQ" | "TF";
  text: string;
  options: Option[];
}
interface ModuleData {
  id: string;
  title: string;
  order: number;
  question_count: number;
  questions: Question[];
  passed: boolean;
  best_score: number | null;
  latest_score: number | null;
  latest_total: number | null;
  latest_passed: boolean | null;
  attempt_count: number;
}
interface Stage {
  id: string;
  title: string;
  order: number;
  locked: boolean;
  passed: boolean;
  modules: ModuleData[];
}
interface Roadmap {
  id: string;
  title: string;
  stages: Stage[];
}
type Screen = "map" | "modules" | "quiz" | "result";
type QuizResult = {
  score: number;
  total: number;
  passed: boolean;
  correct: number;
};

// Quiz Player Component
function QuizPlayer({
  mod,
  onDone,
}: {
  mod: ModuleData;
  onDone: (r: QuizResult) => void;
}) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedAnim, setSelectedAnim] = useState<string | null>(null);

  const q = mod.questions[current];
  const answered = Object.keys(answers).length;
  const total = mod.questions.length;

  const submit = async () => {
    if (answered < total) {
      setError("أجب على جميع الأسئلة أولاً");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const payload = Object.entries(answers).map(([question_id, answer]) => ({
        question_id,
        answer,
      }));
      const res = await fetch(
        `/api/student/roadmap/modules/${mod.id}/attempt`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: payload }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "فشل التسليم");
      onDone(data.attempt);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ");
      setSubmitting(false);
    }
  };

  const tfDisplayToApi = (v: string) => (v === "صح" ? "true" : "false");
  const getDisplayOptions = () =>
    q.type === "MCQ" ? q.options.map((o) => o.text) : ["صح", "خطأ"];

  const handleSelect = (opt: string) => {
    const val = q.type === "TF" ? tfDisplayToApi(opt) : opt;
    setAnswers((p) => ({ ...p, [q.id]: val }));
    setSelectedAnim(opt);
    setTimeout(() => setSelectedAnim(null), 300);
  };

  const isSelected = (opt: string) => {
    const val = q.type === "TF" ? tfDisplayToApi(opt) : opt;
    return answers[q.id] === val;
  };

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div className="quiz-progress-bar">
          <div
            className="quiz-progress-fill"
            style={{ width: `${((current + 1) / total) * 100}%` }}
          />
        </div>
        <div className="quiz-progress-text">
          <span className="progress-current">السؤال {current + 1}</span>
          <span className="progress-divider">/</span>
          <span className="progress-total">{total}</span>
        </div>
      </div>

      <div className="question-card" key={q.id}>
        <div className="question-badge">
          {q.type === "MCQ" ? (
            <span className="badge-mcq">اختيار من متعدد</span>
          ) : (
            <span className="badge-tf">صح / خطأ</span>
          )}
        </div>

        <h2 className="question-text" dir="rtl">
          {q.text}
        </h2>

        <div className="options-grid">
          {getDisplayOptions().map((opt, i) => (
            <button
              key={opt}
              className={`option-card ${isSelected(opt) ? "selected" : ""} ${selectedAnim === opt ? "pop" : ""}`}
              onClick={() => handleSelect(opt)}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <span className="option-indicator">
                {isSelected(opt) ? (
                  <svg viewBox="0 0 24 24" className="check-icon">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  <span className="option-letter">
                    {String.fromCharCode(65 + i)}
                  </span>
                )}
              </span>
              <span className="option-text" dir="rtl">
                {opt}
              </span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="quiz-error">
          <svg viewBox="0 0 24 24" className="error-icon">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="quiz-navigation">
        <button
          className="nav-button prev"
          onClick={() => setCurrent((c) => c - 1)}
          disabled={current === 0}
        >
          <svg viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span>السابق</span>
        </button>

        {current < total - 1 ? (
          <button
            className="nav-button next"
            onClick={() => setCurrent((c) => c + 1)}
            disabled={!answers[q.id]}
          >
            <span>التالي</span>
            <svg viewBox="0 0 24 24">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        ) : (
          <button
            className="nav-button submit"
            onClick={submit}
            disabled={answered < total || submitting}
          >
            {submitting ? (
              <span className="submit-loading">جارٍ التسليم...</span>
            ) : (
              <>
                <span>تسليم</span>
                <span className="submit-count">
                  {answered}/{total}
                </span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="question-dots">
        {mod.questions.map((qq, i) => (
          <button
            key={qq.id}
            className={`q-dot ${i === current ? "current" : ""} ${answers[qq.id] ? "answered" : ""}`}
            onClick={() => setCurrent(i)}
          >
            <span className="dot-number">{i + 1}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Result Screen Component
function ResultScreen({
  result,
  onRetake,
  onBack,
}: {
  result: QuizResult;
  onRetake: () => void;
  onBack: () => void;
}) {
  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (circleRef.current) {
      const circumference = 2 * Math.PI * 90;
      const offset = circumference - (result.score / 100) * circumference;
      circleRef.current.style.strokeDashoffset = String(offset);
    }
  }, [result.score]);

  return (
    <div className="result-container">
      {result.passed && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: ["#16a34a", "#22c55e", "#86efac", "#166534"][
                  Math.floor(Math.random() * 4)
                ],
              }}
            />
          ))}
        </div>
      )}

      <div
        className={`score-circle-container ${result.passed ? "passed" : "failed"}`}
      >
        <svg viewBox="0 0 200 200" className="score-circle-svg">
          <circle cx="100" cy="100" r="90" className="score-bg" />
          <circle
            ref={circleRef}
            cx="100"
            cy="100"
            r="90"
            className="score-fill"
            strokeDasharray={`${2 * Math.PI * 90}`}
            strokeDashoffset={`${2 * Math.PI * 90}`}
          />
        </svg>
        <div className="score-content">
          <span className="score-value">{result.score}%</span>
        </div>
      </div>

      <div className="result-message">
        <h2 className={`result-title ${result.passed ? "passed" : "failed"}`}>
          {result.passed ? "أحسنت! نجحت" : "حاول مرة أخرى"}
        </h2>
        <p className="result-detail">
          {result.correct} من {result.total} إجابة صحيحة
        </p>
      </div>

      <div className="result-progress">
        <div className="result-progress-bg">
          <div
            className={`result-progress-fill ${result.passed ? "passed" : "failed"}`}
            style={{ width: `${result.score}%` }}
          />
        </div>
        <div className="result-threshold">
          <span className="threshold-line" />
          <span className="threshold-label">70%</span>
        </div>
      </div>

      <div className="result-actions">
        {!result.passed && (
          <button className="action-button primary" onClick={onRetake}>
            <svg viewBox="0 0 24 24">
              <path d="M1 4v6h6M23 20v-6h-6" />
              <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
            </svg>
            <span>إعادة المحاولة</span>
          </button>
        )}
        <button className="action-button secondary" onClick={onBack}>
          <svg viewBox="0 0 24 24">
            <path d="M3 12h18M3 12l6 6M3 12l6-6" />
          </svg>
          <span>العودة للخارطة</span>
        </button>
      </div>
    </div>
  );
}

// Modules List Component
function ModulesList({
  stage,
  onStart,
  onBack,
}: {
  stage: Stage;
  onStart: (m: ModuleData) => void;
  onBack: () => void;
}) {
  return (
    <div className="modules-container">
      <button className="back-button" onClick={onBack}>
        <svg viewBox="0 0 24 24">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span>العودة للخارطة</span>
      </button>

      <div className="modules-header">
        <div className="stage-badge">
          <span className="badge-text">المرحلة {stage.order}</span>
        </div>
        <h1 className="modules-title" dir="rtl">
          {stage.title}
        </h1>
        <p className="modules-subtitle" dir="rtl">
          {stage.modules.filter((m) => m.passed).length} من{" "}
          {stage.modules.length} وحدات مكتملة
        </p>
      </div>

      <div className="modules-grid">
        {stage.modules.map((mod, idx) => {
          const prevPassed = idx === 0 || stage.modules[idx - 1].passed;
          const locked = !prevPassed;

          return (
            <div
              key={mod.id}
              className={`module-card ${locked ? "locked" : ""} ${mod.passed ? "completed" : ""}`}
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              <div className="module-status-icon">
                {mod.passed ? (
                  <div className="status-completed">
                    <svg viewBox="0 0 24 24">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                ) : locked ? (
                  <div className="status-locked">
                    <svg viewBox="0 0 24 24">
                      <rect x="5" y="11" width="14" height="10" rx="2" />
                      <path
                        d="M8 11V7a4 4 0 118 0v4"
                        fill="none"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                ) : (
                  <div className="status-available">
                    <span>{idx + 1}</span>
                  </div>
                )}
              </div>

              <div className="module-content">
                <h3 className="module-title" dir="rtl">
                  {mod.title}
                </h3>
                <div className="module-meta">
                  <span className="meta-item">
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    {mod.question_count} سؤال
                  </span>
                  {mod.best_score !== null && (
                    <span className="meta-item score">
                      <svg viewBox="0 0 24 24">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                      </svg>
                      {mod.best_score}%
                    </span>
                  )}
                  {mod.attempt_count > 0 && !mod.passed && (
                    <span className="meta-item attempts">
                      {mod.attempt_count} محاولة
                    </span>
                  )}
                </div>
              </div>

              {!locked && (
                <button
                  className={`module-action ${mod.passed ? "retry" : "start"}`}
                  onClick={() => onStart(mod)}
                >
                  {mod.passed ? (
                    <>
                      <svg viewBox="0 0 24 24">
                        <path d="M1 4v6h6M23 20v-6h-6" />
                        <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
                      </svg>
                      <span>إعادة</span>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24">
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                      <span>ابدأ</span>
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Main Roadmap View with Connected Path
function RoadmapView({
  roadmap,
  onSelect,
}: {
  roadmap: Roadmap;
  onSelect: (s: Stage) => void;
}) {
  const completedStages = roadmap.stages.filter((s) => s.passed).length;
  const totalStages = roadmap.stages.length;
  const overallProgress =
    totalStages > 0 ? (completedStages / totalStages) * 100 : 0;

  return (
    <div className="roadmap-container">
      {/* Header */}
      <div className="roadmap-header">
        <div className="header-badge">
          <span className="badge-label">خريطة التعلم</span>
        </div>
        <h1 className="roadmap-title" dir="rtl">
          {roadmap.title}
        </h1>

        <div className="overall-progress">
          <div className="progress-info">
            <span className="progress-label">التقدم الكلي</span>
            <span className="progress-value">
              {Math.round(overallProgress)}%
            </span>
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <p className="progress-detail">
            {completedStages} من {totalStages} مراحل مكتملة
          </p>
        </div>
      </div>

      {/* Game Map with Connected Path */}
      <div className="game-map">
        {/* The continuous winding path SVG */}
        <svg
          className="path-svg"
          viewBox="0 0 400 800"
          preserveAspectRatio="xMidYMin meet"
        >
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
            <filter id="pathGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background path (always visible) */}
          <path
            d={generatePath(totalStages)}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="path-bg"
          />

          {/* Progress path (filled based on completion) */}
          <path
            d={generatePath(totalStages)}
            fill="none"
            stroke="url(#pathGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="2000"
            strokeDashoffset={2000 - (overallProgress / 100) * 2000}
            className="path-progress"
            filter="url(#pathGlow)"
          />

          {/* Dotted pattern on background path */}
          <path
            d={generatePath(totalStages)}
            fill="none"
            stroke="#d1d5db"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="0 20"
            className="path-dots"
          />
        </svg>

        {/* Start Point */}
        <div className="map-start" style={{ top: "20px" }}>
          <div className="start-node">
            <div className="start-pulse"></div>
            <div className="start-circle">
              <svg viewBox="0 0 24 24" className="start-icon">
                <path d="M4.5 16.5L12 4l7.5 12.5H4.5z" fill="currentColor" />
                <path
                  d="M12 4v16M12 20l-3-3M12 20l3-3"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
          </div>
          <span className="start-label">ابدأ رحلتك</span>
        </div>

        {/* Stage Nodes */}
        {roadmap.stages.map((stage, idx) => {
          const position = getNodePosition(idx, totalStages);
          const progress =
            stage.modules.length > 0
              ? (stage.modules.filter((m) => m.passed).length /
                  stage.modules.length) *
                100
              : 0;

          return (
            <div
              key={stage.id}
              className={`stage-node ${stage.passed ? "completed" : stage.locked ? "locked" : "active"}`}
              style={{
                top: position.top,
                left: position.left,
                right: position.right,
              }}
            >
              <button
                className="stage-button"
                onClick={() => !stage.locked && onSelect(stage)}
                disabled={stage.locked}
              >
                {/* Stage circle with number/icon */}
                <div className="stage-circle">
                  {!stage.locked && !stage.passed && (
                    <svg className="progress-ring" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" className="ring-bg" />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        className="ring-fill"
                        strokeDasharray={`${progress * 2.83} 283`}
                      />
                    </svg>
                  )}
                  <div className="circle-inner">
                    {stage.passed ? (
                      <svg viewBox="0 0 24 24" className="stage-icon check">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : stage.locked ? (
                      <svg viewBox="0 0 24 24" className="stage-icon lock">
                        <rect x="5" y="11" width="14" height="10" rx="2" />
                        <path d="M8 11V7a4 4 0 118 0v4" />
                      </svg>
                    ) : (
                      <span className="stage-number">{stage.order}</span>
                    )}
                  </div>
                  {stage.passed && <div className="completed-glow"></div>}
                </div>

                {/* Stage info card */}
                <div className="stage-info">
                  <h3 className="stage-title" dir="rtl">
                    {stage.title}
                  </h3>
                  <div className="stage-meta">
                    {stage.passed ? (
                      <span className="meta-completed">مكتملة</span>
                    ) : stage.locked ? (
                      <span className="meta-locked">مقفلة</span>
                    ) : (
                      <span className="meta-progress">
                        {stage.modules.filter((m) => m.passed).length}/
                        {stage.modules.length}
                      </span>
                    )}
                  </div>
                  {!stage.locked && stage.modules.length > 0 && (
                    <div className="stage-dots">
                      {stage.modules.map((m) => (
                        <span
                          key={m.id}
                          className={`dot ${m.passed ? "filled" : ""}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Arrow */}
                {!stage.locked && (
                  <div className="stage-arrow">
                    <svg viewBox="0 0 24 24">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                )}
              </button>

              {/* Stars for completed */}
              {stage.passed && (
                <div className="stage-stars">
                  <span className="star s1">&#9733;</span>
                  <span className="star s2">&#9733;</span>
                  <span className="star s3">&#9733;</span>
                </div>
              )}
            </div>
          );
        })}

        {/* End Point (Trophy) */}
        <div
          className={`map-end ${completedStages === totalStages ? "achieved" : ""}`}
          style={{ top: `${100 + totalStages * 160}px` }}
        >
          <div className="end-node">
            <div className="end-glow"></div>
            <div className="end-circle">
              <svg viewBox="0 0 24 24" className="end-icon">
                <path d="M6 9H4a2 2 0 01-2-2V5a2 2 0 012-2h2M18 9h2a2 2 0 002-2V5a2 2 0 00-2-2h-2" />
                <path d="M4 5h16v4a6 6 0 01-6 6h-4a6 6 0 01-6-6V5z" />
                <path d="M12 15v4M8 19h8" />
              </svg>
            </div>
          </div>
          <span className="end-label">
            {completedStages === totalStages
              ? "مبروك! أكملت الرحلة"
              : "الهدف النهائي"}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-dot completed" />
          <span>مكتملة</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot active" />
          <span>متاحة</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot locked" />
          <span>مقفلة</span>
        </div>
      </div>
    </div>
  );
}

// Generate the winding path SVG
function generatePath(stageCount: number): string {
  const startY = 60;
  const stageSpacing = 160;
  const curveWidth = 120;

  let path = `M 200 ${startY}`; // Start at top center

  for (let i = 0; i < stageCount; i++) {
    const y1 = startY + i * stageSpacing + 40;
    const y2 = startY + (i + 1) * stageSpacing;
    const isLeft = i % 2 === 0;
    const cpX = isLeft ? 200 - curveWidth : 200 + curveWidth;

    // Curve to next point
    path += ` Q ${cpX} ${y1 + stageSpacing / 2}, ${200 + (isLeft ? -60 : 60)} ${y2}`;

    if (i < stageCount - 1) {
      // Connect back toward center for next curve
      const nextIsLeft = (i + 1) % 2 === 0;
      const midY = y2 + 40;
      path += ` Q 200 ${midY}, ${200 + (nextIsLeft ? -60 : 60)} ${y2 + 80}`;
    }
  }

  // Final stretch to trophy
  const finalY = startY + stageCount * stageSpacing + 60;
  path += ` L 200 ${finalY}`;

  return path;
}

// Get position for each stage node
function getNodePosition(
  index: number,
  total: number,
): { top: string; left?: string; right?: string } {
  const startY = 100;
  const spacing = 160;
  const isLeft = index % 2 === 0;

  return {
    top: `${startY + index * spacing}px`,
    ...(isLeft ? { left: "10px" } : { right: "10px" }),
  };
}

// Main Page Component
export default function StudentRoadmapPage() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<Screen>("map");
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [selectedModule, setSelectedModule] = useState<ModuleData | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const load = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch("/api/student/roadmap");
      const data = await res.json();
      setRoadmap(data.roadmap ?? null);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    void load(true);
  }, []);

  const handleDone = async (result: QuizResult) => {
    setQuizResult(result);
    setScreen("result");
    const res = await fetch("/api/student/roadmap");
    const data = await res.json();
    const freshRoadmap = data.roadmap ?? null;
    setRoadmap(freshRoadmap);
    if (selectedStage && freshRoadmap) {
      const fresh = freshRoadmap.stages.find(
        (s: Stage) => s.id === selectedStage.id,
      );
      if (fresh) setSelectedStage(fresh);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner">
            <div className="spinner-ring" />
            <div className="spinner-ring r2" />
            <div className="spinner-ring r3" />
          </div>
          <p className="loading-text">جارٍ تحميل خريطتك...</p>
        </div>
        <style>{css}</style>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="empty-screen">
        <div className="empty-content">
          <div className="empty-icon-wrap">
            <svg viewBox="0 0 24 24" className="empty-icon">
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <h2 className="empty-title">لا توجد خريطة بعد</h2>
          <p className="empty-desc">لا يوجد بنك أسئلة لمدرستك حتى الآن</p>
        </div>
        <style>{css}</style>
      </div>
    );
  }

  return (
    <div className="game-page">
      {screen === "map" && (
        <RoadmapView
          roadmap={roadmap}
          onSelect={(s) => {
            setSelectedStage(s);
            setScreen("modules");
          }}
        />
      )}

      {screen === "modules" && selectedStage && (
        <ModulesList
          stage={selectedStage}
          onStart={(m) => {
            setSelectedModule(m);
            setQuizResult(null);
            setScreen("quiz");
          }}
          onBack={() => setScreen("map")}
        />
      )}

      {screen === "quiz" && selectedModule && (
        <div className="quiz-screen">
          <div className="quiz-top-bar">
            <button
              className="back-button small"
              onClick={() => setScreen("modules")}
            >
              <svg viewBox="0 0 24 24">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>رجوع</span>
            </button>
            <h2 className="quiz-module-title" dir="rtl">
              {selectedModule.title}
            </h2>
          </div>
          <QuizPlayer mod={selectedModule} onDone={handleDone} />
        </div>
      )}

      {screen === "result" && quizResult && (
        <ResultScreen
          result={quizResult}
          onRetake={() => {
            setQuizResult(null);
            setScreen("quiz");
          }}
          onBack={() => {
            const fresh =
              roadmap.stages.find((s) => s.id === selectedStage?.id) ??
              selectedStage;
            setSelectedStage(fresh ?? null);
            setScreen("modules");
          }}
        />
      )}

      <style>{css}</style>
    </div>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap');
  
  *, *::before, *::after { 
    box-sizing: border-box; 
    margin: 0; 
    padding: 0; 
  }

  /* ═══════════════════════════════════════════════════════════
     ANIMATIONS
     ═══════════════════════════════════════════════════════════ */
  
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.4); }
    50% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(22, 163, 74, 0); }
  }

  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(22, 163, 74, 0.4); }
    50% { box-shadow: 0 0 40px rgba(22, 163, 74, 0.7); }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes confetti {
    0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
  }

  @keyframes pop {
    0% { transform: scale(1); }
    50% { transform: scale(1.08); }
    100% { transform: scale(1); }
  }

  @keyframes starBounce {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-6px) scale(1.2); }
  }

  @keyframes pathDraw {
    to { stroke-dashoffset: 0; }
  }

  @keyframes ringPulse {
    0% { transform: scale(0.95); opacity: 0.5; }
    50% { transform: scale(1.1); opacity: 0.8; }
    100% { transform: scale(0.95); opacity: 0.5; }
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  /* ═══════════════════════════════════════════════════════════
     GAME PAGE
     ═══════════════════════════════════════════════════════════ */

  .game-page {
    min-height: 100vh;
    background: linear-gradient(180deg, #fafffe 0%, #f0fdf4 30%, #ecfdf5 70%, #f0fdf4 100%);
    font-family: 'Tajawal', sans-serif;
    position: relative;
    overflow-x: hidden;
  }

  /* ═══════════════════════════════════════════════════════════
     LOADING SCREEN
     ═══════════════════════════════════════════════════════════ */

  .loading-screen {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(180deg, #fafffe 0%, #f0fdf4 100%);
  }

  .loading-content {
    text-align: center;
    animation: fadeIn 0.5s ease;
  }

  .loading-spinner {
    position: relative;
    width: 80px;
    height: 80px;
    margin: 0 auto 24px;
  }

  .spinner-ring {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 4px solid transparent;
    border-top-color: #16a34a;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .spinner-ring.r2 {
    width: 60px;
    height: 60px;
    top: 10px;
    left: 10px;
    border-top-color: #22c55e;
    animation-delay: 0.15s;
    animation-direction: reverse;
  }

  .spinner-ring.r3 {
    width: 40px;
    height: 40px;
    top: 20px;
    left: 20px;
    border-top-color: #86efac;
    animation-delay: 0.3s;
  }

  .loading-text {
    font-size: 20px;
    font-weight: 800;
    color: #166534;
  }

  /* ═══════════════════════════════════════════════════════════
     EMPTY SCREEN
     ═══════════════════════════════════════════════════════════ */

  .empty-screen {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(180deg, #fafffe 0%, #f0fdf4 100%);
    padding: 24px;
  }

  .empty-content {
    text-align: center;
    animation: fadeInUp 0.6s ease;
  }

  .empty-icon-wrap {
    width: 100px;
    height: 100px;
    margin: 0 auto 24px;
    background: linear-gradient(135deg, #dcfce7, #f0fdf4);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: float 3s ease-in-out infinite;
  }

  .empty-icon {
    width: 48px;
    height: 48px;
    fill: none;
    stroke: #16a34a;
    stroke-width: 2;
  }

  .empty-title {
    font-size: 28px;
    font-weight: 900;
    color: #14532d;
    margin-bottom: 12px;
  }

  .empty-desc {
    font-size: 18px;
    color: #6b7280;
    font-weight: 600;
  }

  /* ═══════════════════════════════════════════════════════════
     ROADMAP CONTAINER
     ═══════════════════════════════════════════════════════════ */

  .roadmap-container {
    position: relative;
    max-width: 500px;
    margin: 0 auto;
    padding: 32px 16px 100px;
    min-height: 100vh;
  }

  /* ═══════════════════════════════════════════════════════════
     ROADMAP HEADER
     ═══════════════════════════════════════════════════════════ */

  .roadmap-header {
    text-align: center;
    margin-bottom: 40px;
    animation: fadeInUp 0.6s ease;
  }

  .header-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: white;
    border: 2px solid #dcfce7;
    border-radius: 100px;
    padding: 10px 24px;
    margin-bottom: 20px;
    box-shadow: 0 4px 20px rgba(22, 163, 74, 0.1);
  }

  .badge-label {
    font-size: 16px;
    font-weight: 800;
    color: #166534;
    letter-spacing: 0.5px;
  }

  .roadmap-title {
    font-size: 38px;
    font-weight: 900;
    color: #14532d;
    margin-bottom: 28px;
    line-height: 1.2;
    letter-spacing: -0.5px;
  }

  .overall-progress {
    background: white;
    border: 2px solid #dcfce7;
    border-radius: 24px;
    padding: 24px;
    box-shadow: 0 8px 32px rgba(22, 163, 74, 0.08);
  }

  .progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .progress-label {
    font-size: 16px;
    font-weight: 700;
    color: #374151;
  }

  .progress-value {
    font-size: 28px;
    font-weight: 900;
    color: #16a34a;
  }

  .progress-bar-container {
    height: 14px;
    background: #f0fdf4;
    border-radius: 100px;
    overflow: hidden;
    margin-bottom: 14px;
    border: 1px solid #dcfce7;
  }

  .progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #16a34a, #22c55e);
    border-radius: 100px;
    transition: width 1s ease-out;
    position: relative;
  }

  .progress-bar-fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    animation: shimmer 2s infinite;
  }

  .progress-detail {
    font-size: 15px;
    color: #6b7280;
    font-weight: 600;
  }

  /* ═══════════════════════════════════════════════════════════
     GAME MAP - THE CONNECTED PATH
     ═══════════════════════════════════════════════════════════ */

  .game-map {
    position: relative;
    margin-top: 20px;
  }

  .path-svg {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 400px;
    height: auto;
    z-index: 1;
    pointer-events: none;
  }

  .path-bg {
    opacity: 0.6;
  }

  .path-progress {
    transition: stroke-dashoffset 1.5s ease-out;
  }

  .path-dots {
    opacity: 0.4;
  }

  /* ═══════════════════════════════════════════════════════════
     START POINT
     ═══════════════════════════════════════════════════════════ */

  .map-start {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 10;
    animation: fadeInUp 0.6s ease;
  }

  .start-node {
    position: relative;
    width: 72px;
    height: 72px;
  }

  .start-pulse {
    position: absolute;
    inset: -8px;
    border-radius: 50%;
    background: rgba(22, 163, 74, 0.2);
    animation: pulse 2s ease-in-out infinite;
  }

  .start-circle {
    position: relative;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #16a34a, #22c55e);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 24px rgba(22, 163, 74, 0.35);
  }

  .start-icon {
    width: 32px;
    height: 32px;
    color: white;
  }

  .start-label {
    margin-top: 14px;
    font-size: 18px;
    font-weight: 800;
    color: #166534;
  }

  /* ═══════════════════════════════════════════════════════════
     STAGE NODES
     ═══════════════════════════════════════════════════════════ */

  .stage-node {
    position: absolute;
    z-index: 10;
    width: calc(100% - 20px);
    max-width: 280px;
    animation: fadeInUp 0.6s ease backwards;
  }

  .stage-node:nth-child(2) { animation-delay: 0.1s; }
  .stage-node:nth-child(3) { animation-delay: 0.2s; }
  .stage-node:nth-child(4) { animation-delay: 0.3s; }
  .stage-node:nth-child(5) { animation-delay: 0.4s; }

  .stage-button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 16px;
    background: white;
    border: 3px solid #e5e7eb;
    border-radius: 20px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-family: 'Tajawal', sans-serif;
    text-align: right;
  }

  .stage-node.active .stage-button {
    border-color: #86efac;
    box-shadow: 0 8px 28px rgba(22, 163, 74, 0.15);
  }

  .stage-node.active .stage-button:hover {
    border-color: #22c55e;
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 12px 36px rgba(22, 163, 74, 0.25);
  }

  .stage-node.completed .stage-button {
    border-color: #22c55e;
    background: linear-gradient(135deg, #f0fdf4, #dcfce7);
    box-shadow: 0 6px 24px rgba(22, 163, 74, 0.15);
  }

  .stage-node.completed .stage-button:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 12px 36px rgba(22, 163, 74, 0.25);
  }

  .stage-node.locked .stage-button {
    opacity: 0.55;
    cursor: not-allowed;
    background: #fafafa;
    border-color: #e5e7eb;
  }

  /* Stage Circle */
  .stage-circle {
    position: relative;
    width: 56px;
    height: 56px;
    flex-shrink: 0;
  }

  .circle-inner {
    position: relative;
    z-index: 2;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f0fdf4;
    border: 3px solid #dcfce7;
    transition: all 0.3s ease;
  }

  .stage-node.completed .circle-inner {
    background: linear-gradient(135deg, #16a34a, #22c55e);
    border-color: #16a34a;
  }

  .stage-node.locked .circle-inner {
    background: #f3f4f6;
    border-color: #e5e7eb;
  }

  .stage-node.active .circle-inner {
    background: white;
    border-color: #22c55e;
  }

  .completed-glow {
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    background: rgba(22, 163, 74, 0.2);
    animation: ringPulse 2s ease-in-out infinite;
    z-index: 1;
  }

  .progress-ring {
    position: absolute;
    inset: -6px;
    transform: rotate(-90deg);
    z-index: 3;
  }

  .ring-bg {
    fill: none;
    stroke: #e5e7eb;
    stroke-width: 5;
  }

  .ring-fill {
    fill: none;
    stroke: #22c55e;
    stroke-width: 5;
    stroke-linecap: round;
    transition: stroke-dasharray 0.5s ease;
  }

  .stage-icon {
    width: 26px;
    height: 26px;
    fill: none;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .stage-icon.check {
    stroke: white;
  }

  .stage-icon.lock {
    stroke: #9ca3af;
    fill: none;
  }

  .stage-icon.lock rect {
    fill: #d1d5db;
    stroke: none;
  }

  .stage-number {
    font-size: 24px;
    font-weight: 900;
    color: #16a34a;
  }

  /* Stage Info */
  .stage-info {
    flex: 1;
    min-width: 0;
  }

  .stage-title {
    font-size: 20px;
    font-weight: 800;
    color: #14532d;
    margin-bottom: 6px;
    line-height: 1.3;
  }

  .stage-node.locked .stage-title {
    color: #6b7280;
  }

  .stage-meta {
    font-size: 15px;
    font-weight: 700;
  }

  .meta-completed {
    color: #16a34a;
  }

  .meta-locked {
    color: #9ca3af;
  }

  .meta-progress {
    color: #6b7280;
  }

  .stage-dots {
    display: flex;
    gap: 6px;
    margin-top: 10px;
    justify-content: flex-end;
  }

  .stage-dots .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #e5e7eb;
    transition: all 0.3s ease;
  }

  .stage-dots .dot.filled {
    background: linear-gradient(135deg, #16a34a, #22c55e);
  }

  .stage-arrow {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .stage-arrow svg {
    width: 24px;
    height: 24px;
    fill: none;
    stroke: #d1d5db;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: all 0.3s ease;
  }

  .stage-button:hover .stage-arrow svg {
    stroke: #16a34a;
    transform: translateX(-4px);
  }

  /* Stage Stars */
  .stage-stars {
    position: absolute;
    top: -12px;
    right: 8px;
    display: flex;
    gap: 2px;
    z-index: 20;
  }

  .stage-stars .star {
    font-size: 18px;
    color: #fbbf24;
    text-shadow: 0 2px 4px rgba(251, 191, 36, 0.4);
    animation: starBounce 2s ease-in-out infinite;
  }

  .stage-stars .star.s2 { animation-delay: 0.15s; }
  .stage-stars .star.s3 { animation-delay: 0.3s; }

  /* ═══════════════════════════════════════════════════════════
     END POINT (TROPHY)
     ═══════════════════════════════════════════════════════════ */

  .map-end {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 10;
    animation: fadeInUp 0.6s ease 0.5s backwards;
  }

  .end-node {
    position: relative;
    width: 88px;
    height: 88px;
  }

  .end-glow {
    position: absolute;
    inset: -10px;
    border-radius: 50%;
    background: rgba(251, 191, 36, 0.15);
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  .map-end.achieved .end-glow {
    opacity: 1;
    animation: pulse 2s ease-in-out infinite;
  }

  .end-circle {
    position: relative;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 28px rgba(245, 158, 11, 0.35);
    opacity: 0.5;
    transition: all 0.4s ease;
  }

  .map-end.achieved .end-circle {
    opacity: 1;
    animation: float 3s ease-in-out infinite;
  }

  .end-icon {
    width: 40px;
    height: 40px;
    fill: none;
    stroke: white;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .end-label {
    margin-top: 14px;
    font-size: 18px;
    font-weight: 800;
    color: #92400e;
    text-align: center;
  }

  /* ═══════════════════════════════════════════════════════════
     MAP LEGEND
     ═══════════════════════════════════════════════════════════ */

  .map-legend {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 24px;
    background: white;
    border: 2px solid #dcfce7;
    border-radius: 100px;
    padding: 14px 28px;
    box-shadow: 0 8px 32px rgba(22, 163, 74, 0.12);
    z-index: 100;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 700;
    color: #374151;
  }

  .legend-dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
  }

  .legend-dot.completed {
    background: linear-gradient(135deg, #16a34a, #22c55e);
  }

  .legend-dot.active {
    background: white;
    border: 3px solid #22c55e;
  }

  .legend-dot.locked {
    background: #e5e7eb;
  }

  /* ═══════════════════════════════════════════════════════════
     MODULES CONTAINER
     ═══════════════════════════════════════════════════════════ */

  .modules-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 24px 20px 80px;
    min-height: 100vh;
    animation: fadeIn 0.4s ease;
  }

  .back-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    padding: 10px 18px;
    font-family: 'Tajawal', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 24px;
  }

  .back-button:hover {
    border-color: #16a34a;
    color: #16a34a;
  }

  .back-button svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .back-button.small {
    padding: 8px 14px;
    font-size: 14px;
  }

  .modules-header {
    text-align: center;
    margin-bottom: 32px;
  }

  .stage-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #dcfce7, #f0fdf4);
    border-radius: 100px;
    padding: 8px 20px;
    margin-bottom: 16px;
  }

  .stage-badge .badge-text {
    font-size: 14px;
    font-weight: 800;
    color: #166534;
  }

  .modules-title {
    font-size: 32px;
    font-weight: 900;
    color: #14532d;
    margin-bottom: 8px;
  }

  .modules-subtitle {
    font-size: 16px;
    color: #6b7280;
    font-weight: 600;
  }

  .modules-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .module-card {
    display: flex;
    align-items: center;
    gap: 16px;
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 20px;
    padding: 18px;
    animation: fadeInUp 0.5s ease backwards;
    transition: all 0.3s ease;
  }

  .module-card:hover:not(.locked) {
    border-color: #86efac;
    box-shadow: 0 8px 24px rgba(22, 163, 74, 0.1);
  }

  .module-card.completed {
    border-color: #86efac;
    background: linear-gradient(135deg, #fafffe, #f0fdf4);
  }

  .module-card.locked {
    opacity: 0.55;
  }

  .module-status-icon {
    flex-shrink: 0;
  }

  .module-status-icon > div {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .status-completed {
    background: linear-gradient(135deg, #16a34a, #22c55e);
  }

  .status-completed svg {
    width: 24px;
    height: 24px;
    fill: none;
    stroke: white;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .status-locked {
    background: #f3f4f6;
  }

  .status-locked svg {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: #9ca3af;
    stroke-width: 2;
  }

  .status-locked rect {
    fill: #d1d5db;
    stroke: none;
  }

  .status-available {
    background: #f0fdf4;
    border: 3px solid #86efac;
    font-size: 20px;
    font-weight: 900;
    color: #16a34a;
  }

  .module-content {
    flex: 1;
    min-width: 0;
    text-align: right;
  }

  .module-title {
    font-size: 18px;
    font-weight: 800;
    color: #14532d;
    margin-bottom: 6px;
  }

  .module-meta {
    display: flex;
    gap: 16px;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 14px;
    font-weight: 600;
    color: #6b7280;
  }

  .meta-item svg {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
  }

  .meta-item.score {
    color: #f59e0b;
  }

  .meta-item.score svg {
    fill: #fbbf24;
    stroke: #f59e0b;
  }

  .module-action {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    border-radius: 12px;
    font-family: 'Tajawal', sans-serif;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
  }

  .module-action.start {
    background: linear-gradient(135deg, #16a34a, #22c55e);
    color: white;
  }

  .module-action.start:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(22, 163, 74, 0.3);
  }

  .module-action.retry {
    background: #f0fdf4;
    border: 2px solid #86efac;
    color: #16a34a;
  }

  .module-action.retry:hover {
    background: #dcfce7;
  }

  .module-action svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .module-action.start svg {
    fill: currentColor;
    stroke: none;
  }

  /* ═══════════════════════════════════════════════════════════
     QUIZ SCREEN
     ═══════════════════════════════════════════════════════════ */

  .quiz-screen {
    max-width: 600px;
    margin: 0 auto;
    padding: 24px 20px 80px;
    min-height: 100vh;
    animation: fadeIn 0.4s ease;
  }

  .quiz-top-bar {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
  }

  .quiz-module-title {
    flex: 1;
    font-size: 20px;
    font-weight: 800;
    color: #14532d;
    text-align: right;
  }

  .quiz-container {
    animation: fadeInUp 0.5s ease;
  }

  .quiz-header {
    margin-bottom: 28px;
  }

  .quiz-progress-bar {
    height: 10px;
    background: #e5e7eb;
    border-radius: 100px;
    overflow: hidden;
    margin-bottom: 12px;
  }

  .quiz-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #16a34a, #22c55e);
    border-radius: 100px;
    transition: width 0.4s ease;
  }

  .quiz-progress-text {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 700;
  }

  .progress-current {
    color: #16a34a;
  }

  .progress-divider {
    color: #d1d5db;
  }

  .progress-total {
    color: #9ca3af;
  }

  .question-card {
    background: white;
    border: 2px solid #dcfce7;
    border-radius: 24px;
    padding: 28px;
    margin-bottom: 24px;
    box-shadow: 0 8px 32px rgba(22, 163, 74, 0.08);
    animation: fadeInUp 0.4s ease;
  }

  .question-badge {
    margin-bottom: 20px;
  }

  .question-badge span {
    display: inline-block;
    padding: 6px 16px;
    border-radius: 100px;
    font-size: 13px;
    font-weight: 700;
  }

  .badge-mcq {
    background: #dbeafe;
    color: #1d4ed8;
  }

  .badge-tf {
    background: #fef3c7;
    color: #92400e;
  }

  .question-text {
    font-size: 22px;
    font-weight: 800;
    color: #14532d;
    line-height: 1.6;
    margin-bottom: 24px;
  }

  .options-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .option-card {
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    padding: 16px 18px;
    background: #fafafa;
    border: 2px solid #e5e7eb;
    border-radius: 16px;
    font-family: 'Tajawal', sans-serif;
    cursor: pointer;
    transition: all 0.25s ease;
    text-align: right;
  }

  .option-card:hover {
    border-color: #86efac;
    background: #f0fdf4;
  }

  .option-card.selected {
    border-color: #22c55e;
    background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  }

  .option-card.pop {
    animation: pop 0.3s ease;
  }

  .option-indicator {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: white;
    border: 2px solid #d1d5db;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.25s ease;
  }

  .option-card.selected .option-indicator {
    background: linear-gradient(135deg, #16a34a, #22c55e);
    border-color: #16a34a;
  }

  .option-letter {
    font-size: 15px;
    font-weight: 800;
    color: #9ca3af;
  }

  .option-card.selected .option-letter {
    color: white;
  }

  .check-icon {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: white;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .option-text {
    flex: 1;
    font-size: 17px;
    font-weight: 700;
    color: #374151;
  }

  .quiz-error {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 14px;
    background: #fef2f2;
    border: 2px solid #fecaca;
    border-radius: 12px;
    margin-bottom: 20px;
    font-size: 15px;
    font-weight: 700;
    color: #dc2626;
  }

  .error-icon {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
  }

  .quiz-navigation {
    display: flex;
    gap: 12px;
    margin-bottom: 28px;
  }

  .nav-button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 20px;
    border-radius: 14px;
    font-family: 'Tajawal', sans-serif;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
  }

  .nav-button svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .nav-button.prev {
    background: #f3f4f6;
    color: #6b7280;
  }

  .nav-button.prev:hover:not(:disabled) {
    background: #e5e7eb;
  }

  .nav-button.prev:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .nav-button.next {
    background: linear-gradient(135deg, #16a34a, #22c55e);
    color: white;
  }

  .nav-button.next:hover:not(:disabled) {
    transform: scale(1.02);
    box-shadow: 0 6px 20px rgba(22, 163, 74, 0.3);
  }

  .nav-button.next:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .nav-button.submit {
    background: linear-gradient(135deg, #16a34a, #22c55e);
    color: white;
  }

  .nav-button.submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .submit-count {
    background: rgba(255,255,255,0.2);
    padding: 4px 10px;
    border-radius: 8px;
    font-size: 14px;
  }

  .question-dots {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
  }

  .q-dot {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #f3f4f6;
    border: 2px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Tajawal', sans-serif;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .q-dot:hover {
    border-color: #86efac;
  }

  .q-dot.current {
    border-color: #16a34a;
    background: #dcfce7;
  }

  .q-dot.answered {
    background: linear-gradient(135deg, #16a34a, #22c55e);
    border-color: #16a34a;
  }

  .q-dot.answered .dot-number {
    color: white;
  }

  .dot-number {
    font-size: 14px;
    font-weight: 800;
    color: #6b7280;
  }

  .q-dot.current .dot-number {
    color: #16a34a;
  }

  /* ═══════════════════════════════════════════════════════════
     RESULT SCREEN
     ═══════════════════════════════════════════════════════════ */

  .result-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 60px 24px;
    text-align: center;
    animation: fadeInUp 0.6s ease;
    position: relative;
  }

  .confetti-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 100vh;
    pointer-events: none;
    overflow: hidden;
    z-index: 100;
  }

  .confetti {
    position: absolute;
    width: 12px;
    height: 12px;
    border-radius: 2px;
    animation: confetti 3s ease-out forwards;
  }

  .score-circle-container {
    position: relative;
    width: 180px;
    height: 180px;
    margin: 0 auto 32px;
  }

  .score-circle-svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  .score-bg {
    fill: none;
    stroke: #e5e7eb;
    stroke-width: 12;
  }

  .score-fill {
    fill: none;
    stroke: #22c55e;
    stroke-width: 12;
    stroke-linecap: round;
    transition: stroke-dashoffset 1.5s ease-out;
  }

  .score-circle-container.failed .score-fill {
    stroke: #f87171;
  }

  .score-content {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .score-value {
    font-size: 48px;
    font-weight: 900;
    color: #14532d;
  }

  .score-circle-container.failed .score-value {
    color: #dc2626;
  }

  .result-message {
    margin-bottom: 32px;
  }

  .result-title {
    font-size: 32px;
    font-weight: 900;
    margin-bottom: 12px;
  }

  .result-title.passed {
    color: #16a34a;
  }

  .result-title.failed {
    color: #dc2626;
  }

  .result-detail {
    font-size: 18px;
    font-weight: 600;
    color: #6b7280;
  }

  .result-progress {
    position: relative;
    margin-bottom: 40px;
  }

  .result-progress-bg {
    height: 14px;
    background: #e5e7eb;
    border-radius: 100px;
    overflow: hidden;
  }

  .result-progress-fill {
    height: 100%;
    border-radius: 100px;
    transition: width 1s ease-out;
  }

  .result-progress-fill.passed {
    background: linear-gradient(90deg, #16a34a, #22c55e);
  }

  .result-progress-fill.failed {
    background: linear-gradient(90deg, #ef4444, #f87171);
  }

  .result-threshold {
    position: absolute;
    left: 70%;
    top: -8px;
    bottom: -24px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .threshold-line {
    width: 3px;
    flex: 1;
    background: #374151;
    border-radius: 100px;
  }

  .threshold-label {
    font-size: 13px;
    font-weight: 700;
    color: #374151;
    margin-top: 6px;
  }

  .result-actions {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .action-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 16px;
    border-radius: 16px;
    font-family: 'Tajawal', sans-serif;
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
  }

  .action-button svg {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .action-button.primary {
    background: linear-gradient(135deg, #16a34a, #22c55e);
    color: white;
  }

  .action-button.primary:hover {
    transform: scale(1.02);
    box-shadow: 0 8px 24px rgba(22, 163, 74, 0.3);
  }

  .action-button.secondary {
    background: #f3f4f6;
    color: #374151;
    border: 2px solid #e5e7eb;
  }

  .action-button.secondary:hover {
    background: #e5e7eb;
    border-color: #d1d5db;
  }

  /* ═══════════════════════════════════════════════════════════
     RESPONSIVE
     ═══════════════════════════════════════════════════════════ */

  @media (max-width: 480px) {
    .roadmap-title {
      font-size: 30px;
    }

    .stage-button {
      padding: 14px;
    }

    .stage-title {
      font-size: 17px;
    }

    .stage-node {
      max-width: 240px;
    }

    .map-legend {
      gap: 16px;
      padding: 12px 20px;
    }

    .legend-item {
      font-size: 13px;
    }
  }
`;
