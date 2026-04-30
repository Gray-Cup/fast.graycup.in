export default function RefundReturnsPage() {
  return (
    <div className="py-14 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-black text-blue-600 mb-2">Refund & Returns</h1>
        <p className="text-blue-400 mb-10">Last updated: May 2026</p>

        <div className="space-y-12 text-blue-800">
          <section>
            <h2 className="text-xl font-bold mb-4">Our Return Policy</h2>
            <p className="text-blue-600 leading-relaxed">
              We want you to be happy with your purchase. If you are not satisfied, we offer a hassle-free return policy.
            </p>
            <ul className="mt-4 space-y-2 text-blue-600">
              <li>• Returns accepted within 7 days of delivery</li>
              <li>• Items must be unopened and in original packaging</li>
              <li>• Contact us at arjun@graycup.in to initiate a return</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Refund Process</h2>
            <p className="text-blue-600 leading-relaxed">
              Once we receive and inspect your returned item, we will process your refund within 5-7 business days. The refund will be credited to your original payment method.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Exceptions</h2>
            <p className="text-blue-600 leading-relaxed">
              Perishable items (tea, coffee) cannot be returned once opened. Shipping costs are non-refundable for change-of-mind returns.
            </p>
          </section>

          <hr className="border-blue-100" />

          <section>
            <h2 className="text-3xl font-black text-blue-600 mb-2">Shipping Policy</h2>
            <p className="text-blue-400 mb-6">Last updated: May 2026</p>
            
            <h3 className="text-lg font-bold mb-3">Delivery Partners</h3>
            <p className="text-blue-600 leading-relaxed">
              We ship via Delhivery and India Post to ensure pan-India coverage. Tracking details are shared via email and WhatsApp once your order ships.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-3">Shipping Rates</h3>
            <ul className="space-y-2 text-blue-600">
              <li>• Orders above ₹499: Free shipping</li>
              <li>• Orders below ₹499: ₹50 flat shipping charge</li>
              <li>• Remote/pin codes may incur additional charges (we will inform you before checkout)</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-3">Delivery Timelines</h3>
            <ul className="space-y-2 text-blue-600">
              <li>• Metro cities: 3-5 business days</li>
              <li>• Tier 2/3 cities: 5-7 business days</li>
              <li>• Remote areas: 7-10 business days</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-3">Tracking Your Order</h3>
            <p className="text-blue-600 leading-relaxed">
              Once your order ships, you will receive a tracking link via email. You can also track your order status by contacting us at arjun@graycup.in.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-3">Contact Us</h3>
            <p className="text-blue-600 leading-relaxed">
              For any questions about your order, reach out to us:<br />
              Email: <a href="mailto:arjun@graycup.in" className="text-blue-500 hover:underline">arjun@graycup.in</a><br />
              Phone: <a href="tel:+918527914317" className="text-blue-500 hover:underline">+91 85279 14317</a><br />
              Hours: Mon–Sat, 10am–6pm IST
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}