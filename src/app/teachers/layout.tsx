import DashboardShell from "../../components/shared/dashboard-shell";

const teacherSidebarItems = [
  { label: "الرئيسية", href: "/teacher" },
  { label: "فصولي", href: "/teacher/classes" },
  { label: "الدروس", href: "/teacher/lessons" },
  { label: "الاختبارات", href: "/teacher/quizzes" },
];

export default function TeacherLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <DashboardShell
      title="لوحة المعلم"
      sidebarTitle="المعلم"
      sidebarItems={teacherSidebarItems}
    >
      {children}
    </DashboardShell>
  );
}