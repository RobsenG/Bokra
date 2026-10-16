import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const usersCount = await prisma.user.count();
    return NextResponse.json({ success: true, message: "Database connected", usersCount });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg, dbUrl: process.env.DATABASE_URL?.slice(0, 40) + "..." }, { status: 500 });
  }
}
