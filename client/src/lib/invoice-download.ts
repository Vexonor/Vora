import type { Order } from "@/types/order";
import { OrderStatus } from "@/types/order";
import jsPDF from "jspdf";

// App color palette  ── #056A68 primary (teal), #F4F4F4 background, #0F172A foreground
const C = {
  primary:      [5,   106, 104] as const, // #056A68
  primaryLight: [230, 240, 240] as const, // #056A68 @ 10% on white
  pageBg:       [244, 244, 244] as const, // #F4F4F4
  white:        [255, 255, 255] as const,
  dark:         [15,  23,  42 ] as const, // #0F172A
  muted:        [107, 114, 128] as const,
  faint:        [156, 163, 175] as const,
  border:       [229, 231, 235] as const,
};

const formatCurrency = (v: number) => `Rp ${Number(v).toLocaleString("id-ID")}`;

const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return { date: "-", time: "-" };
  const d = new Date(dateStr);
  return {
    date: d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    time: d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
  };
};

const STATUS_LABELS: Record<number, string> = {
  [OrderStatus.PENDING]:    "Menunggu",
  [OrderStatus.PROCESSING]: "Diproses",
  [OrderStatus.READY]:      "Siap Disajikan",
  [OrderStatus.COMPLETED]:  "Selesai",
  [OrderStatus.CANCELED]:   "Dibatalkan",
};

async function loadLogoDataUrl(): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(null); return; }
      ctx.drawImage(img, 0, 0, 128, 128);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(null);
    img.src = "/image/app-logo.svg";
  });
}

function drawNotchedSep(doc: jsPDF, cx: number, y: number, cw: number, r: number) {
  doc.setFillColor(...C.pageBg);
  doc.circle(cx, y, r, "F");
  doc.circle(cx + cw, y, r, "F");
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (doc as any).setLineDash([2.5, 2], 0);
  doc.line(cx + r + 1, y, cx + cw - r - 1, y);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (doc as any).setLineDash([]);
}

