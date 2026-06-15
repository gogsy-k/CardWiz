import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Shipping & Delivery",
  description: "CardWiz is a 100% digital product — no physical shipping. Premium activates instantly.",
};

export default function Shipping() {
  return (
    <LegalPage title="Shipping & Delivery" updated="Last updated: 14 June 2026">
      <p>
        <b>CardWiz is a 100% digital product.</b> There is no physical shipping — nothing is mailed
        or couriered to you.
      </p>

      <h2>1. Digital delivery</h2>
      <p>
        CardWiz is a browser extension and online service. No physical goods, so no shipping
        charges or delivery timelines.
      </p>

      <h2>2. How you get access</h2>
      <ul>
        <li>
          <b>Free:</b> Install the CardWiz extension from the Chrome Web Store — works immediately.
        </li>
        <li>
          <b>Premium:</b> Activates <b>instantly</b> in your extension once payment is confirmed by
          Razorpay. No waiting, no shipment.
        </li>
      </ul>

      <h2>3. Activation issues</h2>
      <p>
        If Premium doesn&apos;t activate within a few minutes of a successful payment, reopen the
        extension to refresh, or email{" "}
        <a href="mailto:gurpreetsj8871@gmail.com">gurpreetsj8871@gmail.com</a>.
      </p>
    </LegalPage>
  );
}
