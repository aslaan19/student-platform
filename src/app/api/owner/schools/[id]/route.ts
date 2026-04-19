// api/owner/schools/[id]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { prisma } from "../../../../../lib/prisma";

async function requireOwner() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!profile || profile.role !== "OWNER") return null;
  return profile;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const profile = await requireOwner();
  if (!profile) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const school = await prisma.school.findUnique({
    where: { id },
    include: {
      admin: { select: { id: true, full_name: true } },
      teachers: {
        include: {
          profile: { select: { id: true, full_name: true } },
          classes: { select: { id: true, name: true } },
        },
      },
      students: {
        include: {
          profile: { select: { id: true, full_name: true } },
          class: { select: { id: true, name: true } },
        },
        orderBy: { created_at: "desc" },
      },
      classes: {
        include: {
          teacher: {
            include: { profile: { select: { full_name: true } } },
          },
          _count: { select: { students: true } },
        },
      },
    },
  });

  if (!school) return NextResponse.json({ error: "School not found" }, { status: 404 });

  return NextResponse.json({ school });
}