"""
Grafik Feature Importance — Random Forest Regression (Penerapan Metode AI).

Skrip ini melatih model prediksi (SalesTrendPredictor) lalu menyimpan grafik
seberapa besar pengaruh tiap fitur terhadap prediksi, untuk dokumentasi/skripsi.

Catatan: model di proyek ini ada 4 (satu per target: pendapatan kotor, laba
bersih, jumlah transaksi, item terjual), jadi grafik dibuat 1 subplot per target.

Cara pakai:
    # A) Pakai data ASLI dari backend (disarankan):
    #    PowerShell:  $env:VORA_API_URL="http://localhost:3000/api/v1"; python feature_importance.py
    #    (opsional)   $env:VORA_TOKEN="<jwt manager>"   # bila endpoint butuh login
    #
    # B) Tanpa backend: otomatis memakai data contoh 90 hari (pola mirip seeder)
    #    python feature_importance.py

Output: feature_importance.png
"""

import json
import os
import urllib.request
from datetime import datetime, timedelta

import matplotlib

matplotlib.use("Agg")  # headless: tidak butuh layar/display
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402

from predictor import TARGETS, SalesTrendPredictor  # noqa: E402

# Label fitur & target yang lebih ramah dibaca pada grafik
FEATURE_LABELS = {
    "day_of_week": "Hari dalam minggu",
    "day_of_month": "Tanggal",
    "month": "Bulan",
    "year": "Tahun",
    "day_of_year": "Hari ke- (tahun)",
    "days_since_start": "Hari sejak awal",
    "gross_revenue_r3": "Rata2 pendapatan 3h",
    "gross_revenue_r7": "Rata2 pendapatan 7h",
    "net_profit_r3": "Rata2 laba 3h",
    "net_profit_r7": "Rata2 laba 7h",
    "total_transaction_r3": "Rata2 transaksi 3h",
    "total_transaction_r7": "Rata2 transaksi 7h",
}

TARGET_LABELS = {
    "gross_revenue": "Pendapatan Kotor",
    "net_profit": "Laba Bersih",
    "total_transaction": "Jumlah Transaksi",
    "total_items_sold": "Item Terjual",
}

PRIMARY = "#056A68"  # warna brand Vora


def _sample_history(days: int = 90) -> list[dict]:
    """Data contoh deterministik: tren naik + musiman akhir pekan + noise."""
    rng = np.random.default_rng(42)
    today = datetime.now()
    rows = []
    for i in range(days - 1, -1, -1):
        date = today - timedelta(days=i)
        idx = days - 1 - i
        dow = date.weekday()  # 0=Senin ... 5=Sabtu, 6=Minggu
        base = 40 + idx * 0.25
        if dow >= 5:
            base += 28  # akhir pekan ramai
        elif dow == 4:
            base += 14  # Jumat sedang
        tx = max(8, round(base * (1 + (rng.random() - 0.5) * 0.3)))
        items = round(tx * (2.2 + rng.random() * 0.8))
        avg_ticket = 38000 + rng.random() * 12000
        gross = round(tx * avg_ticket)
        net = round(gross * (0.26 + rng.random() * 0.08))
        rows.append(
            {
                "date": date.strftime("%Y-%m-%d"),
                "gross_revenue": gross,
                "net_profit": net,
                "total_transaction": tx,
                "total_items_sold": items,
            }
        )
    return rows


def _fetch_history() -> list[dict] | None:
    """Ambil laporan penjualan asli dari backend bila VORA_API_URL di-set."""
    base = os.environ.get("VORA_API_URL")
    if not base:
        return None

    url = base.rstrip("/") + "/manager/selling-reports"
    req = urllib.request.Request(url, headers={"ngrok-skip-browser-warning": "1"})
    token = os.environ.get("VORA_TOKEN")
    if token:
        req.add_header("Authorization", f"Bearer {token}")

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            body = json.loads(resp.read().decode())
        reports = body.get("data", body) if isinstance(body, dict) else body
        history = [
            {
                "date": str(r["date"])[:10],
                "gross_revenue": float(r.get("gross_revenue", 0) or 0),
                "net_profit": float(r.get("net_profit", 0) or 0),
                "total_transaction": float(r.get("total_transaction", 0) or 0),
                "total_items_sold": float(r.get("total_items_sold", 0) or 0),
            }
            for r in reports
        ]
        return history if len(history) >= 2 else None
    except Exception as exc:  # noqa: BLE001
        print(f"[!] Gagal ambil data backend ({exc}). Memakai data contoh.")
        return None


def main() -> None:
    history = _fetch_history()
    if history:
        print(f"[i] Memakai {len(history)} data ASLI dari backend.")
    else:
        history = _sample_history()
        print(
            f"[i] Memakai {len(history)} data contoh "
            "(set VORA_API_URL untuk pakai data asli)."
        )

    predictor = SalesTrendPredictor()
    predictor.fit(history)
    importances = predictor.feature_importances()

    # Satu subplot per target (2x2)
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle(
        "Feature Importance — Random Forest Regression (Penerapan Metode AI)",
        fontsize=14,
        fontweight="bold",
    )

    for ax, target in zip(axes.flat, TARGETS):
        imp = importances[target]
        items = sorted(imp.items(), key=lambda kv: kv[1])  # ascending utuk barh
        labels = [FEATURE_LABELS.get(k, k) for k, _ in items]
        values = [v for _, v in items]

        ax.barh(labels, values, color=PRIMARY)
        ax.set_title(TARGET_LABELS.get(target, target), fontsize=11, fontweight="bold")
        ax.set_xlabel("Importance")
        for y, v in enumerate(values):
            ax.text(v, y, f" {v:.3f}", va="center", fontsize=8)

    plt.tight_layout(rect=(0, 0, 1, 0.97))
    out_path = "feature_importance.png"
    plt.savefig(out_path, dpi=150)
    print(f"[OK] Grafik disimpan: {out_path}")

    # Ringkasan ke terminal
    print("\nFitur paling berpengaruh per target:")
    for target in TARGETS:
        top_feat, top_val = max(importances[target].items(), key=lambda kv: kv[1])
        label = FEATURE_LABELS.get(top_feat, top_feat)
        print(f"  - {TARGET_LABELS.get(target, target)}: {label} ({top_val:.3f})")


if __name__ == "__main__":
    main()
