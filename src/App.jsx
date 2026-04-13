import { useState, useEffect } from 'react';
import Header from './components/Header';
import PatientForm from './components/PatientForm';
import PatientList from './components/PatientList';
import MonthlyReport from './components/MonthlyReport';
import ConfirmModal from './components/ConfirmModal';
import InstallPrompt from './components/InstallPrompt';
import { loadRecords, saveRecords } from './utils/storage';
import { generateId } from './utils/calculations';

export default function App() {
  const [records, setRecords] = useState([]);
  const [view, setView] = useState('list');
  const [editingRecord, setEditingRecord] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState(null); // { message, type }

  useEffect(() => {
    setRecords(loadRecords());
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const persist = (next) => {
    setRecords(next);
    saveRecords(next);
  };

  const showToast = (message, type = 'success') => setToast({ message, type });

  // ── CRUD ──────────────────────────────────────────────────────
  const handleAdd = (data) => {
    persist([...records, { ...data, id: generateId(), createdAt: new Date().toISOString() }]);
    setView('list');
  };

  const handleUpdate = (data) => {
    persist(records.map((r) => (r.id === editingRecord.id ? { ...r, ...data } : r)));
    setEditingRecord(null);
    setView('list');
  };

  const handleDelete = (id) => {
    persist(records.filter((r) => r.id !== id));
    setDeleteId(null);
  };

  const openEdit = (record) => { setEditingRecord(record); setView('form'); };
  const openNew  = () => { setEditingRecord(null); setView('form'); };
  const handleCancel = () => { setEditingRecord(null); setView('list'); };

  // ── EXPORT ────────────────────────────────────────────────────
  const handleExport = () => {
    const date = new Date().toISOString().slice(0, 10);
    const json = JSON.stringify(records, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `gestanest-backup-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`${records.length} registro(s) exportado(s) com sucesso.`);
  };

  // ── IMPORT ────────────────────────────────────────────────────
  const handleImport = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (!Array.isArray(imported)) throw new Error('Formato inválido');

        // Merge: mantém os registros existentes e adiciona os novos (sem duplicar por ID)
        const existingIds = new Set(records.map((r) => r.id));
        const newOnes = imported.filter((r) => r.id && !existingIds.has(r.id));
        const merged  = [...records, ...newOnes];
        persist(merged);

        if (newOnes.length === 0) {
          showToast('Nenhum registro novo encontrado — dados já estavam atualizados.', 'info');
        } else {
          showToast(`${newOnes.length} registro(s) importado(s) com sucesso.`);
        }
      } catch {
        showToast('Arquivo inválido. Certifique-se de usar um backup do GestAnest.', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="app">
      <InstallPrompt />
      <Header
        view={view}
        onViewChange={setView}
        onNewRecord={openNew}
        onExport={handleExport}
        onImport={handleImport}
      />

      <main className="main-content">
        {view === 'list' && (
          <PatientList
            records={records}
            onEdit={openEdit}
            onDelete={setDeleteId}
            onNewRecord={openNew}
          />
        )}
        {view === 'form' && (
          <PatientForm
            record={editingRecord}
            onSubmit={editingRecord ? handleUpdate : handleAdd}
            onCancel={handleCancel}
          />
        )}
        {view === 'monthly' && <MonthlyReport records={records} />}
      </main>

      {deleteId && (
        <ConfirmModal
          message="Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita."
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          {toast.type === 'error' && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          )}
          {toast.type === 'info' && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}
