import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

// Assign teacher to class
export async function PATCH(req: Request) {
  try {
    const { classId, teacherId } = await req.json();

    if (!classId) {
      return NextResponse.json({ error: "classId is required" }, { status: 400 });
    }

    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: teacherId
        ? { teacher: { connect: { id: teacherId } } }
        : { teacher: { disconnect: true } },
    });

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to assign teacher" }, { status: 500 });
  }
}