import type { SellingReport } from "@/types/selling-report";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import XlsxStyle from "xlsx-js-style";

const formatCurrency = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;
const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export function downloadReportAsExcel(report: SellingReport) {
  const thin = { style: "thin", color: { rgb: "D1D5DB" } };
  const border = { top: thin, bottom: thin, left: thin, right: thin };

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

  const colHeaderStyle = {
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
  const ws: any = {};

  ws["A1"] = { v: "LAPORAN PENJUALAN", t: "s", s: titleStyle };
  ws["B1"] = { v: "", t: "s", s: titleStyle };

  ws["A2"] = { v: "Judul", t: "s", s: infoLabelStyle };
  ws["B2"] = { v: report.title, t: "s", s: infoValueStyle };

  ws["A3"] = { v: "Tanggal", t: "s", s: infoLabelStyle };
  ws["B3"] = { v: formatDate(report.date), t: "s", s: infoValueStyle };

  ws["A4"] = { v: "", t: "s" };
  ws["B4"] = { v: "", t: "s" };

  ws["A5"] = { v: "Keterangan", t: "s", s: colHeaderStyle };
  ws["B5"] = { v: "Nilai", t: "s", s: colHeaderStyle };

  ws["A6"] = { v: "Total Transaksi", t: "s", s: labelStyle };
  ws["B6"] = { v: Number(report.total_transaction), t: "n", s: valueStyle };

  ws["A7"] = { v: "Total Produk Terjual", t: "s", s: labelStyle };
  ws["B7"] = { v: Number(report.total_items_sold), t: "n", s: valueStyle };

  ws["A8"] = { v: "Modal", t: "s", s: labelStyle };
  ws["B8"] = { v: formatCurrency(Number(report.unit_cost)), t: "s", s: valueStyle };

  ws["A9"] = { v: "Pendapatan Kotor", t: "s", s: labelStyle };
  ws["B9"] = { v: formatCurrency(Number(report.gross_revenue)), t: "s", s: valueStyle };

  ws["A10"] = { v: "", t: "s" };
  ws["B10"] = { v: "", t: "s" };

  ws["A11"] = { v: "Pendapatan Bersih", t: "s", s: totalLabelStyle };
  ws["B11"] = { v: formatCurrency(Number(report.net_profit)), t: "s", s: totalValueStyle };

  ws["!ref"] = "A1:B11";
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];
  ws["!cols"] = [{ wch: 24 }, { wch: 22 }];
  ws["!rows"] = [
    { hpt: 28 }, {}, {}, { hpt: 6 },
    { hpt: 20 }, {}, {}, {}, {},
    { hpt: 6 }, { hpt: 22 },
  ];

  const wb = XlsxStyle.utils.book_new();
  XlsxStyle.utils.book_append_sheet(wb, ws, "Laporan");
  XlsxStyle.writeFile(wb, `${report.title}.xlsx`);
}

export function downloadReportAsPDF(report: SellingReport) {
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
      ["Total Produk Terjual", String(Number(report.total_items_sold).toLocaleString("id-ID"))],
      ["Modal", formatCurrency(Number(report.unit_cost))],
      ["Pendapatan Kotor", formatCurrency(Number(report.gross_revenue))],
    ],
    headStyles: { fillColor: [34, 197, 94] },
    columnStyles: { 1: { halign: "right" } },
    styles: { fontSize: 10 },
    foot: [["Pendapatan Bersih", formatCurrency(Number(report.net_profit))]],
    footStyles: {
      fillColor: [220, 252, 231],
      textColor: [21, 128, 61],
      fontStyle: "bold",
    },
  });

  doc.save(`${report.title}.pdf`);
}
