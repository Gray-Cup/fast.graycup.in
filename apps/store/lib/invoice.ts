import PDFDocument from "pdfkit";
import { Writable } from "stream";

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

export async function generateInvoicePdf(d: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    const writable = new Writable({
      write(chunk, _enc, cb) { chunks.push(chunk); cb(); }
    });
    writable.on("finish", () => resolve(Buffer.concat(chunks)));
    writable.on("error", reject);
    doc.pipe(writable);

    const black = "#000000";
    const gray = "#666666";
    const lightGray = "#999999";
    const startX = 50;
    const endX = doc.page.width - 50;

    doc.fontSize(20).font("Helvetica-Bold").fillColor(black).text("Invoice", startX, doc.y);
    doc.fontSize(10).fillColor(gray).text(d.orderRef, startX, doc.y + 22);
    doc.fontSize(10).fillColor(gray).text(d.date, startX, doc.y + 36);

    let y = doc.y + 20;
    doc.fontSize(9).fillColor(lightGray).text("BILL TO", startX, y);
    doc.fontSize(11).font("Helvetica-Bold").fillColor(black).text(d.customerName, startX, y + 14);
    doc.font("Helvetica").fontSize(10).fillColor(gray).text(d.customerAddress + " " + d.customerPincode, startX, y + 28);
    doc.text(d.customerPhone, startX, doc.y + 14);
    if (d.customerEmail) doc.text(d.customerEmail, startX, doc.y + 14);

    y = doc.y + 10;
    doc.fontSize(9).fillColor(lightGray).text("FROM", startX, y);
    doc.fontSize(11).font("Helvetica-Bold").fillColor(black).text("Gray Cup Enterprises", startX, y + 14);
    doc.font("Helvetica").fontSize(10).fillColor(gray).text("FF122, Rodeo Drive Mall, GT Road, TDI City, Kundli, Sonipat, Haryana 131030", startX, y + 28, { width: 260 });
    doc.text("GSTIN: 06AAMCG4985H1Z4", startX, doc.y + 14);
    doc.text("office@graycup.in", startX, doc.y + 14);

    y = doc.y + 20;
    doc.moveTo(startX, y).lineTo(endX, y).strokeColor(lightGray).lineWidth(0.5).stroke();

    y += 12;
    doc.fontSize(9).fillColor(lightGray).text("ITEM", startX, y);
    doc.text("PACK", startX + 240, y);
    doc.text("QTY", startX + 340, y, { align: "center" });
    doc.text("AMOUNT", endX, y, { align: "right", width: 80 });

    y += 16;
    doc.fontSize(11).font("Helvetica").fillColor(black).text(d.productName, startX, y);
    doc.text(d.variantLabel, startX + 240, y);
    doc.text(String(d.quantity), startX + 340, y, { align: "center" });
    doc.text(`₹${d.amount}`, endX, y, { align: "right", width: 80 });

    y += 20;
    doc.moveTo(startX, y).lineTo(endX, y).strokeColor(lightGray).lineWidth(0.5).stroke();

    y += 12;
    const totX = endX - 200;
    doc.fontSize(10).fillColor(gray).text("Subtotal", totX, y, { width: 120 }).text(`₹${d.amount - d.gstAmount}`, endX, y, { align: "right", width: 80 });
    doc.text("GST 5%", totX, y + 16, { width: 120 }).text(`₹${d.gstAmount}`, endX, y + 16, { align: "right", width: 80 });
    doc.moveTo(totX, y + 30).lineTo(endX, y + 30).strokeColor(black).lineWidth(1).stroke();
    doc.fontSize(12).font("Helvetica-Bold").fillColor(black).text("Total", totX, y + 38, { width: 120 }).text(`₹${d.amount}`, endX, y + 38, { align: "right", width: 80 });

    doc.fontSize(9).fillColor(lightGray).text("Thank you for your order. This is a computer-generated invoice.", startX, doc.y + 30, { align: "center" });

    doc.end();
  });
}

export function generateInvoiceHtml(d: InvoiceData): string {
  const base = d.amount - d.gstAmount;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Invoice ${d.orderRef}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #000; background: #fff; padding: 40px; max-width: 600px; margin: 0 auto; font-size: 14px; }
  .header { margin-bottom: 32px; }
  .header h1 { font-size: 24px; font-weight: 900; }
  .header p { color: #666; font-size: 12px; margin-top: 4px; }
  .meta { display: flex; gap: 40px; margin-bottom: 32px; }
  .meta-block { font-size: 12px; }
  .meta-block strong { display: block; font-size: 14px; margin-bottom: 4px; }
  .meta-block p { color: #666; line-height: 1.6; }
  .divider { border-bottom: 1px solid #ddd; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  thead th { font-size: 11px; color: #999; text-align: left; padding-bottom: 8px; font-weight: 400; }
  tbody td { padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px; }
  .totals { margin-left: auto; width: 200px; }
  .totals-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; color: #666; }
  .totals-row.total { font-weight: 900; font-size: 16px; color: #000; border-top: 1px solid #000; padding-top: 8px; margin-top: 4px; }
  .footer { margin-top: 40px; font-size: 11px; color: #999; text-align: center; }
</style>
</head>
<body>
  <div class="header">
    <h1>Invoice</h1>
    <p>${d.orderRef} &nbsp;·&nbsp; ${d.date}</p>
  </div>

  <div class="meta">
    <div class="meta-block">
      <strong>Bill To</strong>
      <p>${d.customerName}<br>${d.customerAddress}<br>${d.customerPincode}<br>${d.customerPhone}${d.customerEmail ? `<br>${d.customerEmail}` : ""}</p>
    </div>
    <div class="meta-block">
      <strong>From</strong>
      <p>Gray Cup Enterprises<br>FF122, Rodeo Drive Mall, GT Road, TDI City, Kundli, Sonipat, Haryana 131030<br>GSTIN: 06AAMCG4985H1Z4<br>office@graycup.in</p>
    </div>
  </div>

  <div class="divider"></div>

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
    <div class="totals-row"><span>Subtotal</span><span>₹${base}</span></div>
    <div class="totals-row"><span>GST 5%</span><span>₹${d.gstAmount}</span></div>
    <div class="totals-row total"><span>Total</span><span>₹${d.amount}</span></div>
  </div>

  <div class="footer">Thank you for your order. This is a computer-generated invoice.</div>
</body>
</html>`;
}