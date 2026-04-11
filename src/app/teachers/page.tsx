import StatCard from "../../components/dashboard/stat-card";
import SectionCard from "../../components/dashboard/section-card";

export default function TeacherPage() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="عدد الفصول" value="3" />
        <StatCard title="عدد الطلاب" value="30" />
        <StatCard title="الاختبارات" value="5" />
      </div>

      {/* Section */}
      <SectionCard title="فصولي">
        <p className="text-gray-600">يمكنك إدارة الفصول الخاصة بك من هنا.</p>
      </SectionCard>
    </div>
  );
}
