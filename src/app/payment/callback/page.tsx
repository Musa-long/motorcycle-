"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/state/cart";

export default function PaymentCallbackPage() {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState(
    "Verifying your payment..."
  );

  const { clearCart } = useCart();

  useEffect(() => {
    async function verifyPayment() {
      const params = new URLSearchParams(window.location.search);
      const reference = params.get("reference");

      if (!reference) {
        setMessage("No payment reference was provided.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/payment/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reference }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          setMessage(
            result.error || "We could not confirm your payment."
          );
          setLoading(false);
          return;
        }

        setSuccess(true);
        setMessage("Your payment was successful.");
        clearCart();
      } catch {
        setMessage(
          "Unable to verify payment right now. Please contact support."
        );
      }

      setLoading(false);
    }

    verifyPayment();
  }, [clearCart]);

  return (
    <main
      style={{
        maxWidth: 650,
        margin: "80px auto",
        padding: 25,
        textAlign: "center",
      }}
    >
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 35,
        }}
      >
        <div style={{ fontSize: 55, marginBottom: 15 }}>
          {loading ? "⏳" : success ? "✓" : "!"}
        </div>

        <h1>
          {loading
            ? "Verifying Payment"
            : success
            ? "Payment Confirmed"
            : "Payment Not Confirmed"}
        </h1>

        <p style={{ margin: "18px 0 25px" }}>
          {message}
        </p>

        {!loading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <Link href="/" className="btn btn-primary">
              Return to Homepage
            </Link>

            {!success && (
              <a
                href="mailto:info@euromotodirect.com"
                className="btn btn-outline"
              >
                Contact Support
              </a>
            )}
          </div>
        )}

        {loading && (
          <p style={{ fontSize: 13 }}>
            Please don't close this page while we check your payment.
          </p>
        )}
      </div>
    </main>
  );
}
