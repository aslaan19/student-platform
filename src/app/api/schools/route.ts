import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const schools = await prisma.school.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      language: true,
      created_at: true,
      _count: { select: { students: true } },
    },
    orderBy: { created_at: "asc" },
  });

  return NextResponse.json({ schools });
}