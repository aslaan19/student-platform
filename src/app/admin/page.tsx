import StatCard from "../../components/dashboard/stat-card";
import SectionCard from "../../components/dashboard/section-card";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="عدد الطلاب" value="100" />
        <StatCard title="عدد المعلمين" value="10" />
        <StatCard title="عدد الفصول" value="10" />
      </div>

      {/* Section */}
      <SectionCard title="نظرة عامة">
        <p className="text-gray-600">يمكنك إدارة النظام بالكامل من هنا.</p>
      </SectionCard>
    </div>
  );
}
