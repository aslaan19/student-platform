import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const student = await prisma.student.findUnique({
      where: { profile_id: user.id },
    });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });
    if (!student.class_id) return NextResponse.json([]);

    const quizzes = await prisma.quiz.findMany({
      where: { class_id: student.class_id },
      include: {
        questions: {
          include: { options: { orderBy: { order: "asc" } } },
          orderBy: { order: "asc" },
        },
        attempts: {
          where: { student_id: student.id },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ quizzes, studentId: student.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 });
  }
}