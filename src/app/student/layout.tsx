// student/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const ONBOARDING_ROUTES: Record<string, string> = {
  PENDING_INTAKE: "/student/intake",
  INTAKE_SUBMITTED: "/student/waiting",
  SCHOOL_ASSIGNED: "/student/placement",
  SCHOOL_PLACEMENT_SUBMITTED: "/student/waiting-class",
  CLASS_ASSIGNED: "/student",
};

// Pages that are part of the onboarding flow themselves — don't redirect from these
const ONBOARDING_PAGES = [
  "/student/intake",
  "/student/waiting",
  "/student/placement",
  "/student/waiting-class",
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetch("/api/student")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          router.push("/login");
          return;
        }

        const status: string = data.onboarding_status;
        const target = ONBOARDING_ROUTES[status];

        if (!target) {
          setChecked(true);
          return;
        }

        // If student is not where they should be, redirect
        if (pathname !== target) {
          router.push(target);
        } else {
          setChecked(true);
        }
      })
      .catch(() => router.push("/login"));
  }, [pathname]);

  if (!checked) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#f7f8fa",
      }}>
        <div style={{
          width: 32, height: 32,
          border: "3px solid #e5e7eb",
          borderTopColor: "#4f8ef7",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return <>{children}</>;
}