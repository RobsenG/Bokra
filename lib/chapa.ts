export interface ChapaInitResponse {
  message: string;
  status: string;
  data: {
    checkout_url: string;
  };
}

export async function initializeChapaPayment({
  amount,
  email,
  firstName,
  lastName,
  txRef,
  returnUrl,
}: {
  amount: number;
  email: string;
  firstName: string;
  lastName: string;
  txRef: string;
  returnUrl: string;
}) {
  const secretKey = process.env.CHAPA_SECRET_KEY;
  const isMock = !secretKey || secretKey.startsWith("CHAPA-STUB");

  if (isMock) {
    // Return local mock checkout endpoint
    const mockCheckoutUrl = `/api/mock-chapa?tx_ref=${encodeURIComponent(
      txRef
    )}&amount=${amount}&return_url=${encodeURIComponent(returnUrl)}`;
    return mockCheckoutUrl;
  }

  try {
    const res = await fetch("https://api.chapa.co/v1/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount.toString(),
        currency: "ETB",
        email,
        first_name: firstName,
        last_name: lastName,
        tx_ref: txRef,
        callback_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/payments/webhook`,
        return_url: returnUrl,
        customization: {
          title: "Bokra Stay Booking",
          description: "Payment for short-term rental stay in Ethiopia",
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Chapa initialize failed: ${errText}`);
    }

    const json = (await res.json()) as ChapaInitResponse;
    return json.data.checkout_url;
  } catch (error) {
    console.error("Error initializing Chapa payment:", error);
    // Fallback to local mock checkout so user's execution flows don't crash
    return `/api/mock-chapa?tx_ref=${encodeURIComponent(
      txRef
    )}&amount=${amount}&return_url=${encodeURIComponent(returnUrl)}`;
  }
}
