"use server";
import { NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/school-admin-auth";
import { prisma } from "@/lib/prisma";

// PUT /api/school-admin/roadmap/stages/[id]
export async function PUT(
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
  const { title, order } = body;

  if (!title?.trim() && typeof order !== "number") {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const updated = await prisma.roadmapStage.update({
    where: { id },
    data: {
      ...(title?.trim() && { title: title.trim() }),
      ...(typeof order === "number" && { order }),
    },
  });

  return NextResponse.json({ stage: updated });
}

// DELETE /api/school-admin/roadmap/stages/[id]
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireSchoolAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  const stage = await prisma.roadmapStage.findFirst({
    where: { id, roadmap: { school_id: auth.school.id } },
  });
  if (!stage) return NextResponse.json({ error: "Stage not found" }, { status: 404 });

  await prisma.roadmapStage.delete({ where: { id } });

  return NextResponse.json({ success: true });
}