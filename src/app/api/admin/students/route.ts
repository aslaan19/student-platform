import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const students = await prisma.student.findMany({
    include: {
      profile: true,
      class: true,
    },
    orderBy: { created_at: "desc" },
  });
  return NextResponse.json(students);
}