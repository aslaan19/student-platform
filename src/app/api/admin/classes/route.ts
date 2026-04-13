import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const classes = await prisma.class.findMany({
    include: {
      teacher: { include: { profile: true } },
      students: { include: { profile: true } },
    },
    orderBy: { created_at: "desc" },
  });
  return NextResponse.json(classes);
}

export async function POST(req: Request) {
  try {
    const { name, teacherId } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Class name is required" }, { status: 400 });
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        ...(teacherId && { teacher: { connect: { id: teacherId } } }),
      },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create class" }, { status: 500 });
  }
}