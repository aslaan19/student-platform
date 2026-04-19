// api/owner/intake-assessment/route.ts
import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { prisma } from "../../../../lib/prisma";

async function requireOwner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!profile || profile.role !== "OWNER") return null;
  return profile;
}

export async function GET() {
  const profile = await requireOwner();
  if (!profile) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const assessment = await prisma.assessment.findFirst({
    where: { type: "PLATFORM_INTAKE" },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          options: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  return NextResponse.json({ assessment });
}

export async function POST(req: Request) {
  const profile = await requireOwner();
  if (!profile) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const existing = await prisma.assessment.findFirst({
    where: { type: "PLATFORM_INTAKE" },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Platform intake assessment already exists" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const { title } = body;

  const assessment = await prisma.assessment.create({
    data: {
      title: title || "Platform Intake Assessment",
      type: "PLATFORM_INTAKE",
      school_id: null,
      is_active: true,
    },
  });

  return NextResponse.json({ assessment }, { status: 201 });
}