import StatCard from "../../components/dashboard/stat-card";
import SectionCard from "../../components/dashboard/section-card";

export default function StudentPage() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="الدروس المكتملة" value="12" />
        <StatCard title="المتبقي" value="8" />
        <StatCard title="متوسط الدرجات" value="85%" />
        <StatCard title="التقدم العام" value="60%" />
      </div>

      {/* Current Learning */}
      <SectionCard title="التعلم الحالي">
        <div className="space-y-2">
          <p className="font-medium">الوحدة 2 - الدرس 3</p>
          <p className="text-sm text-gray-500">
            تابع التعلم من حيث توقفت
          </p>

          <button className="mt-3 rounded-lg bg-black px-4 py-2 text-white">
            متابعة التعلم
          </button>
        </div>
      </SectionCard>

      {/* Lessons */}
      <SectionCard title="الدروس">
        <p className="text-gray-600">
          قائمة الدروس ستظهر هنا لاحقًا
        </p>
      </SectionCard>

      {/* Quizzes */}
      <SectionCard title="الاختبارات">
        <p className="text-gray-600">
          الاختبارات المرتبطة بالدروس
        </p>
      </SectionCard>
    </div>
  );
}