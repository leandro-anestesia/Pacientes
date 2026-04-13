import { useState, useEffect } from 'react';
import Header from './components/Header';
import PatientForm from './components/PatientForm';
import PatientList from './components/PatientList';
import MonthlyReport from './components/MonthlyReport';
import ConfirmModal from './components/ConfirmModal';
import { loadRecords, saveRecords } from './utils/storage';
import { generateId } from './utils/calculations';

export default function App() {
  const [records, setRecords] = useState([]);
  const [view, setView] = useState('list'); // 'list' | 'form' | 'monthly'
  const [editingRecord, setEditingRecord] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    setRecords(loadRecords());
  }, []);

  const persist = (next) => {
    setRecords(next);
    saveRecords(next);
  };

  const handleAdd = (data) => {
    persist([
      ...records,
      { ...data, id: generateId(), createdAt: new Date().toISOString() },
    ]);
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

  const openEdit = (record) => {
    setEditingRecord(record);
    setView('form');
  };

  const openNew = () => {
    setEditingRecord(null);
    setView('form');
  };

  const handleCancel = () => {
    setEditingRecord(null);
    setView('list');
  };

  return (
    <div className="app">
      <Header view={view} onViewChange={setView} onNewRecord={openNew} />

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
    </div>
  );
}
