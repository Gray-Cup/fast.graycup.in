const SHADOWFAX_TOKEN = process.env.SHADOWFAX_TOKEN;
const SHADOWFAX_ENV = process.env.SHADOWFAX_ENV || "staging";

const BASE_URL =
  SHADOWFAX_ENV === "production"
    ? "https://dale.shadowfax.in/api"
    : "https://dale.staging.shadowfax.in/api";

const WAREHOUSE_ADDRESS =
  process.env.SHADOWFAX_WAREHOUSE_ADDRESS ||
  "FF122, Rodeo Drive Mall, GT Road, TDI City, Kundli, Sonipat, Haryana 131030";


const SELLER_GSTIN = "06AAMCG4985H1Z4";
const SELLER_STATE = "Haryana";
const SELLER_NAME = "Gray Cup Enterprises";
const HSN_CODE = "2008"; // prepared/processed nuts & dried fruits

export interface ShadowfaxOrderInput {
  orderRef: string;
  customerName: string;
  customerPhone: string;
  address: string;
  city: string;
  pincode: string;
  productDesc: string;
  totalAmount: number;
  gstAmount: number;
}

export interface ShadowfaxResponse {
  success: boolean;
  requestId?: string;
  error?: string;
}

export async function createShadowfaxOrder(input: ShadowfaxOrderInput): Promise<ShadowfaxResponse> {
  if (!SHADOWFAX_TOKEN) return { success: false, error: "SHADOWFAX_TOKEN not configured" };

  const baseAmount = input.totalAmount - input.gstAmount;
  const halfGst = input.gstAmount / 2;

  const body = {
    client_order_number: input.orderRef,
    warehouse_address: WAREHOUSE_ADDRESS,
    destination_pincode: parseInt(input.pincode, 10),
    pickup_type: "regular",
    price: baseAmount,
    address_attributes: {
      address_line: input.address,
      city: input.city,
      pincode: parseInt(input.pincode, 10),
      name: input.customerName,
      phone_number: input.customerPhone,
    },
    skus_attributes: [
      {
        name: input.productDesc,
        price: baseAmount,
        seller_details: {
          regd_name: SELLER_NAME,
          regd_address: WAREHOUSE_ADDRESS,
          state: SELLER_STATE,
          gstin: SELLER_GSTIN,
        },
        taxes: {
          cgst_amount: halfGst,
          sgst_amount: halfGst,
          igst_amount: 0,
          total_tax_amount: input.gstAmount,
        },
        hsn_code: HSN_CODE,
        invoice_id: input.orderRef,
      },
    ],
  };

  try {
    const res = await fetch(`${BASE_URL}/v3/clients/requests`, {
      method: "POST",
      headers: {
        Authorization: `Token ${SHADOWFAX_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: JSON.stringify(data).slice(0, 300) };
    }

    if (data.client_request_id) {
      return { success: true, requestId: data.client_request_id };
    }

    return { success: false, error: data.message || JSON.stringify(data).slice(0, 300) };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function trackMultipleShadowfaxOrders(
  requestIds: string[]
): Promise<Record<string, { status: string; currentLocation: string }>> {
  if (!SHADOWFAX_TOKEN || requestIds.length === 0) return {};

  // Shadowfax bulk_query supports up to 50 at a time
  const result: Record<string, { status: string; currentLocation: string }> = {};
  const chunks: string[][] = [];
  for (let i = 0; i < requestIds.length; i += 50) chunks.push(requestIds.slice(i, i + 50));

  for (const chunk of chunks) {
    try {
      const res = await fetch(`${BASE_URL}/v4/clients/requests/bulk_query`, {
        method: "POST",
        headers: {
          Authorization: `Token ${SHADOWFAX_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ request_ids: chunk }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      for (const [requestId, histories] of Object.entries(data)) {
        const arr = (histories as any[]);
        const latest = arr?.[arr.length - 1];
        if (latest) {
          result[requestId] = {
            status: latest.status ?? latest.state ?? "",
            currentLocation: latest.current_location ?? "",
          };
        }
      }
    } catch {
      // continue with remaining chunks
    }
  }

  return result;
}

export function mapShadowfaxStatus(state: string): string | null {
  const s = state?.toLowerCase().trim() ?? "";
  if (!s) return null;

  if (["returned to client", "bag received"].includes(s)) return "DELIVERED";
  if (s === "cancelled") return "CANCELLED";
  if (["lost", "qc failed", "undelivered"].includes(s)) return "RETURNED";
  if (
    ["picked", "received", "bag in transit", "received at return dc",
     "item added to bag", "in transit for return", "bag in transit",
     "item misrouted"].includes(s)
  ) return "DISPATCHED";
  if (["assigned", "out for pickup"].includes(s)) return "PAID_DISPATCH_PENDING";

  return null;
}

export async function cancelShadowfaxOrder(
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  if (!SHADOWFAX_TOKEN) return { success: false, error: "SHADOWFAX_TOKEN not configured" };
  try {
    const res = await fetch(`${BASE_URL}/v2/clients/requests/mark_cancel`, {
      method: "POST",
      headers: {
        Authorization: `Token ${SHADOWFAX_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        request_id: requestId,
        cancel_remarks: "Cancelled By Customer",
      }),
    });
    const data = await res.json();
    if (data.responseCode === 200 || data.responseMsg?.toLowerCase().includes("cancel")) {
      return { success: true };
    }
    return { success: false, error: data.responseMsg || JSON.stringify(data) };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
