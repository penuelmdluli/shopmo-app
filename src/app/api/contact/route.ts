import { NextRequest, NextResponse } from "next/server";
import { notifyOwnerAlert } from "@/lib/email/notifications";

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    await notifyOwnerAlert(
      `Contact Form: ${subject || "General Inquiry"}`,
      `From: ${name} (${email})\n\nSubject: ${subject || "General"}\n\n${message}`,
      "info"
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Contact] Error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
