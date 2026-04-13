import { useState, useMemo } from 'react';
import { formatDate, formatCurrency, PAYMENT_LABELS, MONTH_NAMES } from '../utils/calculations';

export default function PatientList({ records, onEdit, onDelete, onNewRecord }) {
  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterPaid, setFilterPaid] = useState('all'); // 'all' | 'paid' | 'unpaid'
  const [sortField, setSortField] = useState('surgeryDate');
  const [sortDir, setSortDir] = useState('desc');

  const filtered = useMemo(() => {
    let result = [...records];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.patientName.toLowerCase().includes(q) ||
          r.procedure.toLowerCase().includes(q)
      );
    }

    if (filterMonth) {
      result = result.filter((r) => r.surgeryDate?.startsWith(filterMonth));
    }

    if (filterPaid !== 'all') {
      result = result.filter((r) =>
        filterPaid === 'paid' ? r.isPaid : !r.isPaid
      );
    }

    result.sort((a, b) => {
      let va = a[sortField] ?? '';
      let vb = b[sortField] ?? '';
      if (sortField === 'amount') {
        va = Number(va);
        vb = Number(vb);
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [records, search, filterMonth, filterPaid, sortField, sortDir]);

  const stats = useMemo(() => {
    const total = records.length;
    const paid = records.filter((r) => r.isPaid).length;
    const unpaid = total - paid;
    const totalValue = records
      .filter((r) => r.isPaid)
      .reduce((s, r) => s + (r.amount ?? 0), 0);
    return { total, paid, unpaid, totalValue };
  }, [records]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field)
      return <span className="sort-icon neutral">↕</span>;
    return (
      <span className="sort-icon active">{sortDir === 'asc' ? '↑' : '↓'}</span>
    );
  };

  // Build month options from existing records
  const monthOptions = useMemo(() => {
    const seen = new Set();
    records.forEach((r) => {
      if (r.surgeryDate) seen.add(r.surgeryDate.slice(0, 7));
    });
    return [...seen].sort().reverse();
  }, [records]);

  const formatMonthLabel = (ym) => {
    const [y, m] = ym.split('-');
    return `${MONTH_NAMES[Number(m) - 1]} ${y}`;
  };

  return (
    <div className="page-container">
      {/* Stats bar */}
      <div className="stats-bar">
        <div className="stat-card">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total de Registros</span>
        </div>
        <div className="stat-card success">
          <span className="stat-value">{stats.paid}</span>
          <span className="stat-label">Pagos</span>
        </div>
        <div className="stat-card danger">
          <span className="stat-value">{stats.unpaid}</span>
          <span className="stat-label">Não Pagos</span>
        </div>
        <div className="stat-card primary">
          <span className="stat-value">{formatCurrency(stats.totalValue)}</span>
          <span className="stat-label">Total Recebido</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-wrapper">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="search-input"
            type="text"
            placeholder="Buscar paciente ou procedimento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
        >
          <option value="">Todos os meses</option>
          {monthOptions.map((ym) => (
            <option key={ym} value={ym}>{formatMonthLabel(ym)}</option>
          ))}
        </select>

        <div className="filter-tabs">
          {[
            { key: 'all', label: 'Todos' },
            { key: 'paid', label: 'Pagos' },
            { key: 'unpaid', label: 'Não Pagos' },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`filter-tab ${filterPaid === key ? 'active' : ''}`}
              onClick={() => setFilterPaid(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          {records.length === 0 ? (
            <>
              <div className="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <h3>Nenhum registro ainda</h3>
              <p>Clique no botão abaixo para adicionar a primeira anestesia.</p>
              <button className="btn-primary" onClick={onNewRecord}>
                + Nova Anestesia
              </button>
            </>
          ) : (
            <>
              <div className="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <h3>Nenhum resultado encontrado</h3>
              <p>Tente ajustar os filtros de busca.</p>
            </>
          )}
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => toggleSort('patientName')} className="sortable">
                  Paciente <SortIcon field="patientName" />
                </th>
                <th>Procedimento</th>
                <th onClick={() => toggleSort('surgeryDate')} className="sortable">
                  Data <SortIcon field="surgeryDate" />
                </th>
                <th onClick={() => toggleSort('amount')} className="sortable">
                  Valor <SortIcon field="amount" />
                </th>
                <th>Status</th>
                <th>Pagamento</th>
                <th className="col-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((record) => (
                <tr key={record.id}>
                  <td className="col-name">
                    <div className="patient-avatar">
                      {record.patientName.charAt(0).toUpperCase()}
                    </div>
                    <span>{record.patientName}</span>
                  </td>
                  <td>
                    <span className="procedure-badge">{record.procedure}</span>
                  </td>
                  <td className="col-date">{formatDate(record.surgeryDate)}</td>
                  <td className="col-amount">{formatCurrency(record.amount)}</td>
                  <td>
                    <span className={`status-badge ${record.isPaid ? 'paid' : 'unpaid'}`}>
                      {record.isPaid ? 'Pago' : 'Não Pago'}
                    </span>
                  </td>
                  <td>
                    <span className={`payment-badge ${record.paymentType?.toLowerCase()}`}>
                      {PAYMENT_LABELS[record.paymentType] ?? '–'}
                    </span>
                  </td>
                  <td className="col-actions">
                    <button
                      className="action-btn edit"
                      onClick={() => onEdit(record)}
                      title="Editar"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => onDelete(record.id)}
                      title="Excluir"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="table-footer">
            {filtered.length} registro{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
