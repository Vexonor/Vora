import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { ResponseHelper } from 'src/core/helpers/response.helper';
import { AiPredictionService } from '../ai-prediction/ai-prediction.service';
import { SellingReport } from '../selling-report/entities/selling-report.entity';
import { SellingTrend } from './entities/selling-trend.entity';
import {
  computeAccuracySummary,
  pickFreshestForecasts,
  METRIC_KEYS,
  type AccuracyPoint,
  type ForecastRow,
  type MetricKey,
} from './accuracy.util';
import { toLocalDateString } from 'src/core/helpers/date.helper';

const SNAPSHOT_HORIZON_DAYS = 7;
const DEFAULT_LOOKBACK_DAYS = 30;

@Injectable()
export class SellingTrendService {
  private readonly logger = new Logger(SellingTrendService.name);

  constructor(
    @InjectModel(SellingTrend)
    private readonly sellingTrendModel: typeof SellingTrend,
    @InjectModel(SellingReport)
    private readonly sellingReportModel: typeof SellingReport,
    private readonly aiPredictionService: AiPredictionService,
    private readonly response: ResponseHelper,
  ) {}

  @Cron('0 23 * * *')
  async handleDailySnapshot(): Promise<void> {
    try {
      const count = await this.generateSnapshot();
      this.logger.log(`Snapshot prediksi tersimpan: ${count} baris`);
    } catch (err) {
      this.logger.error('Gagal menyimpan snapshot prediksi', err as Error);
    }
  }

  /** Menyimpan prediksi 7 hari ke depan sebagai snapshot hari ini. */
  async generateSnapshot(): Promise<number> {
    const { predictions } = await this.aiPredictionService.getPredictions(
      SNAPSHOT_HORIZON_DAYS,
    );
    const generatedDate = toLocalDateString(new Date());

    const rows = predictions.slice(0, SNAPSHOT_HORIZON_DAYS).map((p) => ({
      generated_date: generatedDate,
      target_date: p.date,
      gross_revenue: p.gross_revenue,
      net_profit: p.net_profit,
      total_transaction: p.total_transaction,
      total_items_sold: p.total_items_sold,
    }));

    for (const row of rows) {
      await this.sellingTrendModel.upsert(row);
    }

    return rows.length;
  }

  /** Membandingkan prediksi tersimpan dengan realisasi selling_reports. */
  async getAccuracy(metric: MetricKey = 'gross_revenue', from?: string, to?: string) {
    const safeMetric: MetricKey = METRIC_KEYS.includes(metric)
      ? metric
      : 'gross_revenue';

    const now = new Date();
    const toDate = to ?? toLocalDateString(now);
    const fromDate =
      from ??
      toLocalDateString(
        new Date(now.getTime() - DEFAULT_LOOKBACK_DAYS * 24 * 60 * 60 * 1000),
      );

    const trends = await this.sellingTrendModel.findAll({
      where: { target_date: { [Op.between]: [fromDate, toDate] } },
      raw: true,
    });

    const freshest = pickFreshestForecasts(trends as unknown as ForecastRow[]);

    const reports = await this.sellingReportModel.findAll({
      where: { date: { [Op.between]: [fromDate, `${toDate} 23:59:59`] } },
      raw: true,
    });

    // Peta realisasi: target_date (YYYY-MM-DD) -> nilai metrik aktual.
    const actualByDate = new Map<string, number>();
    for (const report of reports as unknown as Array<Record<string, unknown>>) {
      const key = toLocalDateString(report.date as Date);
      actualByDate.set(key, Number(report[safeMetric]));
    }

    const series: AccuracyPoint[] = [];
    for (const [targetDate, forecast] of freshest) {
      if (!actualByDate.has(targetDate)) continue;
      series.push({
        target_date: targetDate,
        predicted: Number(forecast[safeMetric]),
        actual: actualByDate.get(targetDate) as number,
      });
    }

    series.sort((a, b) => a.target_date.localeCompare(b.target_date));
    const summary = computeAccuracySummary(series);

    return this.response.success(
      { metric: safeMetric, series, summary },
      HttpStatus.OK,
      'Successfully get prediction accuracy',
    );
  }
}
