// api/school-admin/placement-assessment/[id]/route.ts
import { NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/school-admin-auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireSchoolAdmin();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await context.params;
  const body = await req.json();
  const { title, is_active } = body;

  const assessment = await prisma.assessment.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(is_active !== undefined && { is_active }),
    },
    include: {
      questions: { orderBy: { order: "asc" }, include: { options: { orderBy: { order: "asc" } } } },
    },
  });

  return NextResponse.json({ assessment });
}