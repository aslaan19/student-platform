// api/school-admin/students/[id]/assign-class/route.ts
import { NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/school-admin-auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireSchoolAdmin();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: studentId } = await context.params;
  const { class_id } = await req.json();

  const student = await prisma.student.update({
    where: { id: studentId },
    data: {
      class_id: class_id || null,
      ...(class_id ? { onboarding_status: "CLASS_ASSIGNED" } : {}),
    },
  });

  return NextResponse.json({ student });
}