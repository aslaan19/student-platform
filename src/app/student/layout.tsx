import DashboardShell from "../../components/shared/dashboard-shell";

const studentSidebarItems = [
  { label: "الرئيسية", href: "/student" },
  { label: "دروسي", href: "/student/lessons" },
  { label: "اختباراتي", href: "/student/quizzes" },
  { label: "التقدم", href: "/student/progress" },
];

export default function StudentLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <DashboardShell
      title="لوحة الطالب"
      sidebarTitle="الطالب"
      sidebarItems={studentSidebarItems}
    >
      {children}
    </DashboardShell>
  );
}
