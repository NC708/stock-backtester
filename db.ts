import mongoose, { Schema } from 'mongoose';

const candleSchema = new Schema({
  symbol: 'string',
  date: 'Date',
  open: 'number',
  high: 'number',
  low: 'number',
  close: 'number',
  volume: 'number',
});

export const CandleModel = mongoose.model('candles', candleSchema);

async function main() {
  return await mongoose.connect(process.env.DB_URL);
}

main();
