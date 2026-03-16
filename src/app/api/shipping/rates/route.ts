import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getQuotes } from "@/lib/shipping/courier-guy";

const addressSchema = z.object({
  street_address: z.string().optional().default(""),
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

    const { street_address, city, province, postal_code } = parsed.data;
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

    // Try to get live rates from The Courier Guy
    if (process.env.COURIER_GUY_API_KEY) {
      try {
        const tcgRates = await getQuotes({
          street_address: street_address || "1 Main Road",
          city,
          province,
          postal_code,
        });

        const rates = tcgRates.map((rate) => ({
          provider: "The Courier Guy",
          service_name: rate.service_level.name,
          service_code: rate.service_level.code,
          price: Math.round(rate.rate.charge * 100) / 100,
          estimated_days: Math.ceil(
            (new Date(rate.delivery_date_to).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          ),
          estimated_delivery: rate.delivery_date_to.split("T")[0],
          tracking_available: true,
        }));

        // Add Pargo pickup option
        rates.push({
          provider: "Pargo",
          service_name: "Pickup Point",
          service_code: "pargo_pickup",
          price: 45,
          estimated_days: 5,
          estimated_delivery: addBusinessDays(now, 5),
          tracking_available: true,
        });

        return NextResponse.json({
          rates: rates.sort((a, b) => a.price - b.price),
          live: true,
        });
      } catch (err) {
        console.error("[Shipping] Live rate fetch failed, using fallback:", err);
      }
    }

    // Fallback: Static rates
    const rates = [
      {
        provider: "The Courier Guy",
        service_name: "Economy",
        service_code: "ECO",
        price: 65,
        estimated_days: 5,
        estimated_delivery: addBusinessDays(now, 5),
        tracking_available: true,
      },
      {
        provider: "The Courier Guy",
        service_name: "Standard",
        service_code: "NFS",
        price: 85,
        estimated_days: 3,
        estimated_delivery: addBusinessDays(now, 3),
        tracking_available: true,
      },
      {
        provider: "The Courier Guy",
        service_name: "Express (Next Day)",
        service_code: "ONX",
        price: 129,
        estimated_days: 1,
        estimated_delivery: addBusinessDays(now, 1),
        tracking_available: true,
      },
      {
        provider: "Pargo",
        service_name: "Pickup Point",
        service_code: "pargo_pickup",
        price: 45,
        estimated_days: 5,
        estimated_delivery: addBusinessDays(now, 5),
        tracking_available: true,
      },
    ];

    return NextResponse.json({ rates, live: false });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
