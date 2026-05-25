import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const usersCount = await prisma.user.count();
    return NextResponse.json({ success: true, message: "Database connected", usersCount });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 });
  }
}
