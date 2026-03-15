import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { amount, orderId, items, customerEmail } = await req.json();

    if (!amount || amount < 100) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const yocoKey = process.env.YOCO_SECRET_KEY;
    if (!yocoKey) {
      // Fallback for demo — return mock checkout URL
      return NextResponse.json({
        redirectUrl: `/checkout/success?order=${orderId || "SM-DEMO"}&status=paid`,
        checkoutId: `chk_demo_${Date.now()}`,
        demo: true,
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://shopmoo.co.za";

    const response = await fetch("https://payments.yoco.com/api/checkouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${yocoKey}`,
      },
      body: JSON.stringify({
        amount, // in cents
        currency: "ZAR",
        successUrl: `${baseUrl}/checkout/success?order=${orderId}`,
        failureUrl: `${baseUrl}/checkout?error=payment_failed`,
        cancelUrl: `${baseUrl}/cart`,
        metadata: {
          orderId,
          customerEmail: customerEmail || "",
        },
        lineItems: items?.map((item: { title: string; quantity: number; price: number }) => ({
          displayName: item.title,
          quantity: item.quantity,
          pricingDetails: { price: item.price },
        })),
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Yoco checkout error:", err);
      return NextResponse.json({ error: "Payment gateway error" }, { status: 502 });
    }

    const data = await response.json();
    return NextResponse.json({
      redirectUrl: data.redirectUrl,
      checkoutId: data.id,
    });
  } catch (error) {
    console.error("Yoco checkout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
