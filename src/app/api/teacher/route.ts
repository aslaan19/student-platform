import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const teacher = await prisma.teacher.findUnique({
      where: { profile_id: user.id },
      include: {
        profile: true,
        classes: {
          include: {
            students: {
              include: { profile: true },
            },
          },
        },
      },
    });

    if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 });

    return NextResponse.json(teacher);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch teacher data" }, { status: 500 });
  }
}