export async function downloadInvoiceAsPDF(order: Order) {
  const { id, table_id, total_price, items, status, created_at } = order;
  const tableCode  = `T-${String(table_id).padStart(2, "0")}`;
  const tableName  = `Meja ${String(table_id).padStart(2, "0")}`;
  const statusLabel = STATUS_LABELS[Number(status)] ?? "Unknown";
  const { date, time } = formatDateTime(created_at);

  const logoDataUrl = await loadLogoDataUrl();

  const hasCustomer = !!order.customer_name;
  const iCount = items?.length ?? 0;
  const cardH  = 216 + iCount * 9 + (hasCustomer ? 9 : 0);
  const pageH  = Math.max(297, cardH + 30);

  const doc = new jsPDF({ unit: "mm", format: [210, pageH] });

  // Layout constants
  const cardX = 40;
  const cardW = 130;
  const cardY = 15;
  const iX    = cardX + 12;          // inner left edge
  const oX    = cardX + cardW - 12;  // inner right edge
  const mX    = cardX + cardW / 2;   // center
  const nr    = 5;                   // notch radius

  // ── Page background ───────────────────────────────────────────
  doc.setFillColor(...C.pageBg);
  doc.rect(0, 0, 210, pageH, "F");

  // ── White ticket card ─────────────────────────────────────────
  doc.setFillColor(...C.white);
  doc.roundedRect(cardX, cardY, cardW, cardH, 6, 6, "F");

  let y = cardY + 20;

  // ── App logo ──────────────────────────────────────────────────
  const logoSize = 20; // mm
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", mX - logoSize / 2, y - logoSize / 2, logoSize, logoSize);
  } else {
    // Fallback: solid teal circle
    doc.setFillColor(...C.primary);
    doc.circle(mX, y, 10, "F");
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.white);
    doc.text("V", mX, y + 2, { align: "center" });
  }
  y += 16;

  // ── Heading ───────────────────────────────────────────────────
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.dark);
  doc.text("Terima Kasih!", mX, y, { align: "center" });
  y += 6;

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.muted);
  doc.text("Pesanan Anda telah berhasil diproses.", mX, y, { align: "center" });
  y += 4.5;
  doc.text("Sistem Manajemen Restoran VORA", mX, y, { align: "center" });
  y += 9;

  // ── SEPARATOR 1 ───────────────────────────────────────────────
  drawNotchedSep(doc, cardX, y, cardW, nr);
  y += nr + 7;

  // ── ORDER ID & TOTAL ──────────────────────────────────────────
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.muted);
  doc.text("ORDER ID",    iX, y);
  doc.text("TOTAL BAYAR", oX, y, { align: "right" });
  y += 5.5;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.dark);
  doc.text(`#${id}`, iX, y);
  doc.setTextColor(...C.primary);
  doc.text(formatCurrency(Number(total_price)), oX, y, { align: "right" });
  y += 9;

  // ── MEJA & STATUS ─────────────────────────────────────────────
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.muted);
  doc.text("MEJA",   iX, y);
  doc.text("STATUS", oX, y, { align: "right" });
  y += 5.5;

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.dark);
  doc.text(`${tableCode}  —  ${tableName}`, iX, y);

  // Status badge
  doc.setFontSize(8.5);
  const sW  = doc.getTextWidth(statusLabel);
  const sP  = 3.5;
  const sBW = sW + sP * 2;
  const sBX = oX - sBW;
  doc.setFillColor(...C.primaryLight);
  doc.roundedRect(sBX, y - 4, sBW, 6.5, 2, 2, "F");
  doc.setTextColor(...C.primary);
  doc.text(statusLabel, sBX + sP, y);
  y += 9;

  // ── PEMESAN (opsional) ────────────────────────────────────────
  if (order.customer_name) {
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.muted);
    doc.text("PEMESAN", iX, y);
    y += 5.5;

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.dark);
    doc.text(String(order.customer_name), iX, y);
    y += 9;
  }

  // ── DATE & TIME box ───────────────────────────────────────────
  doc.setFillColor(...C.primaryLight);
  doc.roundedRect(iX - 2, y - 2, cardW - 20, 14, 3, 3, "F");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.primary);
  doc.text("TANGGAL", iX, y + 3);
  doc.text("PUKUL",   oX, y + 3, { align: "right" });
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.dark);
  doc.text(date, iX, y + 10);
  doc.text(time, oX, y + 10, { align: "right" });
  y += 18;

  // ── SEPARATOR 2 ───────────────────────────────────────────────
  drawNotchedSep(doc, cardX, y, cardW, nr);
  y += nr + 7;

  // ── ITEMS ─────────────────────────────────────────────────────
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.muted);
  doc.text("ITEM PESANAN", iX, y);
  y += 6;

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.faint);
  doc.text("Menu",     iX, y);
  doc.text("Qty",      mX, y, { align: "center" });
  doc.text("Subtotal", oX, y, { align: "right" });
  y += 2;

  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.25);
  doc.line(iX, y, oX, y);
  y += 5;

  for (const item of (items ?? [])) {
    const rawName = item.menu?.name ?? `Menu #${item.menu_id}`;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    let displayName = rawName;
    if (doc.getTextWidth(displayName) > 52) {
      while (displayName.length > 4 && doc.getTextWidth(displayName + "...") > 52) {
        displayName = displayName.slice(0, -1);
      }
      displayName += "...";
    }

    doc.setTextColor(...C.dark);
    doc.text(displayName, iX, y);

    doc.setTextColor(...C.muted);
    doc.text(`×${item.quantity}`, mX, y, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.dark);
    doc.text(formatCurrency(Number(item.total_price)), oX, y, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C.faint);
    doc.text(`${formatCurrency(Number(item.price))} / pcs`, iX, y + 4);

    y += 9;
  }

  y += 1;
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.25);
  doc.line(iX, y, oX, y);
  y += 5;

  // ── Total bar ─────────────────────────────────────────────────
  doc.setFillColor(...C.primary);
  doc.roundedRect(iX - 2, y - 1.5, cardW - 20, 12, 3, 3, "F");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.white);
  doc.text("TOTAL", iX + 2, y + 7);
  doc.text(formatCurrency(Number(total_price)), oX - 2, y + 7, { align: "right" });
  y += 17;

  // ── SEPARATOR 3 ───────────────────────────────────────────────
  drawNotchedSep(doc, cardX, y, cardW, nr);
  y += nr + 7;

  // ── Footer ────────────────────────────────────────────────────
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.primary);
  doc.text("Terima kasih telah memesan di VORA!", mX, y, { align: "center" });
  y += 5;
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.faint);
  doc.text(`Dicetak: ${new Date().toLocaleString("id-ID")}`, mX, y, { align: "center" });
  y += 4;
  doc.text("Invoice ini diterbitkan secara otomatis oleh sistem VORA.", mX, y, { align: "center" });

  // ── Bottom scalloped edge ─────────────────────────────────────
  const botY = cardY + cardH;
  for (let bx = cardX + 6; bx <= cardX + cardW - 3; bx += 9) {
    doc.setFillColor(...C.pageBg);
    doc.circle(bx, botY, 4, "F");
  }

  doc.save(`Invoice-Order-${id}.pdf`);
}
