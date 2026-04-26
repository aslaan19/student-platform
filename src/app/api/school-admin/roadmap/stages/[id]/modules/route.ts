"use server";
import { NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/school-admin-auth";
import { prisma } from "@/lib/prisma";

// POST /api/school-admin/roadmap/stages/[id]/modules
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireSchoolAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  const stage = await prisma.roadmapStage.findFirst({
    where: { id, roadmap: { school_id: auth.school.id } },
  });
  if (!stage) return NextResponse.json({ error: "Stage not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const { title } = body;
  if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const last = await prisma.roadmapModule.findFirst({
    where: { stage_id: id },
    orderBy: { order: "desc" },
  });

  const roadmapModule  = await prisma.roadmapModule.create({
    data: {
      stage_id: id,
      title: title.trim(),
      order: (last?.order ?? 0) + 1,
    },
  });

  return NextResponse.json({ module: roadmapModule }, { status: 201 });
}