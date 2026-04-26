"use server";
import { NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/school-admin-auth";
import { prisma } from "@/lib/prisma";

// GET /api/school-admin/roadmap
export async function GET() {
  const auth = await requireSchoolAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roadmap = await prisma.roadmap.findUnique({
    where: { school_id: auth.school.id },
    include: {
      stages: {
        orderBy: { order: "asc" },
        include: {
          modules: {
            orderBy: { order: "asc" },
            include: {
              questions: {
                orderBy: { order: "asc" },
                include: { options: { orderBy: { order: "asc" } } },
              },
              _count: { select: { attempts: true } },
            },
          },
        },
      },
    },
  });

  return NextResponse.json({ roadmap });
}

// POST /api/school-admin/roadmap — create roadmap (idempotent)
export async function POST(req: Request) {
  const auth = await requireSchoolAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.roadmap.findUnique({
    where: { school_id: auth.school.id },
  });
  if (existing) return NextResponse.json({ roadmap: existing });

  const body = await req.json().catch(() => ({}));
  const title = body.title?.trim() || "بنك الأسئلة";

  const roadmap = await prisma.roadmap.create({
    data: { school_id: auth.school.id, title },
  });

  return NextResponse.json({ roadmap }, { status: 201 });
}