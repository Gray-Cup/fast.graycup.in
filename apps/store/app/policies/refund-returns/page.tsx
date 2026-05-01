export default function RefundReturnsPage() {
  return (
    <div className="py-14 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-black text-gray-900 mb-1">Refunds & Cancellations</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: May 2026</p>

        <div className="space-y-10 text-gray-700">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Cancellations</h2>
            <p className="leading-relaxed">Orders can be cancelled within 12 hours of placing them by contacting us at <a href="mailto:arjun@graycup.in" className="text-amber-600 hover:underline">arjun@graycup.in</a> or calling <a href="tel:+918527914317" className="text-amber-600 hover:underline">+91 85279 14317</a>. Once the order has been dispatched, cancellation is not possible.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Returns</h2>
            <p className="leading-relaxed">We accept returns within 7 days of delivery if the item is received in damaged or incorrect condition. Items must be unopened and in original packaging. Perishable goods (tea) cannot be returned once opened.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Refunds</h2>
            <p className="leading-relaxed">Once your return is received and inspected, refunds are processed within 5–7 business days to your original payment method. Shipping charges are non-refundable for change-of-mind returns.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Shipping</h2>
            <p className="leading-relaxed">We ship via Delhivery across India. Tracking details are shared once your order is dispatched. Delivery typically takes 3–7 business days depending on location.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Contact</h2>
            <p className="leading-relaxed">
              Email: <a href="mailto:arjun@graycup.in" className="text-amber-600 hover:underline">arjun@graycup.in</a><br />
              Phone: <a href="tel:+918527914317" className="text-amber-600 hover:underline">+91 85279 14317</a><br />
              Mon–Sat, 10am–6pm IST
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
