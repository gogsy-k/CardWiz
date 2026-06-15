import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Cancellation & Refunds",
  description: "CardWiz Cancellation & Refunds policy for Premium subscription.",
};

export default function Refunds() {
  return (
    <LegalPage title="Cancellation & Refunds" updated="Last updated: 14 June 2026">
      <p>
        <b>In short:</b> CardWiz Premium is a digital subscription. Cancel anytime to stop future
        billing. Since access is granted instantly, fees already charged are generally
        non-refundable, but we review genuine issues case-by-case.
      </p>

      <h2>1. Cancelling</h2>
      <ul>
        <li>Cancel anytime from the extension (&quot;More&quot; tab) or by emailing us.</li>
        <li>Premium benefits continue until the end of the current billing period.</li>
        <li>Cancel during a free trial and you won&apos;t be charged at all.</li>
      </ul>

      <h2>2. Refunds</h2>
      <ul>
        <li>Fees already charged for the current period are generally non-refundable.</li>
        <li>No pro-rated refunds for partially used periods.</li>
        <li>If you were charged in error (duplicate, or after a timely cancellation), full refund.</li>
      </ul>

      <h2>3. How to request</h2>
      <p>
        Email <a href="mailto:gurpreetsj8871@gmail.com">gurpreetsj8871@gmail.com</a> with your
        payment reference. We respond within 3–5 business days. Approved refunds go back to your
        original payment method via Razorpay (usually 5–7 business days).
      </p>

      <h2>4. Free version</h2>
      <p>The free version stays fully functional even if you cancel Premium.</p>
    </LegalPage>
  );
}
