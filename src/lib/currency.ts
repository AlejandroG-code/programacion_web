import Decimal from 'decimal.js';
import { Currency } from '../database/models';

export interface ExchangeRateMap {
  [code: string]: number;
}

export class CurrencyService {
  /**
   * Obtiene el mapa de tasas de cambio actualizadas respecto a 1 USD
   */
  public static async getExchangeRates(): Promise<ExchangeRateMap> {
    const currencies = await Currency.findAll();
    const rateMap: ExchangeRateMap = { USD: 1.0 };
    currencies.forEach(c => {
      rateMap[c.code] = Number(c.rateToUsd);
    });
    return rateMap;
  }

  /**
   * Convierte un monto de una divisa origen a una divisa destino usando triangulación
   */
  public static convert(
    amount: number | string,
    fromCurrency: string,
    toCurrency: string,
    rates: ExchangeRateMap
  ): { convertedAmount: number; exchangeRate: number } {
    const amt = new Decimal(amount || 0);

    if (fromCurrency === toCurrency) {
      return {
        convertedAmount: amt.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
        exchangeRate: 1.0,
      };
    }

    const rateFrom = new Decimal(rates[fromCurrency] || 1.0);
    const rateTo = new Decimal(rates[toCurrency] || 1.0);

    if (rateFrom.isZero()) {
      return { convertedAmount: 0, exchangeRate: 0 };
    }

    // Tasa cruzada: (1 / rateFrom) * rateTo
    const crossRate = rateTo.dividedBy(rateFrom);
    const converted = amt.times(crossRate);

    return {
      convertedAmount: converted.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
      exchangeRate: crossRate.toDecimalPlaces(6, Decimal.ROUND_HALF_UP).toNumber(),
    };
  }

  /**
   * Formatea un número como moneda
   */
  public static format(amount: number, currencyCode: string = 'USD'): string {
    const symbols: Record<string, string> = {
      USD: '$',
      MXN: '$',
      CAD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
    };

    const sym = symbols[currencyCode] || '$';
    const formattedNum = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

    return `${sym} ${formattedNum} ${currencyCode}`;
  }
}
