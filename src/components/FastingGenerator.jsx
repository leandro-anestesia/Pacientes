import { useState, useMemo } from 'react';

const FASTING_RULES = [
  {
    id: 'clear_liquids',
    label: 'Líquidos claros',
    description: 'Água, chá claro, suco sem polpa e café sem leite',
    hours: 2,
    variant: 'fasting-primary',
  },
  {
    id: 'breast_milk',
    label: 'Leite materno',
    description: 'Somente para lactentes em aleitamento materno exclusivo',
    hours: 4,
    variant: 'fasting-success',
  },
  {
    id: 'formula',
    label: 'Fórmula infantil / Leite não humano',
    description: 'Leite de vaca, leite de soja e fórmulas industriais',
    hours: 6,
    variant: 'fasting-warning',
  },
  {
    id: 'light_meal',
    label: 'Refeição leve',
    description: 'Torradas, biscoitos salgados simples e mingau claro sem gordura',
    hours: 6,
    variant: 'fasting-warning',
  },
  {
    id: 'solid_meal',
    label: 'Refeição sólida',
    description: 'Carnes, fritos, gorduras, laticínios e refeições completas',
    hours: 8,
    variant: 'fasting-danger',
  },
];

const ICONS = {
  clear_liquids: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3h14l-1.5 9.5A4 4 0 0 1 13.52 16H10.48a4 4 0 0 1-3.98-3.5L5 3z"/>
      <path d="M2 3h20"/>
      <path d="M10 16v4M14 16v4M8 20h8"/>
    </svg>
  ),
  breast_milk: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2h4v3h2a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2V2z"/>
      <path d="M12 11v4M10 13h4"/>
    </svg>
  ),
  formula: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="3" width="10" height="18" rx="2"/>
      <path d="M10 3V1h4v2"/>
      <path d="M10 11h4M12 9v4"/>
    </svg>
  ),
  light_meal: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11h18M3 7h18"/>
      <rect x="2" y="11" width="20" height="9" rx="2"/>
      <path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  solid_meal: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11h18M12 3c-4.418 0-8 3.582-8 8"/>
      <path d="M4 19h16"/>
      <path d="M18 11a6 6 0 0 0-6-8"/>
      <line x1="5" y1="3" x2="5" y2="7"/>
      <line x1="19" y1="3" x2="19" y2="7"/>
    </svg>
  ),
};

function padTwoDigits(n) {
  return String(n).padStart(2, '0');
}

function formatTime(date) {
  return `${padTwoDigits(date.getHours())}:${padTwoDigits(date.getMinutes())}`;
}

function formatDateLong(date) {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateShort(date) {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function FastingGenerator() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [surgeryDate, setSurgeryDate] = useState(tomorrow.toISOString().slice(0, 10));
  const [surgeryTime, setSurgeryTime] = useState('08:00');
  const [patientName, setPatientName] = useState('');

  const surgeryDateTime = useMemo(() => {
    if (!surgeryDate || !surgeryTime) return null;
    const dt = new Date(`${surgeryDate}T${surgeryTime}:00`);
    return isNaN(dt.getTime()) ? null : dt;
  }, [surgeryDate, surgeryTime]);

  const fastingSchedule = useMemo(() => {
    if (!surgeryDateTime) return [];
    const now = new Date();
    return FASTING_RULES.map((rule) => {
      const deadline = new Date(surgeryDateTime.getTime() - rule.hours * 3600 * 1000);
      return { ...rule, deadline, isPast: deadline < now };
    });
  }, [surgeryDateTime]);

  return (
    <div className="page-container">

      {/* Input card */}
      <div className="fasting-input-card">
        <div className="fasting-input-header">
          <div className="fasting-input-header-left">
            <div className="fasting-icon-badge">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div>
              <h1 className="fasting-page-title">Jejum Pré-Operatório</h1>
              <p className="fasting-page-subtitle">Diretrizes da Sociedade Brasileira de Anestesiologia (SBA)</p>
            </div>
          </div>
          <button className="btn-secondary no-print" onClick={() => window.print()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Imprimir
          </button>
        </div>

        <div className="fasting-form-row">
          <div className="field">
            <label className="field-label">Nome do Paciente (opcional)</label>
            <input
              type="text"
              className="field-input"
              placeholder="Ex: João da Silva"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field-label">Data da Cirurgia</label>
            <input
              type="date"
              className="field-input"
              value={surgeryDate}
              onChange={(e) => setSurgeryDate(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field-label">Horário da Cirurgia</label>
            <input
              type="time"
              className="field-input"
              value={surgeryTime}
              onChange={(e) => setSurgeryTime(e.target.value)}
            />
          </div>
        </div>
      </div>

      {surgeryDateTime && (
        <>
          {/* Surgery time banner */}
          <div className="fasting-surgery-banner">
            <div className="fasting-surgery-banner-left">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <div>
                <div className="fasting-surgery-label">Horário da Cirurgia</div>
                <div className="fasting-surgery-value">
                  {patientName && <strong>{patientName} — </strong>}
                  {formatDateShort(surgeryDateTime)} às {formatTime(surgeryDateTime)}
                </div>
              </div>
            </div>
            <div className="fasting-surgery-chip">Jejum obrigatório</div>
          </div>

          {/* Fasting schedule cards */}
          <div className="fasting-rules-grid">
            {fastingSchedule.map((rule) => (
              <div key={rule.id} className={`fasting-rule-card ${rule.variant}`}>
                <div className="fasting-rule-header">
                  <div className={`fasting-rule-icon ${rule.variant}`}>
                    {ICONS[rule.id]}
                  </div>
                  <div className="fasting-rule-badge">{rule.hours}h de jejum</div>
                </div>

                <div className="fasting-rule-label">{rule.label}</div>
                <div className="fasting-rule-description">{rule.description}</div>

                <div className="fasting-rule-deadline">
                  <svg className="fasting-deadline-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <div>
                    <div className="fasting-deadline-label">Última ingestão até</div>
                    <div className={`fasting-deadline-time${rule.isPast ? ' past' : ''}`}>
                      {formatTime(rule.deadline)}
                    </div>
                    <div className="fasting-deadline-date">
                      {formatDateLong(rule.deadline)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="fasting-footer-note">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p>
              Estas recomendações seguem as <strong>Diretrizes de Jejum Pré-Operatório da Sociedade Brasileira de Anestesiologia (SBA)</strong>. Em caso de dúvida ou situações especiais, consulte o anestesiologista responsável pelo procedimento.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
