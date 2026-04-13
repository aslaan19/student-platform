"use client";

import { useEffect, useState } from "react";
import DashboardShell from "../../components/shared/dashboard-shell";

const studentSidebarItems = [
  { label: "الرئيسية", href: "/student" },
  { label: "فصلي", href: "/student/class" },
];

export default function StudentLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [name, setName] = useState("الطالب");

  useEffect(() => {
    fetch("/api/student")
      .then(r => r.json())
      .then(d => { if (d?.profile?.full_name) setName(d.profile.full_name); });
  }, []);

  return (
    <DashboardShell
      title="لوحة الطالب"
      sidebarTitle={name}
      sidebarItems={studentSidebarItems}
    >
      {children}
    </DashboardShell>
  );
}