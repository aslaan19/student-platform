import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { prisma } from "../../../../../lib/prisma";

interface SubmittedAnswer {
  questionId: string;
  answer: string;
}

interface QuizQuestion {
  id: string;
  correct_answer: string;
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const student = await prisma.student.findUnique({ where: { profile_id: user.id } });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const { quizId, answers } = await req.json() as {
      quizId: string;
      answers: SubmittedAnswer[];
    };

    const existing = await prisma.quizAttempt.findUnique({
      where: { quiz_id_student_id: { quiz_id: quizId, student_id: student.id } },
    });
    if (existing) return NextResponse.json({ error: "Already attempted" }, { status: 400 });

    const questions: QuizQuestion[] = await prisma.question.findMany({
      where: { quiz_id: quizId },
      select: {
        id: true,
        correct_answer: true,
      },
    });

    let score = 0;
    const answerData = answers.map((a: SubmittedAnswer) => {
      const question = questions.find((q) => q.id === a.questionId);
      const is_correct = question?.correct_answer === a.answer;
      if (is_correct) score++;
      return {
        question_id: a.questionId,
        answer: a.answer,
        is_correct,
      };
    });

    const attempt = await prisma.quizAttempt.create({
      data: {
        quiz_id: quizId,
        student_id: student.id,
        score,
        total: questions.length,
        answers: { create: answerData },
      },
    });

    return NextResponse.json({ score, total: questions.length, attempt });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 });
  }
}
