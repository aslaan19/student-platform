// api/owner/schools/route.ts
import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { prisma } from "../../../../lib/prisma";


async function requireOwner() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!profile || profile.role !== "OWNER") return null;
  return profile;
}

export async function GET() {
  const profile = await requireOwner();
  if (!profile) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const schools = await prisma.school.findMany({
    include: {
      admin: { select: { id: true, full_name: true } },
      _count: {
        select: {
          teachers: true,
          students: true,
          classes: true,
        },
      },
    },
    orderBy: { created_at: "asc" },
  });

  return NextResponse.json({ schools });
}