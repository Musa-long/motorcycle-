"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  name: string;
  brand: string;
  description: string | null;
  price_ngn: number;
  image_url: string | null;
  is_active: boolean;
};

const emptyForm = {
  name: "",
  brand: "",
  description: "",
  price_ngn: "",
  image_url: "",
  is_active: true,
};

export default function AdminDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error || profile?.role !== "admin") {
      setMessage("Access denied. Administrator permission required.");
      setLoading(false);
      return;
    }

    setAuthorized(true);
    await loadProducts();
    setLoading(false);
  }

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    setProducts(data || []);
  }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) {
    const target = e.target;

    setForm((previous) => ({
      ...previous,
      [target.name]:
        target.type === "checkbox"
          ? (target as HTMLInputElement).checked
          : target.value,
    }));
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const price = Number(form.price_ngn);

    if (!Number.isFinite(price) || price <= 0) {
      setMessage("Please enter a valid motorcycle price.");
      setSaving(false);
      return;
    }

    const productData = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      description: form.description.trim() || null,
      price_ngn: price,
      image_url: form.image_url.trim() || null,
      is_active: form.is_active,
    };

    const result = editingId
      ? await supabase
          .from("products")
          .update(productData)
          .eq("id", editingId)
      : await supabase
          .from("products")
          .insert(productData);

    if (result.error) {
      setMessage(result.error.message);
      setSaving(false);
      return;
    }

    setMessage(
      editingId
        ? "Motorcycle updated successfully."
        : "Motorcycle added successfully."
    );

    setForm(emptyForm);
    setEditingId(null);

    await loadProducts();
    setSaving(false);
  }

  function editProduct(product: Product) {
    setEditingId(product.id);

    setForm({
      name: product.name,
      brand: product.brand,
      description: product.description || "",
      price_ngn: String(product.price_ngn),
      image_url: product.image_url || "",
      is_active: product.is_active,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function deleteProduct(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this motorcycle?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Motorcycle deleted successfully.");
    await loadProducts();
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return <div style={{ padding: 40 }}>Checking administrator access...</div>;
  }

  if (!authorized) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Access Denied</h2>
        <p>{message}</p>
        <Link href="/">Return to Homepage</Link>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    marginTop: "7px",
    marginBottom: "17px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    boxSizing: "border-box",
  };

  return (
    <main style={{ maxWidth: 1100, margin: "auto", padding: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 15,
          flexWrap: "wrap",
          marginBottom: 30,
        }}
      >
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage your motorcycle catalogue.</p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/" className="btn btn-outline">
            View Website
          </Link>

          <button
            onClick={logout}
            className="btn btn-primary"
          >
            Logout
          </button>
        </div>
      </div>

      <section
        style={{
          padding: 22,
          border: "1px solid #ddd",
          borderRadius: 10,
          marginBottom: 35,
        }}
      >
        <h2>
          {editingId ? "Edit Motorcycle" : "Add New Motorcycle"}
        </h2>

        <form onSubmit={handleSubmit}>
          <label>Motorcycle Name</label>
          <input
            style={inputStyle}
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. BMW S1000RR"
            required
          />

          <label>Brand</label>
          <input
            style={inputStyle}
            name="brand"
            value={form.brand}
            onChange={handleChange}
            placeholder="e.g. BMW"
            required
          />

          <label>Description</label>
          <textarea
            style={inputStyle}
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Motorcycle description"
            rows={4}
          />

          <label>Price in Naira (₦)</label>
          <input
            style={inputStyle}
            type="number"
            name="price_ngn"
            value={form.price_ngn}
            onChange={handleChange}
            placeholder="e.g. 8500000"
            min="1"
            required
          />

          <label>Motorcycle Image URL</label>
          <input
            style={inputStyle}
            name="image_url"
            value={form.image_url}
            onChange={handleChange}
            placeholder="https://example.com/motorcycle.jpg"
            type="url"
          />

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
            }}
          >
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
            />
            Show this motorcycle on the website
          </label>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Motorcycle"
                : "Add Motorcycle"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="btn btn-outline"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {message && (
          <p style={{ marginTop: 18 }}>{message}</p>
        )}
      </section>

      <section>
        <h2>Motorcycle Catalogue ({products.length})</h2>

        {products.length === 0 ? (
          <p>No motorcycles have been added yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 18 }}>
            {products.map((product) => (
              <article
                key={product.id}
                style={{
                  display: "flex",
                  gap: 18,
                  alignItems: "center",
                  flexWrap: "wrap",
                  padding: 15,
                  border: "1px solid #ddd",
                  borderRadius: 10,
                }}
              >
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    style={{
                      width: 120,
                      height: 90,
                      objectFit: "cover",
                      borderRadius: 7,
                    }}
                  />
                )}

                <div style={{ flex: 1 }}>
                  <h3>{product.name}</h3>
                  <p>{product.brand}</p>
                  <strong>
                    {new Intl.NumberFormat("en-NG", {
                      style: "currency",
                      currency: "NGN",
                      maximumFractionDigits: 0,
                    }).format(Number(product.price_ngn))}
                  </strong>

                  <p>
                    Status: {product.is_active ? "Visible" : "Hidden"}
                  </p>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="btn btn-outline"
                    onClick={() => editProduct(product)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-primary"
                    onClick={() => deleteProduct(product.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
            }
