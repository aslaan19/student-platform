// api/owner/stats/route.ts
import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await (await supabase).auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!profile || profile.role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [
    schoolCount,
    teacherCount,
    studentCount,
    pendingSubmissions,
    totalSubmissions,
    hasIntakeAssessment,
  ] = await Promise.all([
    prisma.school.count(),
    prisma.teacher.count(),
    prisma.student.count(),
    prisma.assessmentAttempt.count({
      where: { review_status: "PENDING", assessment: { type: "PLATFORM_INTAKE" } },
    }),
    prisma.assessmentAttempt.count({
      where: { assessment: { type: "PLATFORM_INTAKE" } },
    }),
    prisma.assessment.findFirst({ where: { type: "PLATFORM_INTAKE" } }),
  ]);

  const studentsByStatus = await prisma.student.groupBy({
    by: ["onboarding_status"],
    _count: { onboarding_status: true },
  });

  return NextResponse.json({
    schoolCount,
    teacherCount,
    studentCount,
    pendingSubmissions,
    totalSubmissions,
    hasIntakeAssessment: !!hasIntakeAssessment,
    studentsByStatus: studentsByStatus.map((s) => ({
      status: s.onboarding_status,
      count: s._count.onboarding_status,
    })),
  });
}