import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { prisma } from "../../../../lib/prisma";

interface QuestionInput {
  type: string;
  text: string;
  correct_answer: string;
  options?: string[];
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const teacher = await prisma.teacher.findUnique({ where: { profile_id: user.id } });
    if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 });

    const quizzes = await prisma.quiz.findMany({
      where: { teacher_id: teacher.id },
      include: {
        class: true,
        questions: true,
        attempts: {
          include: {
            student: { include: { profile: true } },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const teacher = await prisma.teacher.findUnique({ where: { profile_id: user.id } });
    if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 });

    const { name, classId, questions } = await req.json();

    if (!name || !classId || !questions?.length) {
      return NextResponse.json({ error: "name, classId and questions are required" }, { status: 400 });
    }

    const quiz = await prisma.quiz.create({
      data: {
        name,
        class_id: classId,
        teacher_id: teacher.id,
        questions: {
          create: questions.map((q: QuestionInput, index: number) => ({
            type: q.type,
            text: q.text,
            correct_answer: q.correct_answer,
            order: index + 1,
            options: q.type === "MCQ" ? {
              create: q.options?.map((opt: string, i: number) => ({
                text: opt,
                order: i + 1,
              })),
            } : undefined,
          })),
        },
      },
      include: { questions: { include: { options: true } } },
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create quiz" }, { status: 500 });
  }
}