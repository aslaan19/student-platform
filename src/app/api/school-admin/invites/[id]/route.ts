// src/app/api/school-admin/invites/[id]/route.ts
import { NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/school-admin-auth";
import { prisma } from "@/lib/prisma";

// ── PATCH /api/school-admin/invites/[id] ───────────────────────────────────
// Disables an invite (soft delete via is_active = false).
// Only the owning school can disable it.

export async function PATCH(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireSchoolAdmin();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const existing = await prisma.invite.findUnique({
    where: { id: params.id },
    select: { id: true, school_id: true, is_active: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  if (existing.school_id !== auth.school.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!existing.is_active) {
    return NextResponse.json({ error: "Invite is already disabled" }, { status: 409 });
  }

  const updated = await prisma.invite.update({
    where: { id: params.id },
    data: { is_active: false },
    select: {
      id: true,
      is_active: true,
      updated_at: true,
    },
  });

  return NextResponse.json({ invite: updated });
}