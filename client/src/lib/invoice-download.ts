import { formatDate, formatRupiah, formatTime } from "@/lib/format";
import { getOrderItemName } from "@/lib/order";
import { getOrderPlace } from "@/lib/order-place";
import { getOrderStatusDisplay } from "@/lib/order-status";
import type { Order } from "@/types/order";
import jsPDF from "jspdf";

const PDF_COLORS = {
  primary: [244, 146, 80] as const,
  primaryLight: [253, 239, 229] as const,
  pageBackground: [241, 240, 240] as const,
  white: [255, 255, 255] as const,
  dark: [15, 23, 42] as const,
  muted: [107, 114, 128] as const,
  faint: [156, 163, 175] as const,
  border: [229, 231, 235] as const,
};

const PAGE_WIDTH_MM = 210;
const MIN_PAGE_HEIGHT_MM = 297;
const LOGO_RESOLUTION_PX = 128;
const MAX_ITEM_NAME_WIDTH_MM = 52;

async function loadLogoDataUrl(): Promise<string | null> {
  return new Promise((resolve) => {
    const logoImage = new Image();
    logoImage.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = LOGO_RESOLUTION_PX;
      canvas.height = LOGO_RESOLUTION_PX;
      const context = canvas.getContext("2d");
      if (!context) { resolve(null); return; }
      context.drawImage(logoImage, 0, 0, LOGO_RESOLUTION_PX, LOGO_RESOLUTION_PX);
      resolve(canvas.toDataURL("image/png"));
    };
    logoImage.onerror = () => resolve(null);
    logoImage.src = "/image/catalog-logo.svg";
  });
}

function drawNotchedSeparator(doc: jsPDF, cardX: number, lineY: number, cardWidth: number, notchRadius: number) {
  doc.setFillColor(...PDF_COLORS.pageBackground);
  doc.circle(cardX, lineY, notchRadius, "F");
  doc.circle(cardX + cardWidth, lineY, notchRadius, "F");
  doc.setDrawColor(...PDF_COLORS.border);
  doc.setLineWidth(0.3);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (doc as any).setLineDash([2.5, 2], 0);
  doc.line(cardX + notchRadius + 1, lineY, cardX + cardWidth - notchRadius - 1, lineY);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (doc as any).setLineDash([]);
}

