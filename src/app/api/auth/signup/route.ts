// api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const { full_name, email, password } = await req.json();

    if (!full_name || !email || !password) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }, { status: 400 });
    }

    const supabase = await createClient();

    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, role: "STUDENT" },
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: "فشل إنشاء المستخدم" }, { status: 500 });
    }

    const userId = authData.user.id;

    // Step 2: Create profile via Prisma (server-side, bypasses RLS)
    await prisma.profile.upsert({
      where: { id: userId },
      update: { full_name, role: "STUDENT" },
      create: { id: userId, full_name, role: "STUDENT" },
    });

    // Step 3: Create student row
    await prisma.student.upsert({
      where: { profile_id: userId },
      update: {},
      create: {
        profile_id: userId,
        onboarding_status: "PENDING_INTAKE",
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}