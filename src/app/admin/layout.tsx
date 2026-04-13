import DashboardShell from "../../components/shared/dashboard-shell";

const adminSidebarItems = [
  { label: "الرئيسية", href: "/admin" },
  { label: "المعلمون", href: "/admin/teachers" },
  { label: "الطلاب", href: "/admin/students" },
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
