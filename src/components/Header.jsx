import { useRef, useState } from 'react';

export default function Header({ view, onViewChange, onNewRecord, onExport, onImport, user, onLogout }) {
  const fileRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onImport(file);
    e.target.value = ''; // reset para permitir reimportar o mesmo arquivo
    setMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-brand">
        <div className="header-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <div>
          <span className="header-title">GestAnest</span>
          <span className="header-subtitle">Gestão de Anestesias</span>
        </div>
      </div>

      <nav className="header-nav">
        <button
          className={`nav-btn ${view === 'list' ? 'active' : ''}`}
          onClick={() => onViewChange('list')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Pacientes
        </button>
        <button
          className={`nav-btn ${view === 'monthly' ? 'active' : ''}`}
          onClick={() => onViewChange('monthly')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Relatório Mensal
        </button>
      </nav>

      <div className="header-actions">
        {/* Menu backup */}
        <div className="dropdown-wrapper">
          <button
            className="btn-icon"
            title="Backup de dados"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <div className="dropdown-backdrop" onClick={() => setMenuOpen(false)} />
              <div className="dropdown-menu">
                <p className="dropdown-title">Backup de dados</p>

                <button
                  className="dropdown-item"
                  onClick={() => { onExport(); setMenuOpen(false); }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Exportar dados
                  <span className="dropdown-hint">Baixa um arquivo .json</span>
                </button>

                <button
                  className="dropdown-item"
                  onClick={() => fileRef.current?.click()}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Importar dados
                  <span className="dropdown-hint">Carrega um arquivo .json</span>
                </button>

                <input
                  ref={fileRef}
                  type="file"
                  accept=".json"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />

                <div className="dropdown-info">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  Exporte no iPhone, transfira via AirDrop ou iCloud e importe no iPad.
                </div>
              </div>
            </>
          )}
        </div>

        <button className="btn-primary" onClick={onNewRecord}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nova Anestesia
        </button>

        {/* Avatar + logout */}
        {user && (
          <button className="user-avatar" onClick={onLogout} title={`Sair (${user.email})`}>
            {user.photoURL
              ? <img src={user.photoURL} alt={user.displayName} referrerPolicy="no-referrer" />
              : <span>{user.email?.[0]?.toUpperCase()}</span>
            }
          </button>
        )}
      </div>
    </header>
  );
}
