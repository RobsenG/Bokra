import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found", email }, { status: 404 });
    if (!user.password) return NextResponse.json({ error: "No password (Google-only account)" }, { status: 400 });

    const valid = await bcrypt.compare(password, user.password);
    return NextResponse.json({
      valid,
      email: user.email,
      role: user.role,
      hashPrefix: user.password.slice(0, 20),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
