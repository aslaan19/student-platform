"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface School {
  id: string;
  name: string;
  created_at: string;
  admin: { id: string; full_name: string } | null;
  _count: { teachers: number; students: number; classes: number };
}

export default function OwnerSchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/owner/schools")
      .then((r) => r.json())
      .then((d) => setSchools(d.schools ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="schools-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">All Schools</h1>
          <p className="page-sub">
            Read-only overview of all registered schools
          </p>
        </div>
        <div className="readonly-badge">
          <svg
            width="12"
            height="12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          View Only
        </div>
      </div>

      {loading ? (
        <div className="loading-row">
          <div className="spinner" />
          Loading schools…
        </div>
      ) : schools.length === 0 ? (
        <div className="empty">No schools found.</div>
      ) : (
        <div className="schools-grid">
          {schools.map((school) => (
            <Link
              key={school.id}
              href={`/owner/schools/${school.id}`}
              className="school-card"
            >
              <div className="school-card-header">
                <div className="school-icon">🏫</div>
                <div className="school-name">{school.name}</div>
              </div>
              <div className="school-admin-row">
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
                {school.admin ? (
                  <span className="admin-name">{school.admin.full_name}</span>
                ) : (
                  <span className="no-admin">No admin assigned</span>
                )}
              </div>
              <div className="school-stats">
                <div className="s-stat">
                  <span className="s-val">{school._count.teachers}</span>
                  <span className="s-lab">Teachers</span>
                </div>
                <div className="s-divider" />
                <div className="s-stat">
                  <span className="s-val">{school._count.students}</span>
                  <span className="s-lab">Students</span>
                </div>
                <div className="s-divider" />
                <div className="s-stat">
                  <span className="s-val">{school._count.classes}</span>
                  <span className="s-lab">Classes</span>
                </div>
              </div>
              <div className="school-created">
                Created{" "}
                {new Date(school.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
              <div className="view-arrow">
                View details
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}

      <style>{`
        .schools-page { display: flex; flex-direction: column; gap: 24px; }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .page-title { font-size: 22px; font-weight: 700; color: var(--text); letter-spacing: -0.4px; }
        .page-sub { font-size: 13px; color: var(--text2); margin-top: 2px; }
        .readonly-badge {
          display: flex; align-items: center; gap: 6px;
          background: rgba(79,142,247,0.08); border: 1px solid rgba(79,142,247,0.2);
          color: var(--accent); font-size: 11.5px; font-weight: 600;
          padding: 5px 10px; border-radius: 7px;
        }
        .loading-row {
          display: flex; align-items: center; gap: 12px;
          color: var(--text2); font-size: 14px; padding: 40px 0; justify-content: center;
        }
        .spinner { width: 18px; height: 18px; border: 2px solid var(--border2); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .empty { text-align: center; color: var(--text3); padding: 60px; font-size: 14px; }

        .schools-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
        .school-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 14px; padding: 20px;
          text-decoration: none; color: var(--text);
          display: flex; flex-direction: column; gap: 12px;
          transition: border-color 0.15s, transform 0.15s;
        }
        .school-card:hover { border-color: var(--accent); transform: translateY(-2px); }
        .school-card-header { display: flex; align-items: center; gap: 10px; }
        .school-icon { font-size: 26px; }
        .school-name { font-size: 16px; font-weight: 700; color: var(--text); line-height: 1.2; }
        .school-admin-row { display: flex; align-items: center; gap: 6px; color: var(--text2); font-size: 12.5px; }
        .admin-name { font-weight: 500; color: var(--text); }
        .no-admin { color: var(--danger); font-style: italic; }
        .school-stats {
          display: flex; align-items: center;
          background: var(--surface2); border-radius: 8px; padding: 10px 14px; gap: 12px;
        }
        .s-stat { display: flex; flex-direction: column; align-items: center; flex: 1; }
        .s-val { font-size: 18px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text); }
        .s-lab { font-size: 10px; color: var(--text3); font-weight: 500; text-transform: uppercase; letter-spacing: 0.3px; }
        .s-divider { width: 1px; height: 28px; background: var(--border); }
        .school-created { font-size: 11px; color: var(--text3); }
        .view-arrow {
          display: flex; align-items: center; gap: 4px;
          font-size: 12px; color: var(--accent); font-weight: 600; margin-top: 2px;
        }
      `}</style>
    </div>
  );
}
