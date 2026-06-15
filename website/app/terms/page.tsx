import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "CardWiz Terms & Conditions — service, premium subscription, acceptable use, liability.",
};

export default function Terms() {
  return (
    <LegalPage title="Terms & Conditions" updated="Last updated: 14 June 2026">
      <p>
        These Terms govern your use of the CardWiz browser extension and website (cardwiz.in). By
        using the Service, you agree to these Terms.
      </p>

      <h2>1. What CardWiz does</h2>
      <p>
        CardWiz is an informational tool that recommends which of your cards may give the best
        reward/discount on an online purchase, plus bill reminders. Reward rates and offers are
        estimates and may change. We do not process payments or access bank accounts.
      </p>

      <h2>2. Eligibility</h2>
      <p>You must be 18+ and able to form a binding contract. Intended for users in India.</p>

      <h2>3. Premium subscription</h2>
      <ul>
        <li>Premium is billed at ₹49/month or ₹299/year, with a free trial where applicable.</li>
        <li>Payments are processed securely by Razorpay. We never store your full card details.</li>
        <li>Subscriptions auto-renew until cancelled — see our Cancellation &amp; Refunds policy.</li>
      </ul>

      <h2>4. Acceptable use</h2>
      <p>
        Don&apos;t misuse the Service (no disruption, no unlawful use). CardWiz operates read-only on
        supported sites and never fills forms or enters payment details for you.
      </p>

      <h2>5. No financial advice</h2>
      <p>
        CardWiz is not a bank or financial advisor. Recommendations are informational only. Verify
        offers with your card issuer before deciding.
      </p>

      <h2>6. Limitation of liability</h2>
      <p>
        The Service is provided &quot;as is&quot;. To the maximum extent permitted by law, CardWiz is
        not liable for any loss arising from reliance on reward estimates, offers, or reminders.
      </p>

      <h2>7. Governing law</h2>
      <p>These Terms are governed by the laws of India.</p>

      <h2>8. Contact</h2>
      <p>
        <a href="mailto:gurpreetsj8871@gmail.com">gurpreetsj8871@gmail.com</a>
      </p>
    </LegalPage>
  );
}
