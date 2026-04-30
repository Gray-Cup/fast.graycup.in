import { NextRequest, NextResponse } from "next/server";
import { sql, generateOrderRef } from "@/lib/db";

const GST_RATE = 0.18;

interface OrderPayload {
  productId: number;
  productName: string;
  variantLabel: string;
  quantity: number;
  amount: number; // total incl. GST
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
    const { amount, customer, productId, productName, variantLabel, quantity } = body;

    if (!amount || !customer?.name || !customer?.phone) {
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
    const gstAmount = Math.round(amount - amount / (1 + GST_RATE));

    const apiBase =
      cashfreeEnv === "production"
        ? "https://api.cashfree.com/pg"
        : "https://sandbox.cashfree.com/pg";

    const cashfreePayload = {
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
        return_url: `${baseUrl}/success?order_id=${orderRef}&product=${encodeURIComponent(productName)}&variant=${encodeURIComponent(variantLabel)}&qty=${quantity}`,
        notify_url: `${baseUrl}/api/cashfree-webhook`,
      },
      order_note: `${productName} ${variantLabel} x${quantity} | ${customer.address}, ${customer.pincode}`,
    };

    const cashfreeRes = await fetch(`${apiBase}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": "2023-08-01",
      },
      body: JSON.stringify(cashfreePayload),
    });

    if (!cashfreeRes.ok) {
      const errData = await cashfreeRes.json();
      console.error("Cashfree error:", errData);
      return NextResponse.json(
        { error: errData.message || "Failed to create Cashfree order" },
        { status: 502 }
      );
    }

    const cashfreeData = await cashfreeRes.json();

    // Persist order to Neon DB
    await sql`
      INSERT INTO orders (
        order_ref, cashfree_order_id, product_id, variant_label, quantity,
        amount, gst_amount, customer_name, customer_phone, customer_email,
        customer_address, customer_pincode, status
      ) VALUES (
        ${orderRef}, ${cashfreeData.cf_order_id || orderRef}, ${productId || null},
        ${variantLabel}, ${quantity}, ${amount}, ${gstAmount},
        ${customer.name}, ${customer.phone}, ${customer.email || null},
        ${customer.address}, ${customer.pincode}, 'PENDING'
      )
    `;

    return NextResponse.json({
      orderRef,
      paymentSessionId: cashfreeData.payment_session_id,
    });
  } catch (err) {
    console.error("create-order error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
