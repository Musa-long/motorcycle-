"use client";

import { CartProvider } from "@/state/cart";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CartProvider>{children}</CartProvider>;
}
