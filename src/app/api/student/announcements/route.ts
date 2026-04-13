import { NextResponse } from "next/server";

import { prisma } from "../../../../lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");

    if (!classId) return NextResponse.json({ error: "classId is required" }, { status: 400 });

    const announcements = await prisma.announcement.findMany({
      where: { class_id: classId },
      include: { teacher: { include: { profile: true } } },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
  }
}