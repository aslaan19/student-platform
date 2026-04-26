// api/student/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const student = await prisma.student.findUnique({
      where: { profile_id: user.id },
      include: {
        profile: { select: { full_name: true } },
        school: { select: { id: true, name: true, language: true } },
        class: {
          select: {
            id: true,
            name: true,
            teacher: {
              include: { profile: { select: { full_name: true } } },
            },
            students: {
              include: { profile: { select: { full_name: true } } },
            },
          },
        },
      },
    });

    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    return NextResponse.json({
      profile: student.profile,
      school: student.school,
      class: student.class,
      onboarding_status: student.onboarding_status,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch student" }, { status: 500 });
  }
}