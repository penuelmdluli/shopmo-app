import { Resend } from "resend";

const OWNER_EMAIL = "mdlulipenuel@gmail.com";

// Fallback from address if custom domain not set up yet
const FROM_EMAIL_RESEND = "ShopMO <onboarding@resend.dev>";

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[Email] RESEND_API_KEY not set — email notifications disabled");
    return null;
  }
  return new Resend(apiKey);
}

function getFromEmail(): string {
  // Use custom domain if configured, otherwise use Resend's default
  return process.env.EMAIL_FROM || FROM_EMAIL_RESEND;
}

// ============================================
// Order Notification Templates
// ============================================

interface OrderNotificationData {
  order_number: string;
  total: number;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  vat_amount: number;
  payment_method: string;
  shipping_method: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  address: {
    street_address: string;
    suburb?: string;
    city: string;
    province: string;
    postal_code: string;
  };
  items: {
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
}

function formatCurrency(amount: number): string {
  return `R${amount.toFixed(2)}`;
}

function buildNewOrderEmailHtml(data: OrderNotificationData): string {
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${item.product_name}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.unit_price)}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.total_price)}</td>
      </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
  <div style="background: linear-gradient(135deg, #0891b2, #06b6d4); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">New Order Received!</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px;">Order ${data.order_number}</p>
  </div>

  <div style="background: white; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
    <!-- Customer Info -->
    <div style="margin-bottom: 20px; padding: 16px; background: #f0fdfa; border-radius: 8px;">
      <h3 style="margin: 0 0 8px; color: #0891b2; font-size: 14px; text-transform: uppercase;">Customer Details</h3>
      <p style="margin: 4px 0; font-size: 14px;"><strong>${data.customer_name}</strong></p>
      ${data.customer_email ? `<p style="margin: 4px 0; font-size: 14px;">${data.customer_email}</p>` : ""}
      ${data.customer_phone ? `<p style="margin: 4px 0; font-size: 14px;">${data.customer_phone}</p>` : ""}
    </div>

    <!-- Delivery Address -->
    <div style="margin-bottom: 20px; padding: 16px; background: #f8fafc; border-radius: 8px;">
      <h3 style="margin: 0 0 8px; color: #475569; font-size: 14px; text-transform: uppercase;">Delivery Address</h3>
      <p style="margin: 4px 0; font-size: 14px;">${data.address.street_address}</p>
      ${data.address.suburb ? `<p style="margin: 4px 0; font-size: 14px;">${data.address.suburb}</p>` : ""}
      <p style="margin: 4px 0; font-size: 14px;">${data.address.city}, ${data.address.province} ${data.address.postal_code}</p>
    </div>

    <!-- Order Items -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background: #f1f5f9;">
          <th style="padding: 10px 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #64748b;">Product</th>
          <th style="padding: 10px 12px; text-align: center; font-size: 12px; text-transform: uppercase; color: #64748b;">Qty</th>
          <th style="padding: 10px 12px; text-align: right; font-size: 12px; text-transform: uppercase; color: #64748b;">Price</th>
          <th style="padding: 10px 12px; text-align: right; font-size: 12px; text-transform: uppercase; color: #64748b;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <!-- Totals -->
    <div style="border-top: 2px solid #e5e7eb; padding-top: 16px;">
      <table style="width: 100%; font-size: 14px;">
        <tr><td style="padding: 4px 0;">Subtotal</td><td style="text-align: right;">${formatCurrency(data.subtotal)}</td></tr>
        <tr><td style="padding: 4px 0;">Shipping (${data.shipping_method})</td><td style="text-align: right;">${formatCurrency(data.shipping_cost)}</td></tr>
        ${data.discount_amount > 0 ? `<tr style="color: #059669;"><td style="padding: 4px 0;">Discount</td><td style="text-align: right;">-${formatCurrency(data.discount_amount)}</td></tr>` : ""}
        <tr><td style="padding: 4px 0;">VAT (15%)</td><td style="text-align: right;">${formatCurrency(data.vat_amount)}</td></tr>
        <tr style="font-size: 18px; font-weight: bold; color: #0891b2;">
          <td style="padding: 12px 0 0;">TOTAL</td>
          <td style="text-align: right; padding: 12px 0 0;">${formatCurrency(data.total)}</td>
        </tr>
      </table>
    </div>

    <!-- Payment & Shipping -->
    <div style="margin-top: 20px; padding: 12px 16px; background: #fffbeb; border-radius: 8px; font-size: 13px;">
      <strong>Payment:</strong> ${data.payment_method.toUpperCase()} |
      <strong>Shipping:</strong> ${data.shipping_method.replace(/_/g, " ")}
    </div>

    <!-- Action -->
    <div style="text-align: center; margin-top: 24px;">
      <a href="https://sellbot.app/orders" style="display: inline-block; padding: 12px 32px; background: #0891b2; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">
        View in SellBot Dashboard
      </a>
    </div>
  </div>

  <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 16px;">
    ShopMO Automated Notification — ${new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
  </p>
</body>
</html>`;
}

// ============================================
// Public API
// ============================================

/**
 * Send owner notification when a new order is placed.
 */
export async function notifyOwnerNewOrder(data: OrderNotificationData): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.log("[Email] Would send new order notification for", data.order_number, "(email not configured)");
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: getFromEmail(),
      to: [OWNER_EMAIL],
      subject: `New Order ${data.order_number} — ${formatCurrency(data.total)} from ${data.customer_name}`,
      html: buildNewOrderEmailHtml(data),
    });

    if (error) {
      console.error("[Email] Failed to send order notification:", error);
      return false;
    }

    console.log("[Email] Owner notified about order", data.order_number);
    return true;
  } catch (err) {
    console.error("[Email] Error sending notification:", err);
    return false;
  }
}

/**
 * Send owner alert for important events (low stock, failed payments, complaints, etc.)
 */
export async function notifyOwnerAlert(
  subject: string,
  message: string,
  severity: "info" | "warning" | "critical" = "info"
): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.log("[Email] Would send alert:", subject, "(email not configured)");
    return false;
  }

  const severityColors = {
    info: "#0891b2",
    warning: "#f59e0b",
    critical: "#ef4444",
  };

  const severityLabels = {
    info: "Info",
    warning: "Warning",
    critical: "URGENT",
  };

  try {
    const { error } = await resend.emails.send({
      from: getFromEmail(),
      to: [OWNER_EMAIL],
      subject: `[${severityLabels[severity]}] ShopMO: ${subject}`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: ${severityColors[severity]}; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
    <h2 style="color: white; margin: 0;">${severityLabels[severity]}: ${subject}</h2>
  </div>
  <div style="background: white; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 14px; line-height: 1.6; color: #374151; white-space: pre-wrap;">${message}</p>
    <div style="text-align: center; margin-top: 24px;">
      <a href="https://sellbot.app" style="display: inline-block; padding: 12px 32px; background: ${severityColors[severity]}; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
        View Dashboard
      </a>
    </div>
  </div>
  <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 16px;">
    ShopMO Alert — ${new Date().toLocaleDateString("en-ZA")}
  </p>
</body>
</html>`,
    });

    if (error) {
      console.error("[Email] Failed to send alert:", error);
      return false;
    }

    console.log("[Email] Alert sent:", subject);
    return true;
  } catch (err) {
    console.error("[Email] Error sending alert:", err);
    return false;
  }
}

