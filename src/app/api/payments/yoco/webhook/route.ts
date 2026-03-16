import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceClient } from "@/lib/supabase/service";
import { notifyOwnerAlert } from "@/lib/email/notifications";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const webhookId = req.headers.get("webhook-id");
    const webhookTimestamp = req.headers.get("webhook-timestamp");
    const webhookSignature = req.headers.get("webhook-signature");

    // Verify signature when webhook secret is configured
    const secret = process.env.YOCO_WEBHOOK_SECRET;
    if (secret) {
      if (!webhookId || !webhookTimestamp || !webhookSignature) {
        return NextResponse.json({ error: "Missing webhook headers" }, { status: 401 });
      }
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

    const supabase = await createServiceClient();

    if (event.type === "payment.succeeded") {
      const { metadata } = event.payload || {};
      const orderId = metadata?.orderId;
      const paymentId = event.payload?.id;

      if (orderId) {
        // Update customer_orders status to paid
        const { error: orderError } = await supabase
          .from("customer_orders")
          .update({
            status: "paid",
            payment_status: "paid",
            payment_reference: paymentId,
            payment_provider: "yoco",
            paid_at: new Date().toISOString(),
          })
          .eq("order_number", orderId);

        if (orderError) {
          console.error("[Yoco] Failed to update customer order:", orderError);
        } else {
          console.log(`[Yoco] Order ${orderId} marked as paid`);
        }

        // Also update SellBot orders table
        const { error: sellbotError } = await supabase
          .from("orders")
          .update({
            status: "paid",
            payment_status: "paid",
          })
          .eq("platform_order_id", orderId)
          .eq("platform", "shopmo");

        if (sellbotError) {
          console.error("[Yoco] Failed to update SellBot order:", sellbotError);
        }

        // Update order items status
        const { data: customerOrder } = await supabase
          .from("customer_orders")
          .select("id")
          .eq("order_number", orderId)
          .single();

        if (customerOrder) {
          await supabase
            .from("customer_order_items")
            .update({ status: "processing" })
            .eq("customer_order_id", customerOrder.id);
        }
      }
    }

    if (event.type === "payment.failed") {
      const { metadata } = event.payload || {};
      const orderId = metadata?.orderId;

      if (orderId) {
        await supabase
          .from("customer_orders")
          .update({
            payment_status: "failed",
            status: "cancelled",
          })
          .eq("order_number", orderId);

        // Update SellBot orders too
        await supabase
          .from("orders")
          .update({
            payment_status: "failed",
            status: "cancelled",
          })
          .eq("platform_order_id", orderId)
          .eq("platform", "shopmo");

        console.log(`[Yoco] Payment failed for order ${orderId}`);

        // Alert owner about failed payment
        notifyOwnerAlert(
          `Payment Failed — Order ${orderId}`,
          `A payment attempt failed for order ${orderId}.\n\nThe order has been cancelled. The customer may retry or need assistance.\n\nPayment Provider: Yoco\nEvent: ${event.type}`,
          "warning"
        ).catch((err) => console.error("[Yoco] Failed payment alert email error:", err));
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Yoco Webhook Error]:", error);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }
}
