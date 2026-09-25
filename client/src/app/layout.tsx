import { AppProviders } from "@/components/providers/app-providers";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cat-a Log",
  description: "POS Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
