"use server";
import { NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/school-admin-auth";
import { prisma } from "@/lib/prisma";

// POST /api/school-admin/roadmap/stages
export async function POST(req: Request) {
  const auth = await requireSchoolAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roadmap = await prisma.roadmap.findUnique({
    where: { school_id: auth.school.id },
  });
  if (!roadmap) return NextResponse.json({ error: "Roadmap not found. Create roadmap first." }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const { title } = body;
  if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const last = await prisma.roadmapStage.findFirst({
    where: { roadmap_id: roadmap.id },
    orderBy: { order: "desc" },
  });

  const stage = await prisma.roadmapStage.create({
    data: {
      roadmap_id: roadmap.id,
      title: title.trim(),
      order: (last?.order ?? 0) + 1,
    },
  });

  return NextResponse.json({ stage }, { status: 201 });
}