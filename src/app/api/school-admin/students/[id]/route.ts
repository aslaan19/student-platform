// api/school-admin/students/[id]/route.ts
import { NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/school-admin-auth";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireSchoolAdmin();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await context.params;

  // Verify student belongs to this school
  const student = await prisma.student.findFirst({
    where: { id, school_id: auth.school.id },
    select: { id: true, profile_id: true },
  });
  if (!student)
    return NextResponse.json({ error: "Student not found" }, { status: 404 });

  const supabase = createAdminClient();
  await supabase.auth.admin.deleteUser(student.profile_id);

  return NextResponse.json({ success: true });
}