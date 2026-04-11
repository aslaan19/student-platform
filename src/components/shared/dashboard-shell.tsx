import Sidebar from "./sidebar";
import Header from "./header";

type SidebarItem = {
  label: string;
  href: string;
};

type DashboardShellProps = {
  title: string;
  sidebarTitle: string;
  sidebarItems: SidebarItem[];
  children: React.ReactNode;
};

export default function DashboardShell({
  title,
  sidebarTitle,
  sidebarItems,
  children,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        <Sidebar title={sidebarTitle} items={sidebarItems} />

        <div className="flex flex-1 flex-col">
          <Header title={title} />

          <main className="flex-1 p-6">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
