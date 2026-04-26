"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLang } from "@/lib/language-context";
import LangToggle from "@/lib/LangToggle";

const ONBOARDING_ROUTES: Record<string, string> = {
  PENDING_INTAKE: "/student/intake",
  INTAKE_SUBMITTED: "/student/waiting",
  SCHOOL_ASSIGNED: "/student/school-assigned",
  SCHOOL_PLACEMENT_SUBMITTED: "/student/waiting-class",
  CLASS_ASSIGNED: "/student/welcome",
};

const ALLOWED_PAGES: Record<string, string[]> = {
  PENDING_INTAKE: ["/student/intake"],
  INTAKE_SUBMITTED: ["/student/waiting"],
  SCHOOL_ASSIGNED: ["/student/school-assigned", "/student/placement"],
  SCHOOL_PLACEMENT_SUBMITTED: ["/student/waiting-class"],
  CLASS_ASSIGNED: [
    "/student/welcome",
    "/student",
    "/student/classes",
    "/student/quizzes",
    "/student/announcements",
  ],
};

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const { setLang, lang } = useLang();

  useEffect(() => {
    fetch("/api/student")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          router.push("/login");
          return;
        }

        // Auto-set language from school
        if (data.school?.language && data.school.language !== lang) {
          setLang(data.school.language as "ar" | "sq");
        }

        // Show toggle only for schools with Albanian language
        if (data.school?.language === "sq") {
          setShowToggle(true);
        }

        const status: string = data.onboarding_status;
        const allowed = ALLOWED_PAGES[status];

        if (!allowed) {
          setChecked(true);
          return;
        }

        const isAllowed = allowed.some(
          (p) => p === pathname || pathname.startsWith(p + "/"),
        );

        if (status === "CLASS_ASSIGNED") {
          const onDashboard =
            pathname === "/student" || pathname.startsWith("/student/");
          if (!onDashboard || pathname === "/student/school-assigned") {
            router.push("/student/welcome");
          } else {
            setChecked(true);
          }
          return;
        }

        if (!isAllowed) {
          router.push(ONBOARDING_ROUTES[status] ?? "/student");
        } else {
          setChecked(true);
        }
      })
      .catch(() => router.push("/login"));
  }, [pathname]);

  if (!checked) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f8fa",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: "3px solid #e5e7eb",
            borderTopColor: "#4f8ef7",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      {showToggle && (
        <div style={{ position: "fixed", bottom: 24, left: 24, zIndex: 9999 }}>
          <LangToggle />
        </div>
      )}
      {children}
    </>
  );
}
