import { Candle } from '../types';

export default function main(candles: Candle[], days: number) {
  if (days <= 0 || days % 1 != 0)
    throw 'Argument "days" must be a positive integer';
  if (candles.length < days) return [];
  let avgVol = [];
  let buffer = [];
  let retiredPartial = 0;
  let currAvgVol = 0; // Average volume for the current candle
  for (let i = 0; i < candles.length; i++) {
    const newPartial = candles[i].volume / days;
    if (buffer.length == days) {
      retiredPartial = buffer.shift();
    }
    currAvgVol = currAvgVol - retiredPartial + newPartial;
    avgVol.push(currAvgVol);
    buffer.push(newPartial);
  }
  return avgVol;
}
