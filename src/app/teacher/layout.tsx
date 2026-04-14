"use client";

import { useEffect, useState } from "react";
import DashboardShell from "../../components/shared/dashboard-shell";

const teacherSidebarItems = [
  { label: "الرئيسية", href: "/teacher" },
  { label: "فصولي", href: "/teacher/classes" },
  { label: "الاختبارات", href: "/teacher/quizzes" },
];

export default function TeacherLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [name, setName] = useState("المعلم");

  useEffect(() => {
    fetch("/api/teacher")
      .then((r) => r.json())
      .then((d) => {
        if (d?.profile?.full_name) setName(d.profile.full_name);
      });
  }, []);

  return (
    <DashboardShell
      title="لوحة المعلم"
      sidebarTitle={name}
      sidebarItems={teacherSidebarItems}
    >
      {children}
    </DashboardShell>
  );
}
