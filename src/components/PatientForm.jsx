import { useState, useEffect } from 'react';
import { PROCEDURES, PAYMENT_TYPES, PAYMENT_LABELS } from '../utils/calculations';

const EMPTY_FORM = {
  patientName: '',
  procedure: '',
  customProcedure: '',
  surgeryDate: '',
  amount: '',
  isPaid: false,
  paymentType: PAYMENT_TYPES.PIX,
};

export default function PatientForm({ record, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (record) {
      const isCustom = !PROCEDURES.slice(0, -1).includes(record.procedure);
      setForm({
        patientName: record.patientName ?? '',
        procedure: isCustom ? 'Outro' : (record.procedure ?? ''),
        customProcedure: isCustom ? record.procedure : '',
        surgeryDate: record.surgeryDate ?? '',
        amount: record.amount != null ? String(record.amount) : '',
        isPaid: record.isPaid ?? false,
        paymentType: record.paymentType ?? PAYMENT_TYPES.PIX,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [record]);

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.patientName.trim()) e.patientName = 'Nome da paciente é obrigatório';
    if (!form.procedure) e.procedure = 'Selecione um procedimento';
    if (form.procedure === 'Outro' && !form.customProcedure.trim())
      e.customProcedure = 'Informe o procedimento';
    if (!form.surgeryDate) e.surgeryDate = 'Data da cirurgia é obrigatória';
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      e.amount = 'Informe um valor válido';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const finalProcedure =
      form.procedure === 'Outro' ? form.customProcedure.trim() : form.procedure;

    onSubmit({
      patientName: form.patientName.trim(),
      procedure: finalProcedure,
      surgeryDate: form.surgeryDate,
      amount: parseFloat(form.amount.replace(',', '.')),
      isPaid: form.isPaid,
      paymentType: form.paymentType,
    });
  };

  const isEditing = Boolean(record);

  return (
    <div className="page-container">
      <div className="form-card">
        <div className="form-header">
          <h2 className="form-title">
            {isEditing ? 'Editar Registro' : 'Nova Anestesia'}
          </h2>
          <p className="form-subtitle">
            {isEditing
              ? 'Atualize os dados do procedimento'
              : 'Preencha os dados do procedimento realizado'}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            {/* Patient name */}
            <div className="field full-width">
              <label className="field-label">Nome da Paciente *</label>
              <input
                className={`field-input ${errors.patientName ? 'error' : ''}`}
                type="text"
                placeholder="Ex: Maria da Silva"
                value={form.patientName}
                onChange={(e) => set('patientName', e.target.value)}
              />
              {errors.patientName && <span className="field-error">{errors.patientName}</span>}
            </div>

            {/* Procedure */}
            <div className="field">
              <label className="field-label">Procedimento *</label>
              <select
                className={`field-input ${errors.procedure ? 'error' : ''}`}
                value={form.procedure}
                onChange={(e) => set('procedure', e.target.value)}
              >
                <option value="">Selecione...</option>
                {PROCEDURES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              {errors.procedure && <span className="field-error">{errors.procedure}</span>}
            </div>

            {/* Custom procedure */}
            {form.procedure === 'Outro' && (
              <div className="field">
                <label className="field-label">Especifique o Procedimento *</label>
                <input
                  className={`field-input ${errors.customProcedure ? 'error' : ''}`}
                  type="text"
                  placeholder="Descreva o procedimento"
                  value={form.customProcedure}
                  onChange={(e) => set('customProcedure', e.target.value)}
                />
                {errors.customProcedure && (
                  <span className="field-error">{errors.customProcedure}</span>
                )}
              </div>
            )}

            {/* Surgery date */}
            <div className="field">
              <label className="field-label">Data da Cirurgia *</label>
              <input
                className={`field-input ${errors.surgeryDate ? 'error' : ''}`}
                type="date"
                value={form.surgeryDate}
                onChange={(e) => set('surgeryDate', e.target.value)}
              />
              {errors.surgeryDate && (
                <span className="field-error">{errors.surgeryDate}</span>
              )}
            </div>

            {/* Amount */}
            <div className="field">
              <label className="field-label">Valor (R$) *</label>
              <input
                className={`field-input ${errors.amount ? 'error' : ''}`}
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={form.amount}
                onChange={(e) => set('amount', e.target.value)}
              />
              {errors.amount && <span className="field-error">{errors.amount}</span>}
            </div>

            {/* Payment status */}
            <div className="field full-width">
              <label className="field-label">Status do Pagamento</label>
              <div className="toggle-group">
                <button
                  type="button"
                  className={`toggle-btn ${!form.isPaid ? 'active-danger' : ''}`}
                  onClick={() => set('isPaid', false)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  Não Pago
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${form.isPaid ? 'active-success' : ''}`}
                  onClick={() => set('isPaid', true)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Pago
                </button>
              </div>
            </div>

            {/* Payment type */}
            <div className="field full-width">
              <label className="field-label">Forma de Pagamento</label>
              <div className="payment-type-group">
                {Object.entries(PAYMENT_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={`payment-type-btn ${form.paymentType === key ? 'active' : ''}`}
                    onClick={() => set('paymentType', key)}
                  >
                    {key === PAYMENT_TYPES.PIX && (
                      <span className="pix-icon">PIX</span>
                    )}
                    {key !== PAYMENT_TYPES.PIX && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                    )}
                    {label}
                    {key === PAYMENT_TYPES.CREDIT_2X && (
                      <span className="installment-info">
                        mês+1 · mês+2
                      </span>
                    )}
                    {key === PAYMENT_TYPES.CREDIT_1X && (
                      <span className="installment-info">mês+1</span>
                    )}
                    {key === PAYMENT_TYPES.PIX && (
                      <span className="installment-info">mês atual</span>
                    )}
                  </button>
                ))}
              </div>
              <p className="field-hint">
                {form.paymentType === PAYMENT_TYPES.PIX &&
                  'O valor será computado no mês da cirurgia.'}
                {form.paymentType === PAYMENT_TYPES.CREDIT_1X &&
                  'O valor será computado no mês seguinte à cirurgia.'}
                {form.paymentType === PAYMENT_TYPES.CREDIT_2X &&
                  'Duas parcelas: 1ª no mês seguinte, 2ª dois meses após a cirurgia.'}
              </p>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {isEditing ? 'Salvar Alterações' : 'Registrar Anestesia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
