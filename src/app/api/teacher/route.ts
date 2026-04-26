// api/teacher/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const teacher = await prisma.teacher.findUnique({
      where: { profile_id: user.id },
      include: {
        profile: { select: { full_name: true } },
        school: { select: { id: true, name: true, language: true } },
        classes: {
          include: {
            students: {
              include: { profile: { select: { full_name: true } } },
            },
          },
        },
      },
    });

    if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 });

    return NextResponse.json({
      profile: teacher.profile,
      school: teacher.school,
      classes: teacher.classes,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch teacher" }, { status: 500 });
  }
}