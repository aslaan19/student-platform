// api/owner/schools/[id]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { prisma } from "../../../../../lib/prisma";
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;
    const { language } = await req.json();

    if (!["ar", "sq"].includes(language)) {
      return NextResponse.json({ error: "Invalid language" }, { status: 400 });
    }

    const school = await prisma.school.update({
      where: { id },
      data: { language },
    });

    return NextResponse.json({ school });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update language" }, { status: 500 });
  }
}
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