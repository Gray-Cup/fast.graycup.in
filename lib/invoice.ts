interface InvoiceData {
  orderRef: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  customerAddress: string;
  customerPincode: string;
  productName: string;
  variantLabel: string;
  quantity: number;
  amount: number;
  gstAmount: number;
}

export function generateInvoiceHtml(d: InvoiceData): string {
  const base = d.amount - d.gstAmount;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Invoice ${d.orderRef} — Gray Cup (Fast)</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111; background: #fff; padding: 40px; max-width: 700px; margin: 0 auto; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 2px solid #2563eb; }
  .brand { font-size: 22px; font-weight: 900; color: #111; }
  .brand span { color: #f59e0b; }
  .invoice-meta { text-align: right; }
  .invoice-meta h1 { font-size: 28px; font-weight: 900; color: #2563eb; }
  .invoice-meta p { font-size: 13px; color: #555; margin-top: 4px; }
  .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-bottom: 8px; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 36px; }
  .address p { font-size: 14px; color: #333; line-height: 1.7; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  thead tr { background: #2563eb; color: #fff; }
  thead th { padding: 12px 14px; text-align: left; font-size: 13px; font-weight: 700; }
  tbody tr { border-bottom: 1px solid #f0f0f0; }
  tbody td { padding: 12px 14px; font-size: 14px; color: #333; }
  .totals { margin-left: auto; width: 280px; }
  .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; color: #555; }
  .totals-row.total { border-top: 2px solid #111; margin-top: 8px; padding-top: 10px; font-size: 16px; font-weight: 900; color: #111; }
  .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center; line-height: 1.8; }
  @media print { body { padding: 24px; } }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Gray Cup <span>(Fast)</span></div>
      <p style="font-size:13px;color:#555;margin-top:6px;">arjun@graycup.in · +91 85279 14317</p>
    </div>
    <div class="invoice-meta">
      <h1>INVOICE</h1>
      <p><strong>${d.orderRef}</strong></p>
      <p>${d.date}</p>
    </div>
  </div>

  <div class="two-col">
    <div class="address">
      <p class="section-title">Bill To</p>
      <p><strong>${d.customerName}</strong></p>
      <p>${d.customerAddress}</p>
      <p>${d.customerPincode}</p>
      <p>${d.customerPhone}</p>
      ${d.customerEmail ? `<p>${d.customerEmail}</p>` : ""}
    </div>
    <div class="address">
      <p class="section-title">Sold By</p>
      <p><strong>Gray Cup Enterprises</strong></p>
      <p>FF122, Rodeo Drive Mall, GT Road, TDI City, Kundli, Sonipat, Haryana, 131030</p>
      <p>GSTIN: 06AAMCG4985H1Z4</p>
      <p>arjun@graycup.in</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Pack</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${d.productName}</td>
        <td>${d.variantLabel}</td>
        <td style="text-align:center">${d.quantity}</td>
        <td style="text-align:right">₹${d.amount}</td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row"><span>Subtotal (excl. GST)</span><span>₹${base}</span></div>
    <div class="totals-row"><span>GST @ 5%</span><span>₹${d.gstAmount}</span></div>
    <div class="totals-row total"><span>Total</span><span>₹${d.amount}</span></div>
  </div>

  <div class="footer">
    <p>Thank you for your order! Shipped via Delhivery · Payments secured by Cashfree</p>
    <p style="margin-top:4px;">GST-inclusive pricing · This is a computer-generated invoice</p>
  </div>
</body>
</html>`;
}