import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './utils/firebase';
import {
  subscribeToRecords,
  addRecord,
  updateRecord,
  deleteRecord,
  importRecords,
} from './utils/db';

import Login from './components/Login';
import Header from './components/Header';
import PatientForm from './components/PatientForm';
import PatientList from './components/PatientList';
import MonthlyReport from './components/MonthlyReport';
import FastingGenerator from './components/FastingGenerator';
import ConfirmModal from './components/ConfirmModal';
import InstallPrompt from './components/InstallPrompt';

export default function App() {
  const [user, setUser]               = useState(undefined); // undefined = carregando
  const [records, setRecords]         = useState([]);
  const [view, setView]               = useState('list');
  const [editingRecord, setEditingRecord] = useState(null);
  const [deleteId, setDeleteId]       = useState(null);
  const [toast, setToast]             = useState(null);
  const [dbError, setDbError]         = useState(false);

  // ── Auth state ────────────────────────────────────────────────
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u ?? null));
  }, []);

  // ── Firestore listener ────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToRecords(
      user.uid,
      (data) => { setRecords(data); setDbError(false); },
      () => setDbError(true)
    );
    return unsub;
  }, [user]);

  // ── Toast auto-dismiss ─────────────────────────────────────────
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (message, type = 'success') => setToast({ message, type });

  // ── CRUD ──────────────────────────────────────────────────────
  const handleAdd = async (data) => {
    try {
      await addRecord(user.uid, data);
      setView('list');
    } catch {
      showToast('Erro ao salvar. Verifique sua conexão.', 'error');
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateRecord(user.uid, editingRecord.id, data);
      setEditingRecord(null);
      setView('list');
    } catch {
      showToast('Erro ao atualizar. Verifique sua conexão.', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRecord(user.uid, id);
      setDeleteId(null);
    } catch {
      showToast('Erro ao excluir. Verifique sua conexão.', 'error');
    }
  };

  const openEdit   = (r) => { setEditingRecord(r); setView('form'); };
  const openNew    = ()  => { setEditingRecord(null); setView('form'); };
  const handleCancel = () => { setEditingRecord(null); setView('list'); };

  // ── Export ────────────────────────────────────────────────────
  const handleExport = () => {
    const date = new Date().toISOString().slice(0, 10);
    const json = JSON.stringify(records, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `gestanest-backup-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`${records.length} registro(s) exportado(s).`);
  };

  // ── Import ────────────────────────────────────────────────────
  const handleImport = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (!Array.isArray(imported)) throw new Error();

        // Só importa registros que ainda não existem (compara por createdAt+patientName)
        const existingKeys = new Set(
          records.map((r) => `${r.createdAt}|${r.patientName}`)
        );
        const newOnes = imported.filter(
          (r) => !existingKeys.has(`${r.createdAt}|${r.patientName}`)
        );

        if (newOnes.length === 0) {
          showToast('Nenhum registro novo — dados já atualizados.', 'info');
          return;
        }

        await importRecords(user.uid, newOnes);
        showToast(`${newOnes.length} registro(s) importado(s) com sucesso.`);
      } catch {
        showToast('Arquivo inválido. Use um backup do GestAnest.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // ── Logout ────────────────────────────────────────────────────
  const handleLogout = () => signOut(auth);

  // ── Loading state ─────────────────────────────────────────────
  if (user === undefined) {
    return (
      <div className="loading-screen">
        <span className="spinner lg" />
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <div className="app">
      <InstallPrompt />
      <Header
        view={view}
        onViewChange={setView}
        onNewRecord={openNew}
        onExport={handleExport}
        onImport={handleImport}
        user={user}
        onLogout={handleLogout}
      />

      {dbError && (
        <div className="db-error-banner">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Sem conexão com o banco de dados. Verifique sua internet.
        </div>
      )}

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
        {view === 'fasting' && <FastingGenerator />}
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
          {toast.type === 'success' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
          {toast.type === 'error'   && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
          {toast.type === 'info'    && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
          {toast.message}
        </div>
      )}
    </div>
  );
}
