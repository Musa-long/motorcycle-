"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/state/cart";

type Product = {
  id: string;
  name: string;
  brand: string;
  description: string | null;
  price_ngn: number;
  image_url: string | null;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, cartCount } = useCart();

  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setProducts(data);
      }

      setLoading(false);
    }

    loadProducts();
  }, []);

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <>
      <header className="site-header">
        <div className="container navbar">
          <Link href="/" className="logo">
            EURO<span>MOTO</span> DIRECT
          </Link>

          <nav className="nav-links">
            <a href="/">Home</a>
            <a href="#motorcycles">Motorcycles</a>
            <a href="#why-us">Why Choose Us</a>
            <a href="#contact">Contact</a>
          </nav>

          <div className="nav-actions">
            <Link href="/login" className="btn btn-outline">
              Account
            </Link>

            <Link href="/cart" className="btn btn-primary">
              <ShoppingCart size={17} />
              Cart ({cartCount})
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container">
            <div className="hero-content">
              <div className="eyebrow">
                European Motorcycle Supplier
              </div>

              <h1>
                Your Next Motorcycle.
                <br />
                <span>Direct From Europe.</span>
              </h1>

              <p>
                Discover quality motorcycles from European suppliers.
                Browse available models and contact our team for
                transparent pricing and delivery information.
              </p>

              <div className="hero-buttons">
                <a href="#motorcycles" className="btn btn-primary">
                  Browse Motorcycles <ArrowRight size={17} />
                </a>

                <a href="#contact" className="btn btn-outline">
                  Contact Our Team
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="trust-strip">
          <div className="container trust-grid">
            <div className="trust-item">
              <div className="trust-icon">🌍</div>
              <div>
                <strong>European Sourcing</strong>
                <small>Access to European suppliers</small>
              </div>
            </div>

            <div className="trust-item">
              <div className="trust-icon">✓</div>
              <div>
                <strong>Transparent Pricing</strong>
                <small>Clear quotes before purchase</small>
              </div>
            </div>

            <div className="trust-item">
              <div className="trust-icon">🚚</div>
              <div>
                <strong>Delivery Support</strong>
                <small>Import and delivery guidance</small>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="motorcycles">
          <div className="container">
            <div className="section-heading">
              <div>
                <div className="eyebrow">Our Collection</div>
                <h2>Explore Our Motorcycles</h2>
                <p>
                  Discover motorcycles available in our catalogue.
                </p>
              </div>
            </div>

            {loading ? (
              <p>Loading motorcycles...</p>
            ) : products.length === 0 ? (
              <p>
                No motorcycles have been added yet. Please check
                back soon.
              </p>
            ) : (
              <div className="product-grid">
                {products.map((product) => (
                  <article className="product-card" key={product.id}>
                    <div className="product-image">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                        />
                      )}
                    </div>

                    <div className="product-info">
                      <div className="product-brand">
                        {product.brand}
                      </div>

                      <h3>{product.name}</h3>

                      <p className="product-description">
                        {product.description || "Contact us for details."}
                      </p>

                      <div className="product-bottom">
                        <div className="product-price">
                          {formatPrice(Number(product.price_ngn))}
                        </div>

                        <button
                          className="btn btn-primary"
                          onClick={() =>
                            addToCart({
                              id: product.id,
                              name: product.name,
                              brand: product.brand,
                              price: Number(product.price_ngn),
                              image_url: product.image_url || "",
                            })
                          }
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="section why-section" id="why-us">
          <div className="container">
            <div className="section-heading">
              <div>
                <div className="eyebrow">The EuroMoto Advantage</div>
                <h2>A Better Way to Buy Motorcycles</h2>
                <p>
                  A straightforward buying experience from enquiry
                  to delivery.
                </p>
              </div>
            </div>

            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-number">01</div>
                <h3>Direct Supplier Access</h3>
                <p>
                  We help customers source motorcycles through
                  European supplier channels.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-number">02</div>
                <h3>Clear Purchase Quotes</h3>
                <p>
                  Receive a breakdown of motorcycle price,
                  shipping and applicable import charges.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-number">03</div>
                <h3>Import Assistance</h3>
                <p>
                  Get guidance on shipping, customs documentation
                  and delivery arrangements.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section" id="contact">
          <div className="container cta-box">
            <div>
              <h2>Looking for a Particular Motorcycle?</h2>
              <p>
                Contact our team to check availability and request
                a purchase quote.
              </p>
            </div>

            <a
              href="mailto:info@euromotodirect.com"
              className="btn btn-dark"
            >
              Contact Us <ArrowRight size={17} />
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <Link href="/" className="logo">
                EURO<span>MOTO</span> DIRECT
              </Link>
              <p style={{ marginTop: 15 }}>
                Your connection to quality motorcycles sourced
                through European suppliers.
              </p>
            </div>

            <div>
              <h4>Explore</h4>
              <div className="footer-links">
                <a href="/">Home</a>
                <a href="#motorcycles">Motorcycles</a>
                <a href="#why-us">Why Choose Us</a>
              </div>
            </div>

            <div>
              <h4>Customer Service</h4>
              <div className="footer-links">
                <a href="#contact">Contact Us</a>
                <Link href="/login">Customer Account</Link>
                <Link href="/cart">Shopping Cart</Link>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} EuroMoto Direct.
              All rights reserved.
            </span>
            <span>Motorcycles. Sourced with confidence.</span>
          </div>
        </div>
      </footer>
    </>
  );
            }
