// api/school-admin/placement-assessment/[id]/questions/[qid]/route.ts
import { NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/school-admin-auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, context: { params: Promise<{ qid: string }> }) {
  const auth = await requireSchoolAdmin();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { qid } = await context.params;
  const { text, correct_answer, options } = await req.json();

  await prisma.assessmentQuestion.update({
    where: { id: qid },
    data: {
      ...(text !== undefined && { text }),
      ...(correct_answer !== undefined && { correct_answer }),
    },
  });

  if (Array.isArray(options)) {
    await prisma.assessmentOption.deleteMany({ where: { question_id: qid } });
    await prisma.assessmentOption.createMany({
      data: options.map((opt: { text: string }, i: number) => ({
        question_id: qid, text: opt.text, order: i + 1,
      })),
    });
  }

  const updated = await prisma.assessmentQuestion.findUnique({
    where: { id: qid },
    include: { options: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json({ question: updated });
}

export async function DELETE(_req: Request, context: { params: Promise<{ qid: string }> }) {
  const auth = await requireSchoolAdmin();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { qid } = await context.params;
  await prisma.assessmentQuestion.delete({ where: { id: qid } });
  return NextResponse.json({ success: true });
}