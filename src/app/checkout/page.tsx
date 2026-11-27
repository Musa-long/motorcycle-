"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/state/cart";
import { supabase } from "@/lib/supabase";

export default function CheckoutPage() {
  const { items, cartTotal } = useCart();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setLoggedIn(true);

        setForm((previous) => ({
          ...previous,
          fullName:
            user.user_metadata?.full_name || "",
          email: user.email || "",
        }));
      }

      setLoading(false);
    }

    checkUser();
  }, []);

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleCheckout(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setMessage("");

    if (items.length === 0) {
      setMessage("Your shopping cart is empty.");
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setMessage("Please log in before proceeding.");
        setSubmitting(false);
        return;
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          customer_name: form.fullName,
          customer_email: form.email,
          customer_phone: form.phone,
          delivery_address: form.address,
          items: items.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to start checkout."
        );
      }

      if (!result.authorization_url) {
        throw new Error("Payment link was not returned.");
      }

      window.location.href = result.authorization_url;
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );

      setSubmitting(false);
    }
  }

  if (loading) {
    return <main style={{ padding: 40 }}>Loading checkout...</main>;
  }

  if (!loggedIn) {
    return (
      <main style={{ maxWidth: 600, margin: "60px auto", padding: 20 }}>
        <h1>Login Required</h1>
        <p>Please log in to your customer account before checkout.</p>

        <Link href="/login" className="btn btn-primary">
          Log In
        </Link>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main style={{ maxWidth: 600, margin: "60px auto", padding: 20 }}>
        <h1>Your Cart Is Empty</h1>
        <p>Add a motorcycle to your cart before checkout.</p>

        <Link href="/" className="btn btn-primary">
          Browse Motorcycles
        </Link>
      </main>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: 13,
    marginTop: 7,
    marginBottom: 18,
    border: "1px solid #ccc",
    borderRadius: 6,
    boxSizing: "border-box",
  };

  return (
    <main
      style={{
        maxWidth: 1000,
        margin: "40px auto",
        padding: 20,
      }}
    >
      <h1>Secure Checkout</h1>
      <p>Enter your delivery information to continue.</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 30,
          marginTop: 30,
        }}
      >
        <section>
          <h2>Delivery Information</h2>

          <form onSubmit={handleCheckout}>
            <label>Full Name</label>
            <input
              style={inputStyle}
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Your full name"
              required
            />

            <label>Email Address</label>
            <input
              style={inputStyle}
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />

            <label>Phone Number</label>
            <input
              style={inputStyle}
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Your phone number"
              required
            />

            <label>Delivery Address</label>
            <textarea
              style={inputStyle}
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Enter your complete delivery address"
              rows={4}
              required
            />

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ width: "100%" }}
            >
              {submitting
                ? "Preparing Payment..."
                : "Proceed to Payment"}
            </button>
          </form>

          {message && (
            <p style={{ color: "red", marginTop: 15 }}>
              {message}
            </p>
          )}
        </section>

        <section
          style={{
            border: "1px solid #ddd",
            borderRadius: 10,
            padding: 20,
            height: "fit-content",
          }}
        >
          <h2>Your Order</h2>

          {items.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 15,
                padding: "15px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <div>
                <strong>{item.name}</strong>
                <p>
                  {item.brand} × {item.quantity}
                </p>
              </div>

              <strong>
                {formatPrice(item.price * item.quantity)}
              </strong>
            </div>
          ))}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 20,
              fontSize: 19,
            }}
          >
            <strong>Subtotal</strong>
            <strong>{formatPrice(cartTotal)}</strong>
          </div>

          <p style={{ fontSize: 13, marginTop: 15 }}>
            Final payment amount will be calculated securely
            using the current product prices on our server.
          </p>

          <Link
            href="/cart"
            style={{ display: "inline-block", marginTop: 15 }}
          >
            Return to Cart
          </Link>
        </section>
      </div>
    </main>
  );
}
