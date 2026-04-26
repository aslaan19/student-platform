"use server";
import { NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/school-admin-auth";
import { prisma } from "@/lib/prisma";

// POST /api/school-admin/roadmap/modules/[id]/questions
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireSchoolAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  const mod = await prisma.roadmapModule.findFirst({
    where: { id, stage: { roadmap: { school_id: auth.school.id } } },
  });
  if (!mod) return NextResponse.json({ error: "Module not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const { type, text, correct_answer, options } = body;

  // Validate required fields
  if (!type || !text?.trim() || !correct_answer?.trim()) {
    return NextResponse.json(
      { error: "type, text, and correct_answer are required" },
      { status: 400 }
    );
  }
  if (!["MCQ", "TF"].includes(type)) {
    return NextResponse.json({ error: "type must be MCQ or TF" }, { status: 400 });
  }
  if (type === "MCQ" && (!Array.isArray(options) || options.length < 2)) {
    return NextResponse.json(
      { error: "MCQ requires at least 2 options" },
      { status: 400 }
    );
  }

  // TF correct_answer must be "true" or "false"
  if (type === "TF" && !["true", "false"].includes(correct_answer.trim().toLowerCase())) {
    return NextResponse.json(
      { error: "TF correct_answer must be 'true' or 'false'" },
      { status: 400 }
    );
  }

  const last = await prisma.roadmapQuestion.findFirst({
    where: { module_id: id },
    orderBy: { order: "desc" },
  });

  const question = await prisma.roadmapQuestion.create({
    data: {
      module_id: id,
      type,
      text: text.trim(),
      correct_answer: correct_answer.trim().toLowerCase(),
      order: (last?.order ?? 0) + 1,
      ...(type === "MCQ" && {
        options: {
          create: (options as string[]).map((opt: string, idx: number) => ({
            text: opt.trim(),
            order: idx + 1,
          })),
        },
      }),
    },
    include: { options: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json({ question }, { status: 201 });
}