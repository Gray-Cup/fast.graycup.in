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

/** Lookup city and state from a pincode via Delhivery */
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

/** Create a prepaid shipment on Delhivery */
export async function createShipment(
  shipment: DelhiveryShipment
): Promise<DelhiveryResponse> {
  if (!DELHIVERY_TOKEN) {
    return { success: false, error: "DELHIVERY_API_TOKEN not configured" };
  }

  const pickupLocation = process.env.DELHIVERY_PICKUP_NAME || "Primary";
  const returnPhone = process.env.DELHIVERY_RETURN_PHONE || "";
  const returnAddress = process.env.DELHIVERY_RETURN_ADDRESS || "";
  const returnCity = process.env.DELHIVERY_RETURN_CITY || "";
  const returnState = process.env.DELHIVERY_RETURN_STATE || "";
  const returnPincode = process.env.DELHIVERY_RETURN_PINCODE || "";

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
        return_pin: returnPincode,
        return_city: returnCity,
        return_phone: returnPhone,
        return_add: returnAddress,
        return_name: "Gray Cup (Fast)",
        return_email: process.env.DELHIVERY_RETURN_EMAIL || "",
        return_state: returnState,
        return_country: "India",
        products_desc: shipment.productDesc,
        cod_amount: "",
        order_date: new Date().toISOString().split("T")[0],
        total_amount: String(shipment.totalAmount),
        seller_add: returnAddress,
        seller_name: "Gray Cup (Fast)",
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

/** Get tracking info for a waybill */
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
