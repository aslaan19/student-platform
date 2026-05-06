// api/school-admin/students/route.ts
import { NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/school-admin-auth";
import { prisma } from "@/lib/prisma";

export const revalidate = 30;

export async function GET() {
  const auth = await requireSchoolAdmin();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const students = await prisma.student.findMany({
    where: { school_id: auth.school.id },
    select: {
      id: true,
      onboarding_status: true,
      created_at: true,
      profile: { select: { full_name: true } },
      class: { select: { id: true, name: true } },
    },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json({ students });
}