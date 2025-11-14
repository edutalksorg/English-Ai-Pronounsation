// src/pages/Pronunciation/PronHistory.tsx
import React, { useEffect, useState } from "react";
import { getHistory, getAttempt } from "@/lib/api/types/pronunciation";
import { useNavigate } from "react-router-dom";

export default function PronHistory() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => { loadHistory(); }, [page]);

  async function loadHistory() {
    setLoading(true);
    try {
      const res = await getHistory(page, 10);
      const arr = (res && (res.data ?? res)) || [];
      setItems(arr);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function openAttempt(id: string) {
    // Either navigate to detailed page or fetch details and show modal.
    // We'll navigate to /pronunciation/attempts/:id if you add a route later.
    navigate(`/pronunciation/attempts/${id}`);
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Pronunciation History</h1>
      {loading && <div>Loading...</div>}
      <div className="space-y-3">
        {items.map((it: any) => (
          <div key={it.id} className="p-3 border rounded flex justify-between items-center">
            <div>
              <div className="font-medium">{it.paragraphTitle ?? it.paragraphTitle}</div>
              <div className="text-sm text-gray-500">Score: {it.overallScore ?? it.overallScore ?? "—"} • {new Date(it.submittedAt ?? it.createdAt ?? "").toLocaleString()}</div>
            </div>
            <div>
              <button onClick={() => openAttempt(it.id)} className="px-3 py-1 border rounded">View</button>
            </div>
          </div>
        ))}
        {items.length === 0 && !loading && <div className="text-sm text-gray-500">No history yet.</div>}
      </div>

      <div className="mt-4">
        <button onClick={() => setPage(Math.max(1, page - 1))} className="px-3 py-1 border rounded mr-2">Prev</button>
        <button onClick={() => setPage(page + 1)} className="px-3 py-1 border rounded">Next</button>
      </div>
    </div>
  );
}
