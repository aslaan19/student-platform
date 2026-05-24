import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { createAdminClient } from "../../../../../lib/supabase/admin";
import { requireSchoolAdmin } from "@/lib/school-admin-auth";
import { z } from "zod";

// ── PATCH /api/school-admin/teachers/[id] — activate or deactivate a teacher ──
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireSchoolAdmin();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const result = z.object({ is_active: z.boolean() }).safeParse(body);
  if (!result.success) return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });

  // Verify teacher belongs to this school
  const teacher = await prisma.teacher.findFirst({
    where: { id, school_id: auth.school.id },
    select: { profile_id: true },
  });
  if (!teacher) return NextResponse.json({ error: "المعلم غير موجود" }, { status: 404 });

  const updated = await prisma.profile.update({
    where: { id: teacher.profile_id },
    data: { is_active: result.data.is_active },
    select: { id: true, full_name: true, is_active: true },
  });
  return NextResponse.json({ profile: updated });
}

// ── DELETE /api/school-admin/teachers/[id] — permanently remove a teacher ─────
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminClient();
    const { id } = await params;
    const teacher = await prisma.teacher.findUnique({
      where: { id },
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
