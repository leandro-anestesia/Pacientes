export const PAYMENT_TYPES = {
  PIX: 'PIX',
  CREDIT_1X: 'CREDIT_1X',
  CREDIT_2X: 'CREDIT_2X',
};

export const PAYMENT_LABELS = {
  PIX: 'PIX',
  CREDIT_1X: 'Cartão 1x',
  CREDIT_2X: 'Cartão 2x',
};

export const PROCEDURES = [
  'Abdominoplastia',
  'Blefaroplastia',
  'Cirurgia de Ginecomastia',
  'Gluteoplastia',
  'Lifting de Braços',
  'Lifting de Coxas',
  'Lifting Facial (Ritidoplastia)',
  'Lipoaspiração',
  'Lipoescultura',
  'Mamoplastia de Aumento',
  'Mamoplastia de Redução',
  'Mastopexia',
  'Mentoplastia',
  'Otoplastia',
  'Rinoplastia',
  'Outro',
];

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

/**
 * Returns the monthly financial contributions for a record.
 * Rules:
 *   PIX        → counted in the surgery month
 *   CREDIT_1X  → counted in surgery month + 1
 *   CREDIT_2X  → 50% in month+1, 50% in month+2
 * Only PAID records contribute.
 */
export function getMonthlyContributions(record) {
  if (!record.isPaid || !record.amount || record.amount <= 0) return [];

  const [y, m, d] = record.surgeryDate.split('-').map(Number);
  // Use UTC-safe date parsing
  const base = new Date(y, m - 1, d);
  const baseYear = base.getFullYear();
  const baseMonth = base.getMonth(); // 0-indexed

  const next = (offset) => {
    const dt = new Date(baseYear, baseMonth + offset, 1);
    return { year: dt.getFullYear(), month: dt.getMonth() };
  };

  if (record.paymentType === PAYMENT_TYPES.PIX) {
    return [{ ...next(0), amount: record.amount, label: 'PIX', isPix: true }];
  }

  if (record.paymentType === PAYMENT_TYPES.CREDIT_1X) {
    return [{ ...next(1), amount: record.amount, label: 'Cartão 1x', isPix: false }];
  }

  if (record.paymentType === PAYMENT_TYPES.CREDIT_2X) {
    const half = record.amount / 2;
    return [
      { ...next(1), amount: half, label: 'Cartão 2x – 1ª parcela', isPix: false },
      { ...next(2), amount: half, label: 'Cartão 2x – 2ª parcela', isPix: false },
    ];
  }

  return [];
}

/**
 * Aggregates totals for a given year/month (month is 0-indexed).
 */
export function getMonthTotal(records, year, month) {
  let pixTotal = 0;
  let creditTotal = 0;
  const entries = [];

  records.forEach((record) => {
    getMonthlyContributions(record).forEach((contrib) => {
      if (contrib.year === year && contrib.month === month) {
        if (contrib.isPix) {
          pixTotal += contrib.amount;
        } else {
          creditTotal += contrib.amount;
        }
        entries.push({ record, contrib });
      }
    });
  });

  return { pixTotal, creditTotal, total: pixTotal + creditTotal, entries };
}

/**
 * Builds a map of { "YYYY-MM": { pixTotal, creditTotal, total } } for all records.
 */
export function buildMonthlyMap(records) {
  const map = {};

  records.forEach((record) => {
    getMonthlyContributions(record).forEach((contrib) => {
      const key = `${contrib.year}-${String(contrib.month + 1).padStart(2, '0')}`;
      if (!map[key]) map[key] = { pixTotal: 0, creditTotal: 0, total: 0 };
      if (contrib.isPix) {
        map[key].pixTotal += contrib.amount;
      } else {
        map[key].creditTotal += contrib.amount;
      }
      map[key].total += contrib.amount;
    });
  });

  return map;
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value ?? 0);
}

export function formatDate(dateStr) {
  if (!dateStr) return '–';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
