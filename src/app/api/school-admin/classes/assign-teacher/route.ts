import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { classId, teacherId } = body;

    if (!classId || !teacherId) {
      return NextResponse.json(
        { error: "classId and teacherId are required" },
        { status: 400 }
      );
    }

    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: {
        teacher: { connect: { id: teacherId } },
      },
    });

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to assign teacher" }, { status: 500 });
  }
}