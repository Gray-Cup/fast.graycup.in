import { NextRequest, NextResponse } from "next/server";
import { generateOrderRef } from "@/lib/db";

const GST_RATE = 0.05;

interface OrderLine {
  productId: string;
  productName: string;
  variantLabel: string;
  weightGrams: number;
  quantity: number;
  price: number;
  batchId?: string | null;
}

interface OrderPayload {
  productId?: string;
  productName?: string;
  variantLabel?: string;
  weightGrams?: number;
  quantity?: number;
  amount: number;
  batchId?: string | null;
  items?: OrderLine[];
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    pincode: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: OrderPayload = await req.json();
    const { amount, customer, items } = body;
    const productId = body.productId ?? items?.[0]?.productId ?? "";
    const productName = items
      ? items.map((i) => `${i.productName} ${i.variantLabel} ×${i.quantity}`).join(", ")
      : `${body.productName} ${body.variantLabel} ×${body.quantity}`;
    const variantLabel = body.variantLabel ?? items?.map((i) => i.variantLabel).join(", ") ?? "";
    const quantity = body.quantity ?? items?.reduce((s, i) => s + i.quantity, 0) ?? 1;
    const batchId = body.batchId ?? items?.[0]?.batchId ?? null;

    if (!amount || !customer?.name || !customer?.phone || !customer?.address || !customer?.pincode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const cashfreeEnv = process.env.CASHFREE_ENV || "sandbox";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    if (!appId || !secretKey) {
      return NextResponse.json(
        { error: "Cashfree credentials not configured" },
        { status: 500 }
      );
    }

    const orderRef = await generateOrderRef();
    const gstAmt = Math.round(amount - amount / (1 + GST_RATE));

    const apiBase =
      cashfreeEnv === "production"
        ? "https://api.cashfree.com/pg"
        : "https://sandbox.cashfree.com/pg";

    const cfRes = await fetch(`${apiBase}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": "2023-08-01",
      },
      body: JSON.stringify({
        order_id: orderRef,
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: customer.phone,
          customer_phone: customer.phone,
          customer_name: customer.name,
          ...(customer.email ? { customer_email: customer.email } : {}),
        },
        order_meta: {
          return_url: `${baseUrl}/success?order_id=${orderRef}&product=${encodeURIComponent(productName)}&variant=${encodeURIComponent(variantLabel)}&qty=${quantity}&amount=${amount}`,
          notify_url: `${baseUrl}/api/cashfree-webhook`,
        },
        order_note: `${productName} | ${customer.address}, ${customer.pincode}`,
        // All data needed to create the DB row after payment confirmation
        order_tags: {
          productId,
          productName,
          variantLabel,
          quantity: String(quantity),
          gstAmount: String(gstAmt),
          batchId: batchId ?? "",
          customerAddress: customer.address,
          customerPincode: customer.pincode,
        },
      }),
    });

    const cfData = await cfRes.json();

    if (!cfRes.ok) {
      return NextResponse.json(
        {
          error: cfData.message || "Failed to create payment order",
          _debug: { cashfreeEnv, apiBase, cfStatus: cfRes.status, cfError: cfData },
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      orderRef,
      paymentSessionId: cfData.payment_session_id,
      _debug: { cashfreeEnv, apiBase, cfOrderId: cfData.cf_order_id, appIdPrefix: appId.slice(0, 8) },
    });
  } catch (err) {
    console.error("create-order:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
