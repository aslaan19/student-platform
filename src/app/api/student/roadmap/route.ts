import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// GET /api/student/roadmap
export async function GET() {
  // 1. Auth — get supabase user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 2. Resolve profile
  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });
  if (!profile || profile.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 3. Resolve student row (profile_id is the link, school_id may be null)
  const student = await prisma.student.findUnique({
    where: { profile_id: profile.id },
  });
  if (!student) {
    return NextResponse.json({ error: "Student record not found" }, { status: 404 });
  }
  if (!student.school_id) {
    return NextResponse.json({ roadmap: null }); // not assigned to a school yet
  }

  // 4. Load roadmap for the student's school
  const roadmap = await prisma.roadmap.findUnique({
    where: { school_id: student.school_id },
    include: {
      stages: {
        orderBy: { order: "asc" },
        include: {
          modules: {
            orderBy: { order: "asc" },
            include: {
              questions: {
                orderBy: { order: "asc" },
                include: {
                  options: { orderBy: { order: "asc" } },
                },
              },
              attempts: {
                where: { student_id: student.id },
                orderBy: { created_at: "desc" },
              },
            },
          },
        },
      },
    },
  });

  if (!roadmap) return NextResponse.json({ roadmap: null });

  // 5. Annotate stages/modules with lock state and progress
  let previousStagePassed = true; // stage 1 always unlocked

  const annotatedStages = roadmap.stages.map((stage) => {
    const locked = !previousStagePassed;

    const annotatedModules = stage.modules.map((mod) => {
      const passingAttempts = mod.attempts.filter((a) => a.passed);
      const latestAttempt = mod.attempts[0] ?? null;
      const passed = passingAttempts.length > 0;
      const bestScore = passed ? Math.max(...passingAttempts.map((a) => a.score)) : null;

      return {
        id: mod.id,
        title: mod.title,
        order: mod.order,
        question_count: mod.questions.length,
        // hide question content when stage is locked
        questions: locked ? [] : mod.questions,
        passed,
        best_score: bestScore,
        latest_score: latestAttempt?.score ?? null,
        latest_passed: latestAttempt?.passed ?? null,
        attempt_count: mod.attempts.length,
      };
    });

    const stagePassed =
      annotatedModules.length > 0 && annotatedModules.every((m) => m.passed);

    previousStagePassed = stagePassed;

    return {
      id: stage.id,
      title: stage.title,
      order: stage.order,
      locked,
      passed: stagePassed,
      modules: annotatedModules,
    };
  });

  return NextResponse.json({
    roadmap: {
      id: roadmap.id,
      title: roadmap.title,
      stages: annotatedStages,
    },
  });
}