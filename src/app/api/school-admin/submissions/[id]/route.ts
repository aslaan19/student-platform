// api/school-admin/submissions/[id]/route.ts
import { NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/school-admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireSchoolAdmin();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await context.params;

  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id },
    include: {
      assessment: {
        include: {
          questions: { orderBy: { order: "asc" }, include: { options: { orderBy: { order: "asc" } } } },
        },
      },
      student: { include: { profile: { select: { id: true, full_name: true } } } },
      answers: { include: { question: { include: { options: { orderBy: { order: "asc" } } } } } },
      assigned_class: { select: { id: true, name: true } },
      reviewer: { select: { id: true, full_name: true } },
    },
  });

  if (!attempt) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ attempt });
}