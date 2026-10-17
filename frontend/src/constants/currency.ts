export const CURRENCY_SYMBOL = '৳';

export const formatCurrency = (amount: number, showSign: boolean = false): string => {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absAmount);

  if (showSign) {
    if (isNegative) return `-${CURRENCY_SYMBOL}${formatted}`;
    if (amount > 0) return `+${CURRENCY_SYMBOL}${formatted}`;
  }

  return isNegative
    ? `-${CURRENCY_SYMBOL}${formatted}`
    : `${CURRENCY_SYMBOL}${formatted}`;
};
