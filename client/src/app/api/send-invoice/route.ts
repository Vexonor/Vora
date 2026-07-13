import { NextResponse } from "next/server";
import { Resend } from "resend";
import type { Order } from "@/types/order";
import { buildInvoiceEmailHtml } from "@/lib/invoice-email-html";

// Attachments/Buffer and the Resend SDK need the Node.js runtime (not Edge).
export const runtime = "nodejs";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.INVOICE_FROM_EMAIL;

  if (!apiKey || !from) {
    return NextResponse.json(
      { error: "Layanan email belum dikonfigurasi." },
      { status: 500 },
    );
  }

  let body: { email?: string; order?: Order; invoiceUrl?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const { email, order, invoiceUrl } = body;

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Alamat email tidak valid." }, { status: 400 });
  }
  if (!order?.id || !invoiceUrl) {
    return NextResponse.json({ error: "Data invoice tidak lengkap." }, { status: 400 });
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: `Vora POS <${from}>`,
    to: email,
    subject: `Invoice Pesanan #${order.id} — Vora POS`,
    html: buildInvoiceEmailHtml(order, invoiceUrl),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
