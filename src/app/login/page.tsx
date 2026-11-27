"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        setMessage(
          "Account created. Check your email if confirmation is required."
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "25px",
        background: "#f7f8fa",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "#fff",
          padding: "35px",
          borderRadius: "12px",
          border: "1px solid #e7e9ed",
        }}
      >
        <Link href="/" className="logo" style={{ color: "#101820" }}>
          EURO<span>MOTO</span> DIRECT
        </Link>

        <h1 style={{ marginTop: "30px", fontSize: "27px" }}>
          {isRegistering ? "Create your account" : "Welcome back"}
        </h1>

        <p style={{ color: "#6b7280", marginTop: "8px" }}>
          {isRegistering
            ? "Register to start your motorcycle shopping journey."
            : "Log in to your EuroMoto Direct account."}
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gap: "17px",
            marginTop: "28px",
          }}
        >
          {isRegistering && (
            <label>
              Full name
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                style={inputStyle}
              />
            </label>
          )}

          <label>
            Email address
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={inputStyle}
            />
          </label>

          <label>
            Password
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              style={inputStyle}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "5px" }}
          >
            {loading
              ? "Please wait..."
              : isRegistering
                ? "Create Account"
                : "Log In"}
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: "18px",
              padding: "12px",
              background: "#f0f4f0",
              borderRadius: "5px",
              fontSize: "13px",
              overflowWrap: "anywhere",
            }}
          >
            {message}
          </p>
        )}

        <p style={{ marginTop: "24px", textAlign: "center" }}>
          {isRegistering
            ? "Already have an account?"
            : "New to EuroMoto Direct?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setMessage("");
            }}
            style={{
              border: 0,
              background: "transparent",
              color: "#9c7129",
              fontWeight: 700,
            }}
          >
            {isRegistering ? "Log in" : "Create account"}
          </button>
        </p>

        <p style={{ textAlign: "center", marginTop: "20px" }}>
          <Link href="/" style={{ color: "#6b7280", fontSize: "13px" }}>
            Back to homepage
          </Link>
        </p>
      </section>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "13px",
  marginTop: "7px",
  border: "1px solid #dfe3e8",
  borderRadius: "5px",
  outline: "none",
};
