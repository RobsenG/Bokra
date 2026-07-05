import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const secretKey = process.env.CHAPA_SECRET_KEY;
  const callbackUrl = process.env.CHAPA_CALLBACK_URL;
  const nextauthUrl = process.env.NEXTAUTH_URL;

  console.log("[Chapa Debug] Secret key starts with:", secretKey?.substring(0, 15));
  console.log("[Chapa Debug] Is mock?", !secretKey || secretKey.startsWith("CHAPA-STUB"));
  console.log("[Chapa Debug] CHAPA_CALLBACK_URL:", callbackUrl);
  console.log("[Chapa Debug] NEXTAUTH_URL:", nextauthUrl);

  const isMock = !secretKey || secretKey.startsWith("CHAPA-STUB");

  if (isMock) {
    return NextResponse.json({
      status: "MOCK",
      message: "Using mock — CHAPA_SECRET_KEY starts with CHAPA-STUB or is missing",
      key_prefix: secretKey?.substring(0, 15) ?? "undefined",
    });
  }

  // Try to actually call Chapa API with a minimal test
  try {
    const res = await fetch("https://api.chapa.co/v1/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: "100",
        currency: "ETB",
        email: "testuser@gmail.com",
        first_name: "Test",
        last_name: "User",
        tx_ref: `debug-test-${Date.now()}`,
        callback_url: `${callbackUrl || nextauthUrl}/api/payments/webhook`,
        return_url: `${nextauthUrl || "http://localhost:3000"}/payment/success`,
        customization: { title: "Bokra Stay Pay" },
      }),
    });

    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch { json = text; }

    return NextResponse.json({
      status: res.ok ? "SUCCESS" : "CHAPA_ERROR",
      http_status: res.status,
      key_prefix: secretKey?.substring(0, 15),
      callback_url: `${callbackUrl || nextauthUrl}/api/payments/webhook`,
      return_url: `${nextauthUrl}/payment/success`,
      chapa_response: json,
    });
  } catch (err: any) {
    return NextResponse.json({
      status: "NETWORK_ERROR",
      error: err.message,
      key_prefix: secretKey?.substring(0, 15),
    });
  }
}
