import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const webhookId = req.headers.get("webhook-id");
    const webhookTimestamp = req.headers.get("webhook-timestamp");
    const webhookSignature = req.headers.get("webhook-signature");

    // Verify signature if webhook secret is configured
    const secret = process.env.YOCO_WEBHOOK_SECRET;
    if (secret && webhookId && webhookTimestamp && webhookSignature) {
      const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`;
      const secretBytes = Buffer.from(secret.replace("whsec_", ""), "base64");
      const expectedSig = crypto
        .createHmac("sha256", secretBytes)
        .update(signedContent)
        .digest("base64");

      const receivedSig = webhookSignature.split(" ")[0]?.replace("v1,", "");

      if (!receivedSig || !crypto.timingSafeEqual(
        Buffer.from(expectedSig),
        Buffer.from(receivedSig)
      )) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const event = JSON.parse(rawBody);
    console.log(`[Yoco Webhook] ${event.type}:`, JSON.stringify(event.payload?.metadata));

    if (event.type === "payment.succeeded") {
      const { metadata } = event.payload || {};
      const orderId = metadata?.orderId;

      // TODO: Update order status in Supabase
      // await supabase.from("customer_orders").update({ status: "paid", payment_id: event.payload.id }).eq("order_number", orderId);

      console.log(`[Yoco] Payment succeeded for order ${orderId}`);
    }

    if (event.type === "payment.failed") {
      const { metadata } = event.payload || {};
      console.log(`[Yoco] Payment failed for order ${metadata?.orderId}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Yoco Webhook Error]:", error);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }
}
