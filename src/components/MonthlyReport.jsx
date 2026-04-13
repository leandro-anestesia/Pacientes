import { useState, useMemo } from 'react';
import {
  getMonthTotal,
  buildMonthlyMap,
  formatCurrency,
  formatDate,
  MONTH_NAMES,
  PAYMENT_LABELS,
} from '../utils/calculations';

function MonthSelector({ year, month, onChange }) {
  const prevMonth = () => {
    const d = new Date(year, month - 1, 1);
    onChange(d.getFullYear(), d.getMonth());
  };
  const nextMonth = () => {
    const d = new Date(year, month + 1, 1);
    onChange(d.getFullYear(), d.getMonth());
  };

  return (
    <div className="month-selector">
      <button className="month-nav-btn" onClick={prevMonth}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <span className="month-label">
        {MONTH_NAMES[month]} {year}
      </span>
      <button className="month-nav-btn" onClick={nextMonth}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}

function MiniCalendar({ records, selectedYear, selectedMonth, onSelect }) {
  const map = useMemo(() => buildMonthlyMap(records), [records]);

  const months = useMemo(() => {
    const today = new Date();
    const result = [];
    for (let i = -5; i <= 6; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      result.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        key,
        hasData: !!map[key],
        total: map[key]?.total ?? 0,
      });
    }
    return result;
  }, [map]);

  return (
    <div className="mini-calendar">
      <h3 className="mini-cal-title">Meses com movimento</h3>
      <div className="mini-cal-grid">
        {months.map(({ year, month, key, hasData, total }) => {
          const isSelected = year === selectedYear && month === selectedMonth;
          return (
            <button
              key={key}
              className={`mini-cal-cell ${isSelected ? 'selected' : ''} ${hasData ? 'has-data' : ''}`}
              onClick={() => onSelect(year, month)}
            >
              <span className="mini-cal-month">{MONTH_NAMES[month].slice(0, 3)}</span>
              <span className="mini-cal-year">{year}</span>
              {hasData && (
                <span className="mini-cal-dot" title={formatCurrency(total)} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function MonthlyReport({ records }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const { pixTotal, creditTotal, total, entries } = useMemo(
    () => getMonthTotal(records, year, month),
    [records, year, month]
  );

  const handleSelect = (y, m) => {
    setYear(y);
    setMonth(m);
  };

  return (
    <div className="page-container report-layout">
      <div className="report-sidebar">
        <MiniCalendar
          records={records}
          selectedYear={year}
          selectedMonth={month}
          onSelect={handleSelect}
        />
      </div>

      <div className="report-main">
        <div className="report-header">
          <h2 className="report-title">Relatório Mensal</h2>
          <MonthSelector year={year} month={month} onChange={handleSelect} />
        </div>

        {/* Summary cards */}
        <div className="report-cards">
          <div className="report-card pix-card">
            <div className="report-card-icon">
              <span className="pix-icon-lg">PIX</span>
            </div>
            <div className="report-card-body">
              <span className="report-card-label">Recebido via PIX</span>
              <span className="report-card-value">{formatCurrency(pixTotal)}</span>
              <span className="report-card-hint">Computado no mês da cirurgia</span>
            </div>
          </div>

          <div className="report-card credit-card-card">
            <div className="report-card-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            </div>
            <div className="report-card-body">
              <span className="report-card-label">Cartão de Crédito</span>
              <span className="report-card-value">{formatCurrency(creditTotal)}</span>
              <span className="report-card-hint">Parcelas a receber neste mês</span>
            </div>
          </div>

          <div className="report-card total-card">
            <div className="report-card-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="report-card-body">
              <span className="report-card-label">Total do Mês</span>
              <span className="report-card-value total">{formatCurrency(total)}</span>
              <span className="report-card-hint">{entries.length} entrada{entries.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Payment breakdown bar */}
        {total > 0 && (
          <div className="breakdown-bar-container">
            <div className="breakdown-bar">
              {pixTotal > 0 && (
                <div
                  className="breakdown-segment pix"
                  style={{ width: `${(pixTotal / total) * 100}%` }}
                  title={`PIX: ${formatCurrency(pixTotal)}`}
                />
              )}
              {creditTotal > 0 && (
                <div
                  className="breakdown-segment credit"
                  style={{ width: `${(creditTotal / total) * 100}%` }}
                  title={`Cartão: ${formatCurrency(creditTotal)}`}
                />
              )}
            </div>
            <div className="breakdown-legend">
              <span className="legend-item pix">
                <span className="legend-dot" /> PIX ({Math.round((pixTotal / total) * 100)}%)
              </span>
              <span className="legend-item credit">
                <span className="legend-dot" /> Cartão ({Math.round((creditTotal / total) * 100)}%)
              </span>
            </div>
          </div>
        )}

        {/* Detail table */}
        {entries.length > 0 ? (
          <div className="table-wrapper">
            <h3 className="section-title">Detalhamento</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Procedimento</th>
                  <th>Data Cirurgia</th>
                  <th>Forma Original</th>
                  <th>Origem</th>
                  <th className="text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(({ record, contrib }, i) => (
                  <tr key={`${record.id}-${i}`}>
                    <td className="col-name">
                      <div className="patient-avatar sm">
                        {record.patientName.charAt(0).toUpperCase()}
                      </div>
                      <span>{record.patientName}</span>
                    </td>
                    <td>
                      <span className="procedure-badge">{record.procedure}</span>
                    </td>
                    <td className="col-date">{formatDate(record.surgeryDate)}</td>
                    <td>
                      <span className={`payment-badge ${record.paymentType?.toLowerCase()}`}>
                        {PAYMENT_LABELS[record.paymentType] ?? '–'}
                      </span>
                    </td>
                    <td>
                      <span className={`origin-badge ${contrib.isPix ? 'pix' : 'credit'}`}>
                        {contrib.label}
                      </span>
                    </td>
                    <td className="col-amount text-right">
                      {formatCurrency(contrib.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="total-row">
                  <td colSpan={5} className="total-label">Total</td>
                  <td className="col-amount text-right total-value">
                    {formatCurrency(total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h3>Nenhum valor para {MONTH_NAMES[month]} {year}</h3>
            <p>
              Não há pagamentos computados para este mês. Verifique se existem
              registros pagos com data de cirurgia compatível.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
