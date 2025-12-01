"use client"

import CartDrawer from "./customer/home/components/cart-drawer";
import CategoryTab from "./customer/home/components/category-tab";
import Header from "./customer/home/components/header";


export default function Home() {
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
