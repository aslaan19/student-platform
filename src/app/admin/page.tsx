import { prisma } from "../../lib/prisma";
import StatCard from "../../components/dashboard/stat-card";
import SectionCard from "../../components/dashboard/section-card";

export default async function AdminPage() {
  const [studentCount, teacherCount, classCount] = await Promise.all([
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.class.count(),
  ]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="عدد الطلاب" value={String(studentCount)} />
        <StatCard title="عدد المعلمين" value={String(teacherCount)} />
        <StatCard title="عدد الفصول" value={String(classCount)} />
      </div>
      <SectionCard title="نظرة عامة">
        <p className="text-gray-600">يمكنك إدارة النظام بالكامل من هنا.</p>
      </SectionCard>
    </div>
  );
}
