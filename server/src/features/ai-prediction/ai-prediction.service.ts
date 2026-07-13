import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SellingReport } from '../selling-report/entities/selling-report.entity';
import { ResponseHelper } from 'src/core/helpers/response.helper';
import { toLocalDateString } from 'src/core/helpers/date.helper';

export interface PredictionRow {
  date: string;
  gross_revenue: number;
  net_profit: number;
  total_transaction: number;
  total_items_sold: number;
}

export interface RawPredictionResult {
  history: PredictionRow[];
  predictions: PredictionRow[];
  evaluation: unknown;
  trained_on: number;
}

/** Dilempar ketika data historis tidak cukup untuk prediksi. */
export class InsufficientHistoryError extends Error {
  constructor() {
    super('Minimal 2 laporan penjualan diperlukan untuk prediksi');
    this.name = 'InsufficientHistoryError';
  }
}

/** Dilempar ketika layanan AI merespons dengan status non-OK. */
export class AiServiceError extends Error {
  constructor() {
    super('Layanan AI mengembalikan error');
    this.name = 'AiServiceError';
  }
}

@Injectable()
export class AiPredictionService {
  private readonly logger = new Logger(AiPredictionService.name);

  constructor(
    @InjectModel(SellingReport)
    private readonly sellingReportModel: typeof SellingReport,
    private readonly response: ResponseHelper,
  ) {}

  /**
   * Mengambil prediksi mentah dari layanan AI. Melempar error bila data < 2
   * atau layanan tidak dapat dijangkau. Dipakai oleh endpoint dan cron.
   */
  async getPredictions(days = 30): Promise<RawPredictionResult> {
    const reports = await this.sellingReportModel.findAll({
      order: [['date', 'ASC']],
    });

    if (reports.length < 2) {
      throw new InsufficientHistoryError();
    }

    const history: PredictionRow[] = reports.map((r) => ({
      date: toLocalDateString(r.date as Date),
      gross_revenue: Number(r.gross_revenue),
      net_profit: Number(r.net_profit),
      total_transaction: Number(r.total_transaction),
      total_items_sold: Number(r.total_items_sold),
    }));

    const aiUrl = process.env.AI_SERVICE_URL ?? 'http://localhost:8090';

    const res = await fetch(`${aiUrl}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, days }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      const text = await res.text();
      this.logger.error(`AI service error ${res.status}: ${text}`);
      throw new AiServiceError();
    }

    const data = await res.json();
    return {
      history,
      predictions: data.predictions ?? [],
      evaluation: data.evaluation,
      trained_on: history.length,
    };
  }

  /**
   * Endpoint prediksi (perilaku tidak berubah): membungkus getPredictions
   * dengan ResponseHelper dan memetakan error ke kode HTTP yang sesuai.
   */
  async predict(days = 30) {
    try {
      const { history, ...data } = await this.getPredictions(days);
      return this.response.success(
        { history, ...data },
        HttpStatus.OK,
        'Prediksi berhasil diambil',
      );
    } catch (err) {
      if (err instanceof InsufficientHistoryError) {
        return this.response.fail(err.message, HttpStatus.UNPROCESSABLE_ENTITY);
      }
      if (err instanceof AiServiceError) {
        return this.response.fail(err.message, HttpStatus.BAD_GATEWAY);
      }
      this.logger.error('AI service tidak dapat dijangkau', err as Error);
      return this.response.fail(
        'Layanan AI tidak tersedia. Pastikan service Python sudah berjalan.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
