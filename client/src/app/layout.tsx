import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/hooks/use-cart";
import { AuthProvider } from "@/hooks/use-auth";
import type { Metadata } from "next";
import { Toaster } from "sonner";
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
        <AuthProvider>
          <TooltipProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </TooltipProvider>
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