export async function downloadInvoiceAsPdf(order: Order) {
  const { id, total_price, items, status, created_at } = order;
  const place = getOrderPlace(order);
  const statusLabel = getOrderStatusDisplay(Number(status)).label;
  const orderDate = formatDate(created_at);
  const orderTime = formatTime(created_at, { withTimeZone: false });

  const logoDataUrl = await loadLogoDataUrl();

  const hasCustomer = !!order.customer_name;
  const itemCount = items?.length ?? 0;
  const cardHeight = 216 + itemCount * 9 + (hasCustomer ? 9 : 0);
  const pageHeight = Math.max(MIN_PAGE_HEIGHT_MM, cardHeight + 30);

  const doc = new jsPDF({ unit: "mm", format: [PAGE_WIDTH_MM, pageHeight] });

  const cardX = 40;
  const cardWidth = 130;
  const cardY = 15;
  const innerLeftX = cardX + 12;
  const innerRightX = cardX + cardWidth - 12;
  const centerX = cardX + cardWidth / 2;
  const notchRadius = 5;

  doc.setFillColor(...PDF_COLORS.pageBackground);
  doc.rect(0, 0, PAGE_WIDTH_MM, pageHeight, "F");

  doc.setFillColor(...PDF_COLORS.white);
  doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 6, 6, "F");

  let cursorY = cardY + 20;

  const logoSize = 20;
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", centerX - logoSize / 2, cursorY - logoSize / 2, logoSize, logoSize);
  } else {
    doc.setFillColor(...PDF_COLORS.primary);
    doc.circle(centerX, cursorY, 10, "F");
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...PDF_COLORS.white);
    doc.text("PDF_COLORS", centerX, cursorY + 2, { align: "center" });
  }
  cursorY += 16;

  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PDF_COLORS.dark);
  doc.text("Terima Kasih!", centerX, cursorY, { align: "center" });
  cursorY += 6;

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...PDF_COLORS.muted);
  doc.text("Pesanan Anda telah berhasil diproses.", centerX, cursorY, { align: "center" });
  cursorY += 4.5;
  doc.text("Sistem Manajemen Restoran CAT-A LOG", centerX, cursorY, { align: "center" });
  cursorY += 9;

  drawNotchedSeparator(doc, cardX, cursorY, cardWidth, notchRadius);
  cursorY += notchRadius + 7;

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...PDF_COLORS.muted);
  doc.text("ORDER ID", innerLeftX, cursorY);
  doc.text("TOTAL BAYAR", innerRightX, cursorY, { align: "right" });
  cursorY += 5.5;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PDF_COLORS.dark);
  doc.text(`#${id}`, innerLeftX, cursorY);
  doc.setTextColor(...PDF_COLORS.primary);
  doc.text(formatRupiah(total_price), innerRightX, cursorY, { align: "right" });
  cursorY += 9;

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...PDF_COLORS.muted);
  doc.text("TEMPAT", innerLeftX, cursorY);
  doc.text("STATUS", innerRightX, cursorY, { align: "right" });
  cursorY += 5.5;

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PDF_COLORS.dark);
  doc.text(`${place.code}  —  ${place.name}`, innerLeftX, cursorY);

  doc.setFontSize(8.5);
  const statusTextWidth = doc.getTextWidth(statusLabel);
  const statusPadding = 3.5;
  const statusBadgeWidth = statusTextWidth + statusPadding * 2;
  const statusBadgeX = innerRightX - statusBadgeWidth;
  doc.setFillColor(...PDF_COLORS.primaryLight);
  doc.roundedRect(statusBadgeX, cursorY - 4, statusBadgeWidth, 6.5, 2, 2, "F");
  doc.setTextColor(...PDF_COLORS.primary);
  doc.text(statusLabel, statusBadgeX + statusPadding, cursorY);
  cursorY += 9;

  if (order.customer_name) {
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...PDF_COLORS.muted);
    doc.text("PEMESAN", innerLeftX, cursorY);
    cursorY += 5.5;

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...PDF_COLORS.dark);
    doc.text(String(order.customer_name), innerLeftX, cursorY);
    cursorY += 9;
  }

  doc.setFillColor(...PDF_COLORS.primaryLight);
  doc.roundedRect(innerLeftX - 2, cursorY - 2, cardWidth - 20, 14, 3, 3, "F");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...PDF_COLORS.primary);
  doc.text("TANGGAL", innerLeftX, cursorY + 3);
  doc.text("PUKUL", innerRightX, cursorY + 3, { align: "right" });
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PDF_COLORS.dark);
  doc.text(orderDate, innerLeftX, cursorY + 10);
  doc.text(orderTime, innerRightX, cursorY + 10, { align: "right" });
  cursorY += 18;

  drawNotchedSeparator(doc, cardX, cursorY, cardWidth, notchRadius);
  cursorY += notchRadius + 7;

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PDF_COLORS.muted);
  doc.text("ITEM PESANAN", innerLeftX, cursorY);
  cursorY += 6;

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...PDF_COLORS.faint);
  doc.text("Menu", innerLeftX, cursorY);
  doc.text("Qty", centerX, cursorY, { align: "center" });
  doc.text("Subtotal", innerRightX, cursorY, { align: "right" });
  cursorY += 2;

  doc.setDrawColor(...PDF_COLORS.border);
  doc.setLineWidth(0.25);
  doc.line(innerLeftX, cursorY, innerRightX, cursorY);
  cursorY += 5;

  for (const item of (items ?? [])) {
    const itemName = getOrderItemName(item);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    let truncatedName = itemName;
    if (doc.getTextWidth(truncatedName) > MAX_ITEM_NAME_WIDTH_MM) {
      while (truncatedName.length > 4 && doc.getTextWidth(truncatedName + "...") > MAX_ITEM_NAME_WIDTH_MM) {
        truncatedName = truncatedName.slice(0, -1);
      }
      truncatedName += "...";
    }

    doc.setTextColor(...PDF_COLORS.dark);
    doc.text(truncatedName, innerLeftX, cursorY);

    doc.setTextColor(...PDF_COLORS.muted);
    doc.text(`×${item.quantity}`, centerX, cursorY, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...PDF_COLORS.dark);
    doc.text(formatRupiah(item.total_price), innerRightX, cursorY, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...PDF_COLORS.faint);
    doc.text(`${formatRupiah(item.price)} / pcs`, innerLeftX, cursorY + 4);

    cursorY += 9;
  }

  cursorY += 1;
  doc.setDrawColor(...PDF_COLORS.border);
  doc.setLineWidth(0.25);
  doc.line(innerLeftX, cursorY, innerRightX, cursorY);
  cursorY += 5;

  doc.setFillColor(...PDF_COLORS.primary);
  doc.roundedRect(innerLeftX - 2, cursorY - 1.5, cardWidth - 20, 12, 3, 3, "F");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PDF_COLORS.white);
  doc.text("TOTAL", innerLeftX + 2, cursorY + 7);
  doc.text(formatRupiah(total_price), innerRightX - 2, cursorY + 7, { align: "right" });
  cursorY += 17;

  drawNotchedSeparator(doc, cardX, cursorY, cardWidth, notchRadius);
  cursorY += notchRadius + 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PDF_COLORS.primary);
  doc.text("Terima kasih telah memesan di CAT-A LOG!", centerX, cursorY, { align: "center" });
  cursorY += 5;
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...PDF_COLORS.faint);
  doc.text(`Dicetak: ${new Date().toLocaleString("id-ID")}`, centerX, cursorY, { align: "center" });
  cursorY += 4;
  doc.text("Invoice ini diterbitkan secara otomatis oleh sistem CAT-A LOG.", centerX, cursorY, { align: "center" });

  const cardBottomY = cardY + cardHeight;
  for (let scallopX = cardX + 6; scallopX <= cardX + cardWidth - 3; scallopX += 9) {
    doc.setFillColor(...PDF_COLORS.pageBackground);
    doc.circle(scallopX, cardBottomY, 4, "F");
  }

  doc.save(`Invoice-Order-${id}.pdf`);
}
