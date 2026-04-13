import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
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

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { classId, content } = await req.json();

    if (!classId || !content) {
      return NextResponse.json({ error: "classId and content are required" }, { status: 400 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { profile_id: user.id },
    });

    if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 });

    const announcement = await prisma.announcement.create({
      data: {
        content,
        class_id: classId,
        teacher_id: teacher.id,
      },
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    await prisma.announcement.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 });
  }
}