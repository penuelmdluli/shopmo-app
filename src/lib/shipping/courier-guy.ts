/**
 * The Courier Guy (TCG) API Integration
 * Docs: https://developer.thecourierguy.co.za/
 * Priority #1 courier for ShopMO
 */

const TCG_BASE_URL = "https://api.shiplogic.com/v2";

interface TCGAddress {
  street_address: string;
  city: string;
  zone: string; // province
  code: string; // postal code
  country: string;
  type: "residential" | "business";
  company?: string;
  local_area?: string;
}

interface TCGParcel {
  submitted_length_cm: number;
  submitted_width_cm: number;
  submitted_height_cm: number;
  submitted_weight_kg: number;
  description?: string;
}

interface TCGRateResponse {
  rates: Array<{
    rate: number;
    rate_excluding_vat: number;
    service_level: {
      id: number;
      code: string;
      name: string;
      description: string;
      delivery_date_from: string;
      delivery_date_to: string;
      collection_date: string;
      collection_cut_off_time: string;
    };
    base_rate: {
      charge: number;
    };
    surcharges: unknown[];
    charged_weight: number;
  }>;
}

interface TCGShipmentResponse {
  id: string;
  tracking_reference: string;
  short_tracking_reference: string;
  status: string;
  collection_address: TCGAddress;
  delivery_address: TCGAddress;
  parcels: Array<{
    parcel_description: string;
    tracking_reference: string;
    waybill_number: string;
  }>;
}

interface TCGTrackingResponse {
  shipment_id: string;
  tracking_reference: string;
  status: string;
  tracking_events: Array<{
    status: string;
    description: string;
    date: string;
    location?: string;
  }>;
}

function getApiKey(): string {
  const key = process.env.COURIER_GUY_API_KEY;
  if (!key) throw new Error("COURIER_GUY_API_KEY not configured");
  return key;
}

// ShopMO warehouse/origin address (Pretoria)
const ORIGIN_ADDRESS: TCGAddress = {
  street_address: process.env.SHOPMO_WAREHOUSE_ADDRESS || "123 Main Road",
  city: process.env.SHOPMO_WAREHOUSE_CITY || "Pretoria",
  zone: process.env.SHOPMO_WAREHOUSE_PROVINCE || "Gauteng",
  code: process.env.SHOPMO_WAREHOUSE_POSTAL || "0001",
  country: "ZA",
  type: "business",
  company: "ShopMO",
};

/**
 * Get shipping rates from The Courier Guy
 */
export async function getQuotes(
  destination: {
    street_address: string;
    city: string;
    province: string;
    postal_code: string;
    country?: string;
  },
  parcels: TCGParcel[] = [{ submitted_length_cm: 30, submitted_width_cm: 20, submitted_height_cm: 15, submitted_weight_kg: 2 }]
): Promise<TCGRateResponse["rates"]> {
  const apiKey = getApiKey();

  const response = await fetch(`${TCG_BASE_URL}/rates`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      collection_address: ORIGIN_ADDRESS,
      delivery_address: {
        street_address: destination.street_address,
        city: destination.city,
        zone: destination.province,
        code: destination.postal_code,
        country: destination.country || "ZA",
        type: "residential",
      },
      parcels,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("[TCG] Rate request failed:", response.status, error);
    throw new Error(`TCG rate request failed: ${response.status}`);
  }

  const data: TCGRateResponse = await response.json();
  return data.rates;
}

/**
 * Create a shipment (book a collection) with The Courier Guy
 */
export async function createShipment(
  orderNumber: string,
  destination: {
    full_name: string;
    phone: string;
    street_address: string;
    suburb?: string;
    city: string;
    province: string;
    postal_code: string;
    country?: string;
  },
  serviceCode: string = "ECO",
  parcels: TCGParcel[] = [{ submitted_length_cm: 30, submitted_width_cm: 20, submitted_height_cm: 15, submitted_weight_kg: 2 }]
): Promise<TCGShipmentResponse> {
  const apiKey = getApiKey();

  const response = await fetch(`${TCG_BASE_URL}/shipments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      collection_address: ORIGIN_ADDRESS,
      collection_contact: {
        name: "ShopMO Warehouse",
        mobile_number: process.env.SHOPMO_WAREHOUSE_PHONE || "0792572466",
        email: process.env.SHOPMO_WAREHOUSE_EMAIL || "warehouse@shopmoo.co.za",
      },
      delivery_address: {
        street_address: destination.street_address,
        local_area: destination.suburb || "",
        city: destination.city,
        zone: destination.province,
        code: destination.postal_code,
        country: destination.country || "ZA",
        type: "residential",
      },
      delivery_contact: {
        name: destination.full_name,
        mobile_number: destination.phone,
      },
      parcels: parcels.map((p, i) => ({
        ...p,
        description: `ShopMO Order ${orderNumber} - Parcel ${i + 1}`,
      })),
      opt_in_rates: [serviceCode],
      opt_in_time_based_rates: [],
      special_instructions_collection: `ShopMO Order: ${orderNumber}`,
      special_instructions_delivery: `ShopMO Order: ${orderNumber}`,
      declared_value: 0,
      customer_reference: orderNumber,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("[TCG] Shipment creation failed:", response.status, error);
    throw new Error(`TCG shipment creation failed: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Track a shipment by tracking reference
 */
export async function trackShipment(trackingReference: string): Promise<TCGTrackingResponse> {
  const apiKey = getApiKey();

  const response = await fetch(`${TCG_BASE_URL}/tracking/${trackingReference}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("[TCG] Tracking failed:", response.status, error);
    throw new Error(`TCG tracking failed: ${response.status}`);
  }

  return await response.json();
}

/**
 * Cancel a shipment
 */
export async function cancelShipment(shipmentId: string): Promise<boolean> {
  const apiKey = getApiKey();

  const response = await fetch(`${TCG_BASE_URL}/shipments/${shipmentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  return response.ok;
}

/**
 * Get available service levels for a given route
 */
export function mapServiceCode(serviceName: string): string {
  const serviceMap: Record<string, string> = {
    "Economy": "ECO",
    "Standard": "NFS",
    "Express": "ONX",
    "Overnight": "ONX",
    "Same Day": "SDX",
    "bob_go_standard": "ECO",
    "bob_go_express": "ONX",
    "the_courier_guy": "NFS",
    "the_courier_guy_express": "ONX",
    "the_courier_guy_economy": "ECO",
  };
  return serviceMap[serviceName] || "ECO";
}
