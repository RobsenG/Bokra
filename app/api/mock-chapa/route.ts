import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tx_ref = searchParams.get("tx_ref") || "";
  const amount = searchParams.get("amount") || "";
  const return_url = searchParams.get("return_url") || "";

  // Redirect to the visual simulator page
  const redirectUrl = new URL("/mock-chapa", req.url);
  redirectUrl.searchParams.set("tx_ref", tx_ref);
  redirectUrl.searchParams.set("amount", amount);
  redirectUrl.searchParams.set("return_url", return_url);

  return NextResponse.redirect(redirectUrl.toString());
}
