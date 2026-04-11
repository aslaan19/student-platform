import Link from "next/link";

type SidebarItem = {
  label: string;
  href: string;
};

type SidebarProps = {
  title: string;
  items: SidebarItem[];
};

export default function Sidebar({ title, items }: SidebarProps) {
  return (
    <aside className="w-64 border-l bg-white p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>

      <nav className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-black"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
