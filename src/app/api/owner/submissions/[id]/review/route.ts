// api/owner/submissions/[id]/review/route.ts
import { NextResponse } from "next/server";
import { createClient } from "../../../../../../lib/supabase/server";
import { prisma } from "../../../../../../lib/prisma";

async function requireOwner() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!profile || profile.role !== "OWNER") return null;
  return profile;
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const ownerProfile = await requireOwner();
  if (!ownerProfile) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await context.params;
  const body = await req.json();
  const { written_grades, reviewer_notes, assigned_school_id } = body;

  if (!assigned_school_id) {
    return NextResponse.json({ error: "assigned_school_id is required" }, { status: 400 });
  }

  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id },
    include: {
      answers: { include: { question: true } },
      student: true,
    },
  });

  if (!attempt) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (written_grades && typeof written_grades === "object") {
    for (const [answerId, isCorrect] of Object.entries(written_grades)) {
      await prisma.assessmentAnswer.update({
        where: { id: answerId },
        data: { is_correct: isCorrect as boolean },
      });
    }
  }

  const allAnswers = await prisma.assessmentAnswer.findMany({
    where: { attempt_id: id },
  });
  const score = allAnswers.filter((a) => a.is_correct === true).length;
  const total = allAnswers.length;

  const updated = await prisma.assessmentAttempt.update({
    where: { id },
    data: {
      review_status: "REVIEWED",
      reviewer_id: ownerProfile.id,
      reviewer_notes: reviewer_notes || null,
      assigned_school_id,
      score,
      total,
      reviewed_at: new Date(),
    },
  });

  await prisma.student.update({
    where: { id: attempt.student_id },
    data: {
      onboarding_status: "SCHOOL_ASSIGNED",
      school_id: assigned_school_id,
    },
  });

  return NextResponse.json({ attempt: updated, score, total });
}
