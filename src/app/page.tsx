import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Globe2,
  CheckCircle2,
  ShoppingBag,
} from "lucide-react";

const products = [
  {
    brand: "BMW",
    name: "BMW S 1000 RR",
    description: "High-performance superbike with exceptional engineering.",
    price: "Contact for price",
    image:
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=900&q=85",
  },
  {
    brand: "Yamaha",
    name: "Yamaha YZF-R1",
    description: "A powerful sport motorcycle built for performance.",
    price: "Contact for price",
    image:
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=900&q=85",
  },
  {
    brand: "Ducati",
    name: "Ducati Panigale",
    description: "Italian design combined with outstanding performance.",
    price: "Contact for price",
    image:
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=900&q=85",
  },
];

export default function Home() {
  return (
    <>
      <header className="site-header">
        <div className="container navbar">
          <a href="/" className="logo">
            EURO<span>MOTO</span> DIRECT
          </a>

          <nav className="nav-links">
            <a href="/">Home</a>
            <a href="#motorcycles">Motorcycles</a>
            <a href="#why-us">Why Choose Us</a>
            <a href="#contact">Contact</a>
          </nav>

          <div className="nav-actions">
            <a href="#motorcycles" className="btn btn-primary">
              Explore Bikes
            </a>
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
                Discover quality motorcycles from trusted European
                suppliers. Browse available models and contact our
                team for transparent pricing and delivery information.
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
              <div className="trust-icon">
                <Globe2 size={21} />
              </div>
              <div>
                <strong>European Sourcing</strong>
                <small>Access to European suppliers</small>
              </div>
            </div>

            <div className="trust-item">
              <div className="trust-icon">
                <ShieldCheck size={21} />
              </div>
              <div>
                <strong>Transparent Pricing</strong>
                <small>Clear quotes before purchase</small>
              </div>
            </div>

            <div className="trust-item">
              <div className="trust-icon">
                <Truck size={21} />
              </div>
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
                  Discover popular motorcycle brands and models.
                </p>
              </div>

              <a href="#contact" className="btn btn-dark">
                Request a Quote <ArrowRight size={16} />
              </a>
            </div>

            <div className="product-grid">
              {products.map((product) => (
                <article className="product-card" key={product.name}>
                  <div className="product-image">
                    <img
                      src={product.image}
                      alt={product.name}
                    />
                  </div>

                  <div className="product-info">
                    <div className="product-brand">
                      {product.brand}
                    </div>

                    <h3>{product.name}</h3>

                    <p className="product-description">
                      {product.description}
                    </p>

                    <div className="product-bottom">
                      <div className="product-price">
                        {product.price}
                      </div>

                      <a
                        href="#contact"
                        className="btn btn-primary"
                      >
                        Enquire <ArrowRight size={14} />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
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
                  shipping and applicable import charges before
                  making a purchase.
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
                Tell us the brand and model you want. Our team can
                help you check availability and prepare a quote.
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
              <a href="/" className="logo">
                EURO<span>MOTO</span> DIRECT
              </a>
              <p style={{ marginTop: 15, maxWidth: 330 }}>
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
                <a href="#contact">Request a Quote</a>
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
