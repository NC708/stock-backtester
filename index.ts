import axios from 'axios';
import { RateLimiter } from 'limiter';
import symbols from './symbols.json';
import dotenv from 'dotenv';
dotenv.config();
import { Candle } from './types';
import { CandleModel } from './db';
import analyze from './analyze';

function storeCandles(candles: Candle[]) {
  CandleModel.insertMany(candles, { ordered: false })
    .then(() => {
      console.log(candles);
    })
    .catch((err) => console.error(err));
}

async function findLastSymbol() {
  const lastSymbol: string = (
    await CandleModel.aggregate([{ $sort: { symbol: -1 } }, { $limit: 1 }])
  )[0].symbol;
  let i = 0;
  for (; i < symbols.length; i++) {
    if (symbols[i] == lastSymbol) break;
  }
  return symbols.slice(i + 1, symbols.length - i);
}

const rateLimiter = new RateLimiter({
  tokensPerInterval: 1,
  interval: 13000,
});

async function main() {
  try {
    const tempSymbols = await findLastSymbol();
    for (let i = 0; i < tempSymbols.length; i++) {
      await rateLimiter.removeTokens(1);
      const symbol = tempSymbols[i];
      const response = (
        await axios.get('https://www.alphavantage.co/query', {
          params: {
            function: 'TIME_SERIES_DAILY',
            symbol: symbol,
            outputsize: 'full',
            apikey: 'SS7DTLSPEVY93AC6',
          },
        })
      ).data;
      const candlesObj = response['Time Series (Daily)'];
      if (!candlesObj) {
        console.error('Could not fetch candles for ' + symbol);
        continue;
      }
      let candles: Candle[] = [];
      Object.keys(candlesObj).forEach((date) => {
        const candle = candlesObj[date];
        candles.push(<Candle>{
          symbol: symbol,
          date: new Date(date),
          open: Number(candle['1. open']),
          high: Number(candle['2. high']),
          low: Number(candle['3. low']),
          close: Number(candle['4. close']),
          volume: Number(candle['5. volume']),
        });
      });
      storeCandles(candles);
    }
  } catch (err) {
    console.error(err);
    main();
  }
}

main();
analyze();
