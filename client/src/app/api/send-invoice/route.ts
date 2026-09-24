import { NextResponse } from "next/server";
import { Resend } from "resend";
import type { ApiResponse } from "@/types/api";
import type { Order } from "@/types/order";
import { buildInvoiceEmailHtml } from "@/lib/invoice-email-html";
import { canViewInvoice } from "@/lib/invoice-access";

export const runtime = "nodejs";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function fetchOrderFromBackend(orderId: number): Promise<Order | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;

  const response = await fetch(`${apiUrl}/orders/${orderId}`, {
    headers: { "ngrok-skip-browser-warning": "69420" },
    cache: "no-store",
  });
  if (!response.ok) return null;

  const body = (await response.json()) as ApiResponse<Order | null>;
  return body.data ?? null;
}

function buildInvoiceUrl(request: Request, orderId: number) {
  const appOrigin = process.env.APP_URL ?? new URL(request.url).origin;
  return new URL(`/payment/invoice?orderId=${orderId}`, appOrigin).toString();
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const senderEmail = process.env.INVOICE_FROM_EMAIL;

  if (!apiKey || !senderEmail) {
    return NextResponse.json(
      { error: "Layanan email belum dikonfigurasi." },
      { status: 500 },
    );
  }

  let body: { email?: unknown; orderId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const orderId = Number(body.orderId);

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Alamat email tidak valid." }, { status: 400 });
  }
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return NextResponse.json({ error: "Nomor pesanan tidak valid." }, { status: 400 });
  }

  const order = await fetchOrderFromBackend(orderId).catch(() => null);
  if (!order) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
  }
  if (!canViewInvoice(order)) {
    return NextResponse.json({ error: "Struk untuk pesanan ini belum tersedia." }, { status: 403 });
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: `Cat-a Log POS <${senderEmail}>`,
    to: email,
    subject: `Invoice Pesanan #${order.id} — Cat-a Log POS`,
    html: buildInvoiceEmailHtml(order, buildInvoiceUrl(request, order.id)),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
