// api/school-admin/submissions/route.ts
import { NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/school-admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const auth = await requireSchoolAdmin();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status");

  const submissions = await prisma.assessmentAttempt.findMany({
    where: {
      assessment: { type: "SCHOOL_PLACEMENT", school_id: auth.school.id },
      ...(statusFilter ? { review_status: statusFilter as never } : {}),
    },
    include: {
      student: {
        include: { profile: { select: { id: true, full_name: true } }, class: { select: { id: true, name: true } } },
      },
      assessment: { select: { id: true, title: true } },
      assigned_class: { select: { id: true, name: true } },
      reviewer: { select: { id: true, full_name: true } },
    },
    orderBy: { submitted_at: "desc" },
  });

  return NextResponse.json({ submissions });
}