import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { createAdminClient } from "../../../../lib/supabase/admin";

export async function GET() {
  const teachers = await prisma.teacher.findMany({
    include: {
      profile: true,
      classes: true,
    },
    orderBy: { created_at: "desc" },
  });
  return NextResponse.json(teachers);
}

export async function POST(req: Request) {
  try {
    const supabase = createAdminClient();
    const { fullName, email, password } = await req.json();

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // 2. Create profile
    await prisma.profile.create({
      data: { id: userId, full_name: fullName, role: "TEACHER" },
    });

    // 3. Create teacher
    const teacher = await prisma.teacher.create({
      data: { profile_id: userId },
    });

    return NextResponse.json(teacher, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create teacher" }, { status: 500 });
  }
}
