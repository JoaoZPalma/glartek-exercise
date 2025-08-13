import { useEffect, useState } from 'react';
import CronList from './components/CronList';
import CronForm from './components/CronForm';

const API_BASE = 'http://localhost:5000/crons';

export default function App() {
  const [crons, setCrons] = useState([]);
  const [editingCron, setEditingCron] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false); // <-- toggle state

  const fetchCrons = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error('Failed to fetch crons');
      const data = await res.json();
      setCrons(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrons();
  }, []);

  const handleSave = async (cron) => {
    try {
      setLoading(true);
      let res;
      if (cron._id) {
        res = await fetch(`${API_BASE}/${cron._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cron),
        });
      } else {
        res = await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cron),
        });
      }
      if (!res.ok) throw new Error('Failed to save cron');
      await fetchCrons();
      setEditingCron(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this cron job?')) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete cron');
      await fetchCrons();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6">

        <div className="flex items-center justify-center p-6 mb-4">
          <h1 className="text-3xl font-bold text-gray-800">
            Gestor CRON - Desafio
          </h1>
          <img
            src="/Logo-HQ-glartek.svg"
            alt="Glartek Logo"
            className="h-[2em] ml-3"
          />
        </div>

        <div className="flex justify-evenly gap-4">
          {/* Form */}
          <div className="w-1/2 shadow-xl bg-white rounded-xl p-4">
            <CronForm
              onSave={handleSave}
              editingCron={editingCron}
              onCancel={() => setEditingCron(null)}
            />
          </div>

          {/* List */}
          <div className="w-1/3 shadow-xl bg-white rounded-xl p-4">
            <h2 className='text-2xl text-center font-semibold my-4'>Lista das CRON</h2>

            {/* Toggle Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowActiveOnly((prev) => !prev)}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
              >
                {showActiveOnly ? 'Mostrar todos' : 'Mostrar apenas ativos'}
              </button>
            </div>

            {loading ? (
              <p>Loading...</p>
            ) : (
              <CronList
                crons={crons}
                onDelete={handleDelete}
                onEdit={setEditingCron}
                showActiveOnly={showActiveOnly} // <-- pass state
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
