import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function PATCH(req: Request) {
  try {
    const { studentId, classId } = await req.json();

    if (!studentId) {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: classId
        ? { class: { connect: { id: classId } } }
        : { class: { disconnect: true } },
    });

    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to assign student" }, { status: 500 });
  }
}