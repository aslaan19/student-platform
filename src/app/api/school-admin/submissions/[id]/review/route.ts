// api/school-admin/submissions/[id]/review/route.ts
import { NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/school-admin-auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireSchoolAdmin();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await context.params;
  const { written_grades, reviewer_notes, assigned_class_id } = await req.json();

  if (!assigned_class_id) return NextResponse.json({ error: "assigned_class_id is required" }, { status: 400 });

  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id },
    include: { answers: { include: { question: true } }, student: true },
  });
  if (!attempt) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Apply written grades
  if (written_grades && typeof written_grades === "object") {
    for (const [answerId, isCorrect] of Object.entries(written_grades)) {
      await prisma.assessmentAnswer.update({
        where: { id: answerId },
        data: { is_correct: isCorrect as boolean },
      });
    }
  }

  const allAnswers = await prisma.assessmentAnswer.findMany({ where: { attempt_id: id } });
  const score = allAnswers.filter((a) => a.is_correct === true).length;
  const total = allAnswers.length;

  await prisma.assessmentAttempt.update({
    where: { id },
    data: {
      review_status: "REVIEWED",
      reviewer_id: auth.profile.id,
      reviewer_notes: reviewer_notes || null,
      assigned_class_id,
      score,
      total,
      reviewed_at: new Date(),
    },
  });

  // Update student: CLASS_ASSIGNED + link class
  await prisma.student.update({
    where: { id: attempt.student_id },
    data: { onboarding_status: "CLASS_ASSIGNED", class_id: assigned_class_id },
  });

  return NextResponse.json({ success: true, score, total });
}