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
    if (!supabaseUrl || !serviceRoleKey || !paystackSecretKey) {
      return NextResponse.json(
        { success: false, error: "Payment verification is not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const reference = body.reference;

    if (
      typeof reference !== "string" ||
      reference.length < 10 ||
      reference.length > 200
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid payment reference." },
        { status: 400 }
      );
    }

    // Find the order associated with this payment reference.
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, total_ngn, payment_status, paystack_reference")
      .eq("paystack_reference", reference)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: "Order not found." },
        { status: 404 }
      );
    }

    // Verify the transaction directly with Paystack.
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const verification = await paystackResponse.json();

    if (!paystackResponse.ok || !verification.status) {
      return NextResponse.json(
        { success: false, error: "Paystack could not verify this transaction." },
        { status: 502 }
      );
    }

    const transaction = verification.data;

    // Confirm the transaction belongs to this exact order.
    if (
      transaction.reference !== order.paystack_reference ||
      transaction.metadata?.order_id !== order.id
    ) {
      return NextResponse.json(
        { success: false, error: "Payment reference does not match the order." },
        { status: 400 }
      );
    }

    // Confirm successful payment, exact amount and currency.
    const expectedAmount = Math.round(Number(order.total_ngn) * 100);

    if (
      transaction.status !== "success" ||
      transaction.currency !== "NGN" ||
      transaction.amount !== expectedAmount
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment has not been confirmed or the amount does not match.",
        },
        { status: 400 }
      );
    }

    // Do not process the same successful payment twice.
    if (order.payment_status === "paid") {
      return NextResponse.json({
        success: true,
        message: "Payment was already confirmed.",
      });
    }

    // Update the order only after Paystack confirms payment.
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        order_status: "processing",
      })
      .eq("id", order.id)
      .eq("paystack_reference", reference);

    if (updateError) {
      console.error("Order update error:", updateError);

      return NextResponse.json(
        { success: false, error: "Payment verified but order update failed. Please contact support." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified.",
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to verify payment right now." },
      { status: 500 }
    );
  }
}
