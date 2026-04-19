// api/school-admin/placement-assessment/route.ts
import { NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/school-admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireSchoolAdmin();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const assessment = await prisma.assessment.findFirst({
    where: { type: "SCHOOL_PLACEMENT", school_id: auth.school.id },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { options: { orderBy: { order: "asc" } } },
      },
    },
  });

  return NextResponse.json({ assessment });
}

export async function POST(req: Request) {
  const auth = await requireSchoolAdmin();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const existing = await prisma.assessment.findFirst({
    where: { type: "SCHOOL_PLACEMENT", school_id: auth.school.id },
  });
  if (existing) return NextResponse.json({ error: "Already exists" }, { status: 400 });

  const { title } = await req.json();
  const assessment = await prisma.assessment.create({
    data: {
      title: title || "School Placement Assessment",
      type: "SCHOOL_PLACEMENT",
      school_id: auth.school.id,
      is_active: true,
    },
  });

  return NextResponse.json({ assessment }, { status: 201 });
}