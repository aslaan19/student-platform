"use server";
import { NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/school-admin-auth";
import { prisma } from "@/lib/prisma";

// PUT /api/school-admin/roadmap/questions/[id]
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireSchoolAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  const question = await prisma.roadmapQuestion.findFirst({
    where: { id, module: { stage: { roadmap: { school_id: auth.school.id } } } },
  });
  if (!question) return NextResponse.json({ error: "Question not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const { text, correct_answer, options } = body;

  // Validate TF correct_answer if provided
  if (question.type === "TF" && correct_answer) {
    if (!["true", "false"].includes(correct_answer.trim().toLowerCase())) {
      return NextResponse.json(
        { error: "TF correct_answer must be 'true' or 'false'" },
        { status: 400 }
      );
    }
  }

  // Replace MCQ options atomically if new ones provided
  if (question.type === "MCQ" && Array.isArray(options) && options.length >= 2) {
    await prisma.$transaction([
      prisma.roadmapQuestionOption.deleteMany({ where: { question_id: id } }),
      prisma.roadmapQuestionOption.createMany({
        data: (options as string[]).map((opt: string, idx: number) => ({
          question_id: id,
          text: opt.trim(),
          order: idx + 1,
        })),
      }),
    ]);
  }

  const updated = await prisma.roadmapQuestion.update({
    where: { id },
    data: {
      ...(text?.trim() && { text: text.trim() }),
      ...(correct_answer?.trim() && { correct_answer: correct_answer.trim().toLowerCase() }),
    },
    include: { options: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json({ question: updated });
}

// DELETE /api/school-admin/roadmap/questions/[id]
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireSchoolAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  const question = await prisma.roadmapQuestion.findFirst({
    where: { id, module: { stage: { roadmap: { school_id: auth.school.id } } } },
  });
  if (!question) return NextResponse.json({ error: "Question not found" }, { status: 404 });

  await prisma.roadmapQuestion.delete({ where: { id } });

  return NextResponse.json({ success: true });
}