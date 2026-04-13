import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: params.id },
      include: { profile: true },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Delete auth user (cascades to profile → teacher)
    await supabase.auth.admin.deleteUser(teacher.profile_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete teacher" }, { status: 500 });
  }
}