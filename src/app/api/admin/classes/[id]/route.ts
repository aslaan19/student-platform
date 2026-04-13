import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.class.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete class" }, { status: 500 });
  }
}