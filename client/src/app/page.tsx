"use client"

import { useEffect } from "react";
import CartDrawer from "./(public)/home/components/cart-drawer";
import CategoryTab from "./(public)/home/components/category-tab";
import Header from "./(public)/home/components/header";

export default function Home() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tableId = params.get("table");
      if (tableId) {
        localStorage.setItem("table_id", tableId);
      }
    }
  }, []);

  return (
    <main className="w-full h-dvh bg-primary">
      <div className="max-w-3xl h-full mx-auto bg-background flex flex-col gap-2 relative">
        <Header />
        <CategoryTab />

        <div className="absolute bottom-4 right-4 bg-secondary size-20 flex justify-center items-center rounded-full z-30">
          <CartDrawer />
        </div>
      </div>
    </main>
  );
}
