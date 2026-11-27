"use client";

import Link from "next/link";
import { useCart } from "@/state/cart";
import { ShoppingBag, Trash2, Plus, Minus } from "lucide-react";

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

export default function CartPage() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    cartTotal,
  } = useCart();

  return (
    <main className="container" style={{ padding: "65px 0", minHeight: "70vh" }}>
      <div className="eyebrow">Your Selection</div>
      <h1 style={{ fontSize: "36px", marginBottom: "10px" }}>
        Shopping Cart
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "35px" }}>
        Review your selected motorcycles before checkout.
      </p>

      {items.length === 0 ? (
        <div
          style={{
            background: "white",
            border: "1px solid #e7e9ed",
            borderRadius: "10px",
            padding: "55px 20px",
            textAlign: "center",
          }}
        >
          <ShoppingBag size={45} color="#9c7129" />
          <h2 style={{ marginTop: "15px" }}>Your cart is empty</h2>
          <p style={{ color: "#6b7280", margin: "10px 0 22px" }}>
            Explore our collection and add a motorcycle.
          </p>
          <Link href="/#motorcycles" className="btn btn-primary">
            Browse Motorcycles
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(250px, 1fr)",
            gap: "25px",
          }}
        >
          <div>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "18px",
                  background: "white",
                  border: "1px solid #e7e9ed",
                  borderRadius: "9px",
                  padding: "17px",
                  marginBottom: "15px",
                }}
              >
                <img
                  src={item.image_url || "/placeholder-bike.png"}
                  alt={item.name}
                  style={{
                    width: "110px",
                    height: "90px",
                    objectFit: "cover",
                    borderRadius: "6px",
                  }}
                />

                <div style={{ flex: 1 }}>
                  <small style={{ color: "#9c7129", fontWeight: 700 }}>
                    {item.brand}
                  </small>

                  <h3>{item.name}</h3>

                  <strong>{formatPrice(item.price)}</strong>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginTop: "12px",
                    }}
                  >
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                      aria-label="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      aria-label="Remove item"
                      style={{
                        marginLeft: "10px",
                        color: "#c0392b",
                        border: 0,
                        background: "transparent",
                      }}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside
            style={{
              background: "white",
              border: "1px solid #e7e9ed",
              borderRadius: "9px",
              padding: "24px",
              height: "fit-content",
            }}
          >
            <h2 style={{ fontSize: "21px" }}>Order Summary</h2>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                margin: "22px 0",
              }}
            >
              <span>Subtotal</span>
              <strong>{formatPrice(cartTotal)}</strong>
            </div>

            <p style={{ fontSize: "12px", color: "#6b7280" }}>
              Shipping and applicable import charges will be confirmed
              in your purchase quote.
            </p>

            <div style={{ borderTop: "1px solid #e7e9ed", marginTop: "20px", paddingTop: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>Total</strong>
                <strong>{formatPrice(cartTotal)}</strong>
              </div>
            </div>

            <Link
              href="/checkout"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "25px" }}
            >
              Proceed to Checkout
            </Link>

            <Link
              href="/#motorcycles"
              style={{
                display: "block",
                textAlign: "center",
                marginTop: "16px",
                fontSize: "13px",
              }}
            >
              Continue Shopping
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
