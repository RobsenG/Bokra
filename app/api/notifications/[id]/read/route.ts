import { auth } from "@/lib/auth";
import { markNotificationRead } from "@/lib/notifications";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await markNotificationRead(id);

  return NextResponse.json({ success: true });
}
