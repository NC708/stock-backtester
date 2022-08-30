import { CandleModel } from './db';
import avgVol from './indicators/avgVol';

export default async function main() {
  const candles = await CandleModel.aggregate([
    { $match: { symbol: 'AAPL' } },
    { $sort: { date: 1 } },
  ]);
  const days = 50;

  let avgVolData = avgVol(candles, days);
}