/**
 * Send order confirmation email to the customer.
 */
export async function sendCustomerOrderConfirmation(
  customerEmail: string,
  data: OrderNotificationData
): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.log("[Email] Would send customer confirmation to", customerEmail, "(email not configured)");
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: getFromEmail(),
      to: [customerEmail],
      subject: `Order Confirmed! ${data.order_number} — ShopMO`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
  <div style="background: linear-gradient(135deg, #0891b2, #06b6d4); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 22px;">Thank you for your order!</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">Order ${data.order_number}</p>
  </div>
  <div style="background: white; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 14px; color: #374151;">Hi ${data.customer_name},</p>
    <p style="font-size: 14px; color: #374151;">We've received your order and are getting it ready. Here's a summary:</p>

    ${data.items.map((item) => `<p style="font-size: 14px; padding: 8px 0; border-bottom: 1px solid #f1f5f9;"><strong>${item.product_name}</strong> x${item.quantity} — ${formatCurrency(item.total_price)}</p>`).join("")}

    <p style="font-size: 18px; font-weight: bold; color: #0891b2; margin-top: 16px;">Total: ${formatCurrency(data.total)}</p>

    <p style="font-size: 14px; color: #374151;">Your order will be delivered to:<br><strong>${data.address.street_address}, ${data.address.city}, ${data.address.province}</strong></p>

    <div style="text-align: center; margin-top: 24px;">
      <a href="https://shopmo.co.za/track?order=${data.order_number}" style="display: inline-block; padding: 12px 32px; background: #0891b2; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
        Track Your Order
      </a>
    </div>

    <p style="font-size: 13px; color: #94a3b8; margin-top: 24px; text-align: center;">
      Questions? Chat with our AI assistant at shopmo.co.za or reply to this email.
    </p>
  </div>
</body>
</html>`,
    });

    if (error) {
      console.error("[Email] Failed to send customer confirmation:", error);
      return false;
    }

    console.log("[Email] Customer confirmation sent to", customerEmail);
    return true;
  } catch (err) {
    console.error("[Email] Error sending customer confirmation:", err);
    return false;
  }
}
