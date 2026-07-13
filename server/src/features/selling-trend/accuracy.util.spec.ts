import {
  pickFreshestForecasts,
  computeAccuracySummary,
  type ForecastRow,
} from './accuracy.util';

const row = (generated_date: string, target_date: string, gross_revenue: number): ForecastRow => ({
  generated_date,
  target_date,
  gross_revenue,
  net_profit: 0,
  total_transaction: 0,
  total_items_sold: 0,
});

describe('pickFreshestForecasts', () => {
  it('picks the forecast with the latest generated_date strictly before target_date', () => {
    const rows = [
      row('2026-07-01', '2026-07-05', 100), // lead 4
      row('2026-07-04', '2026-07-05', 130), // lead 1 (freshest, should win)
      row('2026-07-05', '2026-07-05', 999), // generated == target, excluded
    ];
    const picked = pickFreshestForecasts(rows);
    expect(picked.get('2026-07-05')?.gross_revenue).toBe(130);
  });

  it('excludes target_dates that have no forecast generated before them', () => {
    const rows = [row('2026-07-05', '2026-07-05', 999)];
    const picked = pickFreshestForecasts(rows);
    expect(picked.has('2026-07-05')).toBe(false);
  });
});

describe('computeAccuracySummary', () => {
  it('computes mape, accuracy, mae and rmse over the series', () => {
    const summary = computeAccuracySummary([
      { target_date: '2026-07-01', predicted: 90, actual: 100 },
      { target_date: '2026-07-02', predicted: 210, actual: 200 },
    ]);
    // errors: 10 and 10 -> mae = 10, rmse = 10
    // ape: 10% and 5% -> mape = 7.5, accuracy = 92.5
    expect(summary.points).toBe(2);
    expect(summary.mae).toBeCloseTo(10, 6);
    expect(summary.rmse).toBeCloseTo(10, 6);
    expect(summary.mape).toBeCloseTo(7.5, 6);
    expect(summary.accuracy).toBeCloseTo(92.5, 6);
  });

  it('excludes actual==0 from mape but keeps it in mae/rmse', () => {
    const summary = computeAccuracySummary([
      { target_date: '2026-07-01', predicted: 5, actual: 0 }, // error 5, no ape
      { target_date: '2026-07-02', predicted: 90, actual: 100 }, // error 10, ape 10%
    ]);
    expect(summary.points).toBe(2);
    // mae over both = (5 + 10) / 2 = 7.5
    expect(summary.mae).toBeCloseTo(7.5, 6);
    // mape only over the actual!=0 point = 10
    expect(summary.mape).toBeCloseTo(10, 6);
    expect(summary.accuracy).toBeCloseTo(90, 6);
  });

  it('returns null metrics for an empty series', () => {
    const summary = computeAccuracySummary([]);
    expect(summary).toEqual({ mape: null, accuracy: null, mae: null, rmse: null, points: 0 });
  });
});
