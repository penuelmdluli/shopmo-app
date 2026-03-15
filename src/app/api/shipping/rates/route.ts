import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const addressSchema = z.object({
  city: z.string().min(1),
  province: z.string().min(1),
  postal_code: z.string().min(1),
  country: z.string().default("South Africa"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = addressSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid address", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const now = new Date();

    const addBusinessDays = (date: Date, days: number): string => {
      const result = new Date(date);
      let added = 0;
      while (added < days) {
        result.setDate(result.getDate() + 1);
        const dayOfWeek = result.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) added++;
      }
      return result.toISOString().split("T")[0];
    };

    const rates = [
      {
        provider: "Bob Go",
        service_name: "Standard Delivery",
        price: 65,
        estimated_days: 5,
        estimated_delivery: addBusinessDays(now, 5),
        tracking_available: true,
      },
      {
        provider: "Bob Go",
        service_name: "Express Delivery",
        price: 99,
        estimated_days: 2,
        estimated_delivery: addBusinessDays(now, 2),
        tracking_available: true,
      },
      {
        provider: "The Courier Guy",
        service_name: "Standard Delivery",
        price: 85,
        estimated_days: 3,
        estimated_delivery: addBusinessDays(now, 3),
        tracking_available: true,
      },
      {
        provider: "Pargo",
        service_name: "Pickup Point",
        price: 45,
        estimated_days: 5,
        estimated_delivery: addBusinessDays(now, 5),
        tracking_available: true,
        pickup_point: {
          code: "PGO-PTA-001",
          name: "Pargo @ PEP Pretoria CBD",
          address: "234 Church Street, Pretoria Central, 0002",
          lat: -25.7479,
          lng: 28.1879,
        },
      },
      {
        provider: "Aramex",
        service_name: "International Shipping",
        price: 199,
        estimated_days: 7,
        estimated_delivery: addBusinessDays(now, 7),
        tracking_available: true,
      },
    ];

    return NextResponse.json({ rates });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
