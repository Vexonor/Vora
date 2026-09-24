import { formatDate, formatNumber, formatRupiah } from "@/lib/format";
import type { SellingReport } from "@/types/selling-report";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import XlsxStyle from "xlsx-js-style";

export function downloadReportAsExcel(report: SellingReport) {
  const thinBorderSide = { style: "thin", color: { rgb: "D1D5DB" } };
  const border = { top: thinBorderSide, bottom: thinBorderSide, left: thinBorderSide, right: thinBorderSide };

  const titleStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" }, sz: 13 },
    fill: { patternType: "solid", fgColor: { rgb: "22C55E" } },
    alignment: { horizontal: "center", vertical: "center" },
    border,
  };

  const infoLabelStyle = {
    font: { bold: true, sz: 10 },
    fill: { patternType: "solid", fgColor: { rgb: "F3F4F6" } },
    alignment: { horizontal: "left", vertical: "center" },
    border,
  };

  const infoValueStyle = {
    font: { sz: 10 },
    alignment: { horizontal: "left", vertical: "center" },
    border,
  };

  const columnHeaderStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" }, sz: 10 },
    fill: { patternType: "solid", fgColor: { rgb: "16A34A" } },
    alignment: { horizontal: "center", vertical: "center" },
    border,
  };

  const labelStyle = {
    font: { sz: 10 },
    fill: { patternType: "solid", fgColor: { rgb: "F9FAFB" } },
    alignment: { horizontal: "left", vertical: "center" },
    border,
  };

  const valueStyle = {
    font: { sz: 10 },
    alignment: { horizontal: "right", vertical: "center" },
    border,
  };

  const totalLabelStyle = {
    font: { bold: true, sz: 11 },
    fill: { patternType: "solid", fgColor: { rgb: "DCFCE7" } },
    alignment: { horizontal: "left", vertical: "center" },
    border,
  };

  const totalValueStyle = {
    font: { bold: true, sz: 11, color: { rgb: "15803D" } },
    fill: { patternType: "solid", fgColor: { rgb: "DCFCE7" } },
    alignment: { horizontal: "right", vertical: "center" },
    border,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const worksheet: any = {};

  worksheet["A1"] = { v: "LAPORAN PENJUALAN", t: "s", s: titleStyle };
  worksheet["B1"] = { v: "", t: "s", s: titleStyle };

  worksheet["A2"] = { v: "Judul", t: "s", s: infoLabelStyle };
  worksheet["B2"] = { v: report.title, t: "s", s: infoValueStyle };

  worksheet["A3"] = { v: "Tanggal", t: "s", s: infoLabelStyle };
  worksheet["B3"] = { v: formatDate(report.date), t: "s", s: infoValueStyle };

  worksheet["A4"] = { v: "", t: "s" };
  worksheet["B4"] = { v: "", t: "s" };

  worksheet["A5"] = { v: "Keterangan", t: "s", s: columnHeaderStyle };
  worksheet["B5"] = { v: "Nilai", t: "s", s: columnHeaderStyle };

  worksheet["A6"] = { v: "Total Transaksi", t: "s", s: labelStyle };
  worksheet["B6"] = { v: Number(report.total_transaction), t: "n", s: valueStyle };

  worksheet["A7"] = { v: "Total Produk Terjual", t: "s", s: labelStyle };
  worksheet["B7"] = { v: Number(report.total_items_sold), t: "n", s: valueStyle };

  worksheet["A8"] = { v: "Modal", t: "s", s: labelStyle };
  worksheet["B8"] = { v: formatRupiah(report.unit_cost), t: "s", s: valueStyle };

  worksheet["A9"] = { v: "Pendapatan Kotor", t: "s", s: labelStyle };
  worksheet["B9"] = { v: formatRupiah(report.gross_revenue), t: "s", s: valueStyle };

  worksheet["A10"] = { v: "", t: "s" };
  worksheet["B10"] = { v: "", t: "s" };

  worksheet["A11"] = { v: "Pendapatan Bersih", t: "s", s: totalLabelStyle };
  worksheet["B11"] = { v: formatRupiah(report.net_profit), t: "s", s: totalValueStyle };

  worksheet["!ref"] = "A1:B11";
  worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];
  worksheet["!cols"] = [{ wch: 24 }, { wch: 22 }];
  worksheet["!rows"] = [
    { hpt: 28 }, {}, {}, { hpt: 6 },
    { hpt: 20 }, {}, {}, {}, {},
    { hpt: 6 }, { hpt: 22 },
  ];

  const workbook = XlsxStyle.utils.book_new();
  XlsxStyle.utils.book_append_sheet(workbook, worksheet, "Laporan");
  XlsxStyle.writeFile(workbook, `${report.title}.xlsx`);
}

export function downloadReportAsPdf(report: SellingReport) {
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(report.title, 14, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text(formatDate(report.date), 14, 28);
  doc.setTextColor(0, 0, 0);

  autoTable(doc, {
    startY: 36,
    head: [["Keterangan", "Nilai"]],
    body: [
      ["Total Transaksi", String(report.total_transaction)],
      ["Total Produk Terjual", formatNumber(report.total_items_sold)],
      ["Modal", formatRupiah(report.unit_cost)],
      ["Pendapatan Kotor", formatRupiah(report.gross_revenue)],
    ],
    headStyles: { fillColor: [34, 197, 94] },
    columnStyles: { 1: { halign: "right" } },
    styles: { fontSize: 10 },
    foot: [["Pendapatan Bersih", formatRupiah(report.net_profit)]],
    footStyles: {
      fillColor: [220, 252, 231],
      textColor: [21, 128, 61],
      fontStyle: "bold",
    },
  });

  doc.save(`${report.title}.pdf`);
}
