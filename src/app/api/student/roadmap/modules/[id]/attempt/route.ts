import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const student = await prisma.student.findUnique({ where: { profile_id: user.id } });
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });
  if (!student.school_id) return NextResponse.json({ error: "Not assigned to a school" }, { status: 403 });

  const { id: moduleId } = await context.params;

  const mod = await prisma.roadmapModule.findFirst({
    where: { id: moduleId, stage: { roadmap: { school_id: student.school_id } } },
    include: {
      questions: true,
      stage: { select: { order: true, roadmap_id: true } },
    },
  });
  if (!mod) return NextResponse.json({ error: "Module not found" }, { status: 404 });
  if (mod.questions.length === 0) return NextResponse.json({ error: "Module has no questions" }, { status: 400 });

  // Replace the priorStages loop with this single query
const priorStages = await prisma.roadmapStage.findMany({
  where: { roadmap_id: mod.stage.roadmap_id, order: { lt: mod.stage.order } },
  include: {
    modules: {
      include: {
        attempts: { 
          where: { student_id: student.id, passed: true }, 
          take: 1,
          select: { id: true } // only fetch id, not full attempt
        },
      },
    },
  },
});

  for (const stage of priorStages) {
    const allPassed = stage.modules.length > 0 && stage.modules.every((m) => m.attempts.length > 0);
    if (!allPassed) return NextResponse.json({ error: "Complete previous stages first" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { answers } = body as { answers: { question_id: string; answer: string }[] };
  if (!Array.isArray(answers) || answers.length === 0) {
    return NextResponse.json({ error: "answers array is required" }, { status: 400 });
  }

  const answerMap = new Map(answers.map((a) => [a.question_id, a.answer?.trim().toLowerCase()]));
  let correct = 0;

  const answerRecords = mod.questions.map((q) => {
    const given = answerMap.get(q.id) ?? "";
    const expected = q.correct_answer.trim().toLowerCase();
    const is_correct = given === expected;
    if (is_correct) correct++;
    return { question_id: q.id, answer: answerMap.get(q.id) ?? "", is_correct };
  });

  const total = mod.questions.length;
  const score = Math.round((correct / total) * 100);
  const passed = score >= 50;

  const attempt = await prisma.moduleAttempt.create({
    data: {
      module_id: moduleId,
      student_id: student.id,
      score,
      total,
      passed,
      answers: { create: answerRecords },
    },
  });

  return NextResponse.json({
    attempt: { id: attempt.id, score, total, passed, correct },
  });
}
