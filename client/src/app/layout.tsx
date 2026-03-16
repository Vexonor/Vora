import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/hooks/use-cart";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vora",
  description: "POS Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        <TooltipProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
