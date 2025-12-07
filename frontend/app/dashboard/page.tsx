"use client";
import { useEffect, useState } from "react";
import { getDashboardSummary } from "../../lib/api";

export default function DashboardPage() {
  const [data, setData] = useState<{modules: number; templates: number} | null>(null);

  useEffect(() => {
    getDashboardSummary().then(setData).catch(() => setData(null));
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      {data ? (
        <ul>
          <li>Modules: {data.modules}</li>
          <li>Templates: {data.templates}</li>
        </ul>
      ) : (
        <p>Loading or not authenticated.</p>
      )}
    </main>
  );
}
