// api/school-admin/stats/route.ts
import { NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/school-admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireSchoolAdmin();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { school } = auth;

  const [teacherCount, studentCount, classCount, pendingPlacements, hasPlacementAssessment] =
    await Promise.all([
      prisma.teacher.count({ where: { school_id: school.id } }),
      prisma.student.count({ where: { school_id: school.id } }),
      prisma.class.count({ where: { school_id: school.id } }),
      prisma.student.count({ where: { school_id: school.id, onboarding_status: "SCHOOL_ASSIGNED" } }),
      prisma.assessment.findFirst({ where: { type: "SCHOOL_PLACEMENT", school_id: school.id } }),
    ]);

  const studentsByStatus = await prisma.student.groupBy({
    by: ["onboarding_status"],
    where: { school_id: school.id },
    _count: { onboarding_status: true },
  });

  return NextResponse.json({
    school: { id: school.id, name: school.name },
    teacherCount,
    studentCount,
    classCount,
    pendingPlacements,
    hasPlacementAssessment: !!hasPlacementAssessment,
    studentsByStatus: studentsByStatus.map((s) => ({
      status: s.onboarding_status,
      count: s._count.onboarding_status,
    })),
  });
}