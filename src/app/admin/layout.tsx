import DashboardShell from "../../components/shared/dashboard-shell";

const adminSidebarItems = [
  { label: "الرئيسية", href: "/" },
  { label: "المعلمون", href: "/teachers" },
  { label: "الطلاب", href: "/student" },
  { label: "الفصول", href: "/admin/classes" },
];

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <DashboardShell
      title="لوحة تحكم الأدمن"
      sidebarTitle="الأدمن"
      sidebarItems={adminSidebarItems}
    >
      {children}
    </DashboardShell>
  );
}
