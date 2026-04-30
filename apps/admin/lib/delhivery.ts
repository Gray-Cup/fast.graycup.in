const DELHIVERY_TOKEN = process.env.DELHIVERY_API_TOKEN;
const DELHIVERY_ENV = process.env.DELHIVERY_ENV || "sandbox";

const BASE_URL =
  DELHIVERY_ENV === "production"
    ? "https://track.delhivery.com"
    : "https://staging-express.delhivery.com";

export interface DelhiveryShipment {
  orderRef: string;
  customerName: string;
  customerPhone: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
  productDesc: string;
  totalAmount: number;
  weightKg: number;
}

export interface DelhiveryResponse {
  waybill?: string;
  error?: string;
  success: boolean;
}

export async function getPincodeDetails(
  pincode: string
): Promise<{ city: string; state: string } | null> {
  if (!DELHIVERY_TOKEN) return null;
  try {
    const res = await fetch(
      `${BASE_URL}/c/api/pin-codes/json/?filter_codes=${pincode}`,
      { headers: { Authorization: `Token ${DELHIVERY_TOKEN}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const pin = data?.delivery_codes?.[0]?.postal_code;
    if (!pin) return null;
    return {
      city: pin.city || "",
      state: pin.state_code || "",
    };
  } catch {
    return null;
  }
}

export async function createShipment(
  shipment: DelhiveryShipment
): Promise<DelhiveryResponse> {
  if (!DELHIVERY_TOKEN) {
    return { success: false, error: "DELHIVERY_API_TOKEN not configured" };
  }

  const pickupLocation = process.env.DELHIVERY_PICKUP_NAME || "Gray Cup Pickup";

  const payload = {
    shipments: [
      {
        name: shipment.customerName,
        add: shipment.address,
        pin: shipment.pincode,
        city: shipment.city,
        state: shipment.state,
        country: "India",
        phone: shipment.customerPhone,
        order: shipment.orderRef,
        payment_mode: "Prepaid",
        return_pin: "131030",
        return_city: "Sonipat",
        return_phone: "8527914317",
        return_add: "FF122, Rodeo Drive Mall, GT Road, TDI City, Kundli, Sonipat, Haryana, 131030",
        return_name: "Gray Cup Enterprises",
        return_email: "arjun@graycup.in",
        return_state: "Haryana",
        return_country: "India",
        products_desc: shipment.productDesc,
        cod_amount: "",
        order_date: new Date().toISOString().split("T")[0],
        total_amount: String(shipment.totalAmount),
        seller_add: "FF122, Rodeo Drive Mall, GT Road, TDI City, Kundli, Sonipat, Haryana, 131030",
        seller_name: "Gray Cup Enterprises",
        seller_inv: shipment.orderRef,
        quantity: "1",
        shipment_width: "12",
        shipment_height: "6",
        weight: String(shipment.weightKg),
        shipment_length: "18",
        shipping_mode: "Surface",
        address_type: "home",
      },
    ],
    pickup_location: { name: pickupLocation },
  };

  try {
    const res = await fetch(`${BASE_URL}/api/cmu/create.json`, {
      method: "POST",
      headers: {
        Authorization: `Token ${DELHIVERY_TOKEN}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `format=json&data=${encodeURIComponent(JSON.stringify(payload))}`,
    });

    const data = await res.json();

    if (data?.packages?.[0]?.waybill) {
      return { success: true, waybill: data.packages[0].waybill };
    }

    const errMsg =
      data?.packages?.[0]?.remarks ||
      data?.rmk ||
      JSON.stringify(data);
    return { success: false, error: errMsg };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function trackShipment(waybill: string) {
  if (!DELHIVERY_TOKEN) return null;
  try {
    const res = await fetch(
      `${BASE_URL}/api/v1/packages/json/?waybill=${waybill}`,
      { headers: { Authorization: `Token ${DELHIVERY_TOKEN}` } }
    );
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

export async function trackMultipleShipments(waybills: string[]): Promise<Record<string, { status: string; statusType: string; location: string; updatedAt: string }>> {
  if (!DELHIVERY_TOKEN || waybills.length === 0) return {};
  try {
    const res = await fetch(
      `${BASE_URL}/api/v1/packages/json/?waybill=${waybills.join(",")}`,
      { headers: { Authorization: `Token ${DELHIVERY_TOKEN}` } }
    );
    if (!res.ok) return {};
    const data = await res.json();
    const result: Record<string, { status: string; statusType: string; location: string; updatedAt: string }> = {};
    for (const item of data?.ShipmentData || []) {
      const s = item?.Shipment;
      if (s?.Waybill) {
        result[s.Waybill] = {
          status: s.Status || "",
          statusType: s.StatusType || s.StatusCode || "",
          location: s.StatusLocation || "",
          updatedAt: s.StatusDateTime || "",
        };
      }
    }
    return result;
  } catch {
    return {};
  }
}

// Maps Delhivery StatusType to our internal order status
export function mapDelhiveryStatus(statusType: string): string | null {
  switch (statusType?.toUpperCase()) {
    case "DL": return "DELIVERED";
    case "RT":
    case "DTO": return "RETURNED";
    default: return null;
  }
}

export async function cancelShipment(waybill: string): Promise<{ success: boolean; error?: string }> {
  if (!DELHIVERY_TOKEN) return { success: false, error: "DELHIVERY_API_TOKEN not configured" };
  try {
    const res = await fetch(`${BASE_URL}/api/p/edit`, {
      method: "POST",
      headers: {
        Authorization: `Token ${DELHIVERY_TOKEN}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `format=json&data=${encodeURIComponent(JSON.stringify({ waybill, cancellation: "true" }))}`,
    });
    const data = await res.json();
    if (data?.status === "Success" || data?.rmk?.toLowerCase().includes("cancel")) {
      return { success: true };
    }
    return { success: false, error: data?.rmk || JSON.stringify(data) };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}