import type { Order } from "@/types/order";
import { getOrderPlace } from "./order-place";

/**
 * Builds the HTML body for the invoice email.
 *
 * This is a pure string builder (no DOM / browser APIs) so it is safe to run
 * inside the serverless API route. Email clients strip <style>/JS, so all
 * styling is inline and layout uses tables for maximum compatibility.
 *
 * @param order      The order to render.
 * @param invoiceUrl Absolute URL to the invoice page (for the "download PDF" button).
 */
export function buildInvoiceEmailHtml(order: Order, invoiceUrl: string): string {
  const rupiah = (v: number) =>
    `Rp ${Number(v).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;

  const place = getOrderPlace(order);

  const subtotal = order.total_price / 1.1;
  const tax = order.total_price - subtotal;

  const createdAt = order.created_at
    ? new Date(order.created_at).toLocaleString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  const itemRows = (order.items ?? [])
    .map((item) => {
      const name = item.menu?.name ?? `Menu #${item.menu_id}`;
      return `
        <tr>
          <td style="padding:8px 0;color:#0f172a;font-size:14px;">
            ${escapeHtml(name)}
            <div style="color:#6b7280;font-size:12px;">${item.quantity} x ${rupiah(item.price)}</div>
          </td>
          <td style="padding:8px 0;text-align:right;color:#0f172a;font-size:14px;font-weight:600;white-space:nowrap;">
            ${rupiah(item.total_price)}
          </td>
        </tr>`;
    })
    .join("");

  const customerRow = order.customer_name
    ? `<tr>
         <td style="padding:2px 0;color:#6b7280;font-size:13px;">Pelanggan</td>
         <td style="padding:2px 0;text-align:right;color:#0f172a;font-size:13px;font-weight:500;">${escapeHtml(order.customer_name)}</td>
       </tr>`
    : "";

  return `
<!-- Invoice email — Vora POS -->
<div style="background-color:#f4f4f4;padding:24px 0;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background-color:#ffffff;border-radius:12px;overflow:hidden;">
    <!-- Header -->
    <tr>
      <td style="background-color:#056A68;padding:28px 32px;text-align:center;">
        <div style="color:#ffffff;font-size:22px;font-weight:bold;letter-spacing:2px;">VORA POS</div>
        <div style="color:#d6eaea;font-size:13px;margin-top:4px;">Asam Pedas Tepi Danau</div>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:28px 32px;">
        <h1 style="margin:0 0 4px;color:#0f172a;font-size:18px;">Invoice Pesanan #${order.id}</h1>
        <p style="margin:0 0 20px;color:#6b7280;font-size:13px;">Terima kasih atas pesanan Anda.</p>

        <!-- Meta -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
          <tr>
            <td style="padding:2px 0;color:#6b7280;font-size:13px;">Tempat</td>
            <td style="padding:2px 0;text-align:right;color:#0f172a;font-size:13px;font-weight:500;">${place.name}</td>
          </tr>
          ${customerRow}
          <tr>
            <td style="padding:2px 0;color:#6b7280;font-size:13px;">Tanggal</td>
            <td style="padding:2px 0;text-align:right;color:#0f172a;font-size:13px;font-weight:500;">${createdAt}</td>
          </tr>
          <tr>
            <td style="padding:2px 0;color:#6b7280;font-size:13px;">Status</td>
            <td style="padding:2px 0;text-align:right;color:#056A68;font-size:13px;font-weight:600;">${escapeHtml(order.status_name || "Lunas")}</td>
          </tr>
        </table>

        <div style="border-top:1px dashed #e5e7eb;margin:16px 0;"></div>

        <!-- Items -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${itemRows}
        </table>

        <div style="border-top:1px dashed #e5e7eb;margin:16px 0;"></div>

        <!-- Totals -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:2px 0;color:#6b7280;font-size:13px;">Subtotal</td>
            <td style="padding:2px 0;text-align:right;color:#0f172a;font-size:13px;">${rupiah(subtotal)}</td>
          </tr>
          <tr>
            <td style="padding:2px 0;color:#6b7280;font-size:13px;">PPN (10%)</td>
            <td style="padding:2px 0;text-align:right;color:#0f172a;font-size:13px;">${rupiah(tax)}</td>
          </tr>
        </table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;background-color:#056A68;border-radius:8px;">
          <tr>
            <td style="padding:12px 16px;color:#ffffff;font-size:15px;font-weight:bold;">TOTAL</td>
            <td style="padding:12px 16px;text-align:right;color:#ffffff;font-size:15px;font-weight:bold;">${rupiah(order.total_price)}</td>
          </tr>
        </table>

        <!-- Download button -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
          <tr>
            <td align="center">
              <a href="${invoiceUrl}"
                 style="display:inline-block;background-color:#056A68;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px;">
                Lihat &amp; Unduh Invoice (PDF)
              </a>
            </td>
          </tr>
        </table>
        <p style="margin:12px 0 0;text-align:center;color:#9ca3af;font-size:11px;">
          Klik tombol di atas untuk membuka invoice dan mengunduh versi PDF.
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding:20px 32px;text-align:center;border-top:1px solid #f0f0f0;">
        <p style="margin:0;color:#9ca3af;font-size:11px;">
          Email ini dikirim otomatis oleh sistem VORA. Mohon tidak membalas email ini.
        </p>
      </td>
    </tr>
  </table>
</div>`;
}

/** Minimal HTML-escaping to avoid breaking the markup with user-provided values. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
