// api/school-admin/placement-assessment/[id]/questions/[qid]/route.ts
import { NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/school-admin-auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string; qid: string }> }
) {
  const auth = await requireSchoolAdmin();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [{ qid }, { text, correct_answer, options }] = await Promise.all([
    context.params,
    req.json(),
  ]);

  // Update question + delete old options in parallel
  await Promise.all([
    prisma.assessmentQuestion.update({
      where: { id: qid },
      data: {
        ...(text !== undefined && { text }),
        ...(correct_answer !== undefined && { correct_answer }),
      },
    }),
    ...(Array.isArray(options)
      ? [prisma.assessmentOption.deleteMany({ where: { question_id: qid } })]
      : []),
  ]);

  // Create new options after delete completes
  if (Array.isArray(options) && options.length > 0) {
    await prisma.assessmentOption.createMany({
      data: options.map((opt: { text: string }, i: number) => ({
        question_id: qid, text: opt.text, order: i + 1,
      })),
    });
  }

  const updated = await prisma.assessmentQuestion.findUnique({
    where: { id: qid },
    select: {
      id: true, type: true, text: true, correct_answer: true, order: true,
      options: {
        orderBy: { order: "asc" },
        select: { id: true, text: true, order: true },
      },
    },
  });

  return NextResponse.json({ question: updated });
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string; qid: string }> }
) {
  const auth = await requireSchoolAdmin();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { qid } = await context.params;
  await prisma.assessmentQuestion.delete({ where: { id: qid } });
  return NextResponse.json({ success: true });
}