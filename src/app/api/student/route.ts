import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const student = await prisma.student.findUnique({
      where: { profile_id: user.id },
      include: {
        profile: true,
        class: {
          include: {
            teacher: { include: { profile: true } },
            students: { include: { profile: true } },
          },
        },
      },
    });

    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    return NextResponse.json(student);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch student data" }, { status: 500 });
  }
}