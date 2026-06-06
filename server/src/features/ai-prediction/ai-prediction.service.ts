import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SellingReport } from '../selling-report/entities/selling-report.entity';
import { ResponseHelper } from 'src/core/helpers/response.helper';

/**
 * Format Date menjadi "YYYY-MM-DD" memakai komponen waktu LOKAL.
 * Hindari toISOString() yang mengonversi ke UTC sehingga tanggal bisa
 * mundur 1 hari pada zona waktu non-UTC (mis. WIB +7).
 */
function toLocalDateString(date: Date): string {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

@Injectable()
export class AiPredictionService {
  private readonly logger = new Logger(AiPredictionService.name);

  constructor(
    @InjectModel(SellingReport)
    private readonly sellingReportModel: typeof SellingReport,
    private readonly response: ResponseHelper,
  ) {}

  async predict(days = 30) {
    const reports = await this.sellingReportModel.findAll({
      order: [['date', 'ASC']],
    });

    if (reports.length < 2) {
      return this.response.fail(
        'Minimal 2 laporan penjualan diperlukan untuk prediksi',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const history = reports.map((r) => ({
      date: toLocalDateString(r.date as Date),
      gross_revenue: Number(r.gross_revenue),
      net_profit: Number(r.net_profit),
      total_transaction: Number(r.total_transaction),
      total_items_sold: Number(r.total_items_sold),
    }));

    const aiUrl = process.env.AI_SERVICE_URL ?? 'http://localhost:8090';

    try {
      const res = await fetch(`${aiUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history, days }),
        signal: AbortSignal.timeout(30_000),
      });

      if (!res.ok) {
        const text = await res.text();
        this.logger.error(`AI service error ${res.status}: ${text}`);
        return this.response.fail(
          'Layanan AI mengembalikan error',
          HttpStatus.BAD_GATEWAY,
        );
      }

      const data = await res.json();
      return this.response.success(
        { history, ...data },
        HttpStatus.OK,
        'Prediksi berhasil diambil',
      );
    } catch (err) {
      this.logger.error('AI service tidak dapat dijangkau', err);
      return this.response.fail(
        'Layanan AI tidak tersedia. Pastikan service Python sudah berjalan.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
