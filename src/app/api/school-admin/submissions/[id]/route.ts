// api/school-admin/submissions/[id]/route.ts
import { NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/school-admin-auth";
import { prisma } from "@/lib/prisma";

export const revalidate = 15;

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireSchoolAdmin();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await context.params;

  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id },
    select: {
      id: true,
      review_status: true,
      score: true,
      total: true,
      reviewer_notes: true,
      submitted_at: true,
      reviewed_at: true,
      assessment: {
        select: {
          id: true, title: true,
          questions: {
            orderBy: { order: "asc" },
            select: {
              id: true, type: true, text: true, correct_answer: true, order: true,
              options: {
                orderBy: { order: "asc" },
                select: { id: true, text: true, order: true },
              },
            },
          },
        },
      },
      student: {
        select: {
          id: true,
          profile: { select: { full_name: true } },
        },
      },
      answers: {
        select: {
          id: true,
          question_id: true,
          answer: true,
          is_correct: true,
          question: {
            select: {
              id: true, type: true, text: true, correct_answer: true,
              options: {
                orderBy: { order: "asc" },
                select: { id: true, text: true, order: true },
              },
            },
          },
        },
      },
      assigned_class: { select: { id: true, name: true } },
      reviewer: { select: { id: true, full_name: true } },
    },
  });

  if (!attempt) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Security: verify this submission belongs to this school
  // (assessment.school_id check via the where clause isn't possible on findUnique,
  //  so we verify via the assessment's school)
  const belongsToSchool = await prisma.assessmentAttempt.findFirst({
    where: {
      id,
      assessment: { school_id: auth.school.id },
    },
    select: { id: true },
  });
  if (!belongsToSchool)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ attempt });
}