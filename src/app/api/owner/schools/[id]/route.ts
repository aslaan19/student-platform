import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

async function requireOwner() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!profile || profile.role !== "OWNER") return null;
  return profile;
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const owner = await requireOwner();
  if (!owner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await context.params;

  const school = await prisma.school.findUnique({
    where: { id },
    include: {
      admin: { select: { id: true, full_name: true } },
      teachers: {
        include: {
          profile: { select: { full_name: true } },
          classes: { select: { id: true, name: true } },
        },
      },
      students: {
        include: {
          profile: { select: { full_name: true } },
          class: { select: { id: true, name: true } },
        },
      },
      classes: {
        include: {
          teacher: { include: { profile: { select: { full_name: true } } } },
          _count: { select: { students: true } },
        },
      },
    },
  });

  if (!school) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ school });
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const owner = await requireOwner();
  if (!owner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await context.params;
  const body = await req.json();

  const updateData: Record<string, unknown> = {};
  if (body.language !== undefined) updateData.language = body.language;
  if (body.description !== undefined) updateData.description = body.description?.trim() || null;
  if (body.name !== undefined) updateData.name = body.name.trim();
  if (body.admin_id !== undefined) updateData.admin_id = body.admin_id || null;
  if (body.color_primary !== undefined) updateData.color_primary = body.color_primary;
if (body.color_secondary !== undefined) updateData.color_secondary = body.color_secondary;
if (body.color_bg !== undefined) updateData.color_bg = body.color_bg;
  // Handle slug update — ensure uniqueness
  if (body.slug !== undefined) {
    const newSlug = body.slug.trim();
    const existing = await prisma.school.findFirst({ where: { slug: newSlug, NOT: { id } } });
    if (existing) {
      return NextResponse.json({ error: "هذا الرابط مستخدم بالفعل" }, { status: 400 });
    }
    updateData.slug = newSlug;
  }

  const school = await prisma.school.update({
    where: { id },
    data: updateData,
    include: { admin: { select: { id: true, full_name: true } } },
  });

  return NextResponse.json({ school });
}