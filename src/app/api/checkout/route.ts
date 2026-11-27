import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY!;

const supabase = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export async function POST(request: NextRequest) {
  try {
    if (
      !supabaseUrl ||
      !serviceRoleKey ||
      !paystackSecretKey
    ) {
      return NextResponse.json(
        { error: "Payment service is not configured." },
        { status: 500 }
      );
    }

    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Please log in first." },
        { status: 401 }
      );
    }

    const token = authorization.substring(7);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user || !user.email) {
      return NextResponse.json(
        { error: "Invalid or expired login session." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      customer_name,
      customer_phone,
      delivery_address,
      items,
    } = body;

    if (
      typeof customer_name !== "string" ||
      !customer_name.trim() ||
      typeof customer_phone !== "string" ||
      !customer_phone.trim() ||
      typeof delivery_address !== "string" ||
      !delivery_address.trim()
    ) {
      return NextResponse.json(
        { error: "Please complete all delivery information." },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      items.length > 20
    ) {
      return NextResponse.json(
        { error: "Your shopping cart is invalid." },
        { status: 400 }
      );
    }

    const productQuantities = new Map<string, number>();

    for (const item of items) {
      if (
        typeof item.product_id !== "string" ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.product_id) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 10
      ) {
        return NextResponse.json(
          { error: "Invalid motorcycle or quantity." },
          { status: 400 }
        );
      }

      if (productQuantities.has(item.product_id)) {
        return NextResponse.json(
          { error: "Duplicate products in cart are not allowed." },
          { status: 400 }
        );
      }

      productQuantities.set(item.product_id, item.quantity);
    }

    const productIds = Array.from(productQuantities.keys());

    const { data: products, error: productsError } =
      await supabase
        .from("products")
        .select("id, name, brand, price_ngn")
        .in("id", productIds)
        .eq("is_active", true);

    if (productsError || !products || products.length !== productIds.length) {
      return NextResponse.json(
        { error: "One or more motorcycles are unavailable." },
        { status: 400 }
      );
    }

    let totalNaira = 0;

    const orderItems = products.map((product) => {
      const quantity = productQuantities.get(product.id)!;
      const price = Number(product.price_ngn);

      if (!Number.isFinite(price) || price <= 0) {
        throw new Error("Invalid product price.");
      }

      totalNaira += price * quantity;

      return {
        product_id: product.id,
        product_name: product.name,
        quantity,
        unit_price_ngn: price,
      };
    });

    const amountInKobo = Math.round(totalNaira * 100);

    if (
      !Number.isSafeInteger(amountInKobo) ||
      amountInKobo <= 0
    ) {
      return NextResponse.json(
        { error: "Invalid payment amount." },
        { status: 400 }
      );
    }

    const { data: order, error: orderError } =
      await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          customer_name: customer_name.trim(),
          customer_email: user.email,
          customer_phone: customer_phone.trim(),
          delivery_address: delivery_address.trim(),
          total_ngn: totalNaira,
          payment_status: "pending",
          order_status: "pending",
        })
        .select("id")
        .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Unable to create your order." },
        { status: 500 }
      );
    }

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(
        orderItems.map((item) => ({
          ...item,
          order_id: order.id,
        }))
      );

    if (itemsError) {
      await supabase
        .from("orders")
        .update({ payment_status: "failed" })
        .eq("id", order.id);

      return NextResponse.json(
        { error: "Unable to save your order items." },
        { status: 500 }
      );
    }

    const reference = `EMD-${order.id}-${Date.now()}`;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          amount: amountInKobo,
          currency: "NGN",
          reference,
          metadata: {
            order_id: order.id,
            customer_name: customer_name.trim(),
          },
          ...(siteUrl
            ? {
                callback_url: `${siteUrl.replace(/\/$/, "")}/payment/callback`,
              }
            : {}),
        }),
      }
    );

    const paymentResult = await paystackResponse.json();

    if (!paystackResponse.ok || !paymentResult.status) {
      await supabase
        .from("orders")
        .update({ payment_status: "failed" })
        .eq("id", order.id);

      return NextResponse.json(
        {
          error:
            paymentResult.message ||
            "Unable to initialize Paystack payment.",
        },
        { status: 502 }
      );
    }

    const { error: referenceError } = await supabase
      .from("orders")
      .update({ paystack_reference: reference })
      .eq("id", order.id);

    if (referenceError) {
      return NextResponse.json(
        { error: "Unable to save payment reference." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      authorization_url: paymentResult.data.authorization_url,
      reference,
    });
  } catch (error) {
    console.error("Checkout error:", error);

    return NextResponse.json(
      { error: "Something went wrong while processing checkout." },
      { status: 500 }
    );
  }
}